from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.models.user import User, UserCompetency, CompetencyProgressHistory
from app.models.organization_role import Organization, Role, RoleCompetency
from app.models.competency import Competency
from app.models.course import Course
from app.models.progress import LearningHistory, Roadmap, RoadmapTask
from app.models.quiz import Quiz, Question, QuizResult
from app.schemas.user import UserCreate, UserUpdate, UserCompetencyCreate, UserOnboardingCreate
from app.core.config import settings
from datetime import datetime
import json


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserService:
    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        if not password_hash:
            return False
        return pwd_context.verify(password, password_hash)

    @staticmethod
    def create_user(db: Session, user_in: UserCreate) -> User:
        existing = db.query(User).filter(User.email == user_in.email).first()
        if existing:
            raise ValueError("User with this email already exists")

        password_value = user_in.password if user_in.password else "gov12345"

        # Resolve organization and role if provided
        org_id = user_in.organization_id
        role_id = user_in.role_id

        if not role_id:
            default_role = db.query(Role).first()
            if default_role:
                role_id = default_role.id
                org_id = org_id or default_role.organization_id

        db_user = User(
            name=user_in.name,
            email=user_in.email,
            password_hash=UserService.hash_password(password_value),
            mobile=user_in.mobile,
            employee_id=user_in.employee_id,
            organization_id=org_id,
            role_id=role_id,
            department=user_in.department,
            designation=user_in.designation,
            job_role=user_in.job_role,
            division_unit=user_in.division_unit,
            experience_years=user_in.experience_years or 0,
            education=user_in.education,
            specialization=user_in.specialization,
            career_goal=user_in.career_goal
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        # Initialize UserCompetency records from RoleCompetencies
        UserService.sync_user_competencies_with_role(db, db_user.id)
        return db_user

    @staticmethod
    def create_onboarding_user(db: Session, onboarding_in: UserOnboardingCreate) -> User:
        # 1. Duplicate email check
        existing_email = db.query(User).filter(User.email == onboarding_in.email.strip()).first()
        if existing_email:
            raise ValueError(f"An account with email '{onboarding_in.email}' already exists. Please sign in.")

        # 2. Duplicate employee ID check
        if onboarding_in.employee_id and onboarding_in.employee_id.strip():
            existing_emp = db.query(User).filter(User.employee_id == onboarding_in.employee_id.strip()).first()
            if existing_emp:
                raise ValueError(f"An account with Employee ID '{onboarding_in.employee_id}' already exists.")

        # 3. Resolve role & organization
        role = None
        if onboarding_in.role_id:
            role = db.query(Role).filter(Role.id == onboarding_in.role_id).first()
        
        if not role:
            role = db.query(Role).first()

        org_id = onboarding_in.organization_id or (role.organization_id if role else None)
        role_id = role.id if role else None

        password_value = onboarding_in.password if onboarding_in.password else "gov12345"

        db_user = User(
            name=onboarding_in.name.strip(),
            email=onboarding_in.email.strip(),
            password_hash=UserService.hash_password(password_value),
            mobile=onboarding_in.mobile.strip() if onboarding_in.mobile else None,
            employee_id=onboarding_in.employee_id.strip() if onboarding_in.employee_id else None,
            organization_id=org_id,
            role_id=role_id,
            department=onboarding_in.department or (role.organization.department if role and role.organization else "National Statistical Office (NSO)"),
            designation=onboarding_in.designation or (role.role_name if role else "Statistical Officer"),
            job_role=onboarding_in.job_role or (role.role_name if role else "Statistical Officer"),
            division_unit=onboarding_in.division_unit,
            experience_years=onboarding_in.experience_years or 0,
            education=onboarding_in.education or "Graduate",
            specialization=onboarding_in.specialization,
            career_goal=onboarding_in.career_goal or "Official Statistical Capacity Building"
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        # 4. Map Self-Reported Skills & Role Competencies
        selected_map = {}
        if onboarding_in.selected_skills:
            for s in onboarding_in.selected_skills:
                selected_map[s.competency_id] = s

        # A) Process Role Competencies (Baseline Mandate)
        role_competency_ids = set()
        if role:
            for rc in role.competency_requirements:
                role_competency_ids.add(rc.competency_id)
                s_input = selected_map.get(rc.competency_id)
                if s_input:
                    if s_input.not_sure_assess or s_input.current_level is None or s_input.current_level <= 0:
                        curr_lvl = 0
                        conf = 0.0
                        src = "ASSESSMENT_REQUIRED"
                    else:
                        curr_lvl = min(5, max(1, s_input.current_level))
                        conf = 0.5
                        src = "SELF_REPORTED"
                else:
                    # Required by role but not declared by user -> needs assessment
                    curr_lvl = 0
                    conf = 0.0
                    src = "ASSESSMENT_REQUIRED"

                uc = UserCompetency(
                    user_id=db_user.id,
                    competency_id=rc.competency_id,
                    current_level=curr_lvl,
                    confidence=conf,
                    assessment_source=src
                )
                db.add(uc)

                if curr_lvl > 0:
                    db.add(CompetencyProgressHistory(
                        user_id=db_user.id,
                        competency_id=rc.competency_id,
                        previous_level=0,
                        new_level=curr_lvl,
                        trigger_source="SELF_APPRAISAL_ONBOARDING",
                        notes=f"Initial self-reported baseline for {role.role_name}."
                    ))

        # B) Process any extra declared skills outside the role's primary requirements
        if onboarding_in.selected_skills:
            for s in onboarding_in.selected_skills:
                if s.competency_id not in role_competency_ids:
                    comp_exists = db.query(Competency).filter(Competency.id == s.competency_id).first()
                    if comp_exists:
                        if s.not_sure_assess or s.current_level is None or s.current_level <= 0:
                            curr_lvl = 0
                            conf = 0.0
                            src = "ASSESSMENT_REQUIRED"
                        else:
                            curr_lvl = min(5, max(1, s.current_level))
                            conf = 0.5
                            src = "SELF_REPORTED"

                        uc = UserCompetency(
                            user_id=db_user.id,
                            competency_id=s.competency_id,
                            current_level=curr_lvl,
                            confidence=conf,
                            assessment_source=src
                        )
                        db.add(uc)

                        if curr_lvl > 0:
                            db.add(CompetencyProgressHistory(
                                user_id=db_user.id,
                                competency_id=s.competency_id,
                                previous_level=0,
                                new_level=curr_lvl,
                                trigger_source="SELF_APPRAISAL_ONBOARDING",
                                notes="Declared ancillary competency baseline."
                            ))

        db.commit()
        db.refresh(db_user)
        return db_user


    @staticmethod
    def assign_role(db: Session, user_id: int, org_id: int, role_id: int, designation: str = None) -> User:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        user.organization_id = org_id
        user.role_id = role_id
        if designation:
            user.designation = designation
        else:
            role = db.query(Role).filter(Role.id == role_id).first()
            if role:
                user.designation = role.role_name
                user.job_role = role.role_name
        
        db.commit()
        db.refresh(user)

        # Sync User Competencies
        UserService.sync_user_competencies_with_role(db, user_id)
        return user

    @staticmethod
    def sync_user_competencies_with_role(db: Session, user_id: int):
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.role:
            return

        role = user.role
        for rc in role.competency_requirements:
            existing = db.query(UserCompetency).filter(
                UserCompetency.user_id == user_id,
                UserCompetency.competency_id == rc.competency_id
            ).first()
            if not existing:
                # Initial level default: 1 to (required_level - 1)
                init_level = max(1, rc.required_level - 2) if rc.required_level >= 2 else 0
                uc = UserCompetency(
                    user_id=user_id,
                    competency_id=rc.competency_id,
                    current_level=init_level,
                    confidence=0.5,
                    assessment_source="INITIAL_DIAGNOSTIC"
                )
                db.add(uc)
        db.commit()

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str):
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not UserService.verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user(db: Session, user_id: int) -> User:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_all_users(db: Session) -> list[User]:
        return db.query(User).order_by(User.id.asc()).all()

    @staticmethod
    def update_user(db: Session, user_id: int, user_in: UserUpdate) -> User:
        db_user = UserService.get_user(db, user_id)
        if not db_user:
            return None
        
        update_data = user_in.model_dump(exclude_unset=True)
        if "email" in update_data:
            existing = db.query(User).filter(User.email == update_data["email"], User.id != user_id).first()
            if existing:
                raise ValueError("User with this email already exists")
        if "password" in update_data and update_data["password"]:
            db_user.password_hash = UserService.hash_password(update_data["password"])
            update_data.pop("password")

        for field, value in update_data.items():
            setattr(db_user, field, value)

        db.commit()
        db.refresh(db_user)

        if "role_id" in update_data:
            UserService.sync_user_competencies_with_role(db, user_id)

        return db_user

    @staticmethod
    def add_user_competency(db: Session, user_id: int, comp_in: UserCompetencyCreate) -> UserCompetency:
        existing = db.query(UserCompetency).filter(
            UserCompetency.user_id == user_id,
            UserCompetency.competency_id == comp_in.competency_id
        ).first()

        prev_level = existing.current_level if existing else 0

        if existing:
            existing.current_level = comp_in.current_level
            existing.confidence = comp_in.confidence if comp_in.confidence is not None else existing.confidence
            existing.assessment_source = comp_in.assessment_source or existing.assessment_source
            existing.last_assessed = datetime.now()
            db.commit()
            db.refresh(existing)
            res_uc = existing
        else:
            db_uc = UserCompetency(
                user_id=user_id,
                competency_id=comp_in.competency_id,
                current_level=comp_in.current_level,
                confidence=comp_in.confidence or 0.5,
                assessment_source=comp_in.assessment_source or "SELF_APPRAISAL"
            )
            db.add(db_uc)
            db.commit()
            db.refresh(db_uc)
            res_uc = db_uc

        # Log Progress History
        if prev_level != comp_in.current_level:
            db.add(CompetencyProgressHistory(
                user_id=user_id,
                competency_id=comp_in.competency_id,
                previous_level=prev_level,
                new_level=comp_in.current_level,
                trigger_source=comp_in.assessment_source or "SELF_APPRAISAL",
                notes="Competency level adjusted."
            ))
            db.commit()

        return res_uc

    @staticmethod
    def get_user_competencies(db: Session, user_id: int):
        return db.query(UserCompetency).filter(UserCompetency.user_id == user_id).all()

    @staticmethod
    def seed_default_user(db: Session):
        # Ensure default password for existing users
        for u in db.query(User).all():
            if not u.password_hash:
                u.password_hash = UserService.hash_password("gov12345")
        db.commit()

        # Fetch seeded roles
        roles = db.query(Role).all()
        if not roles:
            return None

        role_map = {r.role_name: r for r in roles}
        default_role = roles[0]

        # Rich Authentic Demo Cohort for India's Official Statistical System
        cohort_definitions = [
            {
                "name": "Aditya Sharma",
                "email": "roshan@stats.gov.in", # Primary demo login
                "role_name": "Statistical Officer (Survey Design & Methodology)",
                "department": "National Statistical Office (NSO)",
                "designation": "Statistical Officer",
                "experience_years": 5,
                "education": "M.Sc Statistics (Delhi School of Economics)",
                "career_goal": "Lead National Survey Design Architect",
                "competency_levels": {
                    "Survey Design": 3, # Required: 4 -> Gap: 1 (Medium)
                    "Sampling Techniques": 2, # Required: 4 -> Gap: 2 (High)
                    "Data Quality & Validation Frameworks": 2, # Required: 4 -> Gap: 2 (High)
                    "Python for Statistical Computing": 3, # Required: 3 -> Gap: 0 (Strength)
                    "Relational Databases & SQL": 3, # Required: 3 -> Gap: 0 (Strength)
                    "Interactive Data Visualization": 1, # Required: 3 -> Gap: 2 (High)
                    "Official Communication & Policy Briefs": 3 # Required: 3 -> Gap: 0 (Strength)
                },
                "course_progress": [
                    ("IGOT-STAT-001", "In Progress", 65),
                    ("IGOT-TECH-001", "Completed", 100)
                ]
            },
            {
                "name": "Priya Sharma",
                "email": "priya.sharma@mospi.gov.in",
                "role_name": "Junior Statistical Officer (Microdata & PLFS Analytics)",
                "department": "Department of Statistics",
                "designation": "Junior Statistical Officer",
                "experience_years": 3,
                "education": "B.Stat (Hons) Indian Statistical Institute",
                "career_goal": "Senior Microdata Scientist",
                "competency_levels": {
                    "Labour & Employment Statistics": 3, # Required: 4 -> Gap: 1
                    "Sampling Techniques": 2, # Required: 3 -> Gap: 1
                    "Python for Statistical Computing": 4, # Required: 4 -> Gap: 0
                    "Relational Databases & SQL": 4, # Required: 4 -> Gap: 0
                    "Interactive Data Visualization": 2, # Required: 3 -> Gap: 1
                    "Data Privacy & DPDP Act 2023": 1 # Required: 3 -> Gap: 2
                },
                "course_progress": [
                    ("IGOT-STAT-005", "In Progress", 40)
                ]
            },
            {
                "name": "Dr. Amitabh Verma",
                "email": "amitabh.verma@mospi.gov.in",
                "role_name": "Deputy Director (National Accounts & Macroeconomic Aggregates)",
                "department": "National Accounts Division (NAD)",
                "designation": "Deputy Director (ISS)",
                "experience_years": 11,
                "education": "Ph.D. Quantitative Economics",
                "career_goal": "Director General of National Accounts",
                "competency_levels": {
                    "National Accounts & GVA": 4, # Required: 5 -> Gap: 1
                    "Price Statistics & Index Numbers": 3, # Required: 4 -> Gap: 1
                    "R Programming & Econometrics": 4, # Required: 4 -> Gap: 0
                    "Agricultural & Industrial Statistics": 4, # Required: 4 -> Gap: 0
                    "Strategic Leadership in Public Admin": 4, # Required: 4 -> Gap: 0
                    "Official Communication & Policy Briefs": 4 # Required: 4 -> Gap: 0
                },
                "course_progress": [
                    ("IGOT-STAT-003", "In Progress", 75)
                ]
            },
            {
                "name": "Sunita Roy",
                "email": "sunita.roy@nsso.gov.in",
                "role_name": "Senior Field Enumeration Supervisor",
                "department": "Field Operations Division (NSSO)",
                "designation": "Senior Field Officer",
                "experience_years": 8,
                "education": "M.A. Applied Economics",
                "career_goal": "Chief Field Inspection Officer",
                "competency_levels": {
                    "Survey Design": 3, # Required: 4 -> Gap: 1
                    "Sampling Techniques": 3, # Required: 4 -> Gap: 1
                    "Data Quality & Validation Frameworks": 2, # Required: 4 -> Gap: 2
                    "GIS & Spatial Analytics": 1, # Required: 3 -> Gap: 2
                    "Official Communication & Policy Briefs": 3 # Required: 3 -> Gap: 0
                },
                "course_progress": [
                    ("IGOT-STAT-002", "In Progress", 50)
                ]
            },
            {
                "name": "Rajesh Nair",
                "email": "rajesh.nair@nic.in",
                "role_name": "Data Systems & Privacy Analyst",
                "department": "Data Informatics and Innovation",
                "designation": "Systems Architect",
                "experience_years": 9,
                "education": "B.Tech Computer Science & InfoSec",
                "career_goal": "Chief Data Protection Officer",
                "competency_levels": {
                    "Data Privacy & DPDP Act 2023": 3, # Required: 5 -> Gap: 2
                    "Cybersecurity & Infrastructure Protection": 4, # Required: 4 -> Gap: 0
                    "Digital Public Infrastructure & APIs": 4, # Required: 4 -> Gap: 0
                    "Relational Databases & SQL": 4, # Required: 4 -> Gap: 0
                    "AI & Machine Learning in Governance": 2 # Required: 3 -> Gap: 1
                },
                "course_progress": [
                    ("IGOT-GOV-001", "In Progress", 30)
                ]
            }
        ]

        for item in cohort_definitions:
            target_role = role_map.get(item["role_name"], default_role)
            existing_user = db.query(User).filter(User.email == item["email"]).first()
            if not existing_user:
                u = User(
                    name=item["name"],
                    email=item["email"],
                    password_hash=UserService.hash_password("gov12345"),
                    organization_id=target_role.organization_id if target_role else None,
                    role_id=target_role.id if target_role else None,
                    department=item["department"],
                    designation=item["designation"],
                    job_role=target_role.role_name if target_role else item["designation"],
                    experience_years=item["experience_years"],
                    education=item["education"],
                    career_goal=item["career_goal"]
                )
                db.add(u)
                db.commit()
                db.refresh(u)
                existing_user = u
            else:
                existing_user.organization_id = target_role.organization_id if target_role else None
                existing_user.role_id = target_role.id if target_role else None
                existing_user.designation = item["designation"]
                db.commit()

            # Seed specific competency levels
            for comp_name, lvl in item["competency_levels"].items():
                comp = db.query(Competency).filter(Competency.name == comp_name).first()
                if comp:
                    uc = db.query(UserCompetency).filter(
                        UserCompetency.user_id == existing_user.id,
                        UserCompetency.competency_id == comp.id
                    ).first()
                    if not uc:
                        db.add(UserCompetency(
                            user_id=existing_user.id,
                            competency_id=comp.id,
                            current_level=lvl,
                            confidence=0.8,
                            assessment_source="INITIAL_DIAGNOSTIC"
                        ))
                    else:
                        uc.current_level = lvl
                        uc.confidence = 0.8
            db.commit()

            # Seed Course Progress
            for ext_id, status_str, pct in item.get("course_progress", []):
                c = db.query(Course).filter(Course.external_id == ext_id).first()
                if c:
                    lh = db.query(LearningHistory).filter(
                        LearningHistory.user_id == existing_user.id,
                        LearningHistory.course_id == c.id
                    ).first()
                    if not lh:
                        db.add(LearningHistory(
                            user_id=existing_user.id,
                            course_id=c.id,
                            status=status_str,
                            progress_percentage=pct
                        ))
            db.commit()

        # Seed Demo Administrator Account (Configurable for Demo/Prototype environments)
        if settings.ENABLE_DEMO_ADMIN:
            admin_email = "admin@pragatiparikshan.demo"
            admin_role = db.query(Role).filter(Role.role_name == "Admin").first()
            if not admin_role:
                admin_role = default_role

            existing_admin = db.query(User).filter(User.email == admin_email).first()
            if not existing_admin:
                demo_admin = User(
                    name="PragatiParikshan Admin",
                    email=admin_email,
                    password_hash=UserService.hash_password("Admin@123"),
                    organization_id=admin_role.organization_id if admin_role else None,
                    role_id=admin_role.id if admin_role else None,
                    department="Ministry of Statistics & Programme Implementation",
                    designation="Admin",
                    job_role="Admin",
                    experience_years=12,
                    education="Master in Public Administration & Data Governance",
                    career_goal="National Competency & Statistical Systems Director"
                )
                db.add(demo_admin)
                db.commit()
                db.refresh(demo_admin)
            else:
                existing_admin.name = "PragatiParikshan Admin"
                existing_admin.password_hash = UserService.hash_password("Admin@123")
                if admin_role:
                    existing_admin.role_id = admin_role.id
                    existing_admin.organization_id = admin_role.organization_id
                existing_admin.designation = "Admin"
                existing_admin.job_role = "Admin"
                db.commit()

        return db.query(User).first()

