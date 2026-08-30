from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db
from app.schemas.progress import ProgressUpdate, ProgressResponse
from app.services.progress_service import ProgressService
from app.services.user_service import UserService

router = APIRouter(prefix="/users/{user_id}/progress", tags=["Learning History & Progress"])

@router.post("", response_model=ProgressResponse)
def update_progress(user_id: int, progress_in: ProgressUpdate, db: Session = Depends(get_db)):
    user = UserService.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return ProgressService.update_progress(db, user_id, progress_in)

@router.get("", response_model=List[ProgressResponse])
def get_user_progress(user_id: int, db: Session = Depends(get_db)):
    user = UserService.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return ProgressService.get_user_progress(db, user_id)
