const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

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

export type SkillGapItem = {
  competency: string;
  current_level: number;
  required_level: number;
  gap: number;
  priority: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
};

export type RecommendationItem = {
  course_id: number;
  title: string;
  description?: string | null;
  score: number;
  skills_addressed: string[];
  reason: string;
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

export type DocumentUploadResponse = {
  id: number;
  filename: string;
  file_type: string;
};

export function getUser(userId = DUMMY_USER_ID) {
  return apiFetch<UserProfile>(`/users/${userId}`);
}

export function getUserSkillGaps(userId = DUMMY_USER_ID) {
  return apiFetch<{ user_id: number; skill_gaps: SkillGapItem[] }>(`/users/${userId}/skill-gaps`);
}

export function getUserRecommendations(userId = DUMMY_USER_ID) {
  return apiFetch<RecommendationItem[]>(`/users/${userId}/recommendations`);
}

export function listCourses() {
  return apiFetch<CourseItem[]>(`/courses`);
}

export function getUserRoadmaps(userId = DUMMY_USER_ID) {
  return apiFetch<RoadmapItem[]>(`/users/${userId}/roadmaps`);
}

export function toggleRoadmapTask(taskId: number, status: "Pending" | "Completed") {
  return apiFetch<RoadmapTask>(`/roadmaps/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<DocumentUploadResponse>(`/documents/upload`, {
    method: "POST",
    body: formData,
  });
}

export function askAiTutor(question: string, documentId?: number) {
  return apiFetch<{ answer: string; sources: Array<{ document: string; page: number; content_snippet: string }> }>(`/rag/query`, {
    method: "POST",
    body: JSON.stringify({ question, document_id: documentId ?? null }),
  });
}

export function generateQuiz(documentId: number, topic = "General", numberOfQuestions = 5, difficulty = "medium") {
  return apiFetch<QuizItem>(`/quizzes/generate`, {
    method: "POST",
    body: JSON.stringify({
      document_id: documentId,
      topic,
      number_of_questions: numberOfQuestions,
      difficulty,
    }),
  });
}

export function submitQuiz(quizId: number, answers: Record<string, string>, userId = DUMMY_USER_ID) {
  return apiFetch<{ score: number; total_questions: number; correct_answers: number; feedback: string; correct_details: Record<string, { correct: string; explanation: string }>; result_id: number }>(`/quizzes/${quizId}/submit?user_id=${userId}`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}
