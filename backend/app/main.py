from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base, SessionLocal
from app.core.config import settings
from app.services.competency_service import CompetencyService
from app.services.role_service import RoleService
from app.services.recommendation_service import RecommendationService
from app.services.user_service import UserService

# Import all models to ensure registration in Base.metadata
from app.models.organization_role import Organization, Role, RoleCompetency
from app.models.competency import Competency
from app.models.user import User, UserCompetency, CompetencyProgressHistory
from app.models.course import Course, CourseCompetency, TrainingProgramme
from app.models.document import Document, DocumentChunk
from app.models.quiz import Quiz, Question, QuizResult
from app.models.progress import LearningHistory, Roadmap, RoadmapTask
from app.models.ai_cache import AICache

# Import routes
from app.api.routes import (
    roles,
    users,
    competencies,
    skill_gaps,
    courses,
    documents,
    rag,
    quizzes,
    progress,
    roadmaps,
    admin
)

from sqlalchemy import text

# Initialize tables
Base.metadata.create_all(bind=engine)

# Safe SQLite migrations for upgraded columns (executed only if using SQLite)
if engine.url.get_backend_name() == "sqlite":
    with engine.connect() as conn:
        # Competencies table
        try:
            columns = conn.execute(text("PRAGMA table_info(competencies)")).fetchall()
            existing_cols = {row[1] for row in columns}
            if "max_level" not in existing_cols:
                conn.execute(text("ALTER TABLE competencies ADD COLUMN max_level INTEGER DEFAULT 5"))
            if "active" not in existing_cols:
                conn.execute(text("ALTER TABLE competencies ADD COLUMN active BOOLEAN DEFAULT 1"))
            conn.commit()
        except Exception:
            pass

        # Users table
        try:
            columns = conn.execute(text("PRAGMA table_info(users)")).fetchall()
            existing_cols = {row[1] for row in columns}
            if "organization_id" not in existing_cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN organization_id INTEGER"))
            if "role_id" not in existing_cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN role_id INTEGER"))
            if "password_hash" not in existing_cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR"))
            if "division_unit" not in existing_cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN division_unit VARCHAR"))
            if "specialization" not in existing_cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN specialization VARCHAR"))
            conn.commit()
        except Exception:
            pass

        # User Competencies table
        try:
            columns = conn.execute(text("PRAGMA table_info(user_competencies)")).fetchall()
            existing_cols = {row[1] for row in columns}
            if "confidence" not in existing_cols:
                conn.execute(text("ALTER TABLE user_competencies ADD COLUMN confidence FLOAT DEFAULT 0.5"))
            if "last_assessed" not in existing_cols:
                conn.execute(text("ALTER TABLE user_competencies ADD COLUMN last_assessed DATETIME"))
            if "assessment_source" not in existing_cols:
                conn.execute(text("ALTER TABLE user_competencies ADD COLUMN assessment_source VARCHAR DEFAULT 'INITIAL_DIAGNOSTIC'"))
            conn.commit()
        except Exception:
            pass

        # Courses table
        try:
            columns = conn.execute(text("PRAGMA table_info(courses)")).fetchall()
            existing_cols = {row[1] for row in columns}
            if "provider" not in existing_cols:
                conn.execute(text("ALTER TABLE courses ADD COLUMN provider VARCHAR DEFAULT 'Capacity Building Commission / MoSPI'"))
            if "source_type" not in existing_cols:
                conn.execute(text("ALTER TABLE courses ADD COLUMN source_type VARCHAR DEFAULT 'iGOT Karmayogi'"))
            if "igot_course_id" not in existing_cols:
                conn.execute(text("ALTER TABLE courses ADD COLUMN igot_course_id VARCHAR"))
            if "course_url" not in existing_cols:
                conn.execute(text("ALTER TABLE courses ADD COLUMN course_url VARCHAR DEFAULT 'https://portal.igotkarmayogi.gov.in'"))
            if "active" not in existing_cols:
                conn.execute(text("ALTER TABLE courses ADD COLUMN active BOOLEAN DEFAULT 1"))
            if "last_verified" not in existing_cols:
                conn.execute(text("ALTER TABLE courses ADD COLUMN last_verified DATETIME"))
            conn.commit()
        except Exception:
            pass

        # Quizzes table
        try:
            columns = conn.execute(text("PRAGMA table_info(quizzes)")).fetchall()
            existing_cols = {row[1] for row in columns}
            if "quiz_type" not in existing_cols:
                conn.execute(text("ALTER TABLE quizzes ADD COLUMN quiz_type VARCHAR DEFAULT 'DIAGNOSTIC'"))
            if "created_at" not in existing_cols:
                conn.execute(text("ALTER TABLE quizzes ADD COLUMN created_at DATETIME"))
            conn.commit()
        except Exception:
            pass

        # Questions table
        try:
            columns = conn.execute(text("PRAGMA table_info(questions)")).fetchall()
            existing_cols = {row[1] for row in columns}
            if "competency_id" not in existing_cols:
                conn.execute(text("ALTER TABLE questions ADD COLUMN competency_id INTEGER"))
            if "weight" not in existing_cols:
                conn.execute(text("ALTER TABLE questions ADD COLUMN weight FLOAT DEFAULT 1.0"))
            if "source_reference" not in existing_cols:
                conn.execute(text("ALTER TABLE questions ADD COLUMN source_reference VARCHAR"))
            conn.commit()
        except Exception:
            pass

        # Quiz Results table
        try:
            columns = conn.execute(text("PRAGMA table_info(quiz_results)")).fetchall()
            existing_cols = {row[1] for row in columns}
            if "competency_breakdown" not in existing_cols:
                conn.execute(text("ALTER TABLE quiz_results ADD COLUMN competency_breakdown TEXT"))
            if "wrong_question_ids" not in existing_cols:
                conn.execute(text("ALTER TABLE quiz_results ADD COLUMN wrong_question_ids VARCHAR"))
            if "created_at" not in existing_cols:
                conn.execute(text("ALTER TABLE quiz_results ADD COLUMN created_at DATETIME"))
            conn.commit()
        except Exception:
            pass

