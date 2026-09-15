from sqlalchemy import Column, Integer, String, Boolean, Float, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    provider = Column(String, default="Capacity Building Commission / MoSPI", nullable=False)
    source_type = Column(String, default="iGOT Karmayogi", nullable=False) # "iGOT Karmayogi", "NSSTA / TPAC", "Approved Resource"
    
    external_id = Column(String, unique=True, index=True, nullable=False)
    igot_course_id = Column(String, nullable=True, index=True) # Official iGOT course content ID if verified
    course_url = Column(String, nullable=False) # Exact course launch deep link
    
    level = Column(String, default="Intermediate") # Beginner, Intermediate, Advanced
    duration_hours = Column(Integer, default=0)
    language = Column(String, default="English")
    skills = Column(String, nullable=True) # Legacy comma-separated names for quick matching
    
    active = Column(Boolean, default=True, nullable=False)
    last_verified = Column(DateTime, default=func.now())

    # Relationships
    competency_mappings = relationship("CourseCompetency", back_populates="course", cascade="all, delete-orphan")


class CourseCompetency(Base):
    __tablename__ = "course_competencies"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    competency_id = Column(Integer, ForeignKey("competencies.id", ondelete="CASCADE"), nullable=False)
    coverage_level = Column(Integer, default=3, nullable=False) # 1 to 5 level this course elevates to
    relevance_score = Column(Float, default=1.0, nullable=False) # 0.0 to 1.0 weight

    # Relationships
    course = relationship("Course", back_populates="competency_mappings")
    competency = relationship("Competency", back_populates="course_links")


class TrainingProgramme(Base):
    __tablename__ = "training_programmes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    provider = Column(String, default="NSSTA Greater Noida", nullable=False) # e.g. NSSTA, TPAC / MoSPI, ISI Kolkata
    programme_type = Column(String, default="In-Service Residential", nullable=False) # In-Service Residential, Virtual Masterclass, Executive Workshop
    description = Column(Text, nullable=True)
    competencies = Column(String, nullable=False) # Comma-separated or tagged competencies
    eligibility = Column(String, nullable=True) # e.g. "ISS / SSS Officers, Senior Survey Analysts"
    duration = Column(String, default="5 Days")
    registration_url = Column(String, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=func.now())
