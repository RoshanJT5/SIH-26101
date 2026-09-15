from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.recommendation_service import RecommendationService
from app.schemas.course import CourseResponse, RecommendationResponse, TrainingProgrammeResponse
from app.models.course import Course, TrainingProgramme
from typing import List, Optional

router = APIRouter(prefix="/courses", tags=["Learning Resources & Recommendations"])

@router.get("/recommendations/{user_id}", response_model=List[RecommendationResponse])
def get_recommended_courses(user_id: int, db: Session = Depends(get_db)):
    """
    Returns personalized course recommendations calculated using:
    40% Skill Gap + 25% Role Relevance + 20% Course Competency Coverage + 15% Learning History.
    Provides authentic verified iGOT / NSSTA deep links.
    """
    return RecommendationService.get_recommendations(db, user_id)

@router.get("/programmes/all", response_model=List[TrainingProgrammeResponse])
def list_training_programmes(db: Session = Depends(get_db)):
    """
    Returns official NSSTA / TPAC in-service residential & virtual training programmes.
    """
    programmes = db.query(TrainingProgramme).filter(TrainingProgramme.active == True).all()
    if not programmes:
        RecommendationService.seed_courses(db)
        programmes = db.query(TrainingProgramme).filter(TrainingProgramme.active == True).all()
    return programmes

@router.get("", response_model=List[CourseResponse])
def list_courses(source: Optional[str] = Query(None, description="Filter by source: 'iGOT Karmayogi', 'NSSTA / TPAC'"), db: Session = Depends(get_db)):
    query = db.query(Course).filter(Course.active == True)
    if source:
        query = query.filter(Course.source_type == source)
    courses = query.all()
    if not courses:
        RecommendationService.seed_courses(db)
        courses = db.query(Course).filter(Course.active == True).all()
    return courses

@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course
