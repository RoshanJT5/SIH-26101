const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? (typeof window !== "undefined" ? "/api/v1" : "http://127.0.0.1:8000/api/v1");

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const DUMMY_USER_ID = 1;

export function getCurrentUserId(): number {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("statlearn_user_id");
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  return DUMMY_USER_ID;
}

export function setCurrentUserId(id: number): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("statlearn_user_id", String(id));
  }
}

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  department?: string | null;
  designation?: string | null;
  job_role?: string | null;
  experience_years?: number | null;
  education?: string | null;
  career_goal?: string | null;
  competencies: Array<{
    id: number;
    competency_id: number;
    user_id: number;
    competency_name: string;
    category: string;
    current_level: number;
    required_level: number;
    last_updated: string;
  }>;
};

export type UserCreate = {
  name: string;
  email: string;
  department?: string;
  designation?: string;
  job_role?: string;
  experience_years?: number;
  education?: string;
  career_goal?: string;
};

export type UserUpdate = Partial<UserCreate>;

export type CompetencyMaster = {
  id: number;
  name: string;
  category: string;
  description?: string | null;
};

export type UserCompetencyItem = {
  id: number;
  user_id: number;
  competency_id: number;
  competency_name: string;
  category: string;
  current_level: number;
  required_level: number;
  last_updated: string;
};

export type SkillGapItem = {
  competency: string;
  current_level: number;
  required_level: number;
  gap: number;
  priority: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
};

export type RecommendationItem = {
  course_id: number;
  external_id?: string | null;
  source?: string;
  title: string;
  description?: string | null;
  score: number;
  skills_addressed: string[];
  reason: string;
  level?: string | null;
  duration_hours?: number | null;
  course_url?: string | null;
};

export type CourseItem = {
  id: number;
  external_id: string;
  source: string;
  title: string;
  description?: string | null;
  level?: string | null;
  duration_hours?: number | null;
  language?: string | null;
  skills?: string | null;
  course_url?: string | null;
};

export type CourseProgress = {
  id: number;
  user_id: number;
  course_id: number;
  status: string;
  progress_percentage: number;
  last_accessed?: string | null;
  completed_at?: string | null;
};

export type RoadmapTask = {
  id: number;
  day_number: number;
  task_title: string;
  task_description?: string | null;
  status: string;
  completed_at?: string | null;
};

export type RoadmapItem = {
  id: number;
  user_id: number;
  title: string;
  target_competency: string;
  progress_percentage: number;
  created_at: string;
  tasks: RoadmapTask[];
};

export type QuizQuestion = {
  id: number;
  question_text: string;
  options: string[];
  topic?: string | null;
  difficulty?: string | null;
  source_reference?: string | null;
};

export type QuizItem = {
  id: number;
  document_id?: number | null;
  topic?: string | null;
  difficulty?: string | null;
  questions: QuizQuestion[];
};

export type QuizSubmitResponse = {
  score: number;
  total_questions: number;
  correct_answers: number;
  feedback: string;
  correct_details: Record<string, { correct: string; explanation: string }>;
  result_id?: number;
};

export type DocumentResponse = {
  id: number;
  filename: string;
  file_type: string;
  uploaded_at?: string;
};

export type RAGSource = {
  document: string;
  page: number;
  content_snippet: string;
};

export type RAGResponse = {
  answer: string;
  sources: RAGSource[];
};

// ================= USER APIs ================= //

