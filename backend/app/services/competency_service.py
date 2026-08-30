from sqlalchemy.orm import Session
from app.models.competency import Competency
from app.schemas.competency import CompetencyCreate

DEFAULT_COMPETENCIES = [
    # Statistical
    {"name": "Survey Design", "category": "Statistical", "description": "Methodology for planning and designing statistical surveys."},
    {"name": "Sampling", "category": "Statistical", "description": "Techniques for selecting representative samples from populations."},
    {"name": "National Accounts", "category": "Statistical", "description": "Compilation of macroeconomic indicators like GDP."},
    {"name": "Price Statistics", "category": "Statistical", "description": "Indices measuring price changes (CPI, WPI)."},
    {"name": "Labour Statistics", "category": "Statistical", "description": "Measurement of employment, unemployment, and labor force dynamics."},
    # Technical
    {"name": "Python", "category": "Technical", "description": "General programming for data analysis and software development."},
    {"name": "R", "category": "Technical", "description": "Statistical computing and graphic capabilities."},
    {"name": "SQL", "category": "Technical", "description": "Structured Query Language for database management."},
    {"name": "GIS", "category": "Technical", "description": "Geographic Information Systems mapping and spatial analysis."},
    {"name": "Data Visualization", "category": "Technical", "description": "Designing charts, dashboards, and visual representation of data."},
    {"name": "AI/ML", "category": "Technical", "description": "Artificial Intelligence and Machine Learning implementation."},
    # Digital Governance
    {"name": "Cybersecurity", "category": "Digital Governance", "description": "Information security policies, encryption, and threat prevention."},
    {"name": "Data Privacy", "category": "Digital Governance", "description": "Regulations and technical protocols for protecting user/public data."},
    # Behavioural / Managerial
    {"name": "Leadership", "category": "Behavioural", "description": "Guiding teams and strategic decision making."},
    {"name": "Communication", "category": "Behavioural", "description": "Expressing ideas clearly and facilitating collaboration."},
    {"name": "Project Management", "category": "Behavioural", "description": "Planning, executing, and closing complex operational projects."}
]

class CompetencyService:
    @staticmethod
    def get_all_competencies(db: Session):
        return db.query(Competency).all()

    @staticmethod
    def get_competency(db: Session, competency_id: int):
        return db.query(Competency).filter(Competency.id == competency_id).first()

    @staticmethod
    def seed_competencies(db: Session):
        for comp_data in DEFAULT_COMPETENCIES:
            exists = db.query(Competency).filter(Competency.name == comp_data["name"]).first()
            if not exists:
                db_comp = Competency(**comp_data)
                db.add(db_comp)
        db.commit()
