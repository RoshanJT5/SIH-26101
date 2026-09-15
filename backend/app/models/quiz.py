from sqlalchemy import Column, Integer, String, ForeignKey, Float, Text, DateTime, func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    topic = Column(String, nullable=True)
    difficulty = Column(String, default="medium") # easy, medium, hard
    number_of_questions = Column(Integer, default=5)
    quiz_type = Column(String, default="DIAGNOSTIC") # DIAGNOSTIC, DOCUMENT_RAG, POST_LEARNING, REMEDIATION
    created_at = Column(DateTime, default=func.now())

    # Relationships
    document = relationship("Document", back_populates="quizzes")
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")
    results = relationship("QuizResult", back_populates="quiz", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    competency_id = Column(Integer, ForeignKey("competencies.id", ondelete="SET NULL"), nullable=True)
    
    question_text = Column(Text, nullable=False)
    options = Column(Text, nullable=False) # JSON-serialized list of 4 options
    correct_answer = Column(String, nullable=False)
    explanation = Column(Text, nullable=True)
    
    topic = Column(String, nullable=True)
    difficulty = Column(String, default="medium") # easy, medium, hard
    weight = Column(Float, default=1.0)
    source_reference = Column(String, nullable=True)

    # Relationships
    quiz = relationship("Quiz", back_populates="questions")
    competency = relationship("Competency", back_populates="questions")


class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False) # Overall Percentage
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    feedback = Column(Text, nullable=True)
    wrong_question_ids = Column(String, nullable=True) # Comma-separated question IDs
    competency_breakdown = Column(Text, nullable=True) # JSON-serialized dict: {"Sampling": {"score": 80.0, "total": 2, "correct": 2}}
    created_at = Column(DateTime, default=func.now())

    # Relationships
    user = relationship("User", back_populates="quiz_results")
    quiz = relationship("Quiz", back_populates="results")
