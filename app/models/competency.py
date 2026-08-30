from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.database import Base

class Competency(Base):
    __tablename__ = "competencies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False) # Statistical, Technical, Digital Governance, Behavioural
    description = Column(String, nullable=True)

    # Relationships
    user_links = relationship("UserCompetency", back_populates="competency", cascade="all, delete-orphan")
