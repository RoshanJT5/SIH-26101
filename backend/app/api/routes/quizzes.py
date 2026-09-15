from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.quiz_service import QuizService
from app.schemas.quiz import QuizGenerateRequest, QuizResponse, QuestionResponse, QuizSubmitRequest, QuizSubmitResponse
from app.models.quiz import Quiz, QuizResult
from typing import List
import json

router = APIRouter(prefix="/quizzes", tags=["Dynamic Assessments & Quizzes"])

@router.post("/generate", response_model=QuizResponse)
def generate_quiz(req: QuizGenerateRequest, db: Session = Depends(get_db)):
    """
    Generates a structured MCQ diagnostic assessment grounded in uploaded documents or target competencies.
    """
    db_quiz = QuizService.generate_and_save_quiz(db, req)
    
    questions_data = []
    for q in db_quiz.questions:
        try:
            opts = json.loads(q.options)
        except Exception:
            opts = ["Option 1", "Option 2", "Option 3", "Option 4"]
            
        questions_data.append(QuestionResponse(
            id=q.id,
            question_text=q.question_text,
            options=opts,
            competency_id=q.competency_id,
            competency_name=q.competency.name if q.competency else q.topic,
            topic=q.topic,
            difficulty=q.difficulty,
            source_reference=q.source_reference
        ))

    return QuizResponse(
        id=db_quiz.id,
        topic=db_quiz.topic,
        difficulty=db_quiz.difficulty,
        quiz_type=db_quiz.quiz_type,
        number_of_questions=db_quiz.number_of_questions,
        document_id=db_quiz.document_id,
        questions=questions_data
    )

@router.get("/{quiz_id}", response_model=QuizResponse)
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    db_quiz = QuizService.get_quiz(db, quiz_id)
    if not db_quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions_data = []
    for q in db_quiz.questions:
        try:
            opts = json.loads(q.options)
        except Exception:
            opts = ["Option 1", "Option 2", "Option 3", "Option 4"]
            
        questions_data.append(QuestionResponse(
            id=q.id,
            question_text=q.question_text,
            options=opts,
            competency_id=q.competency_id,
            competency_name=q.competency.name if q.competency else q.topic,
            topic=q.topic,
            difficulty=q.difficulty,
            source_reference=q.source_reference
        ))

    return QuizResponse(
        id=db_quiz.id,
        topic=db_quiz.topic,
        difficulty=db_quiz.difficulty,
        quiz_type=db_quiz.quiz_type,
        number_of_questions=db_quiz.number_of_questions,
        document_id=db_quiz.document_id,
        questions=questions_data
    )

@router.post("/{quiz_id}/submit", response_model=QuizSubmitResponse)
def submit_quiz(quiz_id: int, submission: QuizSubmitRequest, user_id: int = 1, db: Session = Depends(get_db)):
    """
    Submits quiz responses, computes per-competency scores, and triggers deterministic competency progression (+1 level rule) with audit logging.
    """
    res = QuizService.submit_and_evaluate_quiz(db, user_id=user_id, quiz_id=quiz_id, submission=submission)
    if not res:
        raise HTTPException(status_code=404, detail="Quiz submission could not be evaluated")
    return res

@router.get("/history/{user_id}")
def get_user_quiz_history(user_id: int, db: Session = Depends(get_db)):
    results = db.query(QuizResult).filter(QuizResult.user_id == user_id).order_by(QuizResult.id.desc()).all()
    out = []
    for r in results:
        breakdown = []
        if r.competency_breakdown:
            try:
                breakdown = json.loads(r.competency_breakdown)
            except Exception:
                pass
        out.append({
            "id": r.id,
            "quiz_id": r.quiz_id,
            "topic": r.quiz.topic if r.quiz else "General",
            "score": round(r.score, 3) if r.score is not None else 0.0,
            "total_questions": r.total_questions,
            "correct_answers": r.correct_answers,
            "feedback": r.feedback,
            "competency_breakdown": breakdown,
            "created_at": r.created_at.isoformat() if r.created_at else None
        })
    return out
