# API Documentation: PragatiParikshan (SIH26101)
### AI-Enabled Competency Intelligence & Diagnostic Learning Platform for India's Official Statistical System

**Base URL**:
```text
http://localhost:8000/api/v1
```

---

## 🧭 End-to-End Closed-Loop Workflow

```mermaid
graph TD
    A[1. Role Alignment: POST /users/{id}/assign-role] --> B[2. Calculate Skill Gaps: GET /skill-gaps/{id}]
    B --> C[3. Multi-Factor Recommendations: GET /courses/recommendations/{id}]
    C --> D[4. In-Person Training Programmes: GET /courses/programmes/all]
    B --> E[5. Generate Daily Roadmap: POST /roadmaps/generate]
    E --> F[6. Upload Official Manuals: POST /documents/upload]
    F --> G[7. AI Tutor RAG Q&A: POST /rag/query]
    E --> H[8. Diagnostic Assessment: POST /quizzes/generate]
    H --> I[9. Submit Assessment: POST /quizzes/{id}/submit]
    I -->|Score >= 70%| J[10. +1 Level Upgrade & Audit History Log]
    I -->|Score < 70%| K[11. Adaptive Remediation Roadmap: POST /roadmaps/remediation/{id}]
    J --> L[12. Institutional Analytics Updated: GET /admin/analytics]
```

---

## 1. Cadre & Institutional Hierarchy (`/roles`)

### **Get Progressive Hierarchy**
* **Endpoint:** `GET /roles/hierarchy/progressive`
* **Description:** Returns the 3-step progressive onboarding cascade: Ministries $\rightarrow$ Departments $\rightarrow$ Organizations $\rightarrow$ Roles with required competency baselines.
* **Response (`200 OK`):**
  ```json
  {
    "ministries": ["Ministry of Statistics and Programme Implementation (MoSPI)"],
    "departments_by_ministry": {
      "Ministry of Statistics and Programme Implementation (MoSPI)": [
        "National Statistical Office (NSO) - Survey Design & Research Division (SDRD)",
        "National Accounts Division (NAD)",
        "Field Operations Division (FOD)"
      ]
    },
    "organizations_by_dept": {
      "National Statistical Office (NSO) - Survey Design & Research Division (SDRD)": [
        { "id": 1, "name": "Survey Design & Research Division (SDRD)", "description": "National survey methodology wing" }
      ]
    },
    "roles_by_org": {
      "1": [
        {
          "id": 1,
          "role_name": "Statistical Officer",
          "service_cadre": "Indian Statistical Service (ISS) / SSS",
          "competency_count": 5,
          "competencies": [
            {
              "competency_id": 1,
              "competency_name": "Survey Sampling Methodology",
              "category": "Statistical",
              "required_level": 4,
              "importance": "CRITICAL"
            }
          ]
        }
      ]
    }
  }
  ```

### **List Organizations**
* **Endpoint:** `GET /roles/organizations`
* **Description:** Retrieves all administrative entities and divisions.

### **List Roles**
* **Endpoint:** `GET /roles`
* **Query Parameters:** `organization_id` (optional filter)
* **Description:** Returns defined cadre roles with their required competency levels.

### **Get Role Details**
* **Endpoint:** `GET /roles/{role_id}`
* **Description:** Returns a single role and its required competency standard breakdown.

---

## 2. User Profiles & Role Assignment (`/users`)

### **Assign Role to User**
* **Endpoint:** `POST /users/{user_id}/assign-role`
* **Description:** Assigns an official to an institutional role. The user immediately inherits the role's required competency baselines without corrupting their current measured proficiency.
* **Request Body:**
  ```json
  {
    "organization_id": 1,
    "role_id": 1,
    "designation": "Statistical Officer"
  }
  ```

### **Get User Profile**
* **Endpoint:** `GET /users/{user_id}`
* **Description:** Retrieves full user dossier, assigned cadre role, current measured competencies, and progression history audit logs.

### **Update User Profile**
* **Endpoint:** `PUT /users/{user_id}`
* **Request Body:** Partial update of `name`, `email`, `mobile`, `employee_id`, `career_goal`, etc.

---

## 3. Competency Framework & Skill Gaps (`/competencies`, `/skill-gaps`)

### **List All Competencies**
* **Endpoint:** `GET /competencies`
* **Description:** Returns master catalog of statistical, technical, governance, and managerial competencies.

### **Get User Skill Gaps**
* **Endpoint:** `GET /skill-gaps/{user_id}`
* **Description:** Calculates $\text{gap} = \max(0, \text{Required} - \text{Current})$, health score percentage, and deficit priorities.
* **Response (`200 OK`):**
  ```json
  {
    "user_id": 1,
    "user_name": "Dr. Rajesh Kumar",
    "role_id": 1,
    "role_name": "Statistical Officer",
    "organization_name": "Survey Design & Research Division (SDRD)",
    "overall_health_score": 68.0,
    "total_competencies": 5,
    "critical_gaps_count": 1,
    "high_gaps_count": 2,
    "medium_gaps_count": 0,
    "strengths_count": 2,
    "skill_gaps": [
      {
        "competency_id": 1,
        "competency_name": "Survey Sampling Methodology",
        "category": "Statistical",
        "current_level": 2,
        "required_level": 4,
        "gap": 2,
        "confidence": 75.0,
        "priority": "CRITICAL",
        "why_it_matters": "Core requirement for designing multi-stage stratified survey frames in SDRD.",
        "recommended_action": "Complete iGOT IGOT-STAT-001 or NSSTA Residential Workshop."
      }
    ]
  }
  ```

---

## 4. iGOT & NSSTA Training Recommendations (`/courses`)

