import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.database import Base, get_db

from sqlalchemy.pool import StaticPool

# Use in-memory SQLite with StaticPool to ensure fresh schema on each test run
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Import all models to register them on Base
from app.models.user import User, UserCompetency
from app.models.competency import Competency
from app.models.course import Course
from app.models.document import Document, DocumentChunk
from app.models.quiz import Quiz, Question, QuizResult
from app.models.progress import LearningHistory

import os

@pytest.fixture(scope="module")
def db():
    if os.path.exists("./test.db"):
        try:
            os.remove("./test.db")
        except Exception:
            pass
    Base.metadata.create_all(bind=engine)
    db_session = TestingSessionLocal()
    
    # Pre-seed competencies, roles, and courses in mock DB
    from app.services.competency_service import CompetencyService
    from app.services.role_service import RoleService
    from app.services.recommendation_service import RecommendationService
    CompetencyService.seed_competencies(db_session)
    RoleService.seed_organizations_and_roles(db_session)
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
    names = [c["name"] for c in data]
    assert any("Sampling" in n for n in names)
    assert any("Survey" in n for n in names)

def test_skill_gap_workflow(client):
    # 1. Create a user
    user_payload = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "department": "Department of Statistics",
        "designation": "Statistical Officer",
        "job_role": "Analyst"
    }
    user_res = client.post("/api/v1/users", json=user_payload)
    user_id = user_res.json()["id"]

    # 2. Get competencies to find ID
    comps_res = client.get("/api/v1/competencies")
    python_comp_id = next(c["id"] for c in comps_res.json() if "Python" in c["name"])

    # 3. Add user competency level (Current: 1)
    uc_payload = {
        "competency_id": python_comp_id,
        "current_level": 1
    }
    uc_res = client.post(f"/api/v1/users/{user_id}/competencies", json=uc_payload)
    assert uc_res.status_code == 200
    
    # 4. Fetch skill gaps
    gap_res = client.get(f"/api/v1/skill-gaps/{user_id}")
    assert gap_res.status_code == 200
    gaps_data = gap_res.json()
    assert gaps_data["user_id"] == user_id
    assert len(gaps_data["skill_gaps"]) > 0

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
    python_comp_id = next(c["id"] for c in comps_res.json() if "Python" in c["name"])
    
    client.post(f"/api/v1/users/{user_id}/competencies", json={
        "competency_id": python_comp_id,
        "current_level": 1
    })

    # 3. Get recommendations
    rec_res = client.get(f"/api/v1/courses/recommendations/{user_id}")
    assert rec_res.status_code == 200
    recs = rec_res.json()
    assert len(recs) > 0

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
        "target_competency": "Python for Statistical Computing",
        "number_of_days": 3
    }
    roadmap_res = client.post(f"/api/v1/roadmaps/generate?user_id={user_id}", json=roadmap_payload)
    assert roadmap_res.status_code == 201
    roadmap_data = roadmap_res.json()
    assert "Roadmap" in roadmap_data["title"]
    assert roadmap_data["progress_percentage"] == 0
    assert len(roadmap_data["tasks"]) == 3
    
    # 3. Complete the first day's task
    first_task_id = roadmap_data["tasks"][0]["id"]
    task_update_res = client.put(f"/api/v1/roadmaps/tasks/{first_task_id}", json={"status": "Completed"})
    assert task_update_res.status_code == 200
    task_data = task_update_res.json()
    assert task_data["status"] == "Completed"
    
    # 4. Fetch the roadmap again and verify progress is updated (33%)
    get_roadmaps_res = client.get(f"/api/v1/roadmaps/user/{user_id}")
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
    
    quiz = Quiz(topic="Sampling Techniques", difficulty="easy", number_of_questions=1)
    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    q = Question(
        quiz_id=quiz.id,
        question_text="What is simple random sampling?",
        options=json.dumps(["A random method", "A biased method", "No answer", "Option D"]),
        correct_answer="A random method",
        explanation="Simple random sampling gives every element an equal chance.",
        topic="Sampling Techniques"
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
    roadmap_res = client.post(f"/api/v1/roadmaps/remediation/{result_id}?number_of_days=2")
    assert roadmap_res.status_code == 201
    roadmap_data = roadmap_res.json()
    assert "Remediation" in roadmap_data["title"]
    assert len(roadmap_data["tasks"]) == 2

def test_progressive_hierarchy(client):
    response = client.get("/api/v1/roles/hierarchy/progressive")
    assert response.status_code == 200
    data = response.json()
    assert "ministries" in data
    assert "departments_by_ministry" in data
    assert "organizations_by_dept" in data
    assert "roles_by_org" in data
    assert len(data["ministries"]) > 0

def test_onboarding_lifecycle(client):
    # 1. Get competencies and roles
    comps_res = client.get("/api/v1/competencies")
    comps = comps_res.json()
    comp_1 = comps[0]
    comp_2 = comps[1]

    hier_res = client.get("/api/v1/roles/hierarchy/progressive")
    hier = hier_res.json()
    first_min = hier["ministries"][0]
    first_dept = hier["departments_by_ministry"][first_min][0]
    first_org = hier["organizations_by_dept"][first_dept][0]
    first_roles = hier["roles_by_org"][str(first_org["id"])]
    first_role = first_roles[0]

    # 2. Register onboarding user
    onboarding_payload = {
        "name": "Suresh Raina",
        "email": "suresh.raina@mospi.gov.in",
        "password": "Password123!",
        "mobile": "+91 9988776655",
        "employee_id": "MOSPI-ISS-9988",
        "ministry": first_min,
        "department": first_dept,
        "organization_id": first_org["id"],
        "division_unit": "Sample Survey Wing",
        "designation": first_role["role_name"],
        "role_id": first_role["id"],
        "job_role": first_role["role_name"],
        "experience_years": 5,
        "education": "M.Sc. Statistics",
        "specialization": "Survey Sampling & Estimation",
        "career_goal": "Lead NSSO Survey Operations",
        "selected_skills": [
            {
                "competency_id": comp_1["id"],
                "current_level": 3,
                "not_sure_assess": False
            },
            {
                "competency_id": comp_2["id"],
                "current_level": 0,
                "not_sure_assess": True
            }
        ]
    }

    reg_res = client.post("/api/v1/users/onboarding", json=onboarding_payload)
    assert reg_res.status_code == 201
    user_data = reg_res.json()
    assert user_data["name"] == "Suresh Raina"
    assert user_data["email"] == "suresh.raina@mospi.gov.in"
    assert user_data["division_unit"] == "Sample Survey Wing"
    assert user_data["specialization"] == "Survey Sampling & Estimation"
    assert len(user_data["competencies"]) >= 2

    # Verify self-reported baseline distinction
    user_comps = {c["competency_id"]: c for c in user_data["competencies"]}
    assert comp_1["id"] in user_comps
    assert user_comps[comp_1["id"]]["current_level"] == 3
    assert user_comps[comp_1["id"]]["assessment_source"] == "SELF_REPORTED"
    assert user_comps[comp_1["id"]]["confidence"] == 0.5

    assert comp_2["id"] in user_comps
    assert user_comps[comp_2["id"]]["current_level"] == 0
    assert user_comps[comp_2["id"]]["assessment_source"] == "ASSESSMENT_REQUIRED"
    assert user_comps[comp_2["id"]]["confidence"] == 0.0

    # 3. Duplicate email check
    dup_res = client.post("/api/v1/users/onboarding", json=onboarding_payload)
    assert dup_res.status_code == 400
    assert "already exists" in dup_res.json()["detail"]

    # 4. Duplicate employee_id check
    dup_emp_payload = {**onboarding_payload, "email": "unique.email@mospi.gov.in"}
    dup_emp_res = client.post("/api/v1/users/onboarding", json=dup_emp_payload)
    assert dup_emp_res.status_code == 400
    assert "Employee ID" in dup_emp_res.json()["detail"] and "already exists" in dup_emp_res.json()["detail"]


def test_demo_admin_login(client, db):
    from app.services.user_service import UserService
    UserService.seed_default_user(db)

    # 1. Test successful Demo Admin login with prototype credentials
    admin_login_payload = {
        "email": "admin@pragatiparikshan.demo",
        "password": "Admin@123"
    }
    res = client.post("/api/v1/users/login", json=admin_login_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "admin@pragatiparikshan.demo"
    assert data["name"] == "PragatiParikshan Admin"
    assert data["is_admin"] is True
    assert data["role"] == "Admin"

    # 2. Test learner login returns is_admin = False
    learner_login_payload = {
        "email": "roshan@stats.gov.in",
        "password": "gov12345"
    }
    learner_res = client.post("/api/v1/users/login", json=learner_login_payload)
    assert learner_res.status_code == 200
    learner_data = learner_res.json()
    assert learner_data["is_admin"] is False
    assert learner_data["role"] != "Admin"

    # 3. Test invalid password returns 401
    bad_res = client.post("/api/v1/users/login", json={"email": "admin@pragatiparikshan.demo", "password": "WrongPassword"})
    assert bad_res.status_code == 401

def test_health_endpoints(client):
    res_root = client.get("/health")
    assert res_root.status_code == 200
    assert res_root.json()["status"] == "ok"

    res_api = client.get("/api/v1/health")
    assert res_api.status_code == 200
    assert res_api.json()["status"] == "ok"
    assert "database" in res_api.json()

def test_admin_authorization_enforcement(client, db):
    from app.services.user_service import UserService
    UserService.seed_default_user(db)
    from app.models.user import User
    admin_user = db.query(User).filter(User.email == "admin@pragatiparikshan.demo").first()
    learner_user = db.query(User).filter(User.email == "roshan@stats.gov.in").first()

    # 1. Unauthenticated request to /admin/analytics -> 401
    unauth_res = client.get("/api/v1/admin/analytics")
    assert unauth_res.status_code == 401

    # 2. Normal learner request to /admin/analytics -> 403 Forbidden
    learner_res = client.get(
        "/api/v1/admin/analytics",
        headers={"Authorization": f"Bearer bearer-session-{learner_user.id}"}
    )
    assert learner_res.status_code == 403
    assert "Admin authorization required" in learner_res.json()["detail"] or "Administrator privileges required" in learner_res.json()["detail"]

    # 3. Admin request to /admin/analytics -> 200 OK
    admin_res = client.get(
        "/api/v1/admin/analytics",
        headers={"Authorization": f"Bearer bearer-session-{admin_user.id}"}
    )
    assert admin_res.status_code == 200
    data = admin_res.json()
    assert "average_workforce_health_score" in data
    assert "total_officials" in data

    # 4. Admin request to /admin/users -> 200 OK

    users_res = client.get(
        "/api/v1/admin/users",
        headers={"Authorization": f"Bearer bearer-session-{admin_user.id}"}
    )
    assert users_res.status_code == 200
    assert isinstance(users_res.json(), list)

def test_document_upload_validation(client):
    # 1. Reject invalid file extension
    files = {"file": ("malicious.exe", b"binarycontent", "application/x-msdownload")}
    res = client.post("/api/v1/documents/upload", files=files)
    assert res.status_code == 400
    assert "Unsupported file format" in res.json()["detail"]






