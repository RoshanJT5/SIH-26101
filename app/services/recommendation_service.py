from sqlalchemy.orm import Session
from app.models.course import Course
from app.models.user import User, UserCompetency
from app.models.competency import Competency
from app.models.progress import LearningHistory
from app.schemas.course import RecommendationResponse
from typing import List

class RecommendationService:
    @staticmethod
    def get_recommendations(db: Session, user_id: int) -> List[dict]:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return []

        # Get all courses
        courses = db.query(Course).all()
        # Seed basic course database if empty
        if not courses:
            RecommendationService.seed_courses(db)
            courses = db.query(Course).all()

        user_comps = db.query(UserCompetency).filter(UserCompetency.user_id == user_id).all()
        # Create quick map of user's competencies
        user_comp_map = {}
        for uc in user_comps:
            comp = db.query(Competency).filter(Competency.id == uc.competency_id).first()
            if comp:
                user_comp_map[comp.name.lower()] = {
                    "current": uc.current_level,
                    "required": uc.required_level,
                    "gap": max(0, uc.required_level - uc.current_level)
                }

        # User learning history map
        history_records = db.query(LearningHistory).filter(LearningHistory.user_id == user_id).all()
        history_map = {h.course_id: h.status for h in history_records}

        recommendations = []

        for course in courses:
            # If already completed, do not recommend
            if history_map.get(course.id) == "Completed":
                continue

            # Parse skills covered by the course
            course_skills = [s.strip().lower() for s in course.skills.split(",") if s.strip()] if course.skills else []

            # 1. Skill Gap (40%)
            max_gap = 0
            for skill in course_skills:
                if skill in user_comp_map:
                    max_gap = max(max_gap, user_comp_map[skill]["gap"])
            gap_score = min(max_gap / 5.0, 1.0) if max_gap > 0 else 0.0

            # 2. Role Relevance (25%)
            # If the user has a required level > 0 for this skill, it is relevant to their role
            role_relevance_score = 0.0
            for skill in course_skills:
                if skill in user_comp_map and user_comp_map[skill]["required"] > 0:
                    role_relevance_score = 1.0
                    break

            # 3. Topic Match (20%)
            # Checks if course skills overlap with career goal or job role
            topic_match_score = 0.0
            career_goal_lower = user.career_goal.lower() if user.career_goal else ""
            job_role_lower = user.job_role.lower() if user.job_role else ""
            for skill in course_skills:
                if (career_goal_lower and skill in career_goal_lower) or (job_role_lower and skill in job_role_lower):
                    topic_match_score = 1.0
                    break
            if topic_match_score == 0.0 and course_skills:
                # Default medium matching
                topic_match_score = 0.3

            # 4. Learning History (15%)
            # Started courses get higher priority to encourage completion
            if history_map.get(course.id) in ["Started", "In Progress"]:
                history_score = 1.0
            else:
                history_score = 0.5 # New course

            # Overall Score calculation
            score = (
                (0.40 * gap_score) +
                (0.25 * role_relevance_score) +
                (0.20 * topic_match_score) +
                (0.15 * history_score)
            )

            # Generate clear explanation reasoning
            reason = "Recommended because it addresses your skills."
            matching_gaps = [skill.title() for skill in course_skills if skill in user_comp_map and user_comp_map[skill]["gap"] > 0]
            if matching_gaps:
                reason = f"Addresses your skill gap in: {', '.join(matching_gaps)}."
            elif role_relevance_score > 0:
                reason = "Aligns with the required competencies for your job designation."
            elif topic_match_score > 0.5:
                reason = f"Supports your career goal of {user.career_goal}."

            recommendations.append({
                "course_id": course.id,
                "title": course.title,
                "description": course.description,
                "score": round(score, 2),
                "skills_addressed": [s.title() for s in course_skills],
                "reason": reason
            })

        # Sort recommendations by score descending
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        return recommendations

    @staticmethod
    def seed_courses(db: Session):
        courses_data = [
            {
                "external_id": "IGOT001",
                "source": "iGOT",
                "title": "Introduction to Survey Sampling",
                "description": "Learn the fundamentals of simple random sampling, stratified sampling, and estimation techniques.",
                "level": "Beginner",
                "duration_hours": 6,
                "language": "English",
                "skills": "Sampling,Survey Design"
            },
            {
                "external_id": "IGOT002",
                "source": "iGOT",
                "title": "FastAPI: Building Modern REST APIs in Python",
                "description": "Comprehensive guide to building high-performance APIs using FastAPI, Pydantic, and SQLAlchemy.",
                "level": "Intermediate",
                "duration_hours": 12,
                "language": "English",
                "skills": "Python,SQL,APIs"
            },
            {
                "external_id": "IGOT003",
                "source": "iGOT",
                "title": "Introduction to AI & Machine Learning Foundations",
                "description": "Get started with linear models, decision trees, neural networks, and prompt engineering.",
                "level": "Beginner",
                "duration_hours": 15,
                "language": "English",
                "skills": "AI/ML,Python"
            },
            {
                "external_id": "IGOT004",
                "source": "iGOT",
                "title": "Data Governance, Security & Privacy",
                "description": "Understanding Indian cybersecurity regulations, encryption standards, and digital signatures.",
                "level": "Advanced",
                "duration_hours": 8,
                "language": "English",
                "skills": "Cybersecurity,Data Privacy"
            },
            {
                "external_id": "IGOT005",
                "source": "iGOT",
                "title": "Advanced SQL & Database Administration",
                "description": "Mastering indexing, complex joins, stored procedures, and SQLite database systems.",
                "level": "Intermediate",
                "duration_hours": 10,
                "language": "English",
                "skills": "SQL"
            }
        ]
        for c in courses_data:
            exists = db.query(Course).filter(Course.external_id == c["external_id"]).first()
            if not exists:
                db_course = Course(**c)
                db.add(db_course)
        db.commit()
