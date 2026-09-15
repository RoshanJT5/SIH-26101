from sqlalchemy.orm import Session
from app.models.organization_role import Organization, Role, RoleCompetency
from app.models.competency import Competency
from typing import List, Dict, Any, Optional

# Official Statistical System Organization & Role Seed Definitions
OSS_ORGANIZATIONS_AND_ROLES = [
    {
        "name": "National Statistical Office (NSO) - Survey Coordination",
        "ministry": "Ministry of Statistics and Programme Implementation (MoSPI)",
        "department": "Department of Statistics",
        "description": "Apex body responsible for coordinating socio-economic surveys and statistical standard setting.",
        "roles": [
            {
                "role_name": "Statistical Officer (Survey Design & Methodology)",
                "service_cadre": "Indian Statistical Service (ISS) / SSS",
                "description": "Responsible for multi-stage survey design, questionnaire formulation, and standard sampling frame preparation.",
                "responsibilities": "1. Formulate sampling designs for large-scale national surveys.\n2. Design and pilot-test multi-lingual survey schedules.\n3. Compute sampling error, weighting factors, and design effects.\n4. Supervise survey data editing and validation scripts.",
                "competency_requirements": [
                    ("Survey Design", 4, "CRITICAL", "Required to design multi-stage stratified survey architectures."),
                    ("Sampling Techniques", 4, "CRITICAL", "Essential for determining sampling units, stratification, and sample size."),
                    ("Data Quality & Validation Frameworks", 4, "HIGH", "Required for quality audits, logical consistency checks, and outlier treatment."),
                    ("Python for Statistical Computing", 3, "HIGH", "Used for writing automated data cleaning pipelines."),
                    ("Relational Databases & SQL", 3, "HIGH", "Required for managing survey respondent databases and microdata."),
                    ("Interactive Data Visualization", 3, "MEDIUM", "Needed for generating graphical survey summary charts."),
                    ("Official Communication & Policy Briefs", 3, "MEDIUM", "Required for drafting technical survey reports and documentation.")
                ]
            },
            {
                "role_name": "Junior Statistical Officer (Microdata & PLFS Analytics)",
                "service_cadre": "Subordinate Statistical Service (SSS)",
                "description": "Handles data wrangling, tabulation, and indicator generation for the Periodic Labour Force Survey (PLFS).",
                "responsibilities": "1. Process raw PLFS unit-level microdata.\n2. Compile labor force participation and worker population indicators.\n3. Validate field consistency tables.\n4. Prepare automated tabular releases in Python/R.",
                "competency_requirements": [
                    ("Labour & Employment Statistics", 4, "CRITICAL", "Core requirement for analyzing activity status, wages, and employment sectors."),
                    ("Sampling Techniques", 3, "HIGH", "Understanding rotation scheme and panel weighting in PLFS."),
                    ("Python for Statistical Computing", 4, "CRITICAL", "Primary tool for automated microdata cleaning and aggregation."),
                    ("Relational Databases & SQL", 4, "HIGH", "Running complex queries over millions of survey records."),
                    ("Interactive Data Visualization", 3, "HIGH", "Creating public-facing PLFS dashboard charts."),
                    ("Data Privacy & DPDP Act 2023", 3, "MEDIUM", "Ensuring unit-level microdata anonymization before public dissemination.")
                ]
            }
        ]
    },
    {
        "name": "National Accounts Division (NAD)",
        "ministry": "Ministry of Statistics and Programme Implementation (MoSPI)",
        "department": "Department of Statistics",
        "description": "Responsible for compiling macroeconomic aggregates including GDP, GVA, and input-output tables.",
        "roles": [
            {
                "role_name": "Deputy Director (National Accounts & Macroeconomic Aggregates)",
                "service_cadre": "Indian Statistical Service (ISS)",
                "description": "Leads the compilation of quarterly and annual GDP, Gross Value Added by economic sector, and base year revisions.",
                "responsibilities": "1. Oversee SNA 2008 implementation across institutional sectors.\n2. Estimate GVA for manufacturing, agriculture, and services.\n3. Formulate price deflators using CPI and WPI.\n4. Compile Supply and Use Tables (SUT).",
                "competency_requirements": [
                    ("National Accounts & GVA", 5, "CRITICAL", "Expert knowledge of SNA 2008 methodology and macroeconomic balancing."),
                    ("Price Statistics & Index Numbers", 4, "CRITICAL", "Required for deflating current price estimates to constant prices."),
                    ("R Programming & Econometrics", 4, "HIGH", "Applied econometric modeling and seasonal adjustment algorithms."),
                    ("Agricultural & Industrial Statistics", 4, "HIGH", "Synthesizing ASI and crop yield data into GVA estimations."),
                    ("Strategic Leadership in Public Admin", 4, "HIGH", "Directing inter-institutional data reconciliation committees."),
                    ("Official Communication & Policy Briefs", 4, "HIGH", "Drafting press notes for National Accounts quarterly releases.")
                ]
            }
        ]
    },
    {
        "name": "Field Operations Division (NSSO - FOD)",
        "ministry": "Ministry of Statistics and Programme Implementation (MoSPI)",
        "department": "National Sample Survey Office",
        "description": "Field arm executing nationwide socio-economic, agricultural, and enterprise surveys.",
        "roles": [
            {
                "role_name": "Senior Field Enumeration Supervisor",
                "service_cadre": "Subordinate Statistical Service (SSS) / Field Cadre",
                "description": "Supervises field investigators, manages primary sample unit (PSU) listing, and ensures field data integrity.",
                "responsibilities": "1. Verify boundary demarcation and listing of households in sampled villages/blocks.\n2. Conduct real-time spot checks and re-interviews on tablet-based CAPI systems.\n3. Resolve non-response and informant fatigue in field surveys.\n4. Ensure compliance with survey standard operating procedures.",
                "competency_requirements": [
                    ("Survey Design", 4, "CRITICAL", "Translating survey guidelines into field execution protocols."),
                    ("Sampling Techniques", 4, "CRITICAL", "Field selection of households using systematic circular sampling."),
                    ("Data Quality & Validation Frameworks", 4, "CRITICAL", "Detecting field falsification, digit preference, and non-sampling errors."),
                    ("GIS & Spatial Analytics", 3, "HIGH", "Utilizing mobile GIS maps for Urban Frame Survey (UFS) block navigation."),
                    ("Official Communication & Policy Briefs", 3, "MEDIUM", "Interacting with community respondents and local administrative bodies.")
                ]
            }
        ]
    },
    {
        "name": "National Data Governance & Digital Systems (NDAP / NIC)",
        "ministry": "Ministry of Statistics and Programme Implementation (MoSPI)",
        "department": "Data Informatics and Innovation",
        "description": "Manages open data portals, microdata repositories, and statistical APIs across ministries.",
        "roles": [
            {
                "role_name": "Data Systems & Privacy Analyst",
                "service_cadre": "Technical Specialist / Data Cadre",
                "description": "Implements statistical data privacy standards, API pipelines, and secure cloud microdata repositories.",
                "responsibilities": "1. Implement statistical disclosure control (SDC) and k-anonymity algorithms.\n2. Develop REST APIs for interoperable statistical data dissemination.\n3. Ensure CERT-In and DPDP Act compliance across statistical portals.\n4. Design automated data validation pipelines.",
                "competency_requirements": [
                    ("Data Privacy & DPDP Act 2023", 5, "CRITICAL", "Ensuring complete legal and cryptographic compliance for citizen data."),
                    ("Cybersecurity & Infrastructure Protection", 4, "CRITICAL", "Securing statistical data warehouses against unauthorized breaches."),
                    ("Digital Public Infrastructure & APIs", 4, "CRITICAL", "Designing SDMX compliant REST endpoints for open government data."),
                    ("Relational Databases & SQL", 4, "HIGH", "Managing large distributed database clusters."),
                    ("AI & Machine Learning in Governance", 3, "HIGH", "Applying automated anomaly detection in administrative records.")
                ]
            },
            {
                "role_name": "Admin",
                "service_cadre": "Workforce & Statistical Systems Administration",
                "description": "Enterprise administrator managing workforce competencies, cadre allocations, and statistical intelligence.",
                "responsibilities": "1. Oversee national competency matrices and training pipelines.\n2. Monitor department-level readiness and gap analytics.\n3. Allocate capacity building initiatives across ministries.",
                "competency_requirements": [
                    ("Strategic Leadership in Public Admin", 5, "CRITICAL", "National workforce management and institutional leadership."),
                    ("Data Privacy & DPDP Act 2023", 4, "HIGH", "Governance compliance and data protection oversight."),
                    ("Digital Public Infrastructure & APIs", 4, "HIGH", "Enterprise IT and learning management systems.")
                ]
            }
        ]
    }
]

