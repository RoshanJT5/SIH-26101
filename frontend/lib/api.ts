export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "/api/v1";

const AUTH_SESSION_KEY = "statlearn_auth_session";

export type AuthSession = {
  userId: number;
  user: AuthUser;
  authenticatedAt: string;
};

export function getCurrentUserId(): number {
  if (typeof window === "undefined") return 1;
  const session = getAuthSession();
  return session?.userId || 1;
}

export function setCurrentUserId(userId: number) {
  if (typeof window !== "undefined") {
    const existing = getAuthSession();
    setAuthSession({
      userId,
      user: existing?.user || { id: userId, name: "Official", email: "" },
    });
  }
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(AUTH_SESSION_KEY);
    return stored ? (JSON.parse(stored) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function setAuthSession(auth: { userId: number; user: AuthUser }) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    AUTH_SESSION_KEY,
    JSON.stringify({ ...auth, authenticatedAt: new Date().toISOString() })
  );
}

export function clearAuthSession() {
  if (typeof window !== "undefined") sessionStorage.removeItem(AUTH_SESSION_KEY);
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`API call failed [${response.status}]: ${errorText}`);
  }

  return response.json();
}

// ================= TYPES ================= //

export type UserCompetencyItem = {
  id: number;
  user_id: number;
  competency_id: number;
  competency_name: string;
  category: string;
  current_level: number;
  required_level: number;
  last_updated?: string | null;
};

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  mobile?: string | null;
  employee_id?: string | null;
  organization?: string | null;
  department: string;
  designation: string;
  job_role: string;
  experience_years: number;
  education: string;
  career_goal: string;
  competencies: UserCompetencyItem[];
};

export type UserCreate = {
  name: string;
  email: string;
  mobile?: string;
  employee_id?: string;
  organization?: string;
  department: string;
  designation: string;
  job_role: string;
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
  level_descriptors?: Record<string, string> | null;
};

export type SkillGapItem = {
  competency_id: number;
  competency: string;
  current_level: number;
  required_level: number;
  gap: number;
  priority: string;
};

export type SkillGapsResponse = {
  user_id: number;
  user_name: string;
  total_gaps: number;
  skill_gaps: SkillGapItem[];
};

export type RecommendationItem = {
  id?: number;
  course_id?: number;
  external_id?: string;
  title: string;
  source: string;
  score: number;
  reason: string;
  course_url?: string;
};

export type CourseItem = {
  id: number;
  title: string;
  description?: string | null;
  external_id?: string | null;
  source: string;
  url: string;
  level?: string | null;
  duration_hours?: number | null;
  skills_covered?: string | null;
};

export type CourseProgress = {
  id: number;
  user_id: number;
  course_id: number;
  status: string;
  progress_percentage: number;
  completed_at?: string | null;
};

export type RoadmapTask = {
  id: number;
  roadmap_id: number;
  day_number: number;
  title: string;
  description?: string | null;
  status: "Pending" | "Completed";
  estimated_minutes: number;
  resource_url?: string | null;
};

export type DailyPlanItem = {
  day: number;
  topic: string;
  exercises?: string;
  recommended_course?: string;
};

export type RoadmapItem = {
  id: number;
  user_id: number;
  title: string;
  target_competency: string;
  competency_name?: string;
  total_days?: number;
  progress_percentage: number;
  created_at: string;
  tasks?: RoadmapTask[];
  daily_plan?: DailyPlanItem[];
};

export type RoadmapResponse = RoadmapItem;

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
  quiz_id?: number;
  document_id?: number | null;
  topic?: string | null;
  difficulty?: string | null;
  questions: QuizQuestion[];
};

export type QuizGenerateResponse = QuizItem;

export type QuizSubmitResponse = {
  score: number;
  total_questions: number;
  correct_answers: number;
  passed?: boolean;
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

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  department?: string | null;
  designation?: string | null;
  job_role?: string | null;
};

