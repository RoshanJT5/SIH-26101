from sqlalchemy.orm import Session
from app.models.competency import Competency
from typing import List, Optional

# Official Statistical System (OSS) & MoSPI Comprehensive Competency Framework
OSS_COMPETENCY_CATALOG = [
    # 1. STATISTICAL DOMAIN
    {
        "name": "Survey Design",
        "category": "STATISTICAL",
        "description": "Planning and designing multi-stage statistical surveys, questionnaire construction, stratification, and sample size determination.",
        "max_level": 5
    },
    {
        "name": "Sampling Techniques",
        "category": "STATISTICAL",
        "description": "Application of simple random, stratified, cluster, systematic, and probability proportional to size (PPS) sampling methods.",
        "max_level": 5
    },
    {
        "name": "National Accounts & GVA",
        "category": "STATISTICAL",
        "description": "System of National Accounts (SNA 2008), Gross Value Added (GVA), GDP compilation, deflators, and input-output tables.",
        "max_level": 5
    },
    {
        "name": "Price Statistics & Index Numbers",
        "category": "STATISTICAL",
        "description": "Compilation methodologies for Consumer Price Index (CPI), Wholesale Price Index (WPI), base-year revision, and Laspeyres index formulation.",
        "max_level": 5
    },
    {
        "name": "Labour & Employment Statistics",
        "category": "STATISTICAL",
        "description": "Periodic Labour Force Survey (PLFS) concepts, usual and current weekly status, worker-population ratios, and unemployment rates.",
        "max_level": 5
    },
    {
        "name": "Agricultural & Industrial Statistics",
        "category": "STATISTICAL",
        "description": "Index of Industrial Production (IIP), Annual Survey of Industries (ASI), crop cutting estimation, and yield forecasting.",
        "max_level": 5
    },
    {
        "name": "Data Quality & Validation Frameworks",
        "category": "STATISTICAL",
        "description": "Data editing, logical consistency checks, statistical imputation, variance estimation, and official data release standards.",
        "max_level": 5
    },
    {
        "name": "SDG Indicators & Metadata Standards",
        "category": "STATISTICAL",
        "description": "National Indicator Framework (NIF) for Sustainable Development Goals, statistical metadata documentation (SDMX), and reporting.",
        "max_level": 5
    },

    # 2. TECHNICAL DOMAIN
    {
        "name": "Python for Statistical Computing",
        "category": "TECHNICAL",
        "description": "Automated data wrangling, Pandas, NumPy, statistical hypothesis testing, and processing large-scale administrative microdata.",
        "max_level": 5
    },
    {
        "name": "R Programming & Econometrics",
        "category": "TECHNICAL",
        "description": "Exploratory data analysis, econometric modeling, time-series forecasting, and ggplot2 visual reporting for official policy.",
        "max_level": 5
    },
    {
        "name": "Relational Databases & SQL",
        "category": "TECHNICAL",
        "description": "Complex relational queries, indexing, window functions, and analytical aggregation for government administrative databases.",
        "max_level": 5
    },
    {
        "name": "GIS & Spatial Analytics",
        "category": "TECHNICAL",
        "description": "Geospatial data integration, thematic boundary mapping, QGIS workflows, and geo-referenced sampling frame management.",
        "max_level": 5
    },
    {
        "name": "Interactive Data Visualization",
        "category": "TECHNICAL",
        "description": "Designing interactive dashboards, infographics, and visual charts for executive decision making and public data dissemination.",
        "max_level": 5
    },
    {
        "name": "AI & Machine Learning in Governance",
        "category": "TECHNICAL",
        "description": "Natural Language Processing, automated categorization, predictive modeling, and ethical AI deployment for public data systems.",
        "max_level": 5
    },
    {
        "name": "Stata & Survey Analysis",
        "category": "TECHNICAL",
        "description": "Microdata manipulation, complex survey command estimation (svy), panel data econometrics, and survey weights.",
        "max_level": 5
    },
    {
        "name": "SPSS for Social Statistics",
        "category": "TECHNICAL",
        "description": "Cross-tabulation, hypothesis tests, parametric/non-parametric inferential statistics, and demographic analysis.",
        "max_level": 5
    },
    {
        "name": "Cloud Computing & Data Pipelines",
        "category": "TECHNICAL",
        "description": "Government cloud orchestration, ETL workflows, data lake integration, and large-scale census data processing.",
        "max_level": 5
    },

    # 3. DIGITAL GOVERNANCE DOMAIN
    {
        "name": "Cybersecurity & Infrastructure Protection",
        "category": "DIGITAL_GOVERNANCE",
        "description": "Information security protocols, CERT-In compliance, encryption, access control, and zero-trust government architecture.",
        "max_level": 5
    },
    {
        "name": "Data Privacy & DPDP Act 2023",
        "category": "DIGITAL_GOVERNANCE",
        "description": "Digital Personal Data Protection Act compliance, data fiduciary obligations, privacy-by-design, and statistical anonymization.",
        "max_level": 5
    },
    {
        "name": "Digital Public Infrastructure & APIs",
        "category": "DIGITAL_GOVERNANCE",
        "description": "Government API integration, National Data & Analytics Platform (NDAP) standards, and digital signature compliance.",
        "max_level": 5
    },

    # 4. BEHAVIOURAL & MANAGERIAL DOMAIN
    {
        "name": "Strategic Leadership in Public Admin",
        "category": "BEHAVIOURAL_MANAGERIAL",
        "description": "Leading inter-departmental teams, stakeholder consensus, change management, and institutional capacity building.",
        "max_level": 5
    },
    {
        "name": "Official Communication & Policy Briefs",
        "category": "BEHAVIOURAL_MANAGERIAL",
        "description": "Drafting policy notes, statistical releases, parliamentary question replies, and executive summary briefs.",
        "max_level": 5
    },
    {
        "name": "Project Management & Survey Operations",
        "category": "BEHAVIOURAL_MANAGERIAL",
        "description": "Survey field logistics, budget monitoring, milestone tracking, resource allocation, and quality timelines.",
        "max_level": 5
    },
    {
        "name": "Ethics & Accountability in Public Service",
        "category": "BEHAVIOURAL_MANAGERIAL",
        "description": "Professional statistical integrity, conflict of interest management, transparency standards, and public trust.",
        "max_level": 5
    },
    {
        "name": "Decision Making & Risk Governance",
        "category": "BEHAVIOURAL_MANAGERIAL",
        "description": "Evidence-based decision frameworks, operational risk mitigation, and crisis management in data operations.",
        "max_level": 5
    },
    {
        "name": "Public Procurement & GeM/GFR",
        "category": "BEHAVIOURAL_MANAGERIAL",
        "description": "Government e-Marketplace (GeM) workflows, General Financial Rules (GFR 2017) compliance, and contract lifecycle management.",
        "max_level": 5
    }

]

class CompetencyService:
    @staticmethod
    def get_all_competencies(db: Session, category: Optional[str] = None) -> List[Competency]:
        query = db.query(Competency).filter(Competency.active == True)
        if category:
            query = query.filter(Competency.category == category)
        return query.order_by(Competency.category.asc(), Competency.name.asc()).all()

    @staticmethod
    def get_competency(db: Session, competency_id: int) -> Optional[Competency]:
        return db.query(Competency).filter(Competency.id == competency_id).first()

    @staticmethod
    def get_competency_by_name(db: Session, name: str) -> Optional[Competency]:
        return db.query(Competency).filter(Competency.name.ilike(name.strip())).first()

    @staticmethod
    def seed_competencies(db: Session):
        for comp_data in OSS_COMPETENCY_CATALOG:
            exists = db.query(Competency).filter(Competency.name == comp_data["name"]).first()
            if not exists:
                db_comp = Competency(**comp_data)
                db.add(db_comp)
            else:
                exists.category = comp_data["category"]
                exists.description = comp_data["description"]
                exists.max_level = comp_data.get("max_level", 5)
                exists.active = True
        db.commit()
