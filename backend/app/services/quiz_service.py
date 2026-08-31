import json
from sqlalchemy.orm import Session
from app.models.quiz import Quiz, Question, QuizResult
from app.models.document import DocumentChunk
from app.models.user import UserCompetency
from app.models.competency import Competency
from app.ai.quiz_generator import QuizGenerator
from app.schemas.quiz import QuizGenerateRequest, QuizSubmitRequest, QuizSubmitResponse

class QuizService:
    @staticmethod
    def generate_and_save_quiz(db: Session, req: QuizGenerateRequest) -> Quiz:
        # Retrieve document chunks if document_id is provided
        chunks_text = []
        if req.document_id:
            chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == req.document_id).all()
            chunks_text = [c.content for c in chunks]
        
        # Call AI Generator
        quiz_data = QuizGenerator.generate_quiz_from_chunks(
            chunks_text=chunks_text,
            topic=req.topic or "Official Statistics",
            num_questions=req.number_of_questions or 5,
            difficulty=req.difficulty or "medium"
        )

        # Create Quiz
        db_quiz = Quiz(
            document_id=req.document_id,
            topic=req.topic,
            difficulty=req.difficulty,
            number_of_questions=len(quiz_data["questions"])
        )
        db.add(db_quiz)
        db.commit()
        db.refresh(db_quiz)

        # Create Questions
        for q in quiz_data["questions"]:
            db_question = Question(
                quiz_id=db_quiz.id,
                question_text=q["question"],
                options=json.dumps(q["options"]),
                correct_answer=q["correct_answer"],
                explanation=q.get("explanation"),
                topic=q.get("topic", req.topic),
                difficulty=q.get("difficulty", req.difficulty),
                source_reference=q.get("source_reference")
            )
            db.add(db_question)
        
        db.commit()
        db.refresh(db_quiz)
        return db_quiz

    @staticmethod
    def get_quiz(db: Session, quiz_id: int) -> Quiz:
        return db.query(Quiz).filter(Quiz.id == quiz_id).first()

    @staticmethod
    def submit_and_evaluate_quiz(db: Session, user_id: int, quiz_id: int, submission: QuizSubmitRequest) -> QuizSubmitResponse:
        quiz = QuizService.get_quiz(db, quiz_id)
        if not quiz:
            return None

        total_questions = len(quiz.questions)
        correct_count = 0
        wrong_question_ids = []
        details = {}

        for q in quiz.questions:
            user_ans = submission.answers.get(str(q.id))
            is_correct = (user_ans == q.correct_answer)
            if is_correct:
                correct_count += 1
            else:
                wrong_question_ids.append(q.id)
            
            details[str(q.id)] = {
                "correct": q.correct_answer,
                "explanation": q.explanation if q.explanation else "No explanation available."
            }

        score_percentage = (correct_count / total_questions) * 100.0 if total_questions > 0 else 0.0

        # Create Quiz Result
        feedback = f"You scored {score_percentage}%. "
        if score_percentage >= 80.0:
            feedback += "Excellent! You have mastered this material."
        elif score_percentage >= 50.0:
            feedback += "Good job! Review the explanations to patch any gaps."
        else:
            feedback += "Keep studying! Try taking the quiz again after reviewing the material."

        db_res = QuizResult(
            user_id=user_id,
            quiz_id=quiz_id,
            score=score_percentage,
            total_questions=total_questions,
            correct_answers=correct_count,
            feedback=feedback,
            wrong_question_ids=",".join(map(str, wrong_question_ids)) if wrong_question_ids else ""
        )
        db.add(db_res)
        db.commit()
        db.refresh(db_res) # Refresh to get result ID to return later if needed

        # Update user competency level if score is high (Passing >= 60%)
        if score_percentage >= 60.0 and quiz.topic:
            # Look for a competency matching quiz topic (case-insensitive)
            topic_clean = quiz.topic.strip()
            comp = db.query(Competency).filter(Competency.name.ilike(f"%{topic_clean}%")).first()
            if not comp:
                # Try word-by-word match
                for word in topic_clean.split():
                    if len(word) > 3:
                        comp = db.query(Competency).filter(Competency.name.ilike(f"%{word}%")).first()
                        if comp:
                            break
            if comp:
                uc = db.query(UserCompetency).filter(
                    UserCompetency.user_id == user_id,
                    UserCompetency.competency_id == comp.id
                ).first()
                if uc and uc.current_level < 5:
                    uc.current_level += 1
                    db.commit()

        return QuizSubmitResponse(
            score=score_percentage,
            total_questions=total_questions,
            correct_answers=correct_count,
            feedback=feedback,
            correct_details=details,
            result_id=db_res.id
        )
