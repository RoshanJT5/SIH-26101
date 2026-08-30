from sqlalchemy.orm import Session
from app.models.user import User, UserCompetency
from app.models.competency import Competency
from app.schemas.user import UserCreate, UserUpdate, UserCompetencyCreate
from datetime import datetime

class UserService:
    @staticmethod
    def create_user(db: Session, user_in: UserCreate) -> User:
        db_user = User(
            name=user_in.name,
            email=user_in.email,
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
    def get_user(db: Session, user_id: int) -> User:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def update_user(db: Session, user_id: int, user_in: UserUpdate) -> User:
        db_user = UserService.get_user(db, user_id)
        if not db_user:
            return None
        
        update_data = user_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)
            
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def add_user_competency(db: Session, user_id: int, comp_in: UserCompetencyCreate) -> UserCompetency:
        # Check if already exists
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
