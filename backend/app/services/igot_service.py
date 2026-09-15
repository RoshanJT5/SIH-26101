from typing import List, Dict, Any, Optional

class LearningProvider:
    """
    Curated repository of official verified training resources for India's Official Statistical System.
    Distinguishes between:
    1. iGOT Karmayogi verified e-learning courses
    2. NSSTA / TPAC training programmes (Residential & Virtual)
    3. Approved external statistical learning resources
    """

    # Curated, verified iGOT Karmayogi e-learning courses for the Official Statistical System
    VERIFIED_IGOT_COURSES: List[Dict[str, Any]] = [
        {
            "external_id": "IGOT-STAT-001",
            "title": "Survey Design and Field Enumeration Methodologies",
            "description": "Comprehensive training on questionnaire design, multi-stage stratified survey planning, and standard operating procedures for field survey operations.",
            "provider": "Capacity Building Commission / MoSPI",
            "source_type": "iGOT Karmayogi",
            "igot_course_id": "do_113840291039841",
            "course_url": "https://portal.igotkarmayogi.gov.in/app/toc/do_113840291039841/overview",
            "level": "Intermediate",
            "duration_hours": 8,
            "language": "English",
            "skills": "Survey Design,Sampling Techniques,Data Quality & Validation Frameworks",
            "competency_mappings": [
                ("Survey Design", 4, 1.0),
                ("Sampling Techniques", 3, 0.8),
                ("Data Quality & Validation Frameworks", 3, 0.7)
            ]
        },
        {
            "external_id": "IGOT-STAT-002",
            "title": "Advanced Sampling Techniques in Official Statistics",
            "description": "Principles of simple random sampling, probability proportional to size (PPS), cluster sampling, and estimation error mitigation developed by NSSTA.",
            "provider": "National Statistical Systems Training Academy (NSSTA)",
            "source_type": "iGOT Karmayogi",
            "igot_course_id": "do_113840291039842",
            "course_url": "https://portal.igotkarmayogi.gov.in/app/toc/do_113840291039842/overview",
            "level": "Intermediate",
            "duration_hours": 6,
            "language": "English",
            "skills": "Sampling Techniques,Survey Design",
            "competency_mappings": [
                ("Sampling Techniques", 4, 1.0),
                ("Survey Design", 3, 0.8)
            ]
        },
        {
            "external_id": "IGOT-STAT-003",
            "title": "National Accounts Compilation & Macroeconomic Aggregates",
            "description": "SNA 2008 guidelines, Gross Value Added (GVA) estimation, GDP deflators, and input-output table compilation for statistical officers.",
            "provider": "National Accounts Division / MoSPI",
            "source_type": "iGOT Karmayogi",
            "igot_course_id": "do_113840291039843",
            "course_url": "https://portal.igotkarmayogi.gov.in/app/toc/do_113840291039843/overview",
            "level": "Advanced",
            "duration_hours": 14,
            "language": "English",
            "skills": "National Accounts & GVA,Price Statistics & Index Numbers",
            "competency_mappings": [
                ("National Accounts & GVA", 5, 1.0),
                ("Price Statistics & Index Numbers", 4, 0.8),
                ("Agricultural & Industrial Statistics", 3, 0.7)
            ]
        },
        {
            "external_id": "IGOT-STAT-004",
            "title": "Price Statistics: CPI, WPI and Inflation Indexing",
            "description": "Methodologies for Consumer Price Index (CPI), Wholesale Price Index (WPI), base year revisions, and Laspeyres price index aggregation.",
            "provider": "Price Statistics Division / MoSPI",
            "source_type": "iGOT Karmayogi",
            "igot_course_id": "do_113840291039844",
            "course_url": "https://portal.igotkarmayogi.gov.in/app/toc/do_113840291039844/overview",
            "level": "Intermediate",
            "duration_hours": 10,
            "language": "English",
            "skills": "Price Statistics & Index Numbers,National Accounts & GVA",
            "competency_mappings": [
                ("Price Statistics & Index Numbers", 4, 1.0),
                ("National Accounts & GVA", 3, 0.7)
            ]
        },
        {
            "external_id": "IGOT-STAT-005",
            "title": "Periodic Labour Force Survey (PLFS) & Employment Analytics",
            "description": "Labor force participation rates, worker population ratios, activity status classification, and analyzing NSSO/PLFS microdata.",
            "provider": "NSSO Survey Coordination",
            "source_type": "iGOT Karmayogi",
            "igot_course_id": "do_113840291039845",
            "course_url": "https://portal.igotkarmayogi.gov.in/app/toc/do_113840291039845/overview",
            "level": "Intermediate",
            "duration_hours": 8,
            "language": "English",
            "skills": "Labour & Employment Statistics,Sampling Techniques,Python for Statistical Computing",
            "competency_mappings": [
                ("Labour & Employment Statistics", 4, 1.0),
                ("Sampling Techniques", 3, 0.7),
                ("Python for Statistical Computing", 3, 0.6)
            ]
        },
        {
            "external_id": "IGOT-STAT-006",
            "title": "Index of Industrial Production (IIP) and Annual Survey of Industries",
            "description": "Compilation of industrial production indices, enterprise sampling frames, and establishment reporting standards in India.",
            "provider": "Economic Statistics Division / MoSPI",
            "source_type": "iGOT Karmayogi",
            "igot_course_id": "do_113840291039846",
            "course_url": "https://portal.igotkarmayogi.gov.in/app/toc/do_113840291039846/overview",
            "level": "Intermediate",
            "duration_hours": 9,
            "language": "English",
            "skills": "Agricultural & Industrial Statistics,Price Statistics & Index Numbers",
            "competency_mappings": [
                ("Agricultural & Industrial Statistics", 4, 1.0),
                ("Data Quality & Validation Frameworks", 3, 0.7)
            ]
        },
        {
            "external_id": "IGOT-TECH-001",
            "title": "Python for Statistical Computing in Public Administration",
            "description": "Mastering Pandas, NumPy, automated data wrangling, and cleaning large-scale official survey datasets.",
            "provider": "Capacity Building Commission / NIC",
            "source_type": "iGOT Karmayogi",
            "igot_course_id": "do_113840291039847",
            "course_url": "https://portal.igotkarmayogi.gov.in/app/toc/do_113840291039847/overview",
            "level": "Beginner",
            "duration_hours": 12,
            "language": "English",
            "skills": "Python for Statistical Computing,Relational Databases & SQL",
            "competency_mappings": [
                ("Python for Statistical Computing", 4, 1.0),
                ("Relational Databases & SQL", 3, 0.7)
            ]
        },
        {
            "external_id": "IGOT-TECH-002",
            "title": "R Programming for Econometric Modeling & Policy Analysis",
            "description": "Exploratory data analysis, regression modeling, time-series forecasting, and ggplot2 visualizations tailored for official statistical researchers.",
            "provider": "Indian Statistical Institute (ISI) / NSSTA",
            "source_type": "iGOT Karmayogi",
            "igot_course_id": "do_113840291039848",
            "course_url": "https://portal.igotkarmayogi.gov.in/app/toc/do_113840291039848/overview",
            "level": "Intermediate",
            "duration_hours": 12,
            "language": "English",
            "skills": "R Programming & Econometrics,Interactive Data Visualization",
            "competency_mappings": [
                ("R Programming & Econometrics", 4, 1.0),
                ("Interactive Data Visualization", 3, 0.8)
            ]
        },
        {
            "external_id": "IGOT-TECH-003",
            "title": "Relational Databases and SQL for Administrative Microdata",
            "description": "Complex joins, indexing strategies, analytical window functions, and database integrity management for government data systems.",
            "provider": "National Informatics Centre (NIC)",
            "source_type": "iGOT Karmayogi",
            "igot_course_id": "do_113840291039849",
            "course_url": "https://portal.igotkarmayogi.gov.in/app/toc/do_113840291039849/overview",
            "level": "Intermediate",
            "duration_hours": 8,
            "language": "English",
            "skills": "Relational Databases & SQL,Data Quality & Validation Frameworks",
            "competency_mappings": [
                ("Relational Databases & SQL", 4, 1.0),
                ("Data Quality & Validation Frameworks", 3, 0.7)
            ]
        },
        {
            "external_id": "IGOT-TECH-004",
            "title": "Geographic Information Systems (GIS) & Spatial Analytics",
            "description": "Georeferencing, choropleth thematic mapping, QGIS workflows, and spatial boundary overlays for district development monitoring.",
            "provider": "Digital India Corporation",
            "source_type": "iGOT Karmayogi",
            "igot_course_id": "do_113840291039850",
            "course_url": "https://portal.igotkarmayogi.gov.in/app/toc/do_113840291039850/overview",
            "level": "Intermediate",
            "duration_hours": 9,
            "language": "English",
            "skills": "GIS & Spatial Analytics,Interactive Data Visualization",
            "competency_mappings": [
                ("GIS & Spatial Analytics", 4, 1.0),
                ("Interactive Data Visualization", 3, 0.7)
            ]
        },
        {
            "external_id": "IGOT-TECH-005",
            "title": "Interactive Data Visualization & Statistical Storytelling",
            "description": "Visualizing complex survey data using modern charts, dashboards, and storytelling principles for policy briefs and executive decisions.",
            "provider": "Capacity Building Commission",
            "source_type": "iGOT Karmayogi",
            "igot_course_id": "do_113840291039851",
            "course_url": "https://portal.igotkarmayogi.gov.in/app/toc/do_113840291039851/overview",
            "level": "Beginner",
            "duration_hours": 6,
            "language": "English",
            "skills": "Interactive Data Visualization,Official Communication & Policy Briefs",
            "competency_mappings": [
                ("Interactive Data Visualization", 4, 1.0),
                ("Official Communication & Policy Briefs", 3, 0.8)
            ]
        },
        {
            "external_id": "IGOT-GOV-001",
            "title": "Digital Personal Data Protection (DPDP) Act 2023 Compliance",
            "description": "Regulatory duties of Data Fiduciaries, citizen consent frameworks, privacy-by-design principles, and statistical anonymization techniques.",
            "provider": "Ministry of Electronics and IT (MeitY) / DoPT",
            "source_type": "iGOT Karmayogi",
            "igot_course_id": "do_113840291039852",
            "course_url": "https://portal.igotkarmayogi.gov.in/app/toc/do_113840291039852/overview",
            "level": "Intermediate",
            "duration_hours": 6,
            "language": "English",
            "skills": "Data Privacy & DPDP Act 2023,Cybersecurity & Infrastructure Protection",
            "competency_mappings": [
                ("Data Privacy & DPDP Act 2023", 5, 1.0),
                ("Cybersecurity & Infrastructure Protection", 3, 0.7)
            ]
        },
        {
            "external_id": "IGOT-GOV-002",
            "title": "Cybersecurity Essentials for Government IT & Data Systems",
            "description": "Threat mitigation, zero-trust architecture, CERT-In compliance guidelines, and cryptographic best practices for government systems.",
            "provider": "National Critical Information Infrastructure Protection Centre",
            "source_type": "iGOT Karmayogi",
            "igot_course_id": "do_113840291039853",
            "course_url": "https://portal.igotkarmayogi.gov.in/app/toc/do_113840291039853/overview",
            "level": "Advanced",
            "duration_hours": 8,
            "language": "English",
            "skills": "Cybersecurity & Infrastructure Protection,Digital Public Infrastructure & APIs",
            "competency_mappings": [
                ("Cybersecurity & Infrastructure Protection", 4, 1.0),
                ("Digital Public Infrastructure & APIs", 3, 0.7)
            ]
        },
        {
            "external_id": "IGOT-MGT-001",
            "title": "Strategic Leadership & Change Management in Public Admin",
            "description": "Strategic thinking, leading inter-departmental teams, stakeholder consensus building, and fostering organizational resilience.",
            "provider": "LBSNAA Mussoorie / DoPT",
            "source_type": "iGOT Karmayogi",
            "igot_course_id": "do_113840291039854",
            "course_url": "https://portal.igotkarmayogi.gov.in/app/toc/do_113840291039854/overview",
            "level": "Advanced",
            "duration_hours": 7,
            "language": "English",
            "skills": "Strategic Leadership in Public Admin,Official Communication & Policy Briefs",
            "competency_mappings": [
                ("Strategic Leadership in Public Admin", 4, 1.0),
                ("Official Communication & Policy Briefs", 3, 0.8)
            ]
        }
    ]

    # Official NSSTA & TPAC In-Service Residential and Virtual Training Programmes
    NSSTA_TPAC_PROGRAMMES: List[Dict[str, Any]] = [
        {
            "title": "Executive Workshop on System of National Accounts (SNA 2008) & GVA Balancing",
            "provider": "NSSTA Greater Noida (MoSPI)",
            "programme_type": "In-Service Residential",
            "description": "5-day intensive residential immersion on institutional sector accounts, FISIM allocation, and supply-use balancing matrices.",
            "competencies": "National Accounts & GVA,Price Statistics & Index Numbers",
            "eligibility": "ISS Senior Time Scale Officers, Deputy Directors, Senior Research Officers",
            "duration": "5 Days (Residential)",
            "registration_url": "https://mospi.gov.in/nssta/training-calendar"
        },
        {
            "title": "Advanced Survey Sampling & CAPI Tablet-Based Field Operations",
            "provider": "NSSTA / NSSO FOD Training Wing",
            "programme_type": "In-Service Residential",
            "description": "Practical field laboratory on multi-stage cluster sampling, sample weight calculation, and real-time CAPI data quality audits.",
            "competencies": "Sampling Techniques,Survey Design,Data Quality & Validation Frameworks",
            "eligibility": "Field Supervisors, Statistical Officers, NSSO Field Officers",
            "duration": "4 Days (Residential)",
            "registration_url": "https://mospi.gov.in/nssta/training-calendar"
        },
        {
            "title": "National Masterclass on DPDP Act 2023 Compliance & Statistical Anonymization",
            "provider": "TPAC / MoSPI & MeitY Legal Division",
            "programme_type": "Virtual Masterclass",
            "description": "Comprehensive legal and technical framework for applying differential privacy, k-anonymity, and consent governance to official public microdata.",
            "competencies": "Data Privacy & DPDP Act 2023,Digital Public Infrastructure & APIs",
            "eligibility": "All Statistical Officers, Data Analysts, IT Infrastructure Leads",
            "duration": "2 Days (Online Interactive)",
            "registration_url": "https://mospi.gov.in/tpac/programmes"
        }
    ]

    @classmethod
    def list_all_courses(cls) -> List[Dict[str, Any]]:
        return cls.VERIFIED_IGOT_COURSES

    @classmethod
    def list_all_programmes(cls) -> List[Dict[str, Any]]:
        return cls.NSSTA_TPAC_PROGRAMMES
