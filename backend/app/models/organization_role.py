from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    ministry = Column(String, nullable=False, default="Ministry of Statistics and Programme Implementation (MoSPI)")
    department = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    active = Column(Boolean, default=True, nullable=False)

    # Relationships
    roles = relationship("Role", back_populates="organization", cascade="all, delete-orphan")
    users = relationship("User", back_populates="organization")


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String, index=True, nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    service_cadre = Column(String, nullable=True) # e.g. "Indian Statistical Service (ISS)", "Subordinate Statistical Service (SSS)"
    description = Column(Text, nullable=True)
    responsibilities = Column(Text, nullable=True) # Text or JSON list of key job responsibilities
    active = Column(Boolean, default=True, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="roles")
    competency_requirements = relationship("RoleCompetency", back_populates="role", cascade="all, delete-orphan")
    users = relationship("User", back_populates="role")


class RoleCompetency(Base):
    __tablename__ = "role_competencies"

    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    competency_id = Column(Integer, ForeignKey("competencies.id", ondelete="CASCADE"), nullable=False)
    required_level = Column(Integer, nullable=False, default=3) # 1 to 5
    importance = Column(String, default="HIGH", nullable=False) # CRITICAL, HIGH, MEDIUM
    description = Column(Text, nullable=True)

    # Relationships
    role = relationship("Role", back_populates="competency_requirements")
    competency = relationship("Competency", back_populates="role_links")
