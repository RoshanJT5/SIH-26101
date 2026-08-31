from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.dependencies import get_db
from app.schemas.course import CourseResponse, RecommendationResponse
from app.models.course import Course
from app.services.recommendation_service import RecommendationService
from app.services.user_service import UserService

router = APIRouter(tags=["Courses & Recommendations"])

@router.get("/courses", response_model=List[CourseResponse])
def list_courses(
    skill: Optional[str] = None, 
    level: Optional[str] = None, 
    language: Optional[str] = None,
    source: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Course)
    
    # Auto-seed if empty
    if query.count() == 0:
        RecommendationService.seed_courses(db)
        query = db.query(Course)
        
    if skill:
        query = query.filter(Course.skills.like(f"%{skill}%"))
    if level:
        query = query.filter(Course.level == level)
    if language:
        query = query.filter(Course.language == language)
    if source:
        query = query.filter(Course.source.like(f"%{source}%"))
    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            (Course.title.like(search_pattern)) | 
            (Course.description.like(search_pattern)) |
            (Course.skills.like(search_pattern))
        )
        
    return query.all()

@router.get("/courses/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.get("/users/{user_id}/recommendations", response_model=List[RecommendationResponse])
def get_user_recommendations(user_id: int, db: Session = Depends(get_db)):
    user = UserService.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return RecommendationService.get_recommendations(db, user_id)
