# PragatiParikshan (प्रगतिपरीक्षण)
### AI-Enabled Competency Intelligence & Diagnostic Learning Platform for India's Official Statistical System (OSS)
**Smart India Hackathon 2026 — Ministry of Statistics and Programme Implementation (MoSPI) | Problem Statement: SIH26101**

---

## 🎯 Problem Statement & Product Positioning

> **Official Problem Statement (SIH26101):**
> *"Develop an AI enabled learning platform that identifies competency gaps, recommends personalized training through integration with the iGOT Karmayogi ecosystem, and capable of generating Quizzes and Multiple choice questions (MCQs) from uploaded learning materials to strengthen capacity building in India's Official Statistical System."*

### What PragatiParikshan Is & What It Is Not
- **NOT an iGOT Karmayogi Clone or LMS Replacement**: iGOT Karmayogi is India's national civil service learning portal hosting courses, modules, and platform certificates.
- **IS an OSS Competency Intelligence & Diagnostic Co-Pilot**: PragatiParikshan acts as an accredited diagnostic companion for MoSPI, NSO, and state statistical directorates. It defines role-based competency benchmarks, diagnoses workforce gaps, generates grounded AI assessments from official manuals, and prescribes verified training interventions with deep links to iGOT Karmayogi and NSSTA/TPAC programmes.

```
       ┌─────────────────────────────────────────────────────────────┐
       │             THE CLOSED-LOOP COMPETENCY LIFECYCLE            │
       └─────────────────────────────────────────────────────────────┘
                                      │
  1. DIAGNOSE & MAP                   ▼
  ├── Select Cadre Role (e.g. Statistical Officer, SDRD)
  └── Measure 5-Level Proficiency vs. Mandated Baseline (RoleCompetency)
                                      │
  2. IDENTIFY DEFICITS                ▼
  ├── Deterministic Gap Metric: Gap = max(0, Required - Current)
  └── Priority Classification: Critical (Gap ≥ 2), High (1), Strength (0)
                                      │
  3. RECOMMEND INTERVENTIONS          ▼
  ├── Multi-Factor Scoring (40% Gap, 25% Role, 20% Coverage, 15% History)
  └── Verified Deep Links to iGOT Karmayogi & NSSTA Training Programmes
                                      │
  4. ASSESS & BENCHMARK               ▼
  ├── Grounded Diagnostic MCQs with Competency Tags & Official Citations
  └── Passing Benchmark (Score ≥ 70%) triggers Deterministic +1 Level Upgrade
                                      │
  5. AUDIT & PROGRESS TRACKING        ▼
  ├── Immutable CompetencyProgressHistory audit record created
  └── Real-Time Workforce Health Analytics updated for Administration
```

---

## 🏛️ Official Statistical System (OSS) Domain Framework

PragatiParikshan models 4 competency categories across 5 official proficiency levels:

### Competency Categories
1. **Statistical Domain (OSS Core)**: Survey Sampling Methodology, National Accounts & GVA Estimation, Price Indices & Inflation Metrics (CPI/WPI/IIP), Periodic Labour Force Survey (PLFS) & Household Consumer Expenditure (HCES).
2. **Technical & Analytical Tools**: Python for Official Statistical Analysis, Advanced SQL & Survey Data Warehousing, GIS Mapping & Spatial Statistics.
3. **Digital Governance & Legal Framework**: Digital Personal Data Protection (DPDP) Act 2023 & Statistical Data Privacy, Data Dissemination Standards & Metadata Documentation (SDDS/NSDP).
4. **Behavioural & Managerial**: Field Supervisory Leadership & Survey Administration, Inter-Departmental Statistical Coordination.

### 5-Level Proficiency Scale
- **Level 1 (Foundational)**: Basic awareness of statistical terms, survey schedules, or tool syntax.
- **Level 2 (Working)**: Capable of primary data entry, basic tabulation, and supervised survey fieldwork.
- **Level 3 (Proficient)**: Independent execution of sampling design, quarterly GVA compilation, or advanced validation scripts.
- **Level 4 (Advanced)**: Complex survey weighting, index rebasing, econometric modelling, and microdata anonymization.
- **Level 5 (Expert)**: National survey design, policy-grade statistical leadership, national methodology formulation.

---

## ⚙️ Architecture & Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11 / 3.12) with asynchronous ASGI routing.
- **Database ORM**: SQLAlchemy with SQLite (`sql_app.db`) and dynamic runtime column schema migrations on startup.
- **RAG & NLP**: Sentence-Transformers embeddings (`BAAI/bge-small-en-v1.5`), in-process vector cosine similarity, LangChain integration with Groq LLM fallback.
- **Testing**: pytest suite covering API endpoints and full end-to-end competency progression cycles.

### Frontend
- **Framework**: Next.js 16 (App Router, Turbopack, React 19, TypeScript).
- **Styling**: Tailored CSS custom properties supporting Light/Dark themes and official Government of India portal styling (Tricolor accent, accessibility standards).
- **Client Features**: Interactive 5-level competency steppers, live role competency previews, multi-factor recommendation cards with authentic iGOT action deep links, diagnostic assessment player with question-level competency tags and +1 level promotion audit callouts, and institutional admin analytics.

---

## 🚀 Quickstart Guide

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Root: `http://127.0.0.1:8000`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

### 3. Running Automated Tests
```bash
cd backend
pytest
```

---

## 📊 Pre-Seeded Demonstration Personas

To validate diverse cadre scenarios, PragatiParikshan includes 5 pre-seeded official personas accessible via the **Demo Persona Switcher** on the top header:

| ID | Official Name | Cadre Role | Organization | Core Deficit Areas |
|---|---|---|---|---|
| **1** | **Dr. Rajesh Kumar** | Statistical Officer | Survey Design & Research Division (SDRD) | Sampling Methodology (L2 vs L4), Python (L2 vs L4) |
| **2** | **Priya Sharma** | Junior Statistical Officer | Data Processing Division (DPD) | SQL Warehousing (L1 vs L3), DPDP Act (L1 vs L3) |
| **3** | **Amit Verma** | Deputy Director | National Accounts Division (NAD) | National Accounts GVA (L3 vs L5), Macroeconomic Modeling |
| **4** | **Sunita Patel** | Senior Field Supervisor | Field Operations Division (FOD) | PLFS/ASI Field Supervision (L2 vs L4), Interviewing Techniques |
| **5** | **Vikram Singh** | Data Privacy & Compliance Analyst | National Data Governance Center (NDGC) | DPDP Compliance (L2 vs L5), Data Anonymization (L2 vs L4) |

---

## 🔗 Authentic iGOT & NSSTA Integration

All recommended interventions feature curated, genuine course metadata and deep links:
- **iGOT Karmayogi Courses**: `IGOT-STAT-001` (Survey Sampling), `IGOT-TECH-001` (Python for Data Science), `IGOT-NAD-001` (National Accounts & GVA), `IGOT-GOV-001` (DPDP Act & Data Governance), etc. with external action links (`target="_blank"`, `rel="noopener noreferrer"`).
- **NSSTA & TPAC In-Person Programmes**: National Statistical Systems Training Academy residential workshops with registration deep links.

---

## 📜 License & Acknowledgements
Developed for **Smart India Hackathon 2026** under Problem Statement **SIH26101** by Team PragatiParikshan.
© 2026 Government of India • Ministry of Statistics and Programme Implementation (MoSPI).