export function createUser(data: UserCreate & { password: string }) {
  return apiFetch<UserProfile>(`/users`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function loginUser(data: LoginRequest) {
  return apiFetch<AuthUser>(`/users/login`, {
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

export function getUserSkillGaps(userId: number = getCurrentUserId()) {
  return apiFetch<SkillGapsResponse>(`/users/${userId}/skill-gaps`);
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

export const listRoadmaps = getUserRoadmaps;

export function createRoadmap(
  userId: number = getCurrentUserId(),
  data: { competency_name: string; duration_days?: number }
) {
  return generateUserRoadmap(userId, {
    target_competency: data.competency_name,
    number_of_days: data.duration_days,
  });
}

export function updateRoadmapProgress(
  userId: number = getCurrentUserId(),
  roadmapId?: number,
  progressPercentage = 0
) {
  void userId;
  void roadmapId;
  return Promise.resolve({ success: true, progress_percentage: progressPercentage });
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
  arg1?: number | { document_id?: number; competency_name?: string; num_questions?: number },
  topic = "General",
  numberOfQuestions = 5,
  difficulty = "medium"
): Promise<QuizItem> {
  if (typeof arg1 === "object" && arg1 !== null) {
    return apiFetch<QuizItem>(`/quizzes/generate`, {
      method: "POST",
      body: JSON.stringify({
        document_id: arg1.document_id ?? null,
        topic: arg1.competency_name || "General",
        number_of_questions: arg1.num_questions ?? 5,
        difficulty: "medium",
      }),
    }).then((res) => ({ ...res, quiz_id: res.id ?? res.quiz_id }));
  }
  return apiFetch<QuizItem>(`/quizzes/generate`, {
    method: "POST",
    body: JSON.stringify({
      document_id: arg1 ?? null,
      topic,
      number_of_questions: numberOfQuestions,
      difficulty,
    }),
  }).then((res) => ({ ...res, quiz_id: res.id ?? res.quiz_id }));
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
  }).then((res) => ({ ...res, passed: res.score >= 60 }));
}

export function submitQuizAnswers(
  userId: number = getCurrentUserId(),
  data: { quiz_id: number; answers: Record<string, string> }
) {
  return submitQuiz(data.quiz_id, data.answers, userId);
}

// ================= ADMIN APIs ================= //

export type AdminOverviewResponse = {
  total_learners: number;
  total_courses_enrolled: number;
  completed_courses: number;
  active_roadmaps: number;
  total_assessments_taken: number;
  avg_assessment_score: number;
  department_stats: Array<{
    department: string;
    learners_count: number;
    avg_progress: number;
  }>;
  critical_skill_gaps: Array<{
    competency: string;
    category: string;
    affected_learners: number;
    avg_gap: number;
  }>;
};

export type AdminCompetencyDetail = {
  name: string;
  category: string;
  current_level: number;
  required_level: number;
  proficiency_pct: number;
  gap_pct: number;
  status: string;
};

export type AdminCourseDetail = {
  id: number;
  external_id: string;
  title: string;
  source: string;
  status: string;
  progress_percentage: number;
  last_accessed?: string | null;
};

export type AdminRoadmapDetail = {
  id: number;
  title: string;
  target_competency: string;
  progress_percentage: number;
  total_tasks: number;
  completed_tasks: number;
};

export type AdminQuizDetail = {
  id: number;
  quiz_id: number;
  topic: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  passed: boolean;
};

export type AdminLearnerItem = {
  id: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  job_role: string;
  experience_years: number;
  education: string;
  career_goal: string;
  avg_proficiency: number;
  readiness_rating: string;
  badge_color: string;
  competencies: AdminCompetencyDetail[];
  courses: AdminCourseDetail[];
  roadmaps: AdminRoadmapDetail[];
  quizzes: AdminQuizDetail[];
};

export function getAdminOverview() {
  return apiFetch<AdminOverviewResponse>(`/admin/overview`);
}

export function getAdminLearners() {
  return apiFetch<AdminLearnerItem[]>(`/admin/learners`);
}

export function getAdminLearnerDetail(userId: number) {
  return apiFetch<AdminLearnerItem>(`/admin/learners/${userId}`);
}

export function listAllUsers() {
  return apiFetch<UserProfile[]>(`/users`);
}
