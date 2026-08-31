# API Documentation: AI-Enabled Skill Intelligence & Learning Platform (SIH-2026)

This document provides the complete API contracts, request payloads, response schemas, and query parameters for frontend integration with the FastAPI backend.

**Base URL**:
```text
http://localhost:8000/api/v1
```
*(When accessed via Next.js proxy or ngrok, use the relative path `/api/v1`)*

---

## 🧭 End-to-End User & Learning Workflow

```mermaid
graph TD
    A[1. User Registration: POST /users] --> B[2. Track Competencies: POST /users/{id}/competencies]
    B --> C[3. Analyze Skill Gaps: GET /users/{id}/skill-gaps]
    C --> D[4. Match iGOT Courses: GET /users/{id}/recommendations]
    C --> E[5. Generate Learning Roadmap: POST /users/{id}/roadmaps/generate]
    E --> F[6. Upload Government Manuals: POST /documents/upload]
    F --> G[7. Ask AI Tutor: POST /rag/query]
    E --> H[8. Take Day-Wise Quiz: POST /quizzes/generate]
    H --> I[9. Submit Day Quiz: POST /quizzes/{id}/submit]
    I -->|Score >= 60%| J[10. Auto-Complete Task & Upgrade Competency Level]
    I -->|Score < 60%| K[11. Generate Remediation Roadmap: POST /quizzes/results/{id}/roadmap]
    K --> E
```

---

## 1. User Profile Management

### **Create User Profile**
* **Endpoint:** `POST /users`
* **Description:** Registers a new civil service officer profile in the system.
* **Request Body:**
  ```json
  {
    "name": "Rahul Sharma",
    "email": "rahul@mospi.gov.in",
    "department": "Ministry of Statistics and Programme Implementation",
    "designation": "Statistical Officer",
    "job_role": "Survey Analyst",
    "experience_years": 5,
    "education": "M.Sc Statistics",
    "career_goal": "Senior Official Statistics & Macroeconomic Data Lead"
  }
  ```
* **Response (`201 Created`):**
  ```json
  {
    "id": 1,
    "name": "Rahul Sharma",
    "email": "rahul@mospi.gov.in",
    "department": "Ministry of Statistics and Programme Implementation",
    "designation": "Statistical Officer",
    "job_role": "Survey Analyst",
    "experience_years": 5,
    "education": "M.Sc Statistics",
    "career_goal": "Senior Official Statistics & Macroeconomic Data Lead",
    "competencies": []
  }
  ```

---

### **Get User Profile**
* **Endpoint:** `GET /users/{user_id}`
* **Description:** Retrieves the user's details and active competencies.
* **Response (`200 OK`):**
  ```json
  {
    "id": 1,
    "name": "Rahul Sharma",
    "email": "rahul@mospi.gov.in",
    "department": "Ministry of Statistics and Programme Implementation",
    "designation": "Statistical Officer",
    "job_role": "Survey Analyst",
    "experience_years": 5,
    "education": "M.Sc Statistics",
    "career_goal": "Senior Official Statistics & Macroeconomic Data Lead",
    "competencies": [
      {
        "id": 1,
        "user_id": 1,
        "competency_id": 1,
        "competency_name": "Survey Design",
        "category": "Statistical",
        "current_level": 2,
        "required_level": 4,
        "last_updated": "2026-08-31T05:00:00"
      }
    ]
  }
  ```

---

### **Update User Profile**
* **Endpoint:** `PUT /users/{user_id}`
* **Description:** Updates specific profile fields for an existing user.
* **Request Body:**
  ```json
  {
    "career_goal": "Director of National Accounts & Economic Statistics"
  }
  ```
* **Response (`200 OK`):** Updated user profile object.

---

## 2. Competencies & Skill Gaps

