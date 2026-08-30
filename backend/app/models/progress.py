from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func, Text
from sqlalchemy.orm import relationship
from app.db.database import Base

class LearningHistory(Base):
    __tablename__ = "learning_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, default="Started") # Started, In Progress, Completed
    progress_percentage = Column(Integer, default=0)
    last_accessed = Column(DateTime, default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="learning_history")
    course = relationship("Course")

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    target_competency = Column(String, nullable=False)
    progress_percentage = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    tasks = relationship("RoadmapTask", back_populates="roadmap", cascade="all, delete-orphan")

class RoadmapTask(Base):
    __tablename__ = "roadmap_tasks"

    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False)
    day_number = Column(Integer, nullable=False)
    task_title = Column(String, nullable=False)
    task_description = Column(Text, nullable=True)
    status = Column(String, default="Pending") # Pending, Completed
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    roadmap = relationship("Roadmap", back_populates="tasks")
