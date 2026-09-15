from pydantic import BaseModel
from typing import List, Optional

class SkillGapDetail(BaseModel):
    competency_id: int
    competency: str
    category: str
    current_level: int
    required_level: int
    gap: int
    priority: str # "CRITICAL", "HIGH", "MEDIUM", "LOW", "NONE"
    importance: str # "CRITICAL", "HIGH", "MEDIUM"
    why_it_matters: str
    recommended_learning_types: List[str] = []

class SkillGapResponse(BaseModel):
    user_id: int
    user_name: str
    role_id: Optional[int] = None
    role_name: str
    organization_name: str
    service_cadre: Optional[str] = None
    overall_health_score: int # 0 to 100%
    total_competencies: int
    critical_gaps_count: int
    high_gaps_count: int
    medium_gaps_count: int
    strengths_count: int
    skill_gaps: List[SkillGapDetail]
