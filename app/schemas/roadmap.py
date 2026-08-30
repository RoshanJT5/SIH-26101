from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RoadmapGenerateRequest(BaseModel):
    target_competency: str
    number_of_days: Optional[int] = 7 # Default study plan duration

class RoadmapTaskResponse(BaseModel):
    id: int
    day_number: int
    task_title: str
    task_description: Optional[str] = None
    status: str
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RoadmapResponse(BaseModel):
    id: int
    user_id: int
    title: str
    target_competency: str
    progress_percentage: int
    created_at: datetime
    tasks: List[RoadmapTaskResponse]

    class Config:
        from_attributes = True

class TaskStatusUpdate(BaseModel):
    status: str # "Pending" or "Completed"
