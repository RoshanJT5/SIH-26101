from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProgressUpdate(BaseModel):
    course_id: int
    status: str # Started, In Progress, Completed
    progress_percentage: int

class ProgressResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    status: str
    progress_percentage: int
    last_accessed: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
