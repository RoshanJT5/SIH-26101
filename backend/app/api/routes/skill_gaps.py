from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.skill_gap_service import SkillGapService
from app.schemas.skill_gap import SkillGapResponse

router = APIRouter(prefix="/skill-gaps", tags=["Skill Gaps & Diagnostics"])

@router.get("/{user_id}", response_model=SkillGapResponse)
def get_user_skill_gaps(user_id: int, db: Session = Depends(get_db)):
    """
    Computes role-driven competency gaps:
    Role Requirements (Baseline) - User Competency (Current) = Skill Gap
    Returns overall competency health score %, gap severities, and role context.
    """
    result = SkillGapService.get_user_skill_gaps(db, user_id)
    if not result:
        raise HTTPException(status_code=404, detail="User skill gaps could not be computed")
    return result
