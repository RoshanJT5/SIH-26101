from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base, SessionLocal
from app.services.competency_service import CompetencyService
from app.services.recommendation_service import RecommendationService
from app.services.user_service import UserService

# Import all models to ensure they are registered for table creation
from app.models.user import User, UserCompetency
from app.models.competency import Competency
from app.models.course import Course
from app.models.document import Document, DocumentChunk
from app.models.quiz import Quiz, Question, QuizResult
from app.models.progress import LearningHistory
from app.models.ai_cache import AICache

# Import routes
from app.api.routes import users, competencies, skill_gaps, courses, documents, rag, quizzes, progress, roadmaps, admin

from sqlalchemy import text

# Initialize tables
Base.metadata.create_all(bind=engine)

# Safe SQLite migrations
with engine.connect() as conn:
    try:
        columns = conn.execute(text("PRAGMA table_info(users)"))
        existing_columns = {row[1] for row in columns.fetchall()}
        if "password_hash" not in existing_columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR"))
        conn.commit()
    except Exception:
        pass

    for column_name in ("mobile", "employee_id", "organization"):
        try:
            existing_columns = {row[1] for row in conn.execute(text("PRAGMA table_info(users)")).fetchall()}
            if column_name not in existing_columns:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {column_name} VARCHAR"))
                conn.commit()
        except Exception:
            pass

    try:
        conn.execute(text("ALTER TABLE courses ADD COLUMN course_url VARCHAR"))
        conn.commit()
    except Exception:
        pass
    try:
        conn.execute(text("UPDATE courses SET course_url = 'https://portal.igotkarmayogi.gov.in' WHERE course_url LIKE '%/app/toc/%' OR course_url IS NULL"))
        conn.commit()
    except Exception:
        pass

# Seed basic data on startup
db = SessionLocal()
try:
    CompetencyService.seed_competencies(db)
    RecommendationService.seed_courses(db)
    UserService.seed_default_user(db)
finally:
    db.close()

app = FastAPI(
    title="AI-Enabled Skill Intelligence & Learning Platform",
    description="Backend API for personalizing and assisting employee learning with SQLite.",
    version="1.0.0"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under /api/v1
api_prefix = "/api/v1"
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

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Welcome to the Skill Intelligence & Learning Platform API. Go to /docs for interactive Swagger API documentation."
    }
