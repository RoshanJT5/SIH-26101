from sqlalchemy.orm import Session
from app.models.user import User, UserCompetency
from app.models.organization_role import Role, RoleCompetency
from app.models.competency import Competency
from typing import Dict, Any, List

class SkillGapService:
    @staticmethod
    def calculate_priority(gap: int) -> str:
        if gap <= 0:
            return "NONE"
        elif gap == 1:
            return "MEDIUM"
        elif gap == 2:
            return "HIGH"
        else:
            return "CRITICAL"

    @staticmethod
    def get_user_skill_gaps(db: Session, user_id: int) -> Dict[str, Any]:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {
                "user_id": user_id,
                "user_name": "Unknown",
                "role_id": None,
                "role_name": "Unassigned",
                "organization_name": "Government of India",
                "service_cadre": "General",
                "overall_health_score": 0,
                "total_competencies": 0,
                "critical_gaps_count": 0,
                "high_gaps_count": 0,
                "medium_gaps_count": 0,
                "strengths_count": 0,
                "skill_gaps": []
            }

        # Determine Role
        role = user.role
        if not role and user.role_id:
            role = db.query(Role).filter(Role.id == user.role_id).first()
        if not role:
            # Fallback to first role matching designation or default to Role 1
            role = db.query(Role).first()

        role_comps = role.competency_requirements if role else []
        
        # User current competencies map
        user_comps = db.query(UserCompetency).filter(UserCompetency.user_id == user_id).all()
        user_comp_map = {uc.competency_id: uc for uc in user_comps}

        gap_details = []
        total_required_sum = 0
        total_current_sum = 0
        critical_count = 0
        high_count = 0
        medium_count = 0
        strengths_count = 0

        for rc in role_comps:
            comp = rc.competency
            if not comp:
                continue

            req_level = rc.required_level
            total_required_sum += req_level

            uc = user_comp_map.get(comp.id)
            cur_level = uc.current_level if uc else 0
            total_current_sum += min(cur_level, req_level)

            gap_val = max(0, req_level - cur_level)
            priority = SkillGapService.calculate_priority(gap_val)

            if priority == "CRITICAL":
                critical_count += 1
            elif priority == "HIGH":
                high_count += 1
            elif priority == "MEDIUM":
                medium_count += 1
            else:
                strengths_count += 1

            why_it_matters = rc.description or f"Required competency for {role.role_name} to execute operational duties effectively."
            
            # Recommended learning avenues based on category
            recommended_types = ["iGOT Verified e-Learning"]
            if rc.importance == "CRITICAL" or gap_val >= 2:
                recommended_types.append("NSSTA In-Service Training")
            recommended_types.append("Document-based Diagnostic MCQ")

            gap_details.append({
                "competency_id": comp.id,
                "competency": comp.name,
                "category": comp.category,
                "current_level": cur_level,
                "required_level": req_level,
                "gap": gap_val,
                "priority": priority,
                "importance": rc.importance,
                "why_it_matters": why_it_matters,
                "recommended_learning_types": recommended_types
            })

        # Calculate Overall Health Percentage
        health_score = int((total_current_sum / total_required_sum * 100)) if total_required_sum > 0 else 100
        health_score = min(health_score, 100)

        # Sort gaps: CRITICAL first, then HIGH, then MEDIUM, then NONE
        priority_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "NONE": 3}
        gap_details.sort(key=lambda x: (priority_order.get(x["priority"], 4), -x["gap"]))

        org_name = user.organization.name if user.organization else (role.organization.name if role and role.organization else "Ministry of Statistics and Programme Implementation")

        return {
            "user_id": user.id,
            "user_name": user.name,
            "role_id": role.id if role else None,
            "role_name": role.role_name if role else "Statistical Officer",
            "organization_name": org_name,
            "service_cadre": role.service_cadre if role else "ISS / SSS Cadre",
            "overall_health_score": health_score,
            "total_competencies": len(gap_details),
            "critical_gaps_count": critical_count,
            "high_gaps_count": high_count,
            "medium_gaps_count": medium_count,
            "strengths_count": strengths_count,
            "skill_gaps": gap_details
        }
