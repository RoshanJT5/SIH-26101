import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.database import Base, get_db

# Use a file-based SQLite database for testing to avoid connection-isolation issues with in-memory DBs
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Import all models to register them on Base
from app.models.user import User, UserCompetency
from app.models.competency import Competency
from app.models.course import Course
from app.models.document import Document, DocumentChunk
from app.models.quiz import Quiz, Question, QuizResult
from app.models.progress import LearningHistory

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    db_session = TestingSessionLocal()
    
    # Pre-seed competencies and courses in mock DB
    from app.services.competency_service import CompetencyService
    from app.services.recommendation_service import RecommendationService
    CompetencyService.seed_competencies(db_session)
    RecommendationService.seed_courses(db_session)
    
    yield db_session
    
    db_session.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    del app.dependency_overrides[get_db]

def test_read_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_create_user(client):
    payload = {
        "name": "Amit Patel",
        "email": "amit.patel@gov.in",
        "department": "Survey Division",
        "designation": "Director",
        "job_role": "Survey Officer",
        "experience_years": 8,
        "education": "PhD in Statistics",
        "career_goal": "Data Science Specialist"
    }
    response = client.post("/api/v1/users", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Amit Patel"
    assert "id" in data

def test_list_competencies(client):
    response = client.get("/api/v1/competencies")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    # Check if 'Sampling' exists
    names = [c["name"] for c in data]
    assert "Sampling" in names

def test_skill_gap_workflow(client):
    # 1. Create a user
    user_payload = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "department": "Analysis Branch",
        "designation": "Data Officer",
        "job_role": "Analyst"
    }
    user_res = client.post("/api/v1/users", json=user_payload)
    user_id = user_res.json()["id"]

    # 2. Get competencies to find ID
    comps_res = client.get("/api/v1/competencies")
    comp_id = next(c["id"] for c in comps_res.json() if c["name"] == "Python")

    # 3. Add user competency level (Current: 1, Required: 4)
    uc_payload = {
        "competency_id": comp_id,
        "current_level": 1,
        "required_level": 4
    }
    uc_res = client.post(f"/api/v1/users/{user_id}/competencies", json=uc_payload)
    assert uc_res.status_code == 200
    
    # 4. Fetch skill gaps
    gap_res = client.get(f"/api/v1/users/{user_id}/skill-gaps")
    assert gap_res.status_code == 200
    gaps_data = gap_res.json()
    assert gaps_data["user_id"] == user_id
    assert len(gaps_data["skill_gaps"]) == 1
    assert gaps_data["skill_gaps"][0]["competency"] == "Python"
    assert gaps_data["skill_gaps"][0]["gap"] == 3
    assert gaps_data["skill_gaps"][0]["priority"] == "HIGH"

def test_recommendations(client):
    # 1. Create user
    user_payload = {
        "name": "Course Learner",
        "email": "learner@example.com",
        "job_role": "Data Analyst",
        "career_goal": "Python Expert"
    }
    user_res = client.post("/api/v1/users", json=user_payload)
    user_id = user_res.json()["id"]

    # 2. Assign some skill gaps to user
    comps_res = client.get("/api/v1/competencies")
    python_comp_id = next(c["id"] for c in comps_res.json() if c["name"] == "Python")
    
    client.post(f"/api/v1/users/{user_id}/competencies", json={
        "competency_id": python_comp_id,
        "current_level": 1,
        "required_level": 5
    })

    # 3. Get recommendations
    rec_res = client.get(f"/api/v1/users/{user_id}/recommendations")
    assert rec_res.status_code == 200
    recs = rec_res.json()
    assert len(recs) > 0
    # The highest recommended course should ideally be the FastAPI one or AI Foundations one (addressing Python gap)
    assert "Python" in recs[0]["skills_addressed"] or "Python" in recs[1]["skills_addressed"]

def test_roadmap_lifecycle(client):
    # 1. Create a user
    user_payload = {
        "name": "Roadmap Learner",
        "email": "roadmap@example.com",
        "job_role": "Analyst"
    }
    user_res = client.post("/api/v1/users", json=user_payload)
    user_id = user_res.json()["id"]

    # 2. Generate a 3-day roadmap for Python
    roadmap_payload = {
        "target_competency": "Python",
        "number_of_days": 3
    }
    roadmap_res = client.post(f"/api/v1/users/{user_id}/roadmaps/generate", json=roadmap_payload)
    assert roadmap_res.status_code == 201
    roadmap_data = roadmap_res.json()
    assert roadmap_data["title"] == "Python Mastery Roadmap"
    assert roadmap_data["progress_percentage"] == 0
    assert len(roadmap_data["tasks"]) == 3
    
    # 3. Complete the first day's task
    first_task_id = roadmap_data["tasks"][0]["id"]
    task_update_res = client.put(f"/api/v1/roadmaps/tasks/{first_task_id}", json={"status": "Completed"})
    assert task_update_res.status_code == 200
    task_data = task_update_res.json()
    assert task_data["status"] == "Completed"
    
    # 4. Fetch the roadmap again and verify progress is updated (33%)
    get_roadmaps_res = client.get(f"/api/v1/users/{user_id}/roadmaps")
    assert get_roadmaps_res.status_code == 200
    all_roadmaps = get_roadmaps_res.json()
    assert len(all_roadmaps) == 1
    assert all_roadmaps[0]["progress_percentage"] == 33

def test_remediation_roadmap(client, db):
    # 1. Create User
    user_payload = {
        "name": "Failing Student",
        "email": "fail@example.com",
        "job_role": "Survey Assistant"
    }
    user_res = client.post("/api/v1/users", json=user_payload)
    user_id = user_res.json()["id"]

    # 2. Add Quiz & Question to DB
    from app.models.quiz import Quiz, Question
    import json
    
    quiz = Quiz(topic="Sampling", difficulty="easy", number_of_questions=1)
    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    q = Question(
        quiz_id=quiz.id,
        question_text="What is simple random sampling?",
        options=json.dumps(["A random method", "A biased method", "No answer", "Option D"]),
        correct_answer="A random method",
        explanation="Simple random sampling gives every element an equal chance.",
        topic="Sampling"
    )
    db.add(q)
    db.commit()

    # 3. Submit incorrect answer to get failing result
    sub_payload = {
        "answers": {
            str(q.id): "A biased method"
        }
    }
    sub_res = client.post(f"/api/v1/quizzes/{quiz.id}/submit?user_id={user_id}", json=sub_payload)
    assert sub_res.status_code == 200
    res_data = sub_res.json()
    assert res_data["score"] == 0.0
    result_id = res_data["result_id"]

    # 4. Generate Remedial Roadmap
    roadmap_res = client.post(f"/api/v1/quizzes/results/{result_id}/roadmap?number_of_days=2")
    assert roadmap_res.status_code == 201
    roadmap_data = roadmap_res.json()
    assert roadmap_data["title"] == "Personalized Remediation Roadmap"
    assert roadmap_data["target_competency"] == "Remediation for Quiz"
    assert len(roadmap_data["tasks"]) == 2


