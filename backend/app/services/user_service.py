from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.models.user import User, UserCompetency
from app.models.competency import Competency
from app.models.course import Course
from app.models.progress import LearningHistory, Roadmap, RoadmapTask
from app.models.quiz import Quiz, QuizResult
from app.schemas.user import UserCreate, UserUpdate, UserCompetencyCreate
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserService:
    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        if not password_hash:
            return False
        return pwd_context.verify(password, password_hash)

    @staticmethod
    def create_user(db: Session, user_in: UserCreate) -> User:
        existing = db.query(User).filter(User.email == user_in.email).first()
        if existing:
            raise ValueError("User with this email already exists")

        password_value = user_in.password if user_in.password is not None else ""

        db_user = User(
            name=user_in.name,
            email=user_in.email,
            password_hash=UserService.hash_password(password_value),
            mobile=user_in.mobile,
            employee_id=user_in.employee_id,
            organization=user_in.organization,
            department=user_in.department,
            designation=user_in.designation,
            job_role=user_in.job_role,
            experience_years=user_in.experience_years,
            education=user_in.education,
            career_goal=user_in.career_goal
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str):
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not UserService.verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user(db: Session, user_id: int) -> User:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_all_users(db: Session) -> list[User]:
        return db.query(User).order_by(User.id.asc()).all()

    @staticmethod
    def update_user(db: Session, user_id: int, user_in: UserUpdate) -> User:
        db_user = UserService.get_user(db, user_id)
        if not db_user:
            return None
        
        update_data = user_in.model_dump(exclude_unset=True)
        if "email" in update_data:
            existing = db.query(User).filter(User.email == update_data["email"], User.id != user_id).first()
            if existing:
                raise ValueError("User with this email already exists")
        if "password" in update_data and update_data["password"]:
            db_user.password_hash = UserService.hash_password(update_data["password"])
            update_data.pop("password")

        for field, value in update_data.items():
            setattr(db_user, field, value)

        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def add_user_competency(db: Session, user_id: int, comp_in: UserCompetencyCreate) -> UserCompetency:
        existing = db.query(UserCompetency).filter(
            UserCompetency.user_id == user_id,
            UserCompetency.competency_id == comp_in.competency_id
        ).first()

        if existing:
            existing.current_level = comp_in.current_level
            existing.required_level = comp_in.required_level
            existing.last_updated = datetime.now()
            db.commit()
            db.refresh(existing)
            return existing
        
        db_uc = UserCompetency(
            user_id=user_id,
            competency_id=comp_in.competency_id,
            current_level=comp_in.current_level,
            required_level=comp_in.required_level
        )
        db.add(db_uc)
        db.commit()
        db.refresh(db_uc)
        return db_uc

    @staticmethod
    def get_user_competencies(db: Session, user_id: int):
        return db.query(UserCompetency).filter(UserCompetency.user_id == user_id).all()

    @staticmethod
    def seed_default_user(db: Session):
        users = db.query(User).all()
        for user in users:
            if not user.password_hash:
                user.password_hash = UserService.hash_password("gov12345")
        db.commit()

        user_count = db.query(User).count()
        if user_count >= 5:
            return db.query(User).first()

        cohort_data = [
            {
                "name": "Roshan JT5",
                "email": "roshan@stats.gov.in",
                "department": "Department of Statistics",
                "designation": "Statistical Officer",
                "job_role": "Survey Analyst",
                "experience_years": 5,
                "education": "M.Sc Statistics",
                "career_goal": "AI and Machine Learning Specialist",
                "skills": [("Python", 2, 5), ("Data Visualization", 1, 4), ("Survey Design", 3, 4), ("Sampling", 3, 4), ("SQL", 2, 4)],
                "progress": [("IGOT-STAT-001", "In Progress", 72), ("IGOT-STAT-002", "In Progress", 40)],
                "quiz_score": 85.0
            },
            {
                "name": "Priya Sharma",
                "email": "priya.sharma@mospi.gov.in",
                "department": "National Data Governance Center",
                "designation": "Assistant Director",
                "job_role": "Policy & Privacy Specialist",
                "experience_years": 7,
                "education": "M.Tech Data Science",
                "career_goal": "Director of National Data Governance",
                "skills": [("Python", 4, 4), ("Data Visualization", 4, 5), ("Survey Design", 4, 4), ("Sampling", 4, 5), ("SQL", 4, 4)],
                "progress": [("IGOT-STAT-005", "Completed", 100), ("IGOT-STAT-001", "Completed", 100)],
                "quiz_score": 92.0
            },
            {
                "name": "Amitabh Verma",
                "email": "amitabh.verma@nsso.gov.in",
                "department": "Field Operations Division (NSSO)",
                "designation": "Senior Field Officer",
                "job_role": "Field Enumeration Supervisor",
                "experience_years": 9,
                "education": "B.Sc Mathematics & Statistics",
                "career_goal": "Chief Field Operations Manager",
                "skills": [("Python", 1, 3), ("Data Visualization", 2, 4), ("Survey Design", 4, 5), ("Sampling", 4, 5), ("SQL", 1, 3)],
                "progress": [("IGOT-STAT-003", "In Progress", 60)],
                "quiz_score": 78.0
            },
            {
                "name": "Sunita Roy",
                "email": "sunita.roy@mospi.gov.in",
                "department": "Ministry of Statistics & PI",
                "designation": "Junior Statistical Officer",
                "job_role": "Microdata Analyst",
                "experience_years": 2,
                "education": "B.Stat (Hons) ISI",
                "career_goal": "Senior Data Scientist",
                "skills": [("Python", 3, 5), ("Data Visualization", 3, 4), ("Survey Design", 2, 4), ("Sampling", 3, 4), ("SQL", 3, 4)],
                "progress": [("IGOT-STAT-004", "In Progress", 45), ("IGOT-STAT-001", "Completed", 100)],
                "quiz_score": 88.0
            },
            {
                "name": "Rajesh Nair",
                "email": "rajesh.nair@nic.in",
                "department": "National Informatics Centre (NIC)",
                "designation": "Systems Engineer",
                "job_role": "Cloud & Data Infrastructure Lead",
                "experience_years": 8,
                "education": "B.Tech Computer Science",
                "career_goal": "Principal Technical Architect",
                "skills": [("Python", 4, 5), ("Data Visualization", 3, 4), ("Survey Design", 1, 3), ("Sampling", 2, 3), ("SQL", 5, 5)],
                "progress": [("IGOT-STAT-004", "Completed", 100)],
                "quiz_score": 95.0
            },
            {
                "name": "Ananya Iyer",
                "email": "ananya.iyer@gov.in",
                "department": "Department of Personnel & Training",
                "designation": "Capacity Building Associate",
                "job_role": "Cadre Training Coordinator",
                "experience_years": 3,
                "education": "MBA Public Policy",
                "career_goal": "Capacity Building Programme Director",
                "skills": [("Python", 1, 3), ("Data Visualization", 3, 4), ("Survey Design", 2, 3), ("Sampling", 2, 4), ("SQL", 2, 3)],
                "progress": [("IGOT-STAT-005", "In Progress", 50)],
                "quiz_score": 80.0
            }
        ]

        for item in cohort_data:
            existing = db.query(User).filter(User.email == item["email"]).first()
            if not existing:
                user = User(
                    name=item["name"],
                    email=item["email"],
                    password_hash=UserService.hash_password("gov12345"),
                    department=item["department"],
                    designation=item["designation"],
                    job_role=item["job_role"],
                    experience_years=item["experience_years"],
                    education=item["education"],
                    career_goal=item["career_goal"]
                )
                db.add(user)
                db.commit()
                db.refresh(user)

                # Seed Competencies
                for comp_name, cur_lvl, req_lvl in item["skills"]:
                    comp = db.query(Competency).filter(Competency.name == comp_name).first()
                    if comp:
                        db.add(UserCompetency(
                            user_id=user.id,
                            competency_id=comp.id,
                            current_level=cur_lvl,
                            required_level=req_lvl
                        ))

                # Seed Course Progress
                for ext_id, status_str, pct in item["progress"]:
                    c = db.query(Course).filter(Course.external_id == ext_id).first()
                    if c:
                        db.add(LearningHistory(
                            user_id=user.id,
                            course_id=c.id,
                            status=status_str,
                            progress_percentage=pct
                        ))

                # Seed a Roadmap
                rm = Roadmap(
                    user_id=user.id,
                    title=f"Roadmap: {item['skills'][0][0]} Mastery",
                    target_competency=item["skills"][0][0],
                    progress_percentage=item["progress"][0][2] if item["progress"] else 40
                )
                db.add(rm)
                db.commit()
                db.refresh(rm)

                for day_idx in range(1, 6):
                    db.add(RoadmapTask(
                        roadmap_id=rm.id,
                        day_number=day_idx,
                        task_title=f"Day {day_idx}: Foundational Methods and Frameworks",
                        task_description="Study prescribed standard operating procedures, complete exercises, and take check quiz.",
                        status="Completed" if day_idx <= 2 else "Pending"
                    ))

                # Seed Quiz Result
                q = db.query(Quiz).first()
                if q:
                    db.add(QuizResult(
                        user_id=user.id,
                        quiz_id=q.id,
                        score=item["quiz_score"],
                        total_questions=5,
                        correct_answers=int(item["quiz_score"] / 20),
                        feedback="Strong foundational proficiency demonstrated."
                    ))

                db.commit()

        return db.query(User).first()
