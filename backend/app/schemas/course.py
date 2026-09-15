from pydantic import BaseModel
from typing import List, Optional

class CourseResponse(BaseModel):
    id: int
    external_id: str
    title: str
    description: Optional[str] = None
    provider: str
    source_type: str # "iGOT Karmayogi", "NSSTA / TPAC", "Approved Resource"
    igot_course_id: Optional[str] = None
    course_url: str
    level: Optional[str] = "Intermediate"
    duration_hours: int = 0
    language: str = "English"
    skills: Optional[str] = None
    active: bool = True

    class Config:
        from_attributes = True


class RecommendationResponse(BaseModel):
    course_id: int
    external_id: str
    title: str
    description: Optional[str] = None
    provider: str
    source: str # "iGOT Karmayogi", "NSSTA / TPAC", "Approved Resource"
    igot_course_id: Optional[str] = None
    course_url: str
    score: float # 0.0 to 1.0 (match score)
    match_percentage: int
    skills_addressed: List[str]
    gap_level: int = 0
    reason: str
    level: Optional[str] = None
    duration_hours: Optional[int] = None
    cta_label: str = "Start Course on iGOT ↗"


class TrainingProgrammeResponse(BaseModel):
    id: int
    title: str
    provider: str
    programme_type: str
    description: Optional[str] = None
    competencies: str
    eligibility: Optional[str] = None
    duration: str
    registration_url: str
    active: bool

    class Config:
        from_attributes = True
