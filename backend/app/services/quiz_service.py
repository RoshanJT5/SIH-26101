import json
import hashlib
from sqlalchemy.orm import Session
from app.models.quiz import Quiz, Question, QuizResult
from app.models.ai_cache import AICache
from app.models.document import DocumentChunk
from app.models.user import User, UserCompetency, CompetencyProgressHistory
from app.models.organization_role import Role, RoleCompetency
from app.models.competency import Competency
from app.ai.quiz_generator import QuizGenerator
from app.schemas.quiz import QuizGenerateRequest, QuizSubmitRequest, QuizSubmitResponse, CompetencyScoreDetail
from datetime import datetime

class QuizService:
    @staticmethod
    def _cache_key(req: QuizGenerateRequest, chunks_text: list[str]) -> str:
        source_signature = hashlib.sha256(
            "\n".join(chunks_text).encode("utf-8")
        ).hexdigest()
        request_data = {
            "document_id": req.document_id,
            "competency_id": req.competency_id,
            "topic": (req.topic or "Official Statistics").strip().casefold(),
            "number_of_questions": req.number_of_questions or 5,
            "difficulty": (req.difficulty or "medium").strip().casefold(),
            "source_signature": source_signature,
        }
        return hashlib.sha256(json.dumps(request_data, sort_keys=True).encode("utf-8")).hexdigest()

    @staticmethod
    def generate_and_save_quiz(db: Session, req: QuizGenerateRequest) -> Quiz:
        # Resolve target competency if ID or name is provided
        target_comp = None
        if req.competency_id:
            target_comp = db.query(Competency).filter(Competency.id == req.competency_id).first()
        elif req.topic:
            target_comp = db.query(Competency).filter(Competency.name.ilike(f"%{req.topic.strip()}%")).first()

        topic_label = target_comp.name if target_comp else (req.topic or "Official Statistics")

        # Retrieve document chunks if document_id is provided
        chunks_text = []
        if req.document_id:
            chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == req.document_id).all()
            chunks_text = [c.content for c in chunks]

        cache_key = QuizService._cache_key(req, chunks_text)
        cached = db.query(AICache).filter(
            AICache.cache_type == "quiz",
            AICache.cache_key == cache_key,
        ).first()
        if cached:
            cached_payload = json.loads(cached.payload)
            cached_quiz = QuizService.get_quiz(db, cached_payload["quiz_id"])
            if cached_quiz:
                return cached_quiz
            db.delete(cached)
            db.commit()

        # Call AI Generator
        quiz_data = QuizGenerator.generate_quiz_from_chunks(
            chunks_text=chunks_text,
            topic=topic_label,
            num_questions=req.number_of_questions or 5,
            difficulty=req.difficulty or "medium"
        )

        # Create Quiz
        db_quiz = Quiz(
            document_id=req.document_id,
            topic=topic_label,
            difficulty=req.difficulty or "medium",
            quiz_type=req.quiz_type or ("DOCUMENT_RAG" if req.document_id else "DIAGNOSTIC"),
            number_of_questions=len(quiz_data["questions"])
        )
        db.add(db_quiz)
        db.commit()
        db.refresh(db_quiz)

        # Create Questions with linked Competency ID
        comp_id = target_comp.id if target_comp else None
        for q in quiz_data["questions"]:
            # If AI tagged subtopic matches a competency, link it
            subtopic = q.get("topic", topic_label)
            q_comp = target_comp or db.query(Competency).filter(Competency.name.ilike(f"%{subtopic.strip()}%")).first()

            db_question = Question(
                quiz_id=db_quiz.id,
                competency_id=q_comp.id if q_comp else comp_id,
                question_text=q["question"],
                options=json.dumps(q["options"]),
                correct_answer=q["correct_answer"],
                explanation=q.get("explanation"),
                topic=subtopic,
                difficulty=q.get("difficulty", req.difficulty or "medium"),
                source_reference=q.get("source_reference")
            )
            db.add(db_question)

        db.commit()
        db.refresh(db_quiz)

        db.add(AICache(
            cache_type="quiz",
            cache_key=cache_key,
            payload=json.dumps({"quiz_id": db_quiz.id}),
        ))
        db.commit()
        return db_quiz

    @staticmethod
    def get_quiz(db: Session, quiz_id: int) -> Quiz:
        return db.query(Quiz).filter(Quiz.id == quiz_id).first()

    @staticmethod
    def submit_and_evaluate_quiz(db: Session, user_id: int, quiz_id: int, submission: QuizSubmitRequest) -> QuizSubmitResponse:
        quiz = QuizService.get_quiz(db, quiz_id)
        if not quiz:
            return None

        user = db.query(User).filter(User.id == user_id).first()
        role = user.role if user else None

        total_questions = len(quiz.questions)
        correct_count = 0
        wrong_question_ids = []
        details = {}

        # Per-competency tracking: {comp_id: {"name": str, "total": int, "correct": int}}
        comp_tracker = {}

        def _norm(s):
            if not s:
                return ""
            return " ".join(str(s).strip().casefold().split())

        for q in quiz.questions:
            user_ans = submission.answers.get(str(q.id))
            is_correct = bool(user_ans and _norm(user_ans) == _norm(q.correct_answer))
            if is_correct:
                correct_count += 1
            else:
                wrong_question_ids.append(q.id)

            details[str(q.id)] = {
                "correct": q.correct_answer,
                "user_answer": user_ans,
                "is_correct": is_correct,
                "explanation": q.explanation if q.explanation else "Verified against Official Statistical System standards."
            }

            c_id = q.competency_id
            c_name = q.competency.name if q.competency else (q.topic or "General Statistics")
            if c_id not in comp_tracker:
                comp_tracker[c_id] = {
                    "competency_id": c_id,
                    "competency_name": c_name,
                    "total": 0,
                    "correct": 0
                }
            comp_tracker[c_id]["total"] += 1
            if is_correct:
                comp_tracker[c_id]["correct"] += 1

        overall_score = round(correct_count / total_questions * 100.0, 3) if total_questions > 0 else 0.0

        # Deterministic Competency Progression Logic
        breakdown_list: list[CompetencyScoreDetail] = []
        level_upgrades: list[str] = []

        for c_id, stat in comp_tracker.items():
            pct = round(stat["correct"] / stat["total"] * 100.0, 3) if stat["total"] > 0 else 0.0
            
            # Find or create UserCompetency
            uc = None
            req_level = 3
            if c_id and user:
                uc = db.query(UserCompetency).filter(
                    UserCompetency.user_id == user_id,
                    UserCompetency.competency_id == c_id
                ).first()

                # Get Role requirement for ceiling
                if role:
                    rc = db.query(RoleCompetency).filter(
                        RoleCompetency.role_id == role.id,
                        RoleCompetency.competency_id == c_id
                    ).first()
                    if rc:
                        req_level = rc.required_level

            prev_level = uc.current_level if uc else 0
            new_level = prev_level
            level_changed = False
            status = "NEEDS_IMPROVEMENT"

            if pct >= 85.0:
                status = "MASTERY"
                # Strong evidence: +1 level (capped at 5 or max level)
                if prev_level < 5:
                    new_level = prev_level + 1
                    level_changed = True
            elif pct >= 70.0:
                status = "PROFICIENT"
                # Substantial evidence: +1 level if below required baseline
                if prev_level < req_level:
                    new_level = prev_level + 1
                    level_changed = True
            elif pct >= 50.0:
                status = "COMPETENT"
                new_level = prev_level # Maintained
            else:
                status = "NEEDS_IMPROVEMENT"
                new_level = prev_level # Maintained

            # Persist UserCompetency update and history log if changed
            if level_changed and c_id and user:
                if not uc:
                    uc = UserCompetency(
                        user_id=user_id,
                        competency_id=c_id,
                        current_level=new_level,
                        confidence=round(min(pct / 100.0, 0.95), 2),
                        last_assessed=datetime.now(),
                        assessment_source="DIAGNOSTIC_ASSESSMENT"
                    )
                    db.add(uc)
                else:
                    uc.current_level = new_level
                    uc.confidence = round(min(pct / 100.0, 0.95), 2)
                    uc.last_assessed = datetime.now()
                    uc.assessment_source = "DIAGNOSTIC_ASSESSMENT"

                # Progress History Record
                history = CompetencyProgressHistory(
                    user_id=user_id,
                    competency_id=c_id,
                    previous_level=prev_level,
                    new_level=new_level,
                    score=pct,
                    trigger_source=f"Assessment #{quiz_id} ({quiz.topic})",
                    assessment_id=quiz_id,
                    notes=f"Achieved {pct:.1f}% on assessment. Demonstrated verified proficiency elevation."
                )
                db.add(history)
                level_upgrades.append(f"{stat['competency_name']} elevated from Level {prev_level} to Level {new_level} (+1 level)")

            breakdown_list.append(CompetencyScoreDetail(
                competency_id=c_id,
                competency_name=stat["competency_name"],
                total_questions=stat["total"],
                correct_answers=stat["correct"],
                percentage=round(pct, 1),
                previous_level=prev_level,
                new_level=new_level,
                level_changed=level_changed,
                status=status
            ))

        # Overall Feedback
        if overall_score >= 85.0:
            feedback = f"Outstanding! You scored {overall_score:.1f}%, demonstrating high mastery in {quiz.topic}."
        elif overall_score >= 70.0:
            feedback = f"Great work! You scored {overall_score:.1f}%. Competency requirements satisfied."
        elif overall_score >= 50.0:
            feedback = f"Satisfactory score of {overall_score:.1f}%. Recommended to review core concepts before advanced modules."
        else:
            feedback = f"You scored {overall_score:.1f}%. A personalized remediation roadmap has been prepared to target identified gaps."

        # Save QuizResult
        db_res = QuizResult(
            user_id=user_id,
            quiz_id=quiz_id,
            score=round(overall_score, 3),
            total_questions=total_questions,
            correct_answers=correct_count,
            feedback=feedback,
            wrong_question_ids=",".join(map(str, wrong_question_ids)) if wrong_question_ids else "",
            competency_breakdown=json.dumps([b.model_dump() for b in breakdown_list])
        )
        db.add(db_res)
        db.commit()
        db.refresh(db_res)

        return QuizSubmitResponse(
            score=round(overall_score, 3),
            total_questions=total_questions,
            correct_answers=correct_count,
            feedback=feedback,
            correct_details=details,
            result_id=db_res.id,
            competency_breakdown=breakdown_list,
            level_upgrades=level_upgrades
        )
