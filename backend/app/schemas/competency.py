from pydantic import BaseModel
from typing import Optional

class CompetencyBase(BaseModel):
    name: str
    category: str # STATISTICAL, TECHNICAL, DIGITAL_GOVERNANCE, BEHAVIOURAL_MANAGERIAL
    description: Optional[str] = None
    max_level: int = 5
    active: bool = True

class CompetencyCreate(CompetencyBase):
    pass

class CompetencyResponse(CompetencyBase):
    id: int

    class Config:
        from_attributes = True
