from pydantic import BaseModel
from typing import List, Optional, Dict

class WorkforceCompetencyGapItem(BaseModel):
    competency_id: int
    competency_name: str
    category: str
    average_current_level: float
    average_required_level: float
    average_gap: float
    officials_affected: int
    critical_count: int
    high_count: int
    priority: str

class RoleGapAnalyticsItem(BaseModel):
    role_id: int
    role_name: str
    organization_name: str
    total_officials: int
    average_health_score: int
    top_gap_competencies: List[str]

class DepartmentAnalyticsItem(BaseModel):
    organization_name: str
    department: Optional[str] = "General"
    total_officials: int
    average_health_score: int
    top_gap_competencies: List[str] = []

class WorkforceReadinessItem(BaseModel):
    fully_ready_count: int = 0
    fully_ready_pct: int = 0
    needs_development_count: int = 0
    needs_development_pct: int = 0
    assessment_pending_count: int = 0
    assessment_pending_pct: int = 0

class LearningProgressItem(BaseModel):
    active_learners: int = 0
    courses_started: int = 0
    courses_completed: int = 0
    average_completion_pct: int = 0

class AssessmentOverviewItem(BaseModel):
    assessments_completed: int = 0
    average_score: int = 0
    pass_rate: int = 0
    pending_assessments: int = 0

class EmployeeAlertItem(BaseModel):
    id: int
    name: str
    email: str
    designation: Optional[str] = None
    role_name: str
    organization_name: str
    health_score: int
    primary_gap_competency: str
    gap_level: int
    priority: str

class OfficialSummaryItem(BaseModel):
    id: int
    name: str
    email: str
    employee_id: str
    designation: str
    role_name: str
    organization: str
    department: str
    service_cadre: str
    health_score: int
    primary_gap: str
    priority: str
    assessment_status: str

class AdminAnalyticsResponse(BaseModel):
    total_officials: int
    total_organizations: int
    total_roles: int
    total_competencies: int
    total_courses_catalog: int
    total_assessments_conducted: int
    average_workforce_health_score: int
    high_deficiency_competencies: List[WorkforceCompetencyGapItem]
    role_wise_analytics: List[RoleGapAnalyticsItem]
    category_distribution: Dict[str, int]
    category_health: Optional[Dict[str, int]] = None
    department_analytics: Optional[List[DepartmentAnalyticsItem]] = None
    workforce_readiness: Optional[WorkforceReadinessItem] = None
    learning_progress: Optional[LearningProgressItem] = None
    assessment_overview: Optional[AssessmentOverviewItem] = None
    employees_needing_attention: Optional[List[EmployeeAlertItem]] = None
    officials_summary: Optional[List[OfficialSummaryItem]] = None