### **List All System Competencies**
* **Endpoint:** `GET /competencies`
* **Description:** Retrieves the master framework of all official statistical, technical, digital governance, and managerial competencies.
* **Response (`200 OK`):**
  ```json
  [
    {
      "id": 1,
      "name": "Survey Design",
      "category": "Statistical",
      "description": "Questionnaire design, multi-stage stratified survey planning, and SOPs for field survey operations."
    },
    {
      "id": 6,
      "name": "Python",
      "category": "Technical",
      "description": "Data wrangling, automated data pipelines, and numerical computation for administrative records."
    }
  ]
  ```

---

### **Assign Competency to User**
* **Endpoint:** `POST /users/{user_id}/competencies`
* **Description:** Adds or updates an officer's skill level (0 to 5) for a specific competency.
* **Request Body:**
  ```json
  {
    "competency_id": 1,
    "current_level": 2,
    "required_level": 4
  }
  ```
* **Response (`200 OK`):**
  ```json
  {
    "id": 1,
    "user_id": 1,
    "competency_id": 1,
    "competency_name": "Survey Design",
    "category": "Statistical",
    "current_level": 2,
    "required_level": 4,
    "last_updated": "2026-08-31T05:15:00"
  }
  ```

---

### **Get User Skill Gaps**
* **Endpoint:** `GET /users/{user_id}/skill-gaps`
* **Description:** Calculates the delta (`required_level - current_level`) for all competencies where a gap exists.
* **Response (`200 OK`):**
  ```json
  {
    "user_id": 1,
    "skill_gaps": [
      {
        "competency": "Survey Design",
        "current_level": 2,
        "required_level": 4,
        "gap": 2,
        "priority": "MEDIUM"
      },
      {
        "competency": "Python",
        "current_level": 1,
        "required_level": 4,
        "gap": 3,
        "priority": "HIGH"
      }
    ]
  }
  ```
* **Priority Mapping:**
  * Gap $\le 0 \rightarrow$ `NONE` (Meets target)
  * Gap $= 1 \rightarrow$ `LOW`
  * Gap $= 2 \rightarrow$ `MEDIUM`
  * Gap $= 3 \rightarrow$ `HIGH`
  * Gap $\ge 4 \rightarrow$ `CRITICAL`

---

## 3. Official iGOT Karmayogi Courses & Recommendations

### **List All Courses**
* **Endpoint:** `GET /courses`
* **Description:** Retrieves all catalog courses with official iGOT Karmayogi metadata.
* **Query Parameters (Optional):**
  * `source`: Filter by source (e.g. `?source=iGOT Karmayogi`)
  * `q`: Text search across title, description, and skills (e.g. `?q=sampling`)
  * `skill`: Filter by skill tag (e.g. `?skill=Python`)
  * `level`: Filter by difficulty (`Beginner`, `Intermediate`, `Advanced`)
  * `language`: Filter by language (`English`, `Hindi`)
* **Response (`200 OK`):**
  ```json
  [
    {
      "id": 1,
      "external_id": "IGOT-STAT-001",
      "source": "iGOT Karmayogi",
      "title": "Survey Design and Field Enumeration Methodologies",
      "description": "Comprehensive training on questionnaire design, multi-stage stratified survey planning, and SOPs.",
      "level": "Intermediate",
      "duration_hours": 8,
      "language": "English",
      "skills": "Survey Design,Sampling",
      "course_url": "https://portal.igotkarmayogi.gov.in"
    }
  ]
  ```

---

### **Get Personalized Recommendations**
* **Endpoint:** `GET /users/{user_id}/recommendations`
* **Description:** Matches an officer's skill deficits with the official iGOT Karmayogi course catalog, ranked by priority.
* **Response (`200 OK`):**
  ```json
  [
    {
      "course_id": 1,
      "external_id": "IGOT-STAT-001",
      "source": "iGOT Karmayogi",
      "title": "Survey Design and Field Enumeration Methodologies",
      "description": "Comprehensive training on questionnaire design, multi-stage stratified survey planning, and SOPs.",
      "score": 0.95,
      "skills_addressed": ["Survey Design", "Sampling"],
      "reason": "Directly addresses your priority skill gap in: Survey Design.",
      "level": "Intermediate",
      "duration_hours": 8,
      "course_url": "https://portal.igotkarmayogi.gov.in"
    }
  ]
  ```

