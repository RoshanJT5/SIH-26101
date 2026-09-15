# PRAGATIPARIKSHAN — Production Deployment Guide
**Smart India Hackathon 2026 (Problem Statement ID: SIH26101)**  
**Ministry of Statistics and Programme Implementation (MoSPI)**

---

## 1. Architecture Overview

PragatiParikshan is engineered as a decoupled, cloud-ready modern web application:

- **Frontend**: Next.js 16 (React 19, TypeScript, Vanilla CSS design tokens, Turbopack). Designed for deployment on **Vercel**, **Cloudflare Pages**, or containerized with Node.js 20.
- **Backend**: FastAPI (Python 3.12, SQLAlchemy 2.0, Pydantic V2, Uvicorn). Designed for deployment on **Render**, **Railway**, **Google Cloud Run**, or any Linux container host.
- **Database**: Relational database via SQLAlchemy:
  - **Local Development**: SQLite (`sqlite:///./sql_app.db`) with zero setup.
  - **Cloud Production**: PostgreSQL (`postgresql://...`) via managed providers like Supabase, Neon, AWS RDS, Render Postgres, or Railway.
- **AI & RAG Engine**: Groq Cloud API (`mixtral-8x7b-32768`) and HuggingFace semantic embeddings (`BAAI/bge-small-en-v1.5`) with on-device PyMuPDF / ONNX text extraction.

---

## 2. Environment Variables Specification

### Backend Environment Variables (`backend/.env`)

| Variable | Type | Default / Required | Description |
| :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | String | `development` / `production` | Deployment environment identifier. |
| `DATABASE_URL` | String | `sqlite:///./sql_app.db` | Connection string. Supports `postgresql://` and `sqlite:///`. |
| `SECRET_KEY` | String | **Required in Prod** | Cryptographic secret for session and cryptographic tokens. |
| `ALLOWED_ORIGINS` | String | `http://localhost:3000,...` | Comma-separated list of allowed frontend origins for CORS. |
| `ENABLE_DEMO_ADMIN`| Boolean | `true` (dev) / `false` (prod) | Whether to seed the demo administrator account. |
| `GROQ_API_KEY` | String | Optional (mock fallback) | Groq Cloud API key for dynamic AI quiz & tutor. |
| `GROQ_MODEL` | String | `mixtral-8x7b-32768` | LLM model identifier. |
| `EMBEDDING_MODEL` | String | `BAAI/bge-small-en-v1.5` | HuggingFace embedding model for RAG. |
| `MAX_UPLOAD_SIZE_MB`| Integer | `25` | Max allowed document upload size in megabytes. |

### Frontend Environment Variables (`frontend/.env.local` or Vercel Config)

| Variable | Type | Default / Required | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | String | `http://127.0.0.1:8000/api/v1` | Base URL of the deployed FastAPI backend. |

---

## 3. Local Development Setup

### Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux / macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be accessible at: `http://127.0.0.1:8000/docs`  
Health Check: `http://127.0.0.1:8000/health`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Access the web portal at: `http://localhost:3000`

---

## 4. Cloud Deployment Step-by-Step

### Option A: Backend on Render / Railway + PostgreSQL

1. **Create Managed PostgreSQL Database**:
   - Provision a PostgreSQL database on Render, Railway, Neon, or Supabase.
   - Copy the provided Connection URI (`postgres://...` or `postgresql://...`).

2. **Deploy FastAPI Web Service**:
   - Connect the repository to Render / Railway.
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**:
     ```env
     ENVIRONMENT=production
     DATABASE_URL=postgresql://user:password@host:5432/dbname
     SECRET_KEY=generate-a-32-byte-secret-key
     ALLOWED_ORIGINS=https://your-frontend-app.vercel.app
     ENABLE_DEMO_ADMIN=false
     GROQ_API_KEY=gsk_your_groq_api_key
     ```

3. **Verify Backend Health**:
   ```bash
   curl -f https://your-backend-api.onrender.com/health
   # Returns: {"status":"ok","service":"PragatiParikshan API","environment":"production","database":"connected"}
   ```

---

### Option B: Frontend on Vercel

1. **Import Repository to Vercel**:
   - Framework Preset: **Next.js**
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

2. **Set Environment Variable**:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com/api/v1
   ```

3. **Deploy**:
   - Trigger deployment. Next.js will compile the static routes and SSR handlers.
   - Access your live frontend URL (e.g., `https://pragatiparikshan.vercel.app`).

---

## 5. Dockerized Container Deployment

### Backend Docker Container
```bash
cd backend
docker build -t pragatiparikshan-backend:latest .
docker run -d -p 8000:8000 \
  -e ENVIRONMENT=production \
  -e DATABASE_URL=sqlite:///./sql_app.db \
  -e ALLOWED_ORIGINS=http://localhost:3000 \
  --name pragati-backend pragatiparikshan-backend:latest
```

### Frontend Docker Container
```bash
cd frontend
docker build --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 -t pragatiparikshan-frontend:latest .
docker run -d -p 3000:3000 --name pragati-frontend pragatiparikshan-frontend:latest
```

---

## 6. Database Migrations & Idempotency

- Database schema initialization is handled automatically on startup via `Base.metadata.create_all(bind=engine)`.
- Seeding routines in `CompetencyService`, `RoleService`, `RecommendationService`, and `UserService` are strictly **idempotent**:
  - Running server restarts or multiple replica instances will **never** duplicate competencies, organizations, roles, courses, or users.
  - Existing user progress and historical test records are preserved safely.

---

## 7. Security Hardening Checklist

- [x] **Zero Hardcoded Secrets**: All credentials and URLs extracted to environment variables.
- [x] **Admin Authorization**: Backend `/admin/*` routes strictly require administrator privileges (HTTP 403 for unauthorized learners).
- [x] **Secure Filename Handling**: All uploaded manuals and PDFs are sanitized against path traversal (`re.sub` + `os.path.basename`).
- [x] **Upload Size Limits**: File uploads capped at `25MB` with `413 Entity Too Large` protection.
- [x] **Strict CORS Policy**: Configurable allowed origins preventing unauthorized cross-origin access.
- [x] **Clean Error Handling**: Technical stack traces and internal JSON details suppressed in client responses.

---

## 8. Common Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `CORS error on frontend` | `ALLOWED_ORIGINS` does not include frontend domain. | Add exact frontend domain (e.g. `https://pragatiparikshan.vercel.app`) to `ALLOWED_ORIGINS` in backend config. |
| `PostgreSQL connection error` | Connection string format mismatch. | Backend auto-converts `postgres://` to `postgresql://`. Ensure credentials and network access are allowed. |
| `403 on Admin Portal` | Requesting user does not have `is_admin` role. | Sign in using Official Administrator credentials or demo admin if enabled. |
| `413 File Too Large` | Uploaded document exceeds `MAX_UPLOAD_SIZE_MB`. | Upload documents under 25MB or adjust `MAX_UPLOAD_SIZE_MB` in backend environment. |
