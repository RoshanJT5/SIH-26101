from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.dependencies import require_admin_user
from app.models.user import User
from app.services.admin_service import AdminService
from app.services.user_service import UserService
from app.schemas.admin import AdminAnalyticsResponse
from app.schemas.user import UserProfileResponse
from typing import List

router = APIRouter(prefix="/admin", tags=["Admin & Workforce Intelligence"])

@router.get("/analytics", response_model=AdminAnalyticsResponse)
def get_workforce_analytics(
    admin_user: User = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    """
    Returns workforce-level competency intelligence:
    - Overall workforce health %
    - Top deficient competencies across all officials
    - Role-wise health and top gap areas
    - Cadre & domain distributions
    Requires Official Admin authorization.
    """
    return AdminService.get_workforce_analytics(db)

@router.get("/users", response_model=List[UserProfileResponse])
def get_all_officials(
    admin_user: User = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    """
    Lists all registered officials with their assigned organizations, roles, and competency profiles.
    Requires Official Admin authorization.
    """
    users = UserService.get_all_users(db)
    results = []
    from app.api.routes.users import get_user_profile
    for u in users:
        results.append(get_user_profile(u.id, db))
    return results

