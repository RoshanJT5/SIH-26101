from sqlalchemy import Column, Integer, String, Boolean, Text
from sqlalchemy.orm import relationship
from app.db.database import Base

class Competency(Base):
    __tablename__ = "competencies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    # Categories: STATISTICAL, TECHNICAL, DIGITAL_GOVERNANCE, BEHAVIOURAL_MANAGERIAL
    category = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    max_level = Column(Integer, default=5, nullable=False)
    active = Column(Boolean, default=True, nullable=False)

    # Relationships
    role_links = relationship("RoleCompetency", back_populates="competency", cascade="all, delete-orphan")
    user_links = relationship("UserCompetency", back_populates="competency", cascade="all, delete-orphan")
    course_links = relationship("CourseCompetency", back_populates="competency", cascade="all, delete-orphan")
    progress_history = relationship("CompetencyProgressHistory", back_populates="competency", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="competency")
