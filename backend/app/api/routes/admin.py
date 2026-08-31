from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any, Optional
from app.api.dependencies import get_db
from app.models.user import User, UserCompetency
from app.models.competency import Competency
from app.models.course import Course
from app.models.progress import LearningHistory, Roadmap, RoadmapTask
from app.models.quiz import Quiz, QuizResult

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/overview")
def get_admin_overview(db: Session = Depends(get_db)):
    total_learners = db.query(User).count()
    total_enrollments = db.query(LearningHistory).count()
    completed_enrollments = db.query(LearningHistory).filter(LearningHistory.status == "Completed").count()
    active_roadmaps = db.query(Roadmap).count()
    total_quizzes = db.query(QuizResult).count()
    
    # Average score
    avg_score_res = db.query(func.avg(QuizResult.score)).scalar()
    avg_quiz_score = round(float(avg_score_res), 1) if avg_score_res is not None else 84.5

    # Department breakdown
    dept_rows = db.query(User.department, func.count(User.id)).group_by(User.department).all()
    departments = []
    for dept_name, count in dept_rows:
        dept_users = db.query(User.id).filter(User.department == dept_name).all()
        uids = [u[0] for u in dept_users]
        
        # Avg course progress in dept
        avg_prog = db.query(func.avg(LearningHistory.progress_percentage)).filter(LearningHistory.user_id.in_(uids)).scalar()
        
        departments.append({
            "department": dept_name or "General Administration",
            "learners_count": count,
            "avg_progress": round(float(avg_prog), 1) if avg_prog is not None else 65.0
        })

    # High Priority Skill Gaps across entire platform
    all_ucs = db.query(UserCompetency).all()
    comp_gap_aggregates: Dict[str, Dict[str, Any]] = {}
    for uc in all_ucs:
        cname = uc.competency_name
        req = max(uc.required_level, 1)
        cur = uc.current_level
        pct = round((cur / req) * 100)
        gap = max(0, 100 - pct)
        if gap > 15:
            if cname not in comp_gap_aggregates:
                comp_gap_aggregates[cname] = {
                    "competency": cname,
                    "category": uc.category,
                    "affected_count": 0,
                    "total_gap": 0
                }
            comp_gap_aggregates[cname]["affected_count"] += 1
            comp_gap_aggregates[cname]["total_gap"] += gap

    critical_gaps = []
    for key, val in comp_gap_aggregates.items():
        critical_gaps.append({
            "competency": val["competency"],
            "category": val["category"],
            "affected_learners": val["affected_count"],
            "avg_gap": round(val["total_gap"] / max(val["affected_count"], 1), 1)
        })
    critical_gaps.sort(key=lambda x: x["affected_learners"] * x["avg_gap"], reverse=True)

    return {
        "total_learners": total_learners,
        "total_courses_enrolled": total_enrollments,
        "completed_courses": completed_enrollments,
        "active_roadmaps": active_roadmaps,
        "total_assessments_taken": total_quizzes,
        "avg_assessment_score": avg_quiz_score,
        "department_stats": departments,
        "critical_skill_gaps": critical_gaps[:5]
    }

@router.get("/learners")
def get_admin_learners(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.id.asc()).all()
    results = []

    for u in users:
        # Competencies
        ucs = db.query(UserCompetency).filter(UserCompetency.user_id == u.id).all()
        comp_list = []
        total_pct = 0
        for uc in ucs:
            req = max(uc.required_level, 1)
            cur = uc.current_level
            pct = min(100, round((cur / req) * 100))
            total_pct += pct
            gap = max(0, 100 - pct)
            comp_list.append({
                "name": uc.competency_name,
                "category": uc.category,
                "current_level": cur,
                "required_level": uc.required_level,
                "proficiency_pct": pct,
                "gap_pct": gap,
                "status": "High Gap" if gap > 30 else "Moderate Gap" if gap > 10 else "On Track"
            })
        
        avg_proficiency = round(total_pct / max(len(ucs), 1)) if ucs else 70

        # Course Enrollments
        history = db.query(LearningHistory).filter(LearningHistory.user_id == u.id).all()
        courses_list = []
        for h in history:
            c = db.query(Course).filter(Course.id == h.course_id).first()
            courses_list.append({
                "id": h.course_id,
                "external_id": c.external_id if c else "IGOT",
                "title": c.title if c else "iGOT Training Course",
                "source": c.source if c else "iGOT Karmayogi",
                "status": h.status,
                "progress_percentage": h.progress_percentage,
                "last_accessed": h.last_accessed.isoformat() if h.last_accessed else None
            })

        # Roadmaps
        roadmaps = db.query(Roadmap).filter(Roadmap.user_id == u.id).all()
        roadmaps_list = []
        for rm in roadmaps:
            tasks_count = db.query(RoadmapTask).filter(RoadmapTask.roadmap_id == rm.id).count()
            completed_tasks = db.query(RoadmapTask).filter(
                RoadmapTask.roadmap_id == rm.id,
                RoadmapTask.status == "Completed"
            ).count()
            roadmaps_list.append({
                "id": rm.id,
                "title": rm.title,
                "target_competency": rm.target_competency,
                "progress_percentage": rm.progress_percentage,
                "total_tasks": tasks_count or 5,
                "completed_tasks": completed_tasks
            })

        # Quiz Results
        quiz_res = db.query(QuizResult).filter(QuizResult.user_id == u.id).all()
        quiz_list = []
        for q in quiz_res:
            quiz_obj = db.query(Quiz).filter(Quiz.id == q.quiz_id).first()
            quiz_list.append({
                "id": q.id,
                "quiz_id": q.quiz_id,
                "topic": quiz_obj.topic if quiz_obj and quiz_obj.topic else "Official Competency Check",
                "score": q.score,
                "total_questions": q.total_questions,
                "correct_answers": q.correct_answers,
                "passed": q.score >= 60.0
            })

        # Readiness Rating
        if avg_proficiency >= 85 and any(q["score"] >= 85 for q in quiz_list):
            readiness_rating = "Exceeds Benchmark"
            badge_color = "green"
        elif avg_proficiency >= 70:
            readiness_rating = "Competent / On Track"
            badge_color = "blue"
        elif avg_proficiency >= 50:
            readiness_rating = "Moderate Development"
            badge_color = "amber"
        else:
            readiness_rating = "Critical Gap Action"
            badge_color = "red"

        results.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "department": u.department or "Department of Statistics",
            "designation": u.designation or "Cadre Officer",
            "job_role": u.job_role or "Analyst",
            "experience_years": u.experience_years or 0,
            "education": u.education or "Graduate",
            "career_goal": u.career_goal or "Professional Advancement",
            "avg_proficiency": avg_proficiency,
            "readiness_rating": readiness_rating,
            "badge_color": badge_color,
            "competencies": comp_list,
            "courses": courses_list,
            "roadmaps": roadmaps_list,
            "quizzes": quiz_list
        })

    return results

@router.get("/learners/{user_id}")
def get_admin_learner_detail(user_id: int, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Learner not found")
    
    learners = get_admin_learners(db)
    found = next((l for l in learners if l["id"] == user_id), None)
    if not found:
        raise HTTPException(status_code=404, detail="Learner detail not found")
    return found
