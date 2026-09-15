import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.database import Base
from app.models.organization_role import Organization, Role, RoleCompetency
from app.models.competency import Competency
from app.models.user import User, UserCompetency, CompetencyProgressHistory
from app.models.course import Course, CourseCompetency, TrainingProgramme
from app.models.quiz import Quiz, Question, QuizResult
from app.services.competency_service import CompetencyService
from app.services.role_service import RoleService
from app.services.skill_gap_service import SkillGapService
from app.services.recommendation_service import RecommendationService
from app.services.quiz_service import QuizService
from app.services.admin_service import AdminService
from app.schemas.quiz import QuizSubmitRequest
import json

# Setup isolated in-memory test SQLite DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        # Seed core framework
        CompetencyService.seed_competencies(db)
        RoleService.seed_organizations_and_roles(db)
        RecommendationService.seed_courses(db)
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

def test_role_competency_baselines(db_session):
    """Verifies that RoleCompetency defines required baseline levels decoupled from users."""
    role = db_session.query(Role).filter(Role.role_name.ilike("%Survey Design%")).first()
    assert role is not None
    assert len(role.competency_requirements) > 0
    
    # Check that Survey Design has required level 4
    comp_names = {rc.competency.name: rc.required_level for rc in role.competency_requirements}
    assert "Survey Design" in comp_names
    assert comp_names["Survey Design"] == 4
    assert "Sampling Techniques" in comp_names
    assert comp_names["Sampling Techniques"] == 4

def test_closed_loop_skill_gap_and_recommendation(db_session):
    """Verifies: Role -> Current Competency -> Skill Gap -> Course Recommendation."""
    role = db_session.query(Role).first()
    user = User(
        name="Test Statistical Official",
        email="test.officer@mospi.gov.in",
        role_id=role.id,
        organization_id=role.organization_id
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Set initial low competency in Sampling Techniques (Level 1 vs Required 4 -> Gap 3)
    sampling_comp = db_session.query(Competency).filter(Competency.name == "Sampling Techniques").first()
    db_session.add(UserCompetency(
        user_id=user.id,
        competency_id=sampling_comp.id,
        current_level=1,
        confidence=0.5
    ))
    db_session.commit()

    # 1. Evaluate Skill Gap
    gap_result = SkillGapService.get_user_skill_gaps(db_session, user.id)
    assert gap_result["user_id"] == user.id
    assert gap_result["critical_gaps_count"] >= 1
    
    sampling_gap = next((g for g in gap_result["skill_gaps"] if g["competency"] == "Sampling Techniques"), None)
    assert sampling_gap is not None
    assert sampling_gap["current_level"] == 1
    assert sampling_gap["required_level"] == 4
    assert sampling_gap["gap"] == 3
    assert sampling_gap["priority"] == "CRITICAL"

    # 2. Evaluate Course Recommendations
    recs = RecommendationService.get_recommendations(db_session, user.id)
    assert len(recs) > 0
    top_rec = recs[0]
    
    # Top recommendation should address the critical sampling / survey design gap
    assert "Sampling" in str(top_rec["skills_addressed"]) or "Survey" in str(top_rec["skills_addressed"])
    assert top_rec["gap_level"] >= 2
    assert "http" in top_rec["course_url"]
    assert top_rec["cta_label"] == "Start Course on iGOT ↗"

def test_assessment_competency_progression_rule(db_session):
    """Verifies that high score on diagnostic assessment deterministically updates UserCompetency and logs audit history."""
    role = db_session.query(Role).first()
    user = User(
        name="Test Learner",
        email="learner@mospi.gov.in",
        role_id=role.id
    )
    db_session.add(user)
    db_session.commit()

    sampling_comp = db_session.query(Competency).filter(Competency.name == "Sampling Techniques").first()
    db_session.add(UserCompetency(
        user_id=user.id,
        competency_id=sampling_comp.id,
        current_level=2,
        confidence=0.5
    ))
    db_session.commit()

    # Create a test Quiz tagged with Sampling Techniques
    quiz = Quiz(
        topic="Sampling Techniques",
        difficulty="medium",
        quiz_type="DIAGNOSTIC",
        number_of_questions=2
    )
    db_session.add(quiz)
    db_session.commit()
    db_session.refresh(quiz)

    q1 = Question(
        quiz_id=quiz.id,
        competency_id=sampling_comp.id,
        question_text="What is PPS sampling?",
        options=json.dumps(["Probability Proportional to Size", "Periodic Panel Survey", "Pure Population Sample", "Public Policy Standard"]),
        correct_answer="Probability Proportional to Size",
        explanation="PPS stands for Probability Proportional to Size."
    )
    q2 = Question(
        quiz_id=quiz.id,
        competency_id=sampling_comp.id,
        question_text="Which technique is used in multi-stage stratification?",
        options=json.dumps(["Cluster Sampling", "Arbitrary Selection", "Quota Guessing", "Voluntary Polling"]),
        correct_answer="Cluster Sampling",
        explanation="Cluster sampling is used in multi-stage designs."
    )
    db_session.add_all([q1, q2])
    db_session.commit()
    db_session.refresh(q1)
    db_session.refresh(q2)

    # Submit 100% Correct Answers
    submission = QuizSubmitRequest(answers={
        str(q1.id): "Probability Proportional to Size",
        str(q2.id): "Cluster Sampling"
    })

    eval_result = QuizService.submit_and_evaluate_quiz(db_session, user.id, quiz.id, submission)
    assert eval_result.score == 100.0
    assert len(eval_result.level_upgrades) > 0

    # Verify UserCompetency is upgraded from Level 2 to Level 3 (+1)
    uc_updated = db_session.query(UserCompetency).filter(
        UserCompetency.user_id == user.id,
        UserCompetency.competency_id == sampling_comp.id
    ).first()
    assert uc_updated.current_level == 3
    assert uc_updated.confidence >= 0.9

    # Verify CompetencyProgressHistory audit trail
    history = db_session.query(CompetencyProgressHistory).filter(
        CompetencyProgressHistory.user_id == user.id,
        CompetencyProgressHistory.competency_id == sampling_comp.id
    ).first()
    assert history is not None
    assert history.previous_level == 2
    assert history.new_level == 3
    assert history.score == 100.0

def test_admin_workforce_analytics(db_session):
    """Verifies that Admin analytics correctly aggregates deficiencies across roles."""
    from app.services.user_service import UserService
    UserService.seed_default_user(db_session)

    analytics = AdminService.get_workforce_analytics(db_session)
    assert analytics["total_officials"] >= 5
    assert analytics["total_organizations"] >= 4
    assert analytics["total_roles"] >= 4
    assert len(analytics["high_deficiency_competencies"]) > 0
    assert analytics["average_workforce_health_score"] > 0
