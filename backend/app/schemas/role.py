from pydantic import BaseModel
from typing import List, Optional

class OrganizationResponse(BaseModel):
    id: int
    name: str
    ministry: str
    department: str
    description: Optional[str] = None
    active: bool

    class Config:
        from_attributes = True


class RoleCompetencyRequirement(BaseModel):
    competency_id: int
    competency_name: str
    category: str
    required_level: int
    importance: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class RoleResponse(BaseModel):
    id: int
    role_name: str
    organization_id: int
    organization_name: Optional[str] = None
    service_cadre: Optional[str] = None
    description: Optional[str] = None
    responsibilities: Optional[str] = None
    competency_count: int = 0
    competencies: List[RoleCompetencyRequirement] = []

    class Config:
        from_attributes = True


class RoleCreate(BaseModel):
    role_name: str
    organization_id: int
    service_cadre: Optional[str] = None
    description: Optional[str] = None
    responsibilities: Optional[str] = None


class RoleCompetencyCreate(BaseModel):
    competency_id: int
    required_level: int
    importance: str = "HIGH"
    description: Optional[str] = None


class ProgressiveHierarchyResponse(BaseModel):
    ministries: List[str]
    departments_by_ministry: dict[str, List[str]]
    organizations_by_dept: dict[str, List[dict]]
    roles_by_org: dict[int, List[dict]]
