from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
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
    organization = Column(String, nullable=True)
    department = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    job_role = Column(String, nullable=True)
    experience_years = Column(Integer, default=0)
    education = Column(String, nullable=True)
    career_goal = Column(String, nullable=True)

    # Relationships
    competencies = relationship("UserCompetency", back_populates="user", cascade="all, delete-orphan")
    learning_history = relationship("LearningHistory", back_populates="user", cascade="all, delete-orphan")
    quiz_results = relationship("QuizResult", back_populates="user", cascade="all, delete-orphan")

class UserCompetency(Base):
    __tablename__ = "user_competencies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    competency_id = Column(Integer, ForeignKey("competencies.id", ondelete="CASCADE"), nullable=False)
    current_level = Column(Integer, default=0) # 0 to 5
    required_level = Column(Integer, default=0) # 0 to 5
    last_updated = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="competencies")
    competency = relationship("Competency", back_populates="user_links")

    @property
    def competency_name(self) -> str:
        return self.competency.name if self.competency else "Unknown"

    @property
    def category(self) -> str:
        return self.competency.category if self.competency else "Unknown"

