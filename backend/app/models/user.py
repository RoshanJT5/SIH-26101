from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Text, func
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False, default="")
    mobile = Column(String, nullable=True)
    employee_id = Column(String, nullable=True)
    
    # Organization & Role Decoupled Links
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="SET NULL"), nullable=True)
    
    organization = relationship("Organization", back_populates="users")
    role = relationship("Role", back_populates="users")

    # Legacy text fields preserved for fallback/display
    department = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    job_role = Column(String, nullable=True)
    division_unit = Column(String, nullable=True)
    
    experience_years = Column(Integer, default=0)
    education = Column(String, nullable=True)
    specialization = Column(String, nullable=True)
    career_goal = Column(String, nullable=True)


    # Relationships
    competencies = relationship("UserCompetency", back_populates="user", cascade="all, delete-orphan")
    learning_history = relationship("LearningHistory", back_populates="user", cascade="all, delete-orphan")
    quiz_results = relationship("QuizResult", back_populates="user", cascade="all, delete-orphan")
    progress_history = relationship("CompetencyProgressHistory", back_populates="user", cascade="all, delete-orphan")


class UserCompetency(Base):
    __tablename__ = "user_competencies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    competency_id = Column(Integer, ForeignKey("competencies.id", ondelete="CASCADE"), nullable=False)
    current_level = Column(Integer, default=0) # 0 to 5
    confidence = Column(Float, default=0.5) # 0.0 to 1.0 confidence score based on assessments
    last_assessed = Column(DateTime, default=func.now(), onupdate=func.now())
    assessment_source = Column(String, default="INITIAL_DIAGNOSTIC") # INITIAL_DIAGNOSTIC, QUIZ_ASSESSMENT, DOCUMENT_ASSESSMENT, VERIFIED_PROGRAMME

    # Legacy column preserved for SQLite table compatibility
    required_level = Column(Integer, default=0)

    # Relationships
    user = relationship("User", back_populates="competencies")
    competency = relationship("Competency", back_populates="user_links")

    @property
    def competency_name(self) -> str:
        return self.competency.name if self.competency else "Unknown"

    @property
    def category(self) -> str:
        return self.competency.category if self.competency else "Unknown"


class CompetencyProgressHistory(Base):
    __tablename__ = "competency_progress_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    competency_id = Column(Integer, ForeignKey("competencies.id", ondelete="CASCADE"), nullable=False)
    previous_level = Column(Integer, nullable=False)
    new_level = Column(Integer, nullable=False)
    score = Column(Float, nullable=True)
    trigger_source = Column(String, nullable=False) # e.g. "DIAGNOSTIC_ASSESSMENT", "POST_LEARNING_QUIZ", "DOCUMENT_MCQ"
    assessment_id = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    user = relationship("User", back_populates="progress_history")
    competency = relationship("Competency", back_populates="progress_history")
