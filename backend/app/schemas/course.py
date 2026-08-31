from pydantic import BaseModel
from typing import List, Optional

class CourseBase(BaseModel):
    external_id: str
    source: str = "iGOT Karmayogi"
    title: str
    description: Optional[str] = None
    level: Optional[str] = None
    duration_hours: Optional[int] = 0
    language: Optional[str] = "English"
    skills: Optional[str] = None # Comma-separated skills
    course_url: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class CourseResponse(CourseBase):
    id: int

    class Config:
        from_attributes = True

class RecommendationResponse(BaseModel):
    course_id: int
    external_id: Optional[str] = None
    source: str = "iGOT Karmayogi"
    title: str
    description: Optional[str] = None
    score: float
    skills_addressed: List[str]
    reason: str
    level: Optional[str] = None
    duration_hours: Optional[int] = 0
    course_url: Optional[str] = None
