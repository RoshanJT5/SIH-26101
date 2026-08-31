from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class LearningProvider(ABC):
    """
    Abstract Base Class for Learning Providers as defined in PRD FR-009.
    Enables seamless swapping between Mock provider and live iGOT Karmayogi API.
    """

    @abstractmethod
    def search_courses(self, query: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_course(self, external_id: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def list_all_courses(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_user_progress(self, user_id: int) -> List[Dict[str, Any]]:
        pass


class MockIGOTProvider(LearningProvider):
    """
    Mock iGOT Karmayogi Provider providing the official course catalog
    aligned with India's Official Statistical System & civil service competencies.
    """

    OFFICIAL_IGOT_CATALOG: List[Dict[str, Any]] = [
        # Statistical Methodologies & Official Statistics
        {
            "external_id": "IGOT-STAT-001",
            "source": "iGOT Karmayogi",
            "title": "Survey Design and Field Enumeration Methodologies",
            "description": "Comprehensive training on questionnaire design, multi-stage stratified survey planning, and standard operating procedures for field survey operations.",
            "level": "Intermediate",
            "duration_hours": 8,
            "language": "English",
            "skills": "Survey Design,Sampling",
            "course_url": "https://portal.igotkarmayogi.gov.in"
        },
        {
            "external_id": "IGOT-STAT-002",
            "source": "iGOT Karmayogi",
            "title": "Advanced Sampling Techniques in Official Statistics",
            "description": "Principles of simple random sampling, probability proportional to size (PPS), cluster sampling, and estimation error mitigation by NSSTA.",
            "level": "Intermediate",
            "duration_hours": 6,
            "language": "English",
            "skills": "Sampling,Survey Design",
            "course_url": "https://portal.igotkarmayogi.gov.in"
        },
        {
            "external_id": "IGOT-STAT-003",
            "source": "iGOT Karmayogi",
            "title": "National Accounts Compilation & Macroeconomic Aggregates",
            "description": "SNA 2008 guidelines, Gross Value Added (GVA) estimation, GDP deflators, and input-output table compilation for MoSPI statistical officers.",
            "level": "Advanced",
            "duration_hours": 14,
            "language": "English",
            "skills": "National Accounts",
            "course_url": "https://portal.igotkarmayogi.gov.in"
        },
        {
            "external_id": "IGOT-STAT-004",
            "source": "iGOT Karmayogi",
            "title": "Price Statistics: CPI, WPI and Inflation Indexing",
            "description": "Methodologies for Consumer Price Index (CPI), Wholesale Price Index (WPI), base year revisions, and Laspeyres price index aggregation.",
            "level": "Intermediate",
            "duration_hours": 10,
            "language": "English",
            "skills": "Price Statistics",
            "course_url": "https://portal.igotkarmayogi.gov.in"
        },
        {
            "external_id": "IGOT-STAT-005",
            "source": "iGOT Karmayogi",
            "title": "Periodic Labour Force Survey (PLFS) & Employment Analytics",
            "description": "Labor force participation rates, worker population ratios, activity status classification, and analyzing NSSO/PLFS microdata.",
            "level": "Intermediate",
            "duration_hours": 8,
            "language": "English",
            "skills": "Labour Statistics",
            "course_url": "https://portal.igotkarmayogi.gov.in"
        },

        # Technical & Data Systems
        {
            "external_id": "IGOT-TECH-001",
            "source": "iGOT Karmayogi",
            "title": "Python for Data Analysis in Public Administration",
            "description": "Mastering Pandas, NumPy, and automation scripts for cleaning, wrangling, and transforming large-scale administrative datasets.",
            "level": "Beginner",
            "duration_hours": 12,
            "language": "English",
            "skills": "Python",
            "course_url": "https://portal.igotkarmayogi.gov.in"
        },
        {
            "external_id": "IGOT-TECH-002",
            "source": "iGOT Karmayogi",
            "title": "FastAPI: Building High-Performance Modern REST APIs",
            "description": "Designing secure, microservice-ready backend APIs with Pydantic validation, async endpoints, and relational databases for government portals.",
            "level": "Intermediate",
            "duration_hours": 10,
            "language": "English",
            "skills": "Python,SQL,APIs",
            "course_url": "https://portal.igotkarmayogi.gov.in"
        },
        {
            "external_id": "IGOT-TECH-003",
            "source": "iGOT Karmayogi",
            "title": "R Programming for Statistical Computing & Econometrics",
            "description": "Exploratory data analysis, regression modeling, time-series forecasting, and ggplot2 visualizations tailored for policy researchers.",
            "level": "Intermediate",
            "duration_hours": 12,
            "language": "English",
            "skills": "R,Data Visualization",
            "course_url": "https://portal.igotkarmayogi.gov.in"
        },
        {
            "external_id": "IGOT-TECH-004",
            "source": "iGOT Karmayogi",
            "title": "Relational Databases & SQL for Administrative Records",
            "description": "Complex joins, indexing strategies, analytical window functions, and database integrity management for government reporting.",
            "level": "Intermediate",
            "duration_hours": 8,
            "language": "English",
            "skills": "SQL",
            "course_url": "https://portal.igotkarmayogi.gov.in"
        },
        {
            "external_id": "IGOT-TECH-005",
            "source": "iGOT Karmayogi",
            "title": "Geographic Information Systems (GIS) & Spatial Analytics",
            "description": "Georeferencing, choropleth thematic mapping, QGIS workflows, and spatial boundary overlays for district development monitoring.",
            "level": "Intermediate",
            "duration_hours": 9,
            "language": "English",
            "skills": "GIS",
            "course_url": "https://portal.igotkarmayogi.gov.in"
        },
        {
            "external_id": "IGOT-TECH-006",
            "source": "iGOT Karmayogi",
            "title": "Interactive Data Visualization & Dashboard Design",
            "description": "Visualizing complex survey data using modern charts, dashboards, and storytelling principles for policy briefs and executive decisions.",
            "level": "Beginner",
            "duration_hours": 6,
            "language": "English",
            "skills": "Data Visualization",
            "course_url": "https://portal.igotkarmayogi.gov.in"
        },
        {
            "external_id": "IGOT-TECH-007",
            "source": "iGOT Karmayogi",
            "title": "Artificial Intelligence & Machine Learning in Governance",
            "description": "Foundation of ML classification, natural language processing, LLMs, and ethical AI deployment across public service delivery.",
            "level": "Intermediate",
            "duration_hours": 15,
            "language": "English",
            "skills": "AI/ML,Python",
            "course_url": "https://portal.igotkarmayogi.gov.in"
        },

        # Digital Governance, Security & Policy
        {
            "external_id": "IGOT-GOV-001",
            "source": "iGOT Karmayogi",
            "title": "Cybersecurity Essentials for Government Infrastructure",
            "description": "Threat mitigation, zero-trust architecture, CERT-In compliance guidelines, and cryptographic best practices for government systems.",
            "level": "Advanced",
            "duration_hours": 8,
            "language": "English",
            "skills": "Cybersecurity",
            "course_url": "https://portal.igotkarmayogi.gov.in"
        },
        {
            "external_id": "IGOT-GOV-002",
            "source": "iGOT Karmayogi",
            "title": "Digital Personal Data Protection (DPDP) Act 2023 Compliance",
            "description": "Regulatory duties of Data Fiduciaries, citizen consent frameworks, privacy-by-design principles, and statistical anonymization techniques.",
            "level": "Intermediate",
            "duration_hours": 6,
            "language": "English",
            "skills": "Data Privacy,Cybersecurity",
            "course_url": "https://portal.igotkarmayogi.gov.in"
        },

        # Behavioural & Managerial Competencies
        {
            "external_id": "IGOT-MGT-001",
            "source": "iGOT Karmayogi",
            "title": "Transformational Leadership in Public Administration",
            "description": "Strategic thinking, leading inter-departmental teams, stakeholder consensus building, and fostering organizational resilience.",
            "level": "Advanced",
            "duration_hours": 7,
            "language": "English",
            "skills": "Leadership",
            "course_url": "https://portal.igotkarmayogi.gov.in"
        },
        {
            "external_id": "IGOT-MGT-002",
            "source": "iGOT Karmayogi",
            "title": "Effective Official Communication & Briefing Notes",
            "description": "Drafting clear policy notes, press releases, parliamentary responses, and concise inter-ministerial correspondence.",
            "level": "Beginner",
            "duration_hours": 5,
            "language": "English",
            "skills": "Communication",
            "course_url": "https://portal.igotkarmayogi.gov.in"
        },
        {
            "external_id": "IGOT-MGT-003",
            "source": "iGOT Karmayogi",
            "title": "Government Project Management & Procurement (GeM / GFR)",
            "description": "Managing milestones, risk registers, General Financial Rules (GFR) compliance, and public procurement through the GeM portal.",
            "level": "Intermediate",
            "duration_hours": 9,
            "language": "English",
            "skills": "Project Management",
            "course_url": "https://portal.igotkarmayogi.gov.in"
        }
    ]

    def search_courses(self, query: str) -> List[Dict[str, Any]]:
        q = query.lower()
        return [
            c for c in self.OFFICIAL_IGOT_CATALOG
            if q in c["title"].lower() or q in c["description"].lower() or q in c["skills"].lower()
        ]

    def get_course(self, external_id: str) -> Optional[Dict[str, Any]]:
        for c in self.OFFICIAL_IGOT_CATALOG:
            if c["external_id"] == external_id:
                return c
        return None

    def list_all_courses(self) -> List[Dict[str, Any]]:
        return self.OFFICIAL_IGOT_CATALOG

    def get_user_progress(self, user_id: int) -> List[Dict[str, Any]]:
        # In production this queries Karmayogi Bharat telemetry APIs
        return []


# Default singleton instance of the learning provider
igot_provider = MockIGOTProvider()