class RoleService:
    @staticmethod
    def get_all_organizations(db: Session) -> List[Organization]:
        return db.query(Organization).filter(Organization.active == True).order_by(Organization.name.asc()).all()

    @staticmethod
    def get_organization(db: Session, org_id: int) -> Optional[Organization]:
        return db.query(Organization).filter(Organization.id == org_id).first()

    @staticmethod
    def get_all_roles(db: Session, org_id: Optional[int] = None) -> List[Role]:
        query = db.query(Role).filter(Role.active == True)
        if org_id:
            query = query.filter(Role.organization_id == org_id)
        return query.order_by(Role.role_name.asc()).all()

    @staticmethod
    def get_role(db: Session, role_id: int) -> Optional[Role]:
        return db.query(Role).filter(Role.id == role_id).first()

    @staticmethod
    def get_role_competencies(db: Session, role_id: int) -> List[RoleCompetency]:
        return db.query(RoleCompetency).filter(RoleCompetency.role_id == role_id).all()

    @staticmethod
    def get_progressive_hierarchy(db: Session) -> Dict[str, Any]:
        orgs = db.query(Organization).filter(Organization.active == True).all()
        ministries = sorted(list({org.ministry for org in orgs}))
        
        depts_by_min: Dict[str, List[str]] = {}
        for m in ministries:
            depts_by_min[m] = sorted(list({o.department for o in orgs if o.ministry == m}))
            
        orgs_by_dept: Dict[str, List[dict]] = {}
        for o in orgs:
            if o.department not in orgs_by_dept:
                orgs_by_dept[o.department] = []
            orgs_by_dept[o.department].append({
                "id": o.id,
                "name": o.name,
                "description": o.description
            })

        roles = db.query(Role).filter(Role.active == True).all()
        roles_by_org: Dict[int, List[dict]] = {}
        for r in roles:
            if r.organization_id not in roles_by_org:
                roles_by_org[r.organization_id] = []
            
            comp_reqs = [
                {
                    "competency_id": rc.competency_id,
                    "competency_name": rc.competency.name if rc.competency else "Unknown",
                    "category": rc.competency.category if rc.competency else "Unknown",
                    "required_level": rc.required_level,
                    "importance": rc.importance,
                    "description": rc.description
                }
                for rc in r.competency_requirements
            ]
            
            roles_by_org[r.organization_id].append({
                "id": r.id,
                "role_name": r.role_name,
                "service_cadre": r.service_cadre,
                "description": r.description,
                "responsibilities": r.responsibilities,
                "competency_count": len(comp_reqs),
                "competencies": comp_reqs
            })

        return {
            "ministries": ministries,
            "departments_by_ministry": depts_by_min,
            "organizations_by_dept": orgs_by_dept,
            "roles_by_org": roles_by_org
        }

    @staticmethod
    def seed_organizations_and_roles(db: Session):
        for org_data in OSS_ORGANIZATIONS_AND_ROLES:
            org = db.query(Organization).filter(Organization.name == org_data["name"]).first()
            if not org:
                org = Organization(
                    name=org_data["name"],
                    ministry=org_data["ministry"],
                    department=org_data["department"],
                    description=org_data["description"]
                )
                db.add(org)
                db.commit()
                db.refresh(org)
            else:
                org.ministry = org_data["ministry"]
                org.department = org_data["department"]
                org.description = org_data["description"]
                db.commit()

            for role_def in org_data["roles"]:
                role = db.query(Role).filter(
                    Role.role_name == role_def["role_name"],
                    Role.organization_id == org.id
                ).first()
                if not role:
                    role = Role(
                        role_name=role_def["role_name"],
                        organization_id=org.id,
                        service_cadre=role_def.get("service_cadre"),
                        description=role_def.get("description"),
                        responsibilities=role_def.get("responsibilities")
                    )
                    db.add(role)
                    db.commit()
                    db.refresh(role)
                else:
                    role.service_cadre = role_def.get("service_cadre")
                    role.description = role_def.get("description")
                    role.responsibilities = role_def.get("responsibilities")
                    db.commit()

                # Seed Role Competencies
                for comp_name, req_level, importance, comp_desc in role_def["competency_requirements"]:
                    comp = db.query(Competency).filter(Competency.name == comp_name).first()
                    if comp:
                        rc = db.query(RoleCompetency).filter(
                            RoleCompetency.role_id == role.id,
                            RoleCompetency.competency_id == comp.id
                        ).first()
                        if not rc:
                            rc = RoleCompetency(
                                role_id=role.id,
                                competency_id=comp.id,
                                required_level=req_level,
                                importance=importance,
                                description=comp_desc
                            )
                            db.add(rc)
                        else:
                            rc.required_level = req_level
                            rc.importance = importance
                            rc.description = comp_desc
                db.commit()
