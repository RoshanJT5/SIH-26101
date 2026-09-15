import json
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.progress import Roadmap, RoadmapTask
from app.models.user import User
from app.models.quiz import QuizResult, Question
from app.models.competency import Competency
from app.ai.llm import get_llm
from app.schemas.roadmap import RoadmapGenerateRequest, TaskStatusUpdate
from typing import List, Dict, Any

class RoadmapService:
    @staticmethod
    def generate_roadmap(db: Session, user_id: int, req: RoadmapGenerateRequest) -> Roadmap:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None

        title = f"{req.target_competency} Capacity Building Roadmap"
        
        # Call Groq to generate structured competency roadmap
        prompt = f"""
You are an expert curriculum director in India's Official Statistical System.
Create a structured, day-by-day competency building roadmap for a statistical official aiming to master: {req.target_competency}.
Target duration: exactly {req.number_of_days} days.

For each day, provide:
- 'task_title': Clear title of the learning milestone.
- 'task_description': Detailed actionable study plan referencing standard statistical operating procedures or iGOT/NSSTA curriculum concepts.

You MUST respond with a valid JSON object matching this schema:
{{
  "tasks": [
    {{
      "day_number": 1,
      "task_title": "Foundational Principles and Standard Definitions",
      "task_description": "Review official definitions, metadata standards, and conceptual framework for {req.target_competency}."
    }},
    {{
      "day_number": 2,
      "task_title": "Methodological Operations and Case Studies",
      "task_description": "Study operational guidelines, estimation formulas, and complete practice exercises."
    }}
  ]
}}

Generate exactly {req.number_of_days} daily tasks (one for each day from 1 to {req.number_of_days}).
Return only the JSON string. Do not wrap in markdown code blocks.
"""

        try:
            llm = get_llm()
            response = llm.invoke(prompt)
            content = response.content.strip()
            
            if content.startswith("```"):
                lines = content.splitlines()
                if lines[0].startswith("```json") or lines[0].startswith("```"):
                    content = "\n".join(lines[1:-1])
                    
            roadmap_data = json.loads(content)
            tasks_list = roadmap_data.get("tasks", [])
        except Exception:
            tasks_list = [
                {
                    "day_number": i + 1,
                    "task_title": f"Milestone {i + 1}: {req.target_competency} Core Applications",
                    "task_description": f"Complete prescribed module on {req.target_competency}, examine administrative case studies, and complete self-check exercises."
                } for i in range(req.number_of_days)
            ]

        # Save Roadmap
        db_roadmap = Roadmap(
            user_id=user_id,
            title=title,
            target_competency=req.target_competency,
            progress_percentage=0
        )
        db.add(db_roadmap)
        db.commit()
        db.refresh(db_roadmap)

        # Save Tasks
        for t in tasks_list:
            db_task = RoadmapTask(
                roadmap_id=db_roadmap.id,
                day_number=t["day_number"],
                task_title=t["task_title"],
                task_description=t["task_description"],
                status="Pending"
            )
            db.add(db_task)
            
        db.commit()
        db.refresh(db_roadmap)
        return db_roadmap

    @staticmethod
    def get_user_roadmaps(db: Session, user_id: int) -> list:
        return db.query(Roadmap).filter(Roadmap.user_id == user_id).order_by(Roadmap.id.desc()).all()

    @staticmethod
    def toggle_task(db: Session, task_id: int, update: TaskStatusUpdate) -> RoadmapTask:
        task = db.query(RoadmapTask).filter(RoadmapTask.id == task_id).first()
        if not task:
            return None

        task.status = update.status
        if update.status == "Completed":
            task.completed_at = datetime.now()
        else:
            task.completed_at = None

        db.commit()
        db.refresh(task)

        # Recalculate progress of parent Roadmap
        roadmap = db.query(Roadmap).filter(Roadmap.id == task.roadmap_id).first()
        if roadmap:
            total_tasks = len(roadmap.tasks)
            completed_tasks = sum(1 for t in roadmap.tasks if t.status == "Completed")
            roadmap.progress_percentage = int((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0
            db.commit()

        return task

    @staticmethod
    def generate_remediation_roadmap(db: Session, result_id: int, number_of_days: int = 3) -> Roadmap:
        result = db.query(QuizResult).filter(QuizResult.id == result_id).first()
        if not result or not result.wrong_question_ids:
            return None

        # Fetch details of failed questions
        wrong_ids = [int(qid) for qid in result.wrong_question_ids.split(",") if qid.strip()]
        failed_questions = db.query(Question).filter(Question.id.in_(wrong_ids)).all()
        if not failed_questions:
            return None

        failed_details = []
        for q in failed_questions:
            comp_name = q.competency.name if q.competency else q.topic
            failed_details.append(
                f"Topic: {comp_name}\nQuestion: {q.question_text}\nCorrect Concept: {q.correct_answer}\nExplanation: {q.explanation}"
            )

        context = "\n---\n".join(failed_details)
        title = f"Remediation Plan: Diagnostic Gap Resolution"
        
        prompt = f"""
You are an expert tutor in India's Official Statistical System.
The official took a competency diagnostic assessment and struggled with these specific concepts:

{context}

Create a focused {number_of_days}-day remediation study plan to eliminate these exact misunderstandings and reinforce required statistical principles.

You MUST respond with a valid JSON object matching this schema:
{{
  "tasks": [
    {{
      "day_number": 1,
      "task_title": "Clarify Core Statistical Misconceptions",
      "task_description": "Review specific operational formulas and standard guidelines where errors occurred."
    }}
  ]
}}

Generate exactly {number_of_days} daily tasks (one for each day from 1 to {number_of_days}).
Return only the JSON string. Do not wrap in markdown code blocks.
"""

        try:
            llm = get_llm()
            response = llm.invoke(prompt)
            content = response.content.strip()
            
            if content.startswith("```"):
                lines = content.splitlines()
                if lines[0].startswith("```json") or lines[0].startswith("```"):
                    content = "\n".join(lines[1:-1])
                    
            roadmap_data = json.loads(content)
            tasks_list = roadmap_data.get("tasks", [])
        except Exception:
            tasks_list = [
                {
                    "day_number": i + 1,
                    "task_title": f"Targeted Review: Module {i + 1}",
                    "task_description": "Review diagnostic explanations for missed questions and practice related statistical problem sets."
                } for i in range(number_of_days)
            ]

        db_roadmap = Roadmap(
            user_id=result.user_id,
            title=title,
            target_competency="Remediation for Identified Gaps",
            progress_percentage=0
        )
        db.add(db_roadmap)
        db.commit()
        db.refresh(db_roadmap)

        for t in tasks_list:
            db_task = RoadmapTask(
                roadmap_id=db_roadmap.id,
                day_number=t["day_number"],
                task_title=t["task_title"],
                task_description=t["task_description"],
                status="Pending"
            )
            db.add(db_task)
            
        db.commit()
        db.refresh(db_roadmap)
        return db_roadmap
