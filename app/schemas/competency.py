from pydantic import BaseModel
from typing import Optional

class CompetencyBase(BaseModel):
    name: str
    category: str
    description: Optional[str] = None

class CompetencyCreate(CompetencyBase):
    pass

class CompetencyResponse(CompetencyBase):
    id: int

    class Config:
        from_attributes = True
