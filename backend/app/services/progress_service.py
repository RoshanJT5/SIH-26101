from sqlalchemy.orm import Session
from app.models.progress import LearningHistory
from app.schemas.progress import ProgressUpdate
from datetime import datetime

class ProgressService:
    @staticmethod
    def update_progress(db: Session, user_id: int, progress_in: ProgressUpdate) -> LearningHistory:
        existing = db.query(LearningHistory).filter(
            LearningHistory.user_id == user_id,
            LearningHistory.course_id == progress_in.course_id
        ).first()

        if existing:
            existing.status = progress_in.status
            existing.progress_percentage = progress_in.progress_percentage
            existing.last_accessed = datetime.now()
            if progress_in.status == "Completed" and not existing.completed_at:
                existing.completed_at = datetime.now()
            db.commit()
            db.refresh(existing)
            return existing

        db_lh = LearningHistory(
            user_id=user_id,
            course_id=progress_in.course_id,
            status=progress_in.status,
            progress_percentage=progress_in.progress_percentage,
            completed_at=datetime.now() if progress_in.status == "Completed" else None
        )
        db.add(db_lh)
        db.commit()
        db.refresh(db_lh)
        return db_lh

    @staticmethod
    def get_user_progress(db: Session, user_id: int):
        return db.query(LearningHistory).filter(LearningHistory.user_id == user_id).all()
