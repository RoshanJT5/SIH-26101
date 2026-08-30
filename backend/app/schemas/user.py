from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserCompetencyBase(BaseModel):
    competency_id: int
    current_level: int
    required_level: int

class UserCompetencyCreate(UserCompetencyBase):
    pass

class UserCompetencyResponse(UserCompetencyBase):
    id: int
    user_id: int
    competency_name: str
    category: str
    last_updated: datetime

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    name: str
    email: EmailStr
    department: Optional[str] = None
    designation: Optional[str] = None
    job_role: Optional[str] = None
    experience_years: Optional[int] = 0
    education: Optional[str] = None
    career_goal: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    job_role: Optional[str] = None
    experience_years: Optional[int] = None
    education: Optional[str] = None
    career_goal: Optional[str] = None

class UserResponse(UserBase):
    id: int
    competencies: List[UserCompetencyResponse] = []

    class Config:
        from_attributes = True
