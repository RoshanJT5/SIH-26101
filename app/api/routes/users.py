from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserCompetencyCreate, UserCompetencyResponse
from app.services.user_service import UserService
from app.models.competency import Competency

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    return UserService.create_user(db, user_in)

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = UserService.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db)):
    user = UserService.update_user(db, user_id, user_in)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/{user_id}/competencies", response_model=UserCompetencyResponse)
def add_user_competency(user_id: int, comp_in: UserCompetencyCreate, db: Session = Depends(get_db)):
    user = UserService.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if competency exists
    comp = db.query(Competency).filter(Competency.id == comp_in.competency_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Competency not found")

    uc = UserService.add_user_competency(db, user_id, comp_in)
    
    # Construct response mapping name and category
    return UserCompetencyResponse(
        id=uc.id,
        user_id=uc.user_id,
        competency_id=uc.competency_id,
        competency_name=comp.name,
        category=comp.category,
        current_level=uc.current_level,
        required_level=uc.required_level,
        last_updated=uc.last_updated
    )

@router.get("/{user_id}/competencies", response_model=List[UserCompetencyResponse])
def get_user_competencies(user_id: int, db: Session = Depends(get_db)):
    user = UserService.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    ucs = UserService.get_user_competencies(db, user_id)
    results = []
    for uc in ucs:
        comp = db.query(Competency).filter(Competency.id == uc.competency_id).first()
        results.append(UserCompetencyResponse(
            id=uc.id,
            user_id=uc.user_id,
            competency_id=uc.competency_id,
            competency_name=comp.name if comp else "Unknown",
            category=comp.category if comp else "Unknown",
            current_level=uc.current_level,
            required_level=uc.required_level,
            last_updated=uc.last_updated
        ))
    return results
