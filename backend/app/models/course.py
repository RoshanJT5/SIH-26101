from sqlalchemy import Column, Integer, String
from app.db.database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String, unique=True, index=True, nullable=False)
    source = Column(String, default="iGOT Karmayogi")
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    level = Column(String, nullable=True) # Beginner, Intermediate, Advanced
    duration_hours = Column(Integer, default=0)
    language = Column(String, default="English")
    skills = Column(String, nullable=True) # Comma-separated competency names or IDs
    course_url = Column(String, nullable=True) # Direct link to iGOT Karmayogi course
