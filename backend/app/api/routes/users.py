from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.user_service import UserService
from app.schemas.user import (
    UserCreate,
    UserOnboardingCreate,
    UserUpdate,
    UserLogin,
    UserProfileResponse,
    UserCompetencyResponse,
    UserCompetencyCreate,
    RoleAssignmentRequest,
    CompetencyProgressHistoryItem
)
from app.models.user import User, UserCompetency, CompetencyProgressHistory
from app.models.organization_role import RoleCompetency
from typing import List

router = APIRouter(prefix="/users", tags=["Users & Authentication"])

@router.post("", response_model=UserProfileResponse, status_code=201)
@router.post("/register", response_model=UserProfileResponse, status_code=201)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    try:
        user = UserService.create_user(db, user_in)
        return get_user_profile(user.id, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/onboarding", response_model=UserProfileResponse, status_code=201)
def register_onboarding_user(onboarding_in: UserOnboardingCreate, db: Session = Depends(get_db)):
    """
    Complete 3-Step Onboarding:
    Creates User, assigns Organization & Role, maps RoleCompetency baseline,
    records Self-Reported competencies vs. Assessment-Required competencies,
    and initializes audit baseline history.
    """
    try:
        user = UserService.create_onboarding_user(db, onboarding_in)
        return get_user_profile(user.id, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    user = UserService.authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    role_name = user.role.role_name if user.role else (user.designation or "Statistical Officer")
    is_admin = bool(
        (user.role and user.role.role_name.lower() == "admin")
        or (user.designation and user.designation.lower() == "admin")
        or (user.job_role and user.job_role.lower() == "admin")
        or user.email.lower() == "admin@pragatiparikshan.demo"
    )
    
    return {
        "access_token": f"bearer-session-{user.id}",
        "token_type": "bearer",
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": "Admin" if is_admin else role_name,
        "role_name": "Admin" if is_admin else role_name,
        "designation": user.designation or role_name,
        "is_admin": is_admin,
        "organization_name": user.organization.name if user.organization else (user.department or "MoSPI")
    }

@router.get("/me", response_model=UserProfileResponse)
def get_current_user(user_id: int = Query(1, description="Simulated Session User ID for prototype"), db: Session = Depends(get_db)):
    return get_user_profile(user_id, db)

@router.get("/{user_id}", response_model=UserProfileResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = UserService.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    role = user.role
    role_req_map = {}
    if role:
        for rc in role.competency_requirements:
            role_req_map[rc.competency_id] = rc.required_level

    # Build UserCompetencyResponse with computed required_level and gap
    comp_responses = []
    for uc in user.competencies:
        comp = uc.competency
        if comp:
            req_lvl = role_req_map.get(comp.id, 3)
            gap = max(0, req_lvl - uc.current_level)
            comp_responses.append(UserCompetencyResponse(
                id=uc.id,
                user_id=uc.user_id,
                competency_id=uc.competency_id,
                competency_name=comp.name,
                category=comp.category,
                current_level=uc.current_level,
                required_level=req_lvl,
                gap=gap,
                confidence=uc.confidence,
                last_assessed=uc.last_assessed,
                assessment_source=uc.assessment_source
            ))

    # Build Progress History
    history_responses = []
    for ph in user.progress_history:
        history_responses.append(CompetencyProgressHistoryItem(
            id=ph.id,
            competency_id=ph.competency_id,
            competency_name=ph.competency.name if ph.competency else "Competency",
            previous_level=ph.previous_level,
            new_level=ph.new_level,
            score=ph.score,
            trigger_source=ph.trigger_source,
            notes=ph.notes,
            created_at=ph.created_at
        ))

    return UserProfileResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        mobile=user.mobile,
        employee_id=user.employee_id,
        organization_id=user.organization_id,
        organization_name=user.organization.name if user.organization else (user.department or "Ministry of Statistics and Programme Implementation"),
        ministry=user.organization.ministry if user.organization else "Ministry of Statistics and Programme Implementation (MoSPI)",
        department=user.organization.department if user.organization else (user.department or "Department of Statistics"),
        division_unit=user.division_unit,
        role_id=user.role_id,
        role_name=role.role_name if role else (user.designation or "Statistical Officer"),
        service_cadre=role.service_cadre if role else "Indian Statistical Service (ISS)",
        designation=user.designation or (role.role_name if role else "Statistical Officer"),
        job_role=user.job_role or (role.role_name if role else "Survey Analyst"),
        experience_years=user.experience_years or 0,
        education=user.education or "M.Sc. Statistics",
        specialization=user.specialization,
        career_goal=user.career_goal or "Lead Statistical Analyst",

        competencies=comp_responses,
        progress_history=history_responses
    )

@router.put("/{user_id}", response_model=UserProfileResponse)
def update_user(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db)):
    try:
        user = UserService.update_user(db, user_id, user_in)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return get_user_profile(user.id, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{user_id}/assign-role", response_model=UserProfileResponse)
def assign_user_role(user_id: int, assignment: RoleAssignmentRequest, db: Session = Depends(get_db)):
    """
    Assigns user to a specific Organization and Role, automatically synchronizing role competency requirements.
    """
    user = UserService.assign_role(db, user_id, assignment.organization_id, assignment.role_id, assignment.designation)
    if not user:
        raise HTTPException(status_code=404, detail="User could not be updated with role")
    return get_user_profile(user_id, db)

@router.get("/{user_id}/competencies", response_model=List[UserCompetencyResponse])
def get_user_competencies(user_id: int, db: Session = Depends(get_db)):
    profile = get_user_profile(user_id, db)
    return profile.competencies

@router.post("/{user_id}/competencies", response_model=UserCompetencyResponse)
def add_or_update_user_competency(user_id: int, comp_in: UserCompetencyCreate, db: Session = Depends(get_db)):
    uc = UserService.add_user_competency(db, user_id, comp_in)
    user = UserService.get_user(db, user_id)
    role = user.role if user else None
    
    req_level = 3
    if role:
        rc = db.query(RoleCompetency).filter(
            RoleCompetency.role_id == role.id,
            RoleCompetency.competency_id == comp_in.competency_id
        ).first()
        if rc:
            req_level = rc.required_level

    gap = max(0, req_level - uc.current_level)

    return UserCompetencyResponse(
        id=uc.id,
        user_id=uc.user_id,
        competency_id=uc.competency_id,
        competency_name=uc.competency.name if uc.competency else "Unknown",
        category=uc.competency.category if uc.competency else "Unknown",
        current_level=uc.current_level,
        required_level=req_level,
        gap=gap,
        confidence=uc.confidence,
        last_assessed=uc.last_assessed,
        assessment_source=uc.assessment_source
    )

@router.get("/{user_id}/progress-history", response_model=List[CompetencyProgressHistoryItem])
def get_user_progress_history(user_id: int, db: Session = Depends(get_db)):
    history = db.query(CompetencyProgressHistory).filter(
        CompetencyProgressHistory.user_id == user_id
    ).order_by(CompetencyProgressHistory.id.desc()).all()
    
    return [
        CompetencyProgressHistoryItem(
            id=ph.id,
            competency_id=ph.competency_id,
            competency_name=ph.competency.name if ph.competency else "Competency",
            previous_level=ph.previous_level,
            new_level=ph.new_level,
            score=ph.score,
            trigger_source=ph.trigger_source,
            notes=ph.notes,
            created_at=ph.created_at
        )
        for ph in history
    ]
