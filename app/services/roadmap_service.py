import json
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.progress import Roadmap, RoadmapTask
from app.models.user import User
from app.ai.llm import get_llm
from app.schemas.roadmap import RoadmapGenerateRequest, TaskStatusUpdate
from app.models.quiz import QuizResult, Question

class RoadmapService:
    @staticmethod
    def generate_roadmap(db: Session, user_id: int, req: RoadmapGenerateRequest) -> Roadmap:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None

        title = f"{req.target_competency} Mastery Roadmap"
        
        # Call Groq to generate structured day-by-day plan
        prompt = f"""
You are an expert tutor. Create a highly structured, day-by-day study roadmap for a learner aiming to master: {req.target_competency}.
The study plan must be exactly {req.number_of_days} days long.

For each day, provide a concrete 'task_title' and a detailed 'task_description' instructing the user what specific sub-topics to study or practice.

You MUST respond with a valid JSON object matching this schema:
{{
  "tasks": [
    {{
      "day_number": 1,
      "task_title": "Introduction and Setup",
      "task_description": "Install Python, configure VS Code, and write your first Hello World script."
    }},
    {{
      "day_number": 2,
      "task_title": "Variables and Data Types",
      "task_description": "Study integers, floats, strings, booleans, and perform basic operations."
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
            
            # Clean possible markdown wrap
            if content.startswith("```"):
                lines = content.splitlines()
                if lines[0].startswith("```json") or lines[0].startswith("```"):
                    content = "\n".join(lines[1:-1])
                    
            roadmap_data = json.loads(content)
            tasks_list = roadmap_data.get("tasks", [])
        except Exception as e:
            # Fallback mock generator
            tasks_list = [
                {
                    "day_number": i + 1,
                    "task_title": f"Intro to {req.target_competency} - Part {i + 1}",
                    "task_description": f"Learn key fundamentals and core definitions of {req.target_competency}."
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
        return db.query(Roadmap).filter(Roadmap.user_id == user_id).all()

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
            failed_details.append(
                f"Question: {q.question_text}\nTopic: {q.topic}\nExplanation: {q.explanation}"
            )

        context = "\n---\n".join(failed_details)
        title = "Personalized Remediation Roadmap"
        
        prompt = f"""
You are an expert personal tutor. The student recently took a quiz and got the following questions wrong.
Create a personalized remediation study plan of exactly {number_of_days} days to help them master these specific topics and correct their misunderstandings.

Wrong Questions & Concepts:
{context}

For each day, provide a concrete 'task_title' and a detailed 'task_description' explaining what concept to review.

You MUST respond with a valid JSON object matching this schema:
{{
  "tasks": [
    {{
      "day_number": 1,
      "task_title": "Review Concept A",
      "task_description": "Study variables and why they differ..."
    }},
    {{
      "day_number": 2,
      "task_title": "Review Concept B",
      "task_description": "Practice condition loops..."
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
            
            # Clean possible markdown wrap
            if content.startswith("```"):
                lines = content.splitlines()
                if lines[0].startswith("```json") or lines[0].startswith("```"):
                    content = "\n".join(lines[1:-1])
                    
            roadmap_data = json.loads(content)
            tasks_list = roadmap_data.get("tasks", [])
        except Exception:
            # Fallback
            tasks_list = [
                {
                    "day_number": i + 1,
                    "task_title": f"Review Concepts - Part {i + 1}",
                    "task_description": f"Go through the quiz explanations and practice questions related to the wrong answers."
                } for i in range(number_of_days)
            ]

        # Save Roadmap
        db_roadmap = Roadmap(
            user_id=result.user_id,
            title=title,
            target_competency="Remediation for Quiz",
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