---

## 4. Learning Materials & AI Tutor (RAG)

### **Upload Learning Document**
* **Endpoint:** `POST /documents/upload`
* **Description:** Uploads official government manuals or handouts. Automatically parses text, chunks content, generates embeddings, and indexes for semantic search.
* **Request Type:** `multipart/form-data`
* **Form Field:** `file` (Supports `.pdf`, `.docx`, `.pptx`, `.txt`)
* **Response (`201 Created`):**
  ```json
  {
    "id": 3,
    "filename": "PLFS_Survey_Design_Manual.pdf",
    "file_type": "pdf"
  }
  ```

---

### **List Uploaded Documents**
* **Endpoint:** `GET /documents`
* **Description:** Retrieves all uploaded documents available for RAG grounding and assessments.
* **Response (`200 OK`):**
  ```json
  [
    {
      "id": 3,
      "filename": "PLFS_Survey_Design_Manual.pdf",
      "file_type": "pdf"
    }
  ]
  ```

---

### **AI Tutor Question Answering (RAG)**
* **Endpoint:** `POST /rag/query`
* **Description:** Queries the AI assistant using semantic context retrieved from indexed government materials.
* **Request Body:**
  ```json
  {
    "question": "What is the procedure for multi-stage stratified sampling in field surveys?",
    "document_id": 3
  }
  ```
  *(Omit `document_id` to search across all indexed documents)*
* **Response (`200 OK`):**
  ```json
  {
    "answer": "Multi-stage stratified sampling divides the primary sampling units (PSUs) into homogeneous strata based on demographic criteria...",
    "sources": [
      {
        "document": "PLFS_Survey_Design_Manual.pdf",
        "page": 12,
        "content_snippet": "Section 4.1: Selection of Primary Sampling Units in rural and urban strata..."
      }
    ]
  }
  ```

---

## 5. Assessments & Day-Wise Quizzes

### **Generate Quiz (Document-Based or Topic-Based)**
* **Endpoint:** `POST /quizzes/generate`
* **Description:** Prompts Groq LLM to generate structured 4-option multiple choice questions. Supports generating from an uploaded document (`document_id`) OR directly for a competency / roadmap day task (`topic`).
* **Request Body:**
  ```json
  {
    "document_id": null,
    "topic": "Survey Design: Questionnaire Structure and Stratification",
    "number_of_questions": 3,
    "difficulty": "medium"
  }
  ```
* **Response (`201 Created`):** *(Correct answers and explanations are omitted from the client response to preserve test integrity)*
  ```json
  {
    "id": 15,
    "document_id": null,
    "topic": "Survey Design: Questionnaire Structure and Stratification",
    "difficulty": "medium",
    "questions": [
      {
        "id": 42,
        "question_text": "What is the primary benefit of stratifying a sample prior to selection?",
        "options": [
          "It reduces sampling variance by ensuring homogeneous sub-groups are represented",
          "It eliminates the need for a sampling frame",
          "It guarantees 100% response rates in field operations",
          "It allows non-random convenience selection"
        ],
        "topic": "Survey Design",
        "difficulty": "medium",
        "source_reference": "Official Curriculum Reference"
      }
    ]
  }
  ```

---

### **Submit Quiz Responses & Auto-Upgrade**
* **Endpoint:** `POST /quizzes/{quiz_id}/submit?user_id={user_id}`
* **Description:** Submits student answers for evaluation. Returns total score, feedback, and question explanations. **If score $\ge 60\%$**, automatically increments the user's competency level for that topic in the database!
* **Query Parameter:** `user_id` (e.g. `?user_id=1`)
* **Request Body:**
  ```json
  {
    "answers": {
      "42": "It reduces sampling variance by ensuring homogeneous sub-groups are represented"
    }
  }
  ```