# Seed basic data on startup in correct dependency order
db = SessionLocal()
try:
    CompetencyService.seed_competencies(db)
    RoleService.seed_organizations_and_roles(db)
    RecommendationService.seed_courses(db)
    UserService.seed_default_user(db)
finally:
    db.close()

app = FastAPI(
    title="PragatiParikshan — Competency Intelligence & Personalized Learning Platform",
    description="Backend API for India's Official Statistical System (MoSPI SIH26101). Integrates with iGOT Karmayogi and NSSTA.",
    version="2.0.0"
)

# Environment-driven CORS Setup
allowed_origins_raw = settings.ALLOWED_ORIGINS
if allowed_origins_raw.strip() == "*":
    origins = ["*"]
else:
    origins = [orig.strip() for orig in allowed_origins_raw.split(",") if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoints
@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    """
    Standard production health check endpoint for container / orchestrator probes.
    """
    return {
        "status": "ok",
        "service": "PragatiParikshan API",
        "environment": settings.ENVIRONMENT,
        "database": "connected"
    }

# Mount Routers under /api/v1
api_prefix = "/api/v1"
app.include_router(roles.router, prefix=api_prefix)
app.include_router(users.router, prefix=api_prefix)
app.include_router(competencies.router, prefix=api_prefix)
app.include_router(skill_gaps.router, prefix=api_prefix)
app.include_router(courses.router, prefix=api_prefix)
app.include_router(documents.router, prefix=api_prefix)
app.include_router(rag.router, prefix=api_prefix)
app.include_router(quizzes.router, prefix=api_prefix)
app.include_router(progress.router, prefix=api_prefix)
app.include_router(roadmaps.router, prefix=api_prefix)
app.include_router(admin.router, prefix=api_prefix)

@app.get("/", tags=["Root"])
def read_root():
    return {
        "platform": "PragatiParikshan — Competency Intelligence & Diagnostic Platform",
        "ministry": "Ministry of Statistics and Programme Implementation (MoSPI)",
        "problem_statement": "SIH26101 (Smart India Hackathon 2026)",
        "ecosystem_partners": ["iGOT Karmayogi (CBC / DoPT)", "NSSTA Greater Noida", "TPAC / MoSPI"],
        "status": "online",
        "environment": settings.ENVIRONMENT,
        "version": "2.0.0",
        "docs_url": "/docs"
    }

