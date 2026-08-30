# AI-Enabled Skill Intelligence & Learning Platform (Backend MVP)

An intelligent, modular backend API built using **FastAPI**, **SQLAlchemy (SQLite)**, and **LangChain** with **Groq LLM** to personalize competency-based learning and assist statistical officials in training.

---

## 🚀 Key Features

1. **Competency Engine**: Seeds statistical, technical, digital governance, and managerial competencies. Defines levels 0 to 5.
2. **Deterministic Skill Gaps**: Computes `Required - Current` skill gaps and prioritizes them from `LOW` to `CRITICAL`.
3. **Personalized recommendations**: Sorts and reasons course recommendations from a local catalog based on user gaps, job roles, and career goals.
4. **Document Processing pipeline**: Automatically parses, chunks, and extracts embeddings from uploaded **PDF, DOCX, PPTX, and TXT** documents, storing vectors as serialized JSON in SQLite.
5. **AI Tutor Assistant (RAG)**: Answers questions grounded in the context of uploaded files with exact page reference metadata.
6. **Dynamic Quiz Assessments**: Generates Pydantic-validated multiple-choice quizzes from source documents and auto-updates user competencies when passing scores ($\ge$ 75%) are reached.
7. **Learning Progress**: Tracks started, in-progress, and completed courses to build a continuous learning history.

---

## 📁 Project Structure

```text
SIH-2026/
├── backend/
│   ├── app/
│   │   ├── ai/            # LLM interface, Sentence embeddings, Custom vector similarity
│   │   ├── api/           # Endpoints routing & dependencies
│   │   ├── core/          # App settings load via pydantic-settings
│   │   ├── db/            # SQLite engines and Session configuration
│   │   ├── models/        # SQLAlchemy tables definition
│   │   ├── schemas/       # Request and Response Pydantic validators
│   │   └── services/      # Relational operations and recommendation scoring logic
│   ├── tests/             # pytest integration suites
│   ├── requirements.txt   # Backend python dependencies
│   └── .env               # Server environment variables configuration
├── task.md                # Tasklist execution status
└── API_DOCUMENTATION.md   # Endpoint contracts for Frontend integration
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.11+
- Virtual Environment tool (`venv` or `uv`)

### 1. Set Up Virtual Environment
Navigate to the `backend` directory, create, and activate a virtual environment:
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate.ps1
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration
Create a `.env` file in the `backend/` directory (example values below):
```env
APP_ENV=development
DATABASE_URL=sqlite:///./sql_app.db
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=mixtral-8x7b-32768
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
CHUNK_SIZE=1000
CHUNK_OVERLAP=150
TOP_K=5
```

---

## 🖥️ Running the Application

Start the development server:
```bash
uvicorn app.main:app --reload
```
Once booted, access:
- **API Status**: `http://127.0.0.1:8000/`
- **Interactive Swagger UI**: `http://127.0.0.1:8000/docs` (Use this page to visually test all endpoints)

---

## 🧪 Testing

To run the integration tests against an in-memory/isolated SQLite environment:
```bash
python -m pytest
```

---

## 📖 Frontend Integration Guide

Refer to the [API Documentation](API_DOCUMENTATION.md) for full descriptions of all request body structures, query parameters, response JSON schemas, and error states.
