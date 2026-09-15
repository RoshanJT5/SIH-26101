from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.competency_service import CompetencyService
from app.schemas.competency import CompetencyResponse
from typing import List, Optional

router = APIRouter(prefix="/competencies", tags=["Competencies"])

@router.get("", response_model=List[CompetencyResponse])
def get_all_competencies(category: Optional[str] = Query(None, description="Filter by category (STATISTICAL, TECHNICAL, DIGITAL_GOVERNANCE, BEHAVIOURAL_MANAGERIAL)"), db: Session = Depends(get_db)):
    return CompetencyService.get_all_competencies(db, category)

@router.get("/{competency_id}", response_model=CompetencyResponse)
def get_competency(competency_id: int, db: Session = Depends(get_db)):
    comp = CompetencyService.get_competency(db, competency_id)
    if not comp:
        raise HTTPException(status_code=404, detail="Competency not found")
    return comp