* **Response (`200 OK`):**
  ```json
  {
    "score": 100.0,
    "total_questions": 1,
    "correct_answers": 1,
    "feedback": "You scored 100%. Excellent! You have mastered this material.",
    "correct_details": {
      "42": "It reduces sampling variance by ensuring homogeneous sub-groups are represented"
    },
    "result_id": 8
  }
  ```

---

## 6. Daily Learning Roadmaps & Progress Tracking

### **Generate Daily Learning Roadmap**
* **Endpoint:** `POST /users/{user_id}/roadmaps/generate`
* **Description:** Creates a personalized, day-by-day structured curriculum with daily milestones for any chosen competency.
* **Request Body:**
  ```json
  {
    "target_competency": "Survey Design",
    "number_of_days": 5
  }
  ```
* **Response (`201 Created`):**
  ```json
  {
    "id": 4,
    "user_id": 1,
    "title": "Survey Design Mastery Roadmap",
    "target_competency": "Survey Design",
    "progress_percentage": 0,
    "created_at": "2026-08-31T06:00:00",
    "tasks": [
      {
        "id": 16,
        "day_number": 1,
        "task_title": "Sampling Frame Construction & Unit Definition",
        "task_description": "Study complete enumeration frames, address validation, and standard enterprise definitions.",
        "status": "Pending",
        "completed_at": null
      },
      {
        "id": 17,
        "day_number": 2,
        "task_title": "Multi-Stage Stratified Sampling Allocation",
        "task_description": "Implement proportional vs. optimum allocation methods across rural/urban strata.",
        "status": "Pending",
        "completed_at": null
      }
    ]
  }
  ```

---

### **Get User Roadmaps**
* **Endpoint:** `GET /users/{user_id}/roadmaps`
* **Description:** Retrieves all active and completed roadmaps for the user.
* **Response (`200 OK`):** Array of `RoadmapResponse` objects with child daily tasks.

---

### **Toggle Daily Task Status**
* **Endpoint:** `PUT /roadmaps/tasks/{task_id}`
* **Description:** Updates task completion status (`"Pending"` or `"Completed"`). The backend automatically recalculates and updates the parent roadmap's `progress_percentage`.
* **Request Body:**
  ```json
  {
    "status": "Completed"
  }
  ```
* **Response (`200 OK`):**
  ```json
  {
    "id": 16,
    "day_number": 1,
    "task_title": "Sampling Frame Construction & Unit Definition",
    "task_description": "Study complete enumeration frames, address validation, and standard enterprise definitions.",
    "status": "Completed",
    "completed_at": "2026-08-31T06:30:00"
  }
  ```

---

### **Generate Remediation Roadmap from Quiz Failure**
* **Endpoint:** `POST /quizzes/results/{result_id}/roadmap?number_of_days=3`
* **Description:** Analyzes a failed quiz attempt (`score < 60%`), isolates the specific concepts answered incorrectly, and generates a focused revision schedule.
* **Response (`201 Created`):** Returns a specialized Remediation `RoadmapResponse`.

---

## 7. Course Progress Tracking

### **Update Course Progress**
* **Endpoint:** `POST /users/{user_id}/progress`
* **Description:** Updates the enrollment or progress state for a recommended course.
* **Request Body:**
  ```json
  {
    "course_id": 1,
    "status": "In Progress",
    "progress_percentage": 25
  }
  ```
* **Response (`200 OK`):**
  ```json
  {
    "id": 3,
    "user_id": 1,
    "course_id": 1,
    "status": "In Progress",
    "progress_percentage": 25,
    "last_accessed": "2026-08-31T06:45:00",
    "completed_at": null
  }
  ```

---

### **Get User Course Progress**
* **Endpoint:** `GET /users/{user_id}/progress`
* **Description:** Returns all course progress records for the user.
* **Response (`200 OK`):** Array of `CourseProgress` items.
