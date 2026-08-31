# SIH 2026 Project Connection Status

This document records the current state of the frontend-backend integration for the SIH 2026 project.

## 1. Project Overview

The project contains two main parts:

- Backend: Python FastAPI service
- Frontend: Next.js + React + TypeScript app

The backend exposes business APIs for:
- User management
- Competency and skill-gap analysis
- Course recommendations
- Learning roadmap / task tracking
- Document upload and AI document interaction
- Quiz generation and assessment submission
- Progress tracking
- AI-based RAG tutor queries

The frontend is a dark-themed dashboard-style learning app designed to match the product concept while staying stable and usable for demo/testing purposes.

---

## 2. Scope of the Work Done

The current integration covers the full prototype workflow:

- Connect the existing frontend screens to the backend API contract
- Keep the current UI/UX intact
- Connect the Next.js application to the FastAPI API under `/api/v1`
- Persist users, learning data, uploaded documents, AI cache entries, and profile fields in SQLite
- Provide prototype authentication with bcrypt password hashing and browser session storage

This means the frontend is now wired to the backend for most of the core product flows while preserving the visual design already developed.

---

## 3. Backend API Base URL

The backend is running locally at:

- http://localhost:8000

The application routes are mounted under the v1 API prefix:

- http://localhost:8000/api/v1

This is the base that the frontend uses while calling API endpoints.

---

## 4. Prototype Authentication

The prototype authentication flow is implemented in the backend and frontend:
- `POST /api/v1/users` registers users in SQLite and stores bcrypt password hashes
- `POST /api/v1/users/login` verifies credentials
- The frontend stores the authenticated user record in `sessionStorage` under `statlearn_auth_session`
- Protected workspace pages redirect to `/login` when no session exists
- Logout clears the session and returns to `/login`
- `/profile` updates name, email, mobile, employee ID, organization, department, designation, education, and career goal

This remains prototype authentication rather than production token/session infrastructure.

---

## 5. Frontend API Integration Summary

The following screens were connected to the backend APIs and are now using live or fallback data where needed:

### 5.1 Dashboard
File: frontend/app/dashboard/page.tsx

Connected data:
- User profile data from the user endpoint
- Skill gap summary from the user skill-gap endpoint
- Recommendation data from the recommendation endpoint

Purpose:
- Display the current user profile and training state
- Display active competency gaps and personalized suggestions

Fallback behavior:
- If the backend is unavailable or a response is malformed, the dashboard uses static mock data so the page does not crash.

### 5.2 Skill Gaps Page
File: frontend/app/skill-gaps/page.tsx

Connected data:
- User competency gaps
- Recommendation suggestions for gap-based learning

Purpose:
- Show current competency levels vs target levels
- Highlight prioritized skills and learning recommendations

Fallback behavior:
- The page gracefully falls back to predefined sample values if the backend returns empty or fails.

### 5.3 Courses Page
File: frontend/app/courses/page.tsx

Connected data:
- Course listing from the course endpoint
- Course metadata such as title, source, duration, and description

Purpose:
- Present learning content based on skill gaps and role requirements
- Keep the design consistent with the original mock UI

Fallback behavior:
- If course data is unavailable, the page shows the original curated course cards.

### 5.4 Roadmap Page
File: frontend/app/roadmap/page.tsx

Connected data:
- User roadmap tasks
- Roadmap completion/progress information
- Toggle status for task completion

Purpose:
- Display weekly plan and update tasks as complete/incomplete

Fallback behavior:
- If the backend is unavailable, the page shows the original static roadmap tasks.

### 5.5 Documents Page
File: frontend/app/documents/page.tsx

Connected data:
- File upload endpoint
- Uploaded document metadata

Purpose:
- Allow document upload from the UI
- Show the uploaded files in the list

Fallback behavior:
- If the upload fails, the filename still appears locally so the UI remains usable for demo testing.

### 5.6 Documents and AI Tutor Pages
File: frontend/app/ai-tutor/page.tsx

