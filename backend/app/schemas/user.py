from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    mobile: Optional[str] = None
    employee_id: Optional[str] = None
    organization_id: Optional[int] = None
    role_id: Optional[int] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    job_role: Optional[str] = None
    division_unit: Optional[str] = None
    experience_years: Optional[int] = 0
    education: Optional[str] = None
    specialization: Optional[str] = None
    career_goal: Optional[str] = None

class UserCreate(UserBase):
    password: Optional[str] = None

class SelectedSkillInput(BaseModel):
    competency_id: int
    current_level: Optional[int] = None # 1 to 5, or None/0 for 'Not sure / Assess me'
    not_sure_assess: Optional[bool] = False

class UserOnboardingCreate(BaseModel):
    # Personal Information
    name: str
    email: EmailStr
    password: str
    mobile: Optional[str] = None
    employee_id: Optional[str] = None

    # Organization & Role
    ministry: Optional[str] = None
    department: Optional[str] = None
    organization_id: Optional[int] = None
    division_unit: Optional[str] = None
    designation: Optional[str] = None
    role_id: Optional[int] = None
    job_role: Optional[str] = None
    experience_years: Optional[int] = 0
    education: Optional[str] = None
    specialization: Optional[str] = None
    career_goal: Optional[str] = None

    # Declared Skills & Self-Reported Proficiency
    selected_skills: Optional[List[SelectedSkillInput]] = []

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    mobile: Optional[str] = None
    employee_id: Optional[str] = None
    organization_id: Optional[int] = None
    role_id: Optional[int] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    job_role: Optional[str] = None
    division_unit: Optional[str] = None
    experience_years: Optional[int] = None
    education: Optional[str] = None
    specialization: Optional[str] = None
    career_goal: Optional[str] = None

class UserCompetencyResponse(BaseModel):
    id: int
    user_id: int
    competency_id: int
    competency_name: str
    category: str
    current_level: int
    required_level: int # Calculated from User's RoleCompetency
    gap: int
    confidence: float
    last_assessed: Optional[datetime] = None
    assessment_source: str

    class Config:
        from_attributes = True

class UserCompetencyCreate(BaseModel):
    competency_id: int
    current_level: int
    confidence: Optional[float] = 0.5
    assessment_source: Optional[str] = "SELF_APPRAISAL"

class CompetencyProgressHistoryItem(BaseModel):
    id: int
    competency_id: int
    competency_name: str
    previous_level: int
    new_level: int
    score: Optional[float] = None
    trigger_source: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class RoleAssignmentRequest(BaseModel):
    organization_id: int
    role_id: int
    designation: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    mobile: Optional[str] = None
    employee_id: Optional[str] = None
    organization_id: Optional[int] = None
    organization_name: Optional[str] = None
    ministry: Optional[str] = None
    department: Optional[str] = None
    division_unit: Optional[str] = None
    role_id: Optional[int] = None
    role_name: Optional[str] = None
    service_cadre: Optional[str] = None
    designation: Optional[str] = None
    job_role: Optional[str] = None
    experience_years: int
    education: Optional[str] = None
    specialization: Optional[str] = None
    career_goal: Optional[str] = None
    competencies: List[UserCompetencyResponse] = []
    progress_history: List[CompetencyProgressHistoryItem] = []

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

