# SIH 2026 Project Connection Status

This document records the current state of the frontend-backend integration for the SIH 2026 project. It is intended to serve as a working reference for the next phase of development and feature expansion.

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

The work completed so far focused on one specific goal:

- Connect the existing frontend screens to the backend API contract
- Keep the current UI/UX intact
- Avoid changing backend logic or business rules
- Use a dummy auth/user model because there is no real authentication system currently implemented

This means the frontend is now wired to the backend for most of the core product flows while preserving the visual design already developed.

---

## 3. Backend API Base URL

The backend is running locally at:

- http://localhost:8000

The application routes are mounted under the v1 API prefix:

- http://localhost:8000/api/v1

This is the base that the frontend uses while calling API endpoints.

---

## 4. Dummy Auth / Testing Approach

The backend currently does not have a full authentication system implemented.

Because of this:
- The frontend is operating in a dummy mode for user identity
- A fixed user ID is used while testing the app
- The integration behaves as if the logged-in user is a valid internal user

This is intentional and was kept separate from the backend logic so that no authentication changes were needed in the API layer.

Important note:
- The frontend is not pretending to be production-ready auth
- It is simply a prototype flow for testing end-to-end UI and API behavior

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

### 5.6 AI Tutor Page
File: frontend/app/ai-tutor/page.tsx

Connected data:
- RAG query endpoint for AI tutor responses

Purpose:
- Ask a question and receive an answer grounded in uploaded documents or AI knowledge sources

Fallback behavior:
- If the backend is unavailable, the app shows a soft fallback message so the flow still behaves like a demo-ready prototype.

### 5.7 Assessments Page
File: frontend/app/assessments/page.tsx

Connected data:
- Quiz generation endpoint
- Quiz submission endpoint

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

## 8. What Remains Pending

These items are still not fully finalized or may still need deeper connection work depending on backend behavior and response contracts:

### 8.1 Authentication
- No actual login/register backend flow is implemented
- Frontend auth remains dummy

### 8.2 Fine-grained response mapping
- Some backend responses may need deeper normalization depending on the exact JSON structure returned in live usage
- The frontend currently includes fallbacks to protect the UI and avoid crashes

### 8.3 AI Tutor and Quiz endpoints
- These are connected but still need validation against the exact live backend payloads for edge cases
- Some questions/responses may need a final refinement when the backend responses are fully tested in real runtime

### 8.4 Additional dynamic behavior
- More advanced UI polish and route behavior can be added later once the business logic is stabilized

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

- Frontend mostly connected to backend for core features
- UI remains visually unchanged
- Backend logic was not tampered with
- Dummy auth is still in place by design
- Remaining work is mainly about finalizing edge-case data mapping and feature polish

---

## 11. Recommended Next Steps

The next phase should focus on:

1. Confirming exact live payloads from all backend endpoints
2. Refining edge-case handling in the frontend API layer
3. Finalizing the remaining authentication strategy when the backend adds auth
4. Testing AI tutor and quiz flows in a live environment with real inputs
5. Expanding new features only after the current connection is stable

---

## 12. Final Status

Status: Partially completed but functionally connected for the main expected workflow.

The system is now ready for the next round of backend/frontend validation and feature expansion.