Connected data:
- Document upload/list endpoints
- RAG query endpoint for AI tutor responses
- RapidOCR processing for scanned PDFs
- React Markdown response rendering and local greeting handling

Purpose:
- Ask a question and receive an answer grounded in uploaded documents or AI knowledge sources

Fallback behavior:
- If the backend is unavailable, the app shows a soft fallback message so the flow still behaves like a demo-ready prototype.

### 5.7 Assessments Page
File: frontend/app/assessments/page.tsx

Connected data:
- Quiz generation endpoint
- Quiz retrieval endpoint
- Quiz submission endpoint
- SQLite quiz cache for repeated generation requests

Purpose:
- Generate assessment questions
- Allow answer selection
- Submit quiz and show score/feedback

Fallback behavior:
- If the backend is offline, the page keeps the original sample assessment question and result display so the screen remains usable.

---

## 6. Central API Layer

The frontend-side API helper is centralized in:

- frontend/lib/api.ts

This file contains the main logic for calling backend endpoints. It was created to keep frontend integration clean, maintainable, and isolated from page components.

The file includes helper functions for:
- getUser
- getUserSkillGaps
- getUserRecommendations
- listCourses
- getUserRoadmaps
- toggleRoadmapTask
- uploadDocument
- askAiTutor
- generateQuiz
- submitQuiz

This keeps all backend call logic in one place and avoids scattering fetch calls across multiple pages.

---

## 7. Endpoint Mapping Status

The frontend is connected to the following backend features:

### Users
- Fetch user profile
- Fetch user skill gaps
- Fetch personalized recommendations

### Courses
- Fetch course catalog / learning items

### Roadmaps
- Fetch roadmap items for a user
- Toggle roadmap task completion

### Documents
- Upload documents

### AI Tutor / RAG
- Ask a question to the AI tutor endpoint

### Quizzes / Assessment
- Generate quiz questions
- Submit answers for scoring

---

## 8. Caching and Runtime Data

AI generation is persisted in SQLite:
- Generated quizzes are reused by normalized topic, document, count, difficulty, and document-content signature
- RAG answers are reused by normalized question, selected document, retrieval depth, and document-content signature
- New document content produces a new cache key, avoiding stale answers
- Theme preference uses `localStorage`; authenticated identity uses `sessionStorage`

## 9. Current Validation

- Backend API tests: `7 passed`
- Frontend production build: passed
- Live admin overview and learner directory counts match
- Registration, login, profile update, and profile fetch verified end to end
- Multipart document upload request validated after removing the incorrect JSON content type
- RapidOCR dependency imports successfully on the project Python 3.14 environment

---

## 9. Important Notes About Design Integrity

The following were deliberately kept unchanged:
- Current UI/UX styling
- Existing page design structure
- Dark dashboard aesthetic
- Overall navigation and app shell flow

The integration work was done without disturbing the visual product concept. This means the app remain demo-ready and polished while being connected to real data sources.

---

## 10. Current Project State Summary

The project is currently in this state:

- Frontend and backend are connected for the main learner and admin workflows
- SQLite persistence is used for users, progress, documents, quizzes, and AI cache records
- Prototype auth, route protection, profile editing, logout, and session-aware landing navigation are implemented
- AI Tutor supports local multilingual greetings, structured Markdown responses, and cached RAG answers
- Document uploads support PDF, DOCX, PPTX, TXT, with RapidOCR fallback for scanned PDFs

---

## 11. Recommended Next Steps

The next phase should focus on:

1. Add production-grade token-based authentication when required
2. Move large document/embedding storage to object storage/vector infrastructure for deployment
3. Add automated browser tests for protected routes and upload UI
4. Add cache expiry/eviction policy if the prototype grows

---

## 12. Final Status

Status: Functionally connected prototype with SQLite persistence, prototype authentication, OCR upload processing, and AI response caching.

The system is now ready for the next round of backend/frontend validation and feature expansion.
