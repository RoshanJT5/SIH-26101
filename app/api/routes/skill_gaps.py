from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db
from app.services.skill_gap_service import SkillGapService
from app.services.user_service import UserService

router = APIRouter(prefix="/users/{user_id}/skill-gaps", tags=["Skill Gaps"])

@router.get("")
def get_user_skill_gaps(user_id: int, db: Session = Depends(get_db)):
    user = UserService.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return SkillGapService.get_user_skill_gaps(db, user_id)
