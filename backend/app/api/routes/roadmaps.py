from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.dependencies import get_db
from app.schemas.roadmap import RoadmapGenerateRequest, RoadmapResponse, RoadmapTaskResponse, TaskStatusUpdate
from app.services.roadmap_service import RoadmapService
from app.services.user_service import UserService

router = APIRouter(tags=["Roadmaps & Trackers"])

@router.post("/users/{user_id}/roadmaps/generate", response_model=RoadmapResponse, status_code=status.HTTP_201_CREATED)
def generate_user_roadmap(user_id: int, req: RoadmapGenerateRequest, db: Session = Depends(get_db)):
    user = UserService.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    roadmap = RoadmapService.generate_roadmap(db, user_id, req)
    return roadmap

@router.post("/roadmaps/generate", response_model=RoadmapResponse, status_code=status.HTTP_201_CREATED)
def generate_roadmap_query(req: RoadmapGenerateRequest, user_id: Optional[int] = Query(1), db: Session = Depends(get_db)):
    u_id = user_id or 1
    user = UserService.get_user(db, u_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    roadmap = RoadmapService.generate_roadmap(db, u_id, req)
    return roadmap

@router.get("/users/{user_id}/roadmaps", response_model=List[RoadmapResponse])
@router.get("/roadmaps/user/{user_id}", response_model=List[RoadmapResponse])
def get_user_roadmaps(user_id: int, db: Session = Depends(get_db)):
    user = UserService.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return RoadmapService.get_user_roadmaps(db, user_id)

@router.put("/roadmaps/tasks/{task_id}", response_model=RoadmapTaskResponse)
def toggle_roadmap_task(task_id: int, update: TaskStatusUpdate, db: Session = Depends(get_db)):
    task = RoadmapService.toggle_task(db, task_id, update)
    if not task:
        raise HTTPException(status_code=404, detail="Roadmap task not found")
    return task

@router.post("/quizzes/results/{result_id}/roadmap", response_model=RoadmapResponse, status_code=status.HTTP_201_CREATED)
@router.post("/roadmaps/remediation/{result_id}", response_model=RoadmapResponse, status_code=status.HTTP_201_CREATED)
def generate_remediation_roadmap(result_id: int, number_of_days: Optional[int] = 3, db: Session = Depends(get_db)):
    roadmap = RoadmapService.generate_remediation_roadmap(db, result_id, number_of_days)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Quiz result not found or contains no incorrect answers to remediate.")
    return roadmap
