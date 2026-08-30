from sqlalchemy.orm import Session
from app.models.user import UserCompetency
from app.models.competency import Competency

class SkillGapService:
    @staticmethod
    def calculate_priority(gap: int) -> str:
        if gap <= 0:
            return "NONE"
        elif gap == 1:
            return "LOW"
        elif gap == 2:
            return "MEDIUM"
        elif gap == 3:
            return "HIGH"
        else:
            return "CRITICAL"

    @staticmethod
    def get_user_skill_gaps(db: Session, user_id: int):
        user_comps = db.query(UserCompetency).filter(UserCompetency.user_id == user_id).all()
        gaps = []
        for uc in user_comps:
            gap_val = uc.required_level - uc.current_level
            if gap_val > 0:
                comp = db.query(Competency).filter(Competency.id == uc.competency_id).first()
                gaps.append({
                    "competency": comp.name if comp else f"Competency {uc.competency_id}",
                    "current_level": uc.current_level,
                    "required_level": uc.required_level,
                    "gap": gap_val,
                    "priority": SkillGapService.calculate_priority(gap_val)
                })
        return {
            "user_id": user_id,
            "skill_gaps": gaps
        }
