from sqlalchemy import Column, DateTime, Integer, String, Text, func

from app.db.database import Base


class AICache(Base):
    __tablename__ = "ai_cache"

    id = Column(Integer, primary_key=True, index=True)
    cache_type = Column(String, nullable=False, index=True)
    cache_key = Column(String, nullable=False, unique=True, index=True)
    payload = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())