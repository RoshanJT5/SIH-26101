"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "../components/app-shell";
import {
  getCurrentUserId,
  getUserRoadmaps,
  generateUserRoadmap,
  toggleRoadmapTask,
  generateQuiz,
  submitQuiz,
  RoadmapItem,
  QuizItem,
  QuizSubmitResponse,
} from "../../lib/api";

type TaskItem = {
  id: number;
  day: string;
  dayNumber: number;
  title: string;
  description?: string | null;
  status: "Completed" | "Planned" | "In progress";
};

function RoadmapContent() {
  const searchParams = useSearchParams();
  const initialSkill = searchParams.get("competency") || "";

  const [roadmaps, setRoadmaps] = useState<RoadmapItem[]>([]);
  const [selectedRoadmapIdx, setSelectedRoadmapIdx] = useState(0);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [progress, setProgress] = useState("0% complete");
  const [loading, setLoading] = useState(true);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Custom roadmap generator inputs
  const [customCompetency, setCustomCompetency] = useState(initialSkill || "Survey Sampling");
  const [customDays, setCustomDays] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Day-wise Quiz state
  const [activeQuizTask, setActiveQuizTask] = useState<TaskItem | null>(null);
  const [quizData, setQuizData] = useState<QuizItem | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizSubmitResponse | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadRoadmaps() {
      const userId = getCurrentUserId();
      setLoading(true);
      setErrorMsg(null);

      if (initialSkill) {
        setCustomCompetency(initialSkill);
      }

      try {
        let list = (await getUserRoadmaps(userId)) || [];

        if (initialSkill) {
          // 1. Check if user already has a roadmap for this target competency
          const targetLower = initialSkill.trim().toLowerCase();
          const existingIdx = list.findIndex(
            (r) =>
              (r.target_competency && r.target_competency.toLowerCase() === targetLower) ||
              (r.title && r.title.toLowerCase().includes(targetLower))
          );

          if (existingIdx >= 0) {
            // Found existing roadmap for this competency - switch to it directly
            if (active) {
              setRoadmaps(list);
              setSelectedRoadmapIdx(existingIdx);
              updateActiveRoadmap(list[existingIdx]);
              setLoading(false);
            }
            return;
          }

          // 2. Not found: automatically generate a dedicated roadmap for this competency!
          if (active) {
            setAutoGenerating(true);
          }
          try {
            const newRoadmap = await generateUserRoadmap(userId, {
              target_competency: initialSkill.trim(),
              number_of_days: 5,
            });
            if (newRoadmap) {
              list = [newRoadmap, ...list];
              if (active) {
                setRoadmaps(list);
                setSelectedRoadmapIdx(0);
                updateActiveRoadmap(newRoadmap);
                setAutoGenerating(false);
                setLoading(false);
              }
              return;
            }
          } catch (genErr) {
            console.error("Auto roadmap generation failed:", genErr);
          } finally {
            if (active) setAutoGenerating(false);
          }
        }

        if (!active) return;

        if (list.length) {
          setRoadmaps(list);
          setSelectedRoadmapIdx(0);
          updateActiveRoadmap(list[0]);
        } else {
          setTasks([]);
          setProgress("0% complete");
        }
      } catch {
        if (active) {
          setTasks([]);
          setProgress("0% complete");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadRoadmaps();
    return () => {
      active = false;
    };
  }, [initialSkill]);

  function updateActiveRoadmap(roadmap: RoadmapItem) {
    const roadmapTasks = roadmap?.tasks ?? [];
    if (roadmapTasks.length) {
      const mappedTasks: TaskItem[] = roadmapTasks.map((task) => ({
        id: task.id,
        day: `Day ${task.day_number}`,
        dayNumber: task.day_number,
        title: task.task_title,
        description: task.task_description,
        status: task.status === "Completed" ? "Completed" : task.status === "Pending" ? "Planned" : "In progress",
      }));
      setTasks(mappedTasks);
      setProgress(`${roadmap.progress_percentage}% complete`);
    } else {
      setTasks([]);
      setProgress("0% complete");
    }
  }

  function handleSelectRoadmap(idx: number) {
    setSelectedRoadmapIdx(idx);
    if (roadmaps[idx]) {
      updateActiveRoadmap(roadmaps[idx]);
    }
  }

  async function handleCreateCustomRoadmap(e: React.FormEvent) {
    e.preventDefault();
    const competency = customCompetency.trim();
    if (!competency || generating) return;

    setGenerating(true);
    setErrorMsg(null);
    try {
      const userId = getCurrentUserId();
      const newRoadmap = await generateUserRoadmap(userId, {
        target_competency: competency,
        number_of_days: customDays,
      });

      if (newRoadmap) {
        const updated = [newRoadmap, ...roadmaps];
        setRoadmaps(updated);
        setSelectedRoadmapIdx(0);
        updateActiveRoadmap(newRoadmap);
        setShowCustomForm(false);
      }
    } catch {
      setErrorMsg("Failed to generate learning roadmap. Please verify backend connection.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleTaskToggle(taskItem: TaskItem) {
    const nextStatus = taskItem.status === "Completed" ? "Pending" : "Completed";

    // Optimistic local update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskItem.id ? { ...t, status: nextStatus === "Completed" ? "Completed" : "Planned" } : t))
    );

    if (taskItem.id) {
      try {
        await toggleRoadmapTask(taskItem.id, nextStatus as "Pending" | "Completed");
        const userId = getCurrentUserId();
        const updated = await getUserRoadmaps(userId);
        if (updated?.length) {
          setRoadmaps(updated);
          const current = updated[selectedRoadmapIdx] || updated[0];
          if (current) {
            setProgress(`${current.progress_percentage}% complete`);
          }
        }
      } catch {
        // keep optimistic update
      }
    }
  }

  // Open Day Quiz handler
  async function handleOpenDayQuiz(task: TaskItem) {
    setActiveQuizTask(task);
    setQuizLoading(true);
    setQuizData(null);
    setQuizAnswers({});
    setQuizResult(null);
    setQuizError(null);

    try {
      const currentRm = roadmaps[selectedRoadmapIdx];
      const competency = currentRm?.target_competency || "Official Statistics";
      const topic = `${competency}: ${task.title}`;
      const generated = await generateQuiz(undefined, topic, 3, "medium");
      setQuizData(generated);
    } catch {
      setQuizError("Could not generate day assessment questions. Please try again.");
    } finally {
      setQuizLoading(false);
    }
  }

  async function handleSubmitDayQuiz() {
    if (!quizData || !activeQuizTask || submittingQuiz) return;

    const totalQuestions = quizData.questions.length;
    const answeredCount = Object.keys(quizAnswers).length;
    if (answeredCount < totalQuestions) {
      setQuizError(`Please answer all ${totalQuestions} questions before submitting.`);
      return;
    }

    setSubmittingQuiz(true);
    setQuizError(null);
    try {
      const userId = getCurrentUserId();
      const result = await submitQuiz(quizData.id, quizAnswers, userId);
      setQuizResult(result);

      // If passed (score >= 60%), automatically mark the task as completed!
      if (result.score >= 60) {
        await toggleRoadmapTask(activeQuizTask.id, "Completed");

        // Update local tasks state
        setTasks((prev) =>
          prev.map((t) => (t.id === activeQuizTask.id ? { ...t, status: "Completed" } : t))
        );

        // Refresh roadmaps to update overall progress percentage
        const updatedRoadmaps = await getUserRoadmaps(userId);
        if (updatedRoadmaps?.length) {
          setRoadmaps(updatedRoadmaps);
          const current = updatedRoadmaps[selectedRoadmapIdx] || updatedRoadmaps[0];
          if (current) {
            setProgress(`${current.progress_percentage}% complete`);
          }
        }
      }
    } catch {
      setQuizError("Error submitting assessment. Please try again.");
    } finally {
      setSubmittingQuiz(false);
    }
  }

  const currentRoadmap = roadmaps[selectedRoadmapIdx];
  const titleDisplay = currentRoadmap?.title || "Weekly learning plan";

  return (
    <AppShell
      title="Roadmap"
      subtitle="A personalized plan built from your skill gaps and recommended learning goals, with day-wise quiz assessments to track real mastery."
    >
      {/* Auto-generating banner */}
      {autoGenerating && (
        <div className="mb-5 rounded-md border border-[var(--teal)]/40 bg-[rgba(32,196,183,0.1)] p-4 text-xs text-[var(--teal)] flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--teal)] border-t-transparent shrink-0" />
          <span>
            Building tailored day-by-day learning roadmap for <strong>&quot;{initialSkill}&quot;</strong> using official competency framework...
          </span>
        </div>
      )}

      {/* Switcher & Generator Controls */}
      <div className="mb-5 rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Your Learning Roadmaps</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">Switch between targeted competencies or create a custom plan.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowCustomForm((v) => !v)}
            className="inline-flex h-9 items-center justify-center rounded-md bg-[var(--primary)] px-3 text-xs font-semibold text-white hover:bg-[#60a5fa]"
          >
            {showCustomForm ? "Cancel" : "+ Create Custom Roadmap"}
          </button>
        </div>

        {/* Available roadmaps tabs */}
        {roadmaps.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
            {roadmaps.map((rm, idx) => (
              <button
                key={rm.id || rm.title}
                type="button"
                onClick={() => handleSelectRoadmap(idx)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  selectedRoadmapIdx === idx
                    ? "border border-[var(--teal)] bg-[rgba(32,196,183,0.12)] text-[var(--teal)] font-semibold shadow-sm"
                    : "border border-[var(--border)] bg-[#303030] text-[var(--muted)] hover:text-white"
                }`}
              >
                {rm.title} ({rm.progress_percentage}%)
              </button>
            ))}
          </div>
        )}

        {/* Custom roadmap generator form */}
        {showCustomForm && (
          <form onSubmit={handleCreateCustomRoadmap} className="mt-4 border-t border-[var(--border)] pt-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto] sm:items-end">
              <label className="block">
                <span className="mb-1 block text-xs text-[var(--muted)]">Target Competency</span>
                <input
                  type="text"
                  value={customCompetency}
                  onChange={(e) => setCustomCompetency(e.target.value)}
                  placeholder="e.g. Python, SQL, Survey Sampling, Data Visualization"
                  className="h-10 w-full rounded-md border border-[var(--border)] bg-[#303030] px-3 text-xs text-white placeholder:text-[var(--muted)] outline-none"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs text-[var(--muted)]">Duration</span>
                <select
                  value={customDays}
                  onChange={(e) => setCustomDays(Number(e.target.value))}
                  className="h-10 w-full rounded-md border border-[var(--border)] bg-[#303030] px-3 text-xs text-white outline-none"
                >
                  <option value={3}>3 Days</option>
                  <option value={5}>5 Days</option>
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                </select>
              </label>

              <button
                type="submit"
                disabled={generating}
                className="h-10 rounded-md bg-[#14331f] px-4 text-xs font-semibold text-[#37d46f] hover:bg-[#174026] disabled:opacity-60"
              >
                {generating ? "Generating..." : "Build Plan"}
              </button>
            </div>
          </form>
        )}
      </div>

      {errorMsg && (
        <div className="mb-5 rounded-md border border-red-500/30 bg-red-950/20 p-4 text-xs text-red-300">
          {errorMsg}
        </div>
      )}

      {/* Main Roadmap Tasks Display */}
      <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">{titleDisplay}</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Complete each day&apos;s assessment quiz (score &ge; 60%) to verify competency mastery and advance your roadmap.
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-300">
            {progress}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">Loading learning roadmap...</div>
        ) : tasks.length === 0 ? (
          <div className="rounded-md border border-dashed border-[var(--border)] p-12 text-center">
            <span className="text-3xl">🗺️</span>
            <h3 className="mt-3 text-base font-semibold text-white">No active roadmap found</h3>
            <p className="mt-1 text-sm text-[var(--muted)] max-w-md mx-auto">
              Select a competency and click &quot;+ Create Custom Roadmap&quot; above to generate a daily structured training schedule.
            </p>
            <button
              type="button"
              onClick={() => setShowCustomForm(true)}
              className="mt-4 rounded-md bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[#60a5fa]"
            >
              Build your first plan
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={`${task.day}-${task.title}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-md border border-[var(--border)] bg-[#303030] p-4 transition hover:border-[var(--teal)]/40"
              >
                <div className="max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[var(--teal)] uppercase tracking-wider">
                      {task.day}
                    </span>
                    {task.status === "Completed" && (
                      <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 text-[10px] font-medium text-emerald-300">
                        ✓ Passed &amp; Verified
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-base font-medium text-white">{task.title}</div>
                  {task.description && (
                    <div className="mt-1 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {task.description}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Take Day Quiz Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenDayQuiz(task)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                      task.status === "Completed"
                        ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                        : "border border-[var(--teal)] bg-[rgba(32,196,183,0.15)] text-[var(--teal)] hover:bg-[rgba(32,196,183,0.25)] shadow-sm"
                    }`}
                  >
                    <span>{task.status === "Completed" ? "Retake Quiz" : "Take Day Quiz"}</span>
                    <span>📝</span>
                  </button>

                  {/* Manual Status Toggle */}
                  <button
                    type="button"
                    onClick={() => handleTaskToggle(task)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                      task.status === "Completed"
                        ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/40"
                        : task.status === "In progress"
                          ? "bg-blue-500/20 text-blue-200 border border-blue-500/40"
                          : "bg-white/5 text-slate-400 border border-white/10 hover:text-white"
                    }`}
                    title="Toggle completion status"
                  >
                    {task.status === "Completed" ? "✓" : "○"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Day-Wise Quiz Assessment Modal */}
      {activeQuizTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-lg border border-[var(--border)] bg-[#1e1e1e] p-6 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#2e2e2e] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 text-xs font-medium text-teal-300">
                    {activeQuizTask.day} Mastery Check
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {currentRoadmap?.target_competency}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white leading-snug">
                  {activeQuizTask.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveQuizTask(null);
                  setQuizResult(null);
                }}
                className="rounded-md p-1.5 text-[var(--muted)] hover:bg-[#333] hover:text-white transition"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 overflow-y-auto pr-2 flex-1 space-y-4 text-sm">
              {quizLoading ? (
                <div className="py-12 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--teal)] border-t-transparent" />
                  <p className="mt-3 text-xs text-[var(--teal)]">
                    Generating official day assessment questions for &quot;{activeQuizTask.title}&quot;...
                  </p>
                </div>
              ) : quizError ? (
                <div className="rounded-md border border-red-500/30 bg-red-950/20 p-4 text-xs text-red-300">
                  <p>{quizError}</p>
                  <button
                    type="button"
                    onClick={() => handleOpenDayQuiz(activeQuizTask)}
                    className="mt-3 rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-500"
                  >
                    Retry Generating Quiz
                  </button>
                </div>
              ) : quizResult ? (
                // Quiz Evaluation Results
                <div className="space-y-4">
                  <div
                    className={`rounded-lg p-5 border text-center ${
                      quizResult.score >= 60
                        ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                        : "border-amber-500/40 bg-amber-950/20 text-amber-300"
                    }`}
                  >
                    <div className="text-3xl font-bold">
                      {quizResult.score}%
                    </div>
                    <div className="text-xs mt-1 uppercase tracking-wider font-semibold">
                      {quizResult.score >= 60 ? "Day Assessment Passed!" : "Assessment Needs Revision"}
                    </div>
                    <p className="mt-2 text-xs text-slate-300">
                      {quizResult.score >= 60
                        ? `Congratulations! You answered ${quizResult.correct_answers} of ${quizResult.total_questions} questions correctly. ${activeQuizTask.day} has been automatically marked completed and your competency score updated!`
                        : `You answered ${quizResult.correct_answers} of ${quizResult.total_questions} correctly. A score of 60% is required to pass. Review the explanations below and try again.`}
                    </p>
                  </div>

                  {/* Question Review */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Review Questions &amp; Explanations
                    </h4>
                    {quizData?.questions.map((q, idx) => {
                      const userChoice = quizAnswers[String(q.id)];
                      const isCorrect = quizResult.correct_details ? quizResult.correct_details[String(q.id)] : userChoice;

                      return (
                        <div key={q.id} className="rounded-md border border-[#333] bg-[#252525] p-3.5 text-xs">
                          <div className="font-semibold text-white">
                            {idx + 1}. {q.question_text}
                          </div>
                          <div className="mt-2 space-y-1">
                            {q.options.map((opt) => (
                              <div
                                key={opt}
                                className={`rounded px-2.5 py-1.5 ${
                                  opt === isCorrect
                                    ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-medium"
                                    : opt === userChoice && opt !== isCorrect
                                      ? "bg-red-950/60 border border-red-500/40 text-red-300"
                                      : "text-slate-400"
                                }`}
                              >
                                {opt === isCorrect ? "✓ " : opt === userChoice ? "✗ " : "• "} {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : quizData ? (
                // Active Quiz Form
                <div className="space-y-5">
                  <div className="rounded-md border border-teal-500/20 bg-teal-950/10 p-3 text-xs text-teal-300">
                    💡 Answer all 3 questions to verify mastery of today&apos;s curriculum. Scoring &ge; 60% automatically advances your roadmap.
                  </div>

                  {quizData.questions.map((q, idx) => (
                    <div key={q.id} className="rounded-md border border-[#333] bg-[#252525] p-4 text-xs">
                      <div className="font-medium text-white text-sm mb-3">
                        <span className="text-[var(--teal)] font-bold mr-1.5">Q{idx + 1}.</span>
                        {q.question_text}
                      </div>
                      <div className="space-y-2">
                        {q.options.map((opt) => (
                          <label
                            key={opt}
                            className={`flex items-center gap-2.5 rounded-md border p-2.5 cursor-pointer transition ${
                              quizAnswers[String(q.id)] === opt
                                ? "border-[var(--teal)] bg-[rgba(32,196,183,0.12)] text-white"
                                : "border-[#3a3a3a] bg-[#1e1e1e] text-slate-300 hover:border-slate-500"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              value={opt}
                              checked={quizAnswers[String(q.id)] === opt}
                              onChange={() =>
                                setQuizAnswers((prev) => ({ ...prev, [String(q.id)]: opt }))
                              }
                              className="accent-[var(--teal)]"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-[#2e2e2e] pt-4">
              <button
                type="button"
                onClick={() => {
                  setActiveQuizTask(null);
                  setQuizResult(null);
                }}
                className="rounded-md border border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--muted)] hover:text-white transition"
              >
                {quizResult ? "Back to Roadmap" : "Cancel"}
              </button>

              {quizResult ? (
                quizResult.score < 60 && (
                  <button
                    type="button"
                    onClick={() => handleOpenDayQuiz(activeQuizTask)}
                    className="rounded-md bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[#60a5fa] transition"
                  >
                    Retake Day Quiz ↺
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitDayQuiz}
                  disabled={submittingQuiz || quizLoading || !quizData}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition disabled:opacity-50"
                >
                  {submittingQuiz ? "Evaluating..." : "Submit Day Assessment →"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={null}>
      <RoadmapContent />
    </Suspense>
  );
}