export function createUser(data: UserCreate) {
  return apiFetch<UserProfile>(`/users`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getUser(userId: number = getCurrentUserId()) {
  return apiFetch<UserProfile>(`/users/${userId}`);
}

export function updateUser(userId: number = getCurrentUserId(), data: UserUpdate) {
  return apiFetch<UserProfile>(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ================= COMPETENCY & SKILL GAPS APIs ================= //

export function listCompetencies() {
  return apiFetch<CompetencyMaster[]>(`/competencies`);
}

export function addUserCompetency(
  userId: number = getCurrentUserId(),
  data: { competency_id: number; current_level: number; required_level: number }
) {
  return apiFetch<UserCompetencyItem>(`/users/${userId}/competencies`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getUserCompetencies(userId: number = getCurrentUserId()) {
  return apiFetch<UserCompetencyItem[]>(`/users/${userId}/competencies`);
}

export function getUserSkillGaps(userId: number = getCurrentUserId()) {
  return apiFetch<{ user_id: number; skill_gaps: SkillGapItem[] }>(`/users/${userId}/skill-gaps`);
}

// ================= COURSES & RECOMMENDATIONS APIs ================= //

export function listCourses(params?: { skill?: string; level?: string; language?: string }) {
  const query = new URLSearchParams();
  if (params?.skill) query.append("skill", params.skill);
  if (params?.level) query.append("level", params.level);
  if (params?.language) query.append("language", params.language);
  const qs = query.toString();
  return apiFetch<CourseItem[]>(`/courses${qs ? `?${qs}` : ""}`);
}

export function getCourse(courseId: number) {
  return apiFetch<CourseItem>(`/courses/${courseId}`);
}

export function getUserRecommendations(userId: number = getCurrentUserId()) {
  return apiFetch<RecommendationItem[]>(`/users/${userId}/recommendations`);
}

export function updateCourseProgress(
  userId: number = getCurrentUserId(),
  data: { course_id: number; status: string; progress_percentage: number }
) {
  return apiFetch<CourseProgress>(`/users/${userId}/progress`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getUserProgress(userId: number = getCurrentUserId()) {
  return apiFetch<CourseProgress[]>(`/users/${userId}/progress`);
}

// ================= ROADMAP APIs ================= //

export function generateUserRoadmap(
  userId: number = getCurrentUserId(),
  data: { target_competency: string; number_of_days?: number }
) {
  return apiFetch<RoadmapItem>(`/users/${userId}/roadmaps/generate`, {
    method: "POST",
    body: JSON.stringify({
      target_competency: data.target_competency,
      number_of_days: data.number_of_days ?? 5,
    }),
  });
}

export function getUserRoadmaps(userId: number = getCurrentUserId()) {
  return apiFetch<RoadmapItem[]>(`/users/${userId}/roadmaps`);
}

export function toggleRoadmapTask(taskId: number, status: "Pending" | "Completed") {
  return apiFetch<RoadmapTask>(`/roadmaps/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export function generateRemediationRoadmap(resultId: number, numberOfDays = 3) {
  return apiFetch<RoadmapItem>(`/quizzes/results/${resultId}/roadmap?number_of_days=${numberOfDays}`, {
    method: "POST",
  });
}

// ================= DOCUMENTS APIs ================= //

export function listDocuments() {
  return apiFetch<DocumentResponse[]>(`/documents`);
}

export function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<DocumentResponse>(`/documents/upload`, {
    method: "POST",
    body: formData,
  });
}

// ================= AI TUTOR (RAG) APIs ================= //

export function askAiTutor(question: string, documentId?: number) {
  return apiFetch<RAGResponse>(`/rag/query`, {
    method: "POST",
    body: JSON.stringify({ question, document_id: documentId ?? null }),
  });
}

// ================= ASSESSMENTS & QUIZZES APIs ================= //

export function generateQuiz(
  documentId?: number,
  topic = "General",
  numberOfQuestions = 5,
  difficulty = "medium"
) {
  return apiFetch<QuizItem>(`/quizzes/generate`, {
    method: "POST",
    body: JSON.stringify({
      document_id: documentId ?? null,
      topic,
      number_of_questions: numberOfQuestions,
      difficulty,
    }),
  });
}

export function getQuiz(quizId: number) {
  return apiFetch<QuizItem>(`/quizzes/${quizId}`);
}

export function submitQuiz(
  quizId: number,
  answers: Record<string, string>,
  userId: number = getCurrentUserId()
) {
  return apiFetch<QuizSubmitResponse>(`/quizzes/${quizId}/submit?user_id=${userId}`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}
