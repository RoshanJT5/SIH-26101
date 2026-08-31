from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.dependencies import get_db
from app.schemas.quiz import QuizGenerateRequest, QuizResponse, QuizSubmitRequest, QuizSubmitResponse
from app.services.quiz_service import QuizService
from app.services.user_service import UserService
from app.models.document import Document

router = APIRouter(prefix="/quizzes", tags=["Assessments & Quizzes"])

@router.post("/generate", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
def generate_quiz(req: QuizGenerateRequest, db: Session = Depends(get_db)):
    if req.document_id:
        doc = db.query(Document).filter(Document.id == req.document_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        
    db_quiz = QuizService.generate_and_save_quiz(db, req)
    return db_quiz

@router.get("/{quiz_id}", response_model=QuizResponse)
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = QuizService.get_quiz(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@router.post("/{quiz_id}/submit", response_model=QuizSubmitResponse)
def submit_quiz(
    quiz_id: int, 
    submission: QuizSubmitRequest, 
    user_id: int, # Typically passed in headers or authentication context
    db: Session = Depends(get_db)
):
    user = UserService.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    result = QuizService.submit_and_evaluate_quiz(db, user_id, quiz_id, submission)
    if not result:
        raise HTTPException(status_code=404, detail="Quiz not found")
        
    return result
