from sqlalchemy.orm import Session
from app.models.course import Course, CourseCompetency, TrainingProgramme
from app.models.user import User, UserCompetency
from app.models.organization_role import Role, RoleCompetency
from app.models.competency import Competency
from app.models.progress import LearningHistory
from app.services.igot_service import LearningProvider
from typing import List, Dict, Any

class RecommendationService:
    @staticmethod
    def get_recommendations(db: Session, user_id: int) -> List[Dict[str, Any]]:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return []

        # Ensure catalog is seeded
        courses = db.query(Course).filter(Course.active == True).all()
        if not courses:
            RecommendationService.seed_courses(db)
            courses = db.query(Course).filter(Course.active == True).all()

        # Get User's Role Competency Requirements
        role = user.role
        if not role and user.role_id:
            role = db.query(Role).filter(Role.id == user.role_id).first()
        if not role:
            role = db.query(Role).first()

        role_comp_map = {}
        if role:
            for rc in role.competency_requirements:
                role_comp_map[rc.competency_id] = {
                    "required": rc.required_level,
                    "importance": rc.importance
                }

        # User's current competency proficiencies
        user_comps = db.query(UserCompetency).filter(UserCompetency.user_id == user_id).all()
        user_comp_map = {uc.competency_id: uc.current_level for uc in user_comps}

        # Compute Gaps per competency ID
        comp_gaps: Dict[int, int] = {}
        for comp_id, r_info in role_comp_map.items():
            cur_lvl = user_comp_map.get(comp_id, 0)
            comp_gaps[comp_id] = max(0, r_info["required"] - cur_lvl)

        # Learning history map
        history_records = db.query(LearningHistory).filter(LearningHistory.user_id == user_id).all()
        history_map = {h.course_id: h.status for h in history_records}

        recommendations = []

        for course in courses:
            # If already completed, skip recommendation
            if history_map.get(course.id) == "Completed":
                continue

            # Fetch course competency mappings
            course_mappings = course.competency_mappings
            course_comp_ids = [cm.competency_id for cm in course_mappings]

            # 1. Skill Gap Score (40%)
            # Check maximum gap among competencies covered by this course
            max_gap_addressed = 0
            matching_gap_comps = []
            for cm in course_mappings:
                gap = comp_gaps.get(cm.competency_id, 0)
                if gap > 0:
                    max_gap_addressed = max(max_gap_addressed, gap)
                    comp_obj = db.query(Competency).filter(Competency.id == cm.competency_id).first()
                    if comp_obj:
                        matching_gap_comps.append((comp_obj.name, gap))

            gap_score = min(max_gap_addressed / 5.0, 1.0) if max_gap_addressed > 0 else 0.0

            # 2. Role / Competency Relevance (25%)
            # High score if course addresses competencies required for user's role
            role_relevance_score = 0.0
            for cm in course_mappings:
                if cm.competency_id in role_comp_map:
                    importance = role_comp_map[cm.competency_id]["importance"]
                    if importance == "CRITICAL":
                        role_relevance_score = max(role_relevance_score, 1.0)
                    elif importance == "HIGH":
                        role_relevance_score = max(role_relevance_score, 0.8)
                    else:
                        role_relevance_score = max(role_relevance_score, 0.5)

            # 3. Learning Resource Competency Coverage (20%)
            # Evaluates depth and alignment of the course
            coverage_score = 0.5
            if course_mappings:
                avg_coverage = sum(cm.coverage_level for cm in course_mappings) / len(course_mappings)
                coverage_score = min(avg_coverage / 5.0, 1.0)

            # 4. Learning History / Personalization (15%)
            if history_map.get(course.id) in ["Started", "In Progress"]:
                history_score = 1.0
            else:
                history_score = 0.5

            # Total Weighted Score
            final_score = (
                (0.40 * gap_score) +
                (0.25 * role_relevance_score) +
                (0.20 * coverage_score) +
                (0.15 * history_score)
            )

            # Dynamic human-readable reasoning
            if matching_gap_comps:
                gap_strs = [f"{name} (Gap: {g} levels)" for name, g in matching_gap_comps[:2]]
                reason = f"Directly addresses your role competency gap in {', '.join(gap_strs)}."
            elif role_relevance_score >= 0.8:
                reason = f"Covers essential competencies mandated for your designation as {role.role_name if role else 'Official'}."
            elif course.skills:
                reason = f"Builds core statistical capacity in {course.skills.split(',')[0]}."
            else:
                reason = "Recommended by Capacity Building Commission for Official Statistical System personnel."

            cta_label = "Start Course on iGOT ↗" if "iGOT" in course.source_type else "View Training Programme ↗"

            skills_list = [cm.competency.name for cm in course_mappings if cm.competency]
            if not skills_list and course.skills:
                skills_list = [s.strip() for s in course.skills.split(",") if s.strip()]

            recommendations.append({
                "course_id": course.id,
                "external_id": course.external_id,
                "title": course.title,
                "description": course.description,
                "provider": course.provider,
                "source": course.source_type,
                "igot_course_id": course.igot_course_id,
                "course_url": course.course_url,
                "score": round(final_score, 2),
                "match_percentage": int(round(final_score * 100)),
                "skills_addressed": skills_list,
                "gap_level": max_gap_addressed,
                "reason": reason,
                "level": course.level,
                "duration_hours": course.duration_hours,
                "cta_label": cta_label
            })

        # Sort recommendations by match score descending
        recommendations.sort(key=lambda x: (x["score"], x["gap_level"]), reverse=True)
        return recommendations

    @staticmethod
    def seed_courses(db: Session):
        # 1. Seed Verified iGOT Courses
        for c in LearningProvider.VERIFIED_IGOT_COURSES:
            existing = db.query(Course).filter(Course.external_id == c["external_id"]).first()
            if not existing:
                db_course = Course(
                    external_id=c["external_id"],
                    title=c["title"],
                    description=c["description"],
                    provider=c["provider"],
                    source_type=c["source_type"],
                    igot_course_id=c.get("igot_course_id"),
                    course_url=c["course_url"],
                    level=c.get("level", "Intermediate"),
                    duration_hours=c.get("duration_hours", 0),
                    language=c.get("language", "English"),
                    skills=c.get("skills"),
                    active=True
                )
                db.add(db_course)
                db.commit()
                db.refresh(db_course)
                existing = db_course
            else:
                existing.title = c["title"]
                existing.description = c["description"]
                existing.provider = c["provider"]
                existing.source_type = c["source_type"]
                existing.igot_course_id = c.get("igot_course_id")
                existing.course_url = c["course_url"]
                existing.level = c.get("level", "Intermediate")
                existing.duration_hours = c.get("duration_hours", 0)
                existing.language = c.get("language", "English")
                existing.skills = c.get("skills")
                existing.active = True
                db.commit()

            # Seed CourseCompetency links
            for comp_name, cov_level, rel_score in c.get("competency_mappings", []):
                comp = db.query(Competency).filter(Competency.name == comp_name).first()
                if comp:
                    cc = db.query(CourseCompetency).filter(
                        CourseCompetency.course_id == existing.id,
                        CourseCompetency.competency_id == comp.id
                    ).first()
                    if not cc:
                        db.add(CourseCompetency(
                            course_id=existing.id,
                            competency_id=comp.id,
                            coverage_level=cov_level,
                            relevance_score=rel_score
                        ))
                    else:
                        cc.coverage_level = cov_level
                        cc.relevance_score = rel_score
            db.commit()

        # 2. Seed NSSTA & TPAC Training Programmes
        for p in LearningProvider.NSSTA_TPAC_PROGRAMMES:
            existing_prog = db.query(TrainingProgramme).filter(TrainingProgramme.title == p["title"]).first()
            if not existing_prog:
                db_prog = TrainingProgramme(
                    title=p["title"],
                    provider=p["provider"],
                    programme_type=p["programme_type"],
                    description=p["description"],
                    competencies=p["competencies"],
                    eligibility=p.get("eligibility"),
                    duration=p.get("duration", "5 Days"),
                    registration_url=p["registration_url"],
                    active=True
                )
                db.add(db_prog)
            else:
                existing_prog.provider = p["provider"]
                existing_prog.programme_type = p["programme_type"]
                existing_prog.description = p["description"]
                existing_prog.competencies = p["competencies"]
                existing_prog.eligibility = p.get("eligibility")
                existing_prog.registration_url = p["registration_url"]
        db.commit()