### **Get Ranked Recommendations**
* **Endpoint:** `GET /courses/recommendations/{user_id}`
* **Description:** Multi-factor scoring ($40\%$ Gap, $25\%$ Role Relevance, $20\%$ Resource Coverage, $15\%$ History). Returns genuine course metadata, authentic deep link URLs, and transparent reasons.
* **Response (`200 OK`):**
  ```json
  [
    {
      "course_id": 1,
      "external_id": "IGOT-STAT-001",
      "title": "Survey Sampling and Field Estimation Methodologies",
      "provider": "MoSPI / NSSTA on iGOT Karmayogi",
      "source": "iGOT Karmayogi",
      "course_url": "https://igotkarmayogi.gov.in/app/toc/lex_auth_013894726192837482",
      "score": 0.94,
      "match_percentage": 94,
      "skills_addressed": ["Survey Sampling Methodology"],
      "gap_level": 2,
      "reason": "Directly targets Critical Gap (Level 2 → 4) for role Statistical Officer.",
      "cta_label": "Start Course on iGOT ↗"
    }
  ]
  ```

### **List In-Person Training Programmes**
* **Endpoint:** `GET /courses/programmes/all`
* **Description:** Retrieves NSSTA and TPAC residential/hybrid statistical workshops.

---

## 5. Assessments & Competency Upgrades (`/quizzes`)

### **Generate Diagnostic Assessment**
* **Endpoint:** `POST /quizzes/generate`
* **Request Body:**
  ```json
  {
    "competency_id": 1,
    "document_id": null,
    "topic": "Survey Sampling Methodology",
    "number_of_questions": 5,
    "difficulty": "Intermediate"
  }
  ```

### **Submit Assessment & Auto-Promote**
* **Endpoint:** `POST /quizzes/{quiz_id}/submit?user_id={user_id}`
* **Description:** Evaluates responses. **Score $\ge 70\%$ deterministically upgrades competency level (+1 level)**, creates an audit record in `CompetencyProgressHistory`, and updates the user's proficiency.
* **Response (`200 OK`):**
  ```json
  {
    "score": 80.0,
    "total_questions": 5,
    "correct_answers": 4,
    "feedback": "Passed! Verified proficiency in Survey Sampling Methodology.",
    "level_upgrades": [
      "Survey Sampling Methodology upgraded from Level 2 to Level 3"
    ],
    "competency_breakdown": [
      {
        "competency_id": 1,
        "competency_name": "Survey Sampling Methodology",
        "total_questions": 5,
        "correct_answers": 4,
        "percentage": 80.0,
        "previous_level": 2,
        "new_level": 3,
        "level_changed": true,
        "status": "Level Upgraded (+1)"
      }
    ],
    "result_id": 12
  }
  ```

---

## 6. Daily Roadmaps & Remediation (`/roadmaps`)

### **Generate Daily Learning Roadmap**
* **Endpoint:** `POST /roadmaps/generate?user_id={user_id}`
* **Request Body:**
  ```json
  {
    "target_competency": "Survey Sampling Methodology",
    "number_of_days": 5
  }
  ```

### **Generate Remediation Roadmap from Assessment Deficit**
* **Endpoint:** `POST /roadmaps/remediation/{result_id}?number_of_days=3`
* **Description:** Generates targeted remediation for missed concepts.

---

## 7. Institutional Administration & Workforce Analytics (`/admin`)

### **Get Workforce Competency Analytics**
* **Endpoint:** `GET /admin/analytics`
* **Description:** Aggregates institutional workforce health %, priority high-deficiency competencies, role-level health analytics, and category distribution across the statistical system.
* **Response (`200 OK`):**
  ```json
  {
    "total_officials": 5,
    "total_organizations": 3,
    "total_roles": 5,
    "total_competencies": 10,
    "total_courses_catalog": 8,
    "total_assessments_conducted": 12,
    "average_workforce_health_score": 68.4,
    "high_deficiency_competencies": [
      {
        "competency_id": 1,
        "competency_name": "Survey Sampling Methodology",
        "category": "Statistical",
        "average_current_level": 2.2,
        "average_required_level": 4.0,
        "average_gap": 1.8,
        "officials_affected": 3,
        "priority": "CRITICAL"
      }
    ],
    "role_wise_analytics": [
      {
        "role_id": 1,
        "role_name": "Statistical Officer",
        "organization_name": "Survey Design & Research Division (SDRD)",
        "total_officials": 1,
        "average_health_score": 68.0,
        "top_gap_competencies": ["Survey Sampling Methodology", "Python for Official Statistical Analysis"]
      }
    ]
  }
  ```

### **List All Officials**
* **Endpoint:** `GET /admin/users`
* **Description:** Returns all registered officials with full cadre metadata.
* **Authorization:** Requires Official Administrator session (`Bearer bearer-session-{admin_user_id}`). Unauthorized requests return HTTP 401/403.

---

## 8. System Health & Probes (`/health`)

### **Root Health Check (Container Probes)**
* **Endpoint:** `GET /health`
* **Description:** Lightweight endpoint for container orchestrators (Render, Railway, Kubernetes, Cloud Run).
* **Response (`200 OK`):**
  ```json
  {
    "status": "ok",
    "service": "PragatiParikshan API",
    "environment": "production",
    "database": "connected"
  }
  ```

### **API Version Health Check**
* **Endpoint:** `GET /api/v1/health`
* **Description:** Versioned API health check verifying database and service readiness.
* **Response (`200 OK`):**
  ```json
  {
    "status": "ok",
    "service": "PragatiParikshan API",
    "environment": "production",
    "database": "connected"
  }
  ```

