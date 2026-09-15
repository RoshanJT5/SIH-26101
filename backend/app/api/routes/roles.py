from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.role_service import RoleService
from app.schemas.role import (
    OrganizationResponse,
    RoleResponse,
    RoleCompetencyRequirement,
    RoleCreate,
    RoleCompetencyCreate,
    ProgressiveHierarchyResponse
)
from app.models.organization_role import Role, Organization, RoleCompetency
from typing import List, Optional

router = APIRouter(prefix="/roles", tags=["Roles & Competency Baselines"])

@router.get("/hierarchy/progressive", response_model=ProgressiveHierarchyResponse)
def get_progressive_hierarchy(db: Session = Depends(get_db)):
    """
    Returns 3-step progressive onboarding structure:
    Ministry -> Department -> Organization -> Designation/Role with auto-loaded competencies.
    """
    return RoleService.get_progressive_hierarchy(db)

@router.get("/organizations", response_model=List[OrganizationResponse])
def list_organizations(db: Session = Depends(get_db)):
    return RoleService.get_all_organizations(db)

@router.get("", response_model=List[RoleResponse])
def list_roles(organization_id: Optional[int] = None, db: Session = Depends(get_db)):
    roles = RoleService.get_all_roles(db, organization_id)
    results = []
    for r in roles:
        comp_reqs = [
            RoleCompetencyRequirement(
                competency_id=rc.competency_id,
                competency_name=rc.competency.name if rc.competency else "Unknown",
                category=rc.competency.category if rc.competency else "Unknown",
                required_level=rc.required_level,
                importance=rc.importance,
                description=rc.description
            )
            for rc in r.competency_requirements
        ]
        results.append(RoleResponse(
            id=r.id,
            role_name=r.role_name,
            organization_id=r.organization_id,
            organization_name=r.organization.name if r.organization else "MoSPI",
            service_cadre=r.service_cadre,
            description=r.description,
            responsibilities=r.responsibilities,
            competency_count=len(comp_reqs),
            competencies=comp_reqs
        ))
    return results

@router.get("/{role_id}", response_model=RoleResponse)
def get_role_details(role_id: int, db: Session = Depends(get_db)):
    role = RoleService.get_role(db, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    comp_reqs = [
        RoleCompetencyRequirement(
            competency_id=rc.competency_id,
            competency_name=rc.competency.name if rc.competency else "Unknown",
            category=rc.competency.category if rc.competency else "Unknown",
            required_level=rc.required_level,
            importance=rc.importance,
            description=rc.description
        )
        for rc in role.competency_requirements
    ]
    return RoleResponse(
        id=role.id,
        role_name=role.role_name,
        organization_id=role.organization_id,
        organization_name=role.organization.name if role.organization else "MoSPI",
        service_cadre=role.service_cadre,
        description=role.description,
        responsibilities=role.responsibilities,
        competency_count=len(comp_reqs),
        competencies=comp_reqs
    )

@router.get("/{role_id}/competencies", response_model=List[RoleCompetencyRequirement])
def get_role_competency_requirements(role_id: int, db: Session = Depends(get_db)):
    role = RoleService.get_role(db, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    return [
        RoleCompetencyRequirement(
            competency_id=rc.competency_id,
            competency_name=rc.competency.name if rc.competency else "Unknown",
            category=rc.competency.category if rc.competency else "Unknown",
            required_level=rc.required_level,
            importance=rc.importance,
            description=rc.description
        )
        for rc in role.competency_requirements
    ]

@router.post("", response_model=RoleResponse)
def create_role(role_in: RoleCreate, db: Session = Depends(get_db)):
    role = Role(
        role_name=role_in.role_name,
        organization_id=role_in.organization_id,
        service_cadre=role_in.service_cadre,
        description=role_in.description,
        responsibilities=role_in.responsibilities
    )
    db.add(role)
    db.commit()
    db.refresh(role)
    return RoleResponse(
        id=role.id,
        role_name=role.role_name,
        organization_id=role.organization_id,
        organization_name=role.organization.name if role.organization else None,
        service_cadre=role.service_cadre,
        description=role.description,
        responsibilities=role.responsibilities,
        competency_count=0,
        competencies=[]
    )

@router.post("/{role_id}/competencies")
def add_role_competency_requirement(role_id: int, comp_in: RoleCompetencyCreate, db: Session = Depends(get_db)):
    role = RoleService.get_role(db, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    rc = db.query(RoleCompetency).filter(
        RoleCompetency.role_id == role_id,
        RoleCompetency.competency_id == comp_in.competency_id
    ).first()
    if rc:
        rc.required_level = comp_in.required_level
        rc.importance = comp_in.importance
        rc.description = comp_in.description
    else:
        rc = RoleCompetency(
            role_id=role_id,
            competency_id=comp_in.competency_id,
            required_level=comp_in.required_level,
            importance=comp_in.importance,
            description=comp_in.description
        )
        db.add(rc)
    db.commit()
    return {"status": "success", "message": "Role competency requirement updated"}
