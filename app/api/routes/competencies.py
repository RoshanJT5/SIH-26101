from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db
from app.schemas.competency import CompetencyResponse
from app.services.competency_service import CompetencyService

router = APIRouter(prefix="/competencies", tags=["Competencies"])

@router.get("", response_model=List[CompetencyResponse])
def list_competencies(db: Session = Depends(get_db)):
    # Auto-seed if empty
    comps = CompetencyService.get_all_competencies(db)
    if not comps:
        CompetencyService.seed_competencies(db)
        comps = CompetencyService.get_all_competencies(db)
    return comps
