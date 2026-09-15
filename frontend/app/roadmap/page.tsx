"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import {
  ArrowRightIcon,
  CheckIcon,
  MapIcon,
  PencilIcon,
  SparklesIcon,
  XIcon,
} from "../components/icons";
import {
  createRoadmap,
  generateQuiz,
  getCurrentUserId,
  listRoadmaps,
  QuizGenerateResponse,
  QuizSubmitResponse,
  RoadmapResponse,
  submitQuizAnswers,
  updateRoadmapProgress,
  formatScore,
} from "../../lib/api";

type TaskItem = {
  day: string;
  title: string;
  description: string;
  status: "Completed" | "In progress" | "Pending";
};

const defaultTasks: TaskItem[] = [
  {
    day: "Day 1",
    title: "Official Survey Frame & Sampling Taxonomy",
    description: "Understand frame design, universe stratification, and MoSPI survey definitions.",
    status: "Completed",
  },
  {
    day: "Day 2",
    title: "Probability Proportional to Size (PPS) Sampling",
    description: "Compute first-stage selection probabilities for Primary Sampling Units (PSUs).",
    status: "Completed",
  },
  {
    day: "Day 3",
    title: "Non-Response Adjustments & Weight Multipliers",
    description: "Design imputation strategies and weighting adjustments for missing survey responses.",
    status: "In progress",
  },
  {
    day: "Day 4",
    title: "Standard Error & Confidence Interval Estimation",
    description: "Calculate variance of estimators under complex multi-stage designs.",
    status: "Pending",
  },
  {
    day: "Day 5",
    title: "Official Reporting Standards & Data Quality Audits",
    description: "Produce dissemination-grade statistical tables aligned to national metadata standards.",
    status: "Pending",
  },
];

function RoadmapContent() {
  const searchParams = useSearchParams();
  const queryCompetency = searchParams.get("competency");

  const [roadmaps, setRoadmaps] = useState<RoadmapResponse[]>([]);
  const [selectedRoadmapIdx, setSelectedRoadmapIdx] = useState<number>(0);
  const [tasks, setTasks] = useState<TaskItem[]>(defaultTasks);
  const [progress, setProgress] = useState("40% Complete");
  const [loading, setLoading] = useState(true);

  // Custom roadmap generator form state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customCompetency, setCustomCompetency] = useState("");
  const [customDays, setCustomDays] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Quiz Modal State for Day Tasks
  const [activeQuizTask, setActiveQuizTask] = useState<TaskItem | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizGenerateResponse | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<QuizSubmitResponse | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizError, setQuizError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRoadmaps() {
      try {
        const userId = getCurrentUserId();
        const list = await listRoadmaps(userId);

        if (!active) return;

        if (list && list.length > 0) {
          setRoadmaps(list);

          // If query param matches one of the roadmaps, select it
          let matchedIdx = 0;
          if (queryCompetency) {
            const foundIdx = list.findIndex((r) => {
              const cName = (r.competency_name || r.target_competency || "").toLowerCase();
              return cName === queryCompetency.toLowerCase() || queryCompetency.toLowerCase().includes(cName);
            });
            if (foundIdx >= 0) matchedIdx = foundIdx;
          }
          setSelectedRoadmapIdx(matchedIdx);
          applyRoadmap(list[matchedIdx]);
        } else if (queryCompetency) {
          // Auto-generate if directed from Skill Gaps or Courses
          const created = await createRoadmap(userId, {
            competency_name: queryCompetency,
            duration_days: 5,
          });
          if (created && active) {
            setRoadmaps([created]);
            setSelectedRoadmapIdx(0);
            applyRoadmap(created);
          }
        }
      } catch {
        if (active) {
          setTasks(defaultTasks);
          setProgress("40% Complete");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadRoadmaps();
    return () => {
      active = false;
    };
  }, [queryCompetency]);

  function applyRoadmap(rm: RoadmapResponse) {
    if (!rm.daily_plan || rm.daily_plan.length === 0) {
      setTasks(defaultTasks);
      setProgress(`${rm.progress_percentage}% Complete`);
      return;
    }

    const totalDays = rm.daily_plan.length;
    const completedDays = Math.round((rm.progress_percentage / 100) * totalDays);

    const mappedTasks: TaskItem[] = rm.daily_plan.map((plan, index) => {
      let status: "Completed" | "In progress" | "Pending" = "Pending";
      if (index < completedDays) {
        status = "Completed";
      } else if (index === completedDays) {
        status = "In progress";
      }

      return {
        day: `Day ${plan.day}`,
        title: plan.topic,
        description: `${plan.exercises || "Practice scenario-based tasks."} Resource: ${plan.recommended_course || "iGOT Karmayogi module"}`,
        status,
      };
    });

    setTasks(mappedTasks);
    setProgress(`${rm.progress_percentage}% Complete`);
  }

  function handleSelectRoadmap(idx: number) {
    setSelectedRoadmapIdx(idx);
    const rm = roadmaps[idx];
    if (rm) applyRoadmap(rm);
  }

  async function handleCreateCustomRoadmap(e: React.FormEvent) {
    e.preventDefault();
    if (!customCompetency.trim() || generating) return;

    setGenerating(true);
    setErrorMsg("");

    try {
      const userId = getCurrentUserId();
      const newRm = await createRoadmap(userId, {
        competency_name: customCompetency.trim(),
        duration_days: customDays,
      });

      if (newRm) {
        const updatedList = [newRm, ...roadmaps];
        setRoadmaps(updatedList);
        setSelectedRoadmapIdx(0);
        applyRoadmap(newRm);
        setShowCustomForm(false);
        setCustomCompetency("");
      }
    } catch {
      setErrorMsg("Failed to generate custom roadmap. Please ensure backend services are connected.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleTaskToggle(task: TaskItem) {
    const currentRoadmap = roadmaps[selectedRoadmapIdx];
    if (!currentRoadmap) return;

    const taskIndex = tasks.findIndex((t) => t.day === task.day);
    if (taskIndex < 0) return;

    const newTasks = [...tasks];
    const newStatus = task.status === "Completed" ? "In progress" : "Completed";
    newTasks[taskIndex] = { ...task, status: newStatus };
    setTasks(newTasks);

    const completedCount = newTasks.filter((t) => t.status === "Completed").length;
    const newProgress = Math.round((completedCount / newTasks.length) * 100);
    setProgress(`${newProgress}% Complete`);

    try {
      const userId = getCurrentUserId();
      await updateRoadmapProgress(userId, currentRoadmap.id, newProgress);
      const updated = { ...currentRoadmap, progress_percentage: newProgress };
      setRoadmaps((prev) => prev.map((r, i) => (i === selectedRoadmapIdx ? updated : r)));
    } catch {}
  }

  async function handleOpenDayQuiz(task: TaskItem) {
    setActiveQuizTask(task);
    setQuizLoading(true);
    setQuizData(null);
    setQuizAnswers({});
    setQuizResult(null);
    setQuizError("");

    const currentRoadmap = roadmaps[selectedRoadmapIdx];
    const subject = `${task.title} - ${currentRoadmap?.target_competency || "Official Statistics"}`;

    try {
      const data = await generateQuiz({
        competency_name: subject,
        num_questions: 3,
      });

      if (data && data.questions && data.questions.length > 0) {
        setQuizData(data);
      } else {
        setQuizError("Could not generate quiz questions from backend model.");
      }
    } catch {
      setQuizError("Failed to connect to assessment generator. Please verify backend is running.");
    } finally {
      setQuizLoading(false);
    }
  }

  async function handleSubmitDayQuiz() {
    if (!quizData || submittingQuiz) return;
    setSubmittingQuiz(true);

    try {
      const userId = getCurrentUserId();
      const response = await submitQuizAnswers(userId, {
        quiz_id: quizData.quiz_id ?? quizData.id ?? 0,
        answers: quizAnswers,
      });

      if (response) {
        setQuizResult(response);

        if (response.score >= 60 && activeQuizTask) {
          const currentRoadmap = roadmaps[selectedRoadmapIdx];
          const taskIndex = tasks.findIndex((t) => t.day === activeQuizTask.day);
          if (taskIndex >= 0) {
            const newTasks = [...tasks];
            newTasks[taskIndex] = { ...activeQuizTask, status: "Completed" };
            setTasks(newTasks);

            const completedCount = newTasks.filter((t) => t.status === "Completed").length;
            const newProgress = Math.round((completedCount / newTasks.length) * 100);
            setProgress(`${newProgress}% Complete`);

            if (currentRoadmap) {
              await updateRoadmapProgress(userId, currentRoadmap.id, newProgress);
              const updated = { ...currentRoadmap, progress_percentage: newProgress };
              setRoadmaps((prev) => prev.map((r, i) => (i === selectedRoadmapIdx ? updated : r)));
            }
          }
        }
      }
    } catch {
      setQuizError("Failed to submit assessment answers.");
    } finally {
      setSubmittingQuiz(false);
    }
  }

  const currentRoadmap = roadmaps[selectedRoadmapIdx];
  const titleDisplay = currentRoadmap
    ? `${currentRoadmap.target_competency} (${currentRoadmap.total_days} Days)`
    : "Survey Sampling Methodology & Field Quality (5 Days)";

  return (
    <AppShell
      title="Interactive Learning Roadmap"
      subtitle="Follow a daily structured curriculum, take day-wise mastery assessments, and automatically update your verified competency scores."
    >
      {/* Top Controls & Custom Roadmap Trigger */}
      <div className="mb-5 rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)]">Active Learning Trajectories</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Select an ongoing competency roadmap or generate a new tailored plan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCustomForm(!showCustomForm)}
            className="inline-flex items-center justify-center rounded-md bg-[var(--primary)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--primary-hover)] transition shadow-xs"
          >
            {showCustomForm ? "Cancel Plan Builder" : "+ Create Custom Roadmap"}
          </button>
        </div>

        {/* Available roadmaps tabs */}
        {roadmaps.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--border-subtle)] pt-4">
            {roadmaps.map((rm, idx) => (
              <button
                key={rm.id || rm.title}
                type="button"
                onClick={() => handleSelectRoadmap(idx)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  selectedRoadmapIdx === idx
                    ? "border border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)] shadow-xs"
                    : "border border-[var(--border)] bg-[var(--panel-soft)] text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {rm.title} ({rm.progress_percentage}%)
              </button>
            ))}
          </div>
        )}

        {/* Custom roadmap generator form */}
        {showCustomForm && (
          <form onSubmit={handleCreateCustomRoadmap} className="mt-4 border-t border-[var(--border-subtle)] pt-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto] sm:items-end">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Target Competency</span>
                <input
                  type="text"
                  value={customCompetency}
                  onChange={(e) => setCustomCompetency(e.target.value)}
                  placeholder="e.g. Python, SQL, Survey Sampling, Data Visualization"
                  className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--primary)]"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Duration</span>
                <select
                  value={customDays}
                  onChange={(e) => setCustomDays(Number(e.target.value))}
                  className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
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
                className="h-10 rounded-md bg-[var(--green-badge-bg)] border border-[var(--green)]/30 px-4 text-xs font-bold text-[var(--green-badge-text)] hover:opacity-90 disabled:opacity-60 transition shadow-xs"
              >
                {generating ? "Generating..." : "Build Plan"}
              </button>
            </div>
          </form>
        )}
      </div>

      {errorMsg && (
        <div className="mb-5 rounded-md border border-[var(--red)]/30 bg-[var(--badge-red-bg)] p-4 text-xs text-[var(--badge-red-text)]">
          {errorMsg}
        </div>
      )}

      {/* Main Roadmap Tasks Display */}
      <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]">
        <div className="mb-6 flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">{titleDisplay}</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Complete each day&apos;s assessment quiz (score &ge; 60%) to verify competency mastery and advance your roadmap.
            </p>
          </div>
          <span className="rounded-full bg-[var(--green-badge-bg)] border border-[var(--green)]/30 px-3 py-1 text-xs font-bold text-[var(--green-badge-text)]">
            {progress}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">Loading learning roadmap...</div>
        ) : tasks.length === 0 ? (
          <div className="rounded-md border border-dashed border-[var(--border)] p-12 text-center">
            <MapIcon className="mx-auto h-12 w-12 text-[var(--muted)]" />
            <h3 className="mt-3 text-base font-bold text-[var(--foreground)]">No active roadmap found</h3>
            <p className="mt-1 text-xs sm:text-sm text-[var(--muted)] max-w-md mx-auto leading-relaxed">
              Select a competency and click &quot;+ Create Custom Roadmap&quot; above to generate a daily structured training schedule.
            </p>
            <button
              type="button"
              onClick={() => setShowCustomForm(true)}
              className="mt-4 rounded-md bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--primary-hover)] transition shadow-xs"
            >
              Build your first plan
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={`${task.day}-${task.title}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)] p-4 transition hover:border-[var(--primary)]"
              >
                <div className="max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[var(--teal)] uppercase tracking-wider">
                      {task.day}
                    </span>
                    {task.status === "Completed" && (
                      <span className="inline-flex items-center gap-1 rounded bg-[var(--green-badge-bg)] border border-[var(--green)]/30 px-2 py-0.5 text-[10px] font-bold text-[var(--green-badge-text)]">
                        <CheckIcon className="h-3 w-3" />
                        <span>Passed &amp; Verified</span>
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-base font-bold text-[var(--foreground)]">{task.title}</div>
                  {task.description && (
                    <div className="mt-1 text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">
                      {task.description}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
                  {/* Take Day Quiz Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenDayQuiz(task)}
                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold border border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)] hover:opacity-90 shadow-xs transition"
                  >
                    <span>{task.status === "Completed" ? "Retake Quiz" : "Take Day Quiz"}</span>
                    <PencilIcon className="h-3.5 w-3.5" />
                  </button>

                  {/* Integrated Completion Status Indicator (shown only when completed) */}
                  {task.status === "Completed" && (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-md border border-[var(--green)]/30 bg-[var(--green-badge-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--green-badge-text)] select-none"
                      role="status"
                      aria-label="Quiz Completed"
                    >
                      <CheckIcon className="h-3.5 w-3.5" />
                      <span>Completed</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Day-Wise Quiz Assessment Modal */}
      {activeQuizTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded bg-[var(--primary-soft)] border border-[var(--primary)]/30 px-2 py-0.5 text-xs font-bold text-[var(--primary)]">
                    {activeQuizTask.day} Mastery Check
                  </span>
                  <span className="text-xs text-[var(--muted)] font-medium">
                    {currentRoadmap?.target_competency}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-[var(--foreground)] leading-snug">
                  {activeQuizTask.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveQuizTask(null);
                  setQuizResult(null);
                }}
                className="rounded-md p-1.5 text-[var(--muted)] hover:bg-[var(--panel-soft)] hover:text-[var(--foreground)] transition"
                aria-label="Close modal"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 overflow-y-auto pr-2 flex-1 space-y-4 text-sm">
              {quizLoading ? (
                <div className="py-12 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
                  <p className="mt-3 text-xs font-semibold text-[var(--primary)]">
                    Generating official day assessment questions for &quot;{activeQuizTask.title}&quot;...
                  </p>
                </div>
              ) : quizError ? (
                <div className="rounded-md border border-[var(--red)]/30 bg-[var(--badge-red-bg)] p-4 text-xs text-[var(--badge-red-text)]">
                  <p>{quizError}</p>
                  <button
                    type="button"
                    onClick={() => handleOpenDayQuiz(activeQuizTask)}
                    className="mt-3 rounded bg-[var(--red)] px-3 py-1 text-xs font-bold text-white hover:opacity-90 shadow-xs"
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
                        ? "border-[var(--green)]/40 bg-[var(--green-badge-bg)] text-[var(--green-badge-text)]"
                        : "border-[var(--amber)]/40 bg-[var(--badge-amber-bg)] text-[var(--badge-amber-text)]"
                    }`}
                  >
                    <div className="text-3xl font-black">
                      {formatScore(quizResult.score)}%
                    </div>
                    <div className="text-xs mt-1 uppercase tracking-wider font-bold">
                      {quizResult.score >= 60 ? "Day Assessment Passed!" : "Assessment Needs Revision"}
                    </div>
                    <p className="mt-2 text-xs text-[var(--foreground)] leading-relaxed">
                      {quizResult.score >= 60
                        ? `Congratulations! You answered ${quizResult.correct_answers} of ${quizResult.total_questions} questions correctly. ${activeQuizTask.day} has been automatically marked completed and your competency score updated!`
                        : `You answered ${quizResult.correct_answers} of ${quizResult.total_questions} correctly. A score of 60% is required to pass. Review the explanations below and try again.`}
                    </p>
                  </div>

                  {/* Question Review */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                      Review Questions &amp; Explanations
                    </h4>
                    {quizData?.questions.map((q, idx) => {
                      const userChoice = quizAnswers[String(q.id)];
                      const correctEntry = quizResult.correct_details ? quizResult.correct_details[String(q.id)] : undefined;
                      const isCorrect = typeof correctEntry === "string" ? correctEntry : correctEntry?.correct;

                      return (
                        <div key={q.id} className="rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)] p-3.5 text-xs">
                          <div className="font-bold text-[var(--foreground)]">
                            {idx + 1}. {q.question_text}
                          </div>
                          <div className="mt-2 space-y-1">
                            {q.options.map((opt) => (
                              <div
                                key={opt}
                                className={`rounded px-2.5 py-1.5 ${
                                  opt === isCorrect
                                    ? "bg-[var(--green-badge-bg)] border border-[var(--green)]/40 text-[var(--green-badge-text)] font-semibold"
                                    : opt === userChoice && opt !== isCorrect
                                      ? "bg-[var(--badge-red-bg)] border border-[var(--red)]/40 text-[var(--badge-red-text)] font-semibold"
                                      : "text-[var(--muted)]"
                                }`}
                              >
                                {opt === isCorrect ? <CheckIcon className="h-3.5 w-3.5" /> : opt === userChoice ? <XIcon className="h-3.5 w-3.5" /> : <span className="h-2 w-2 rounded-full bg-current" />} <span>{opt}</span>
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
                  <div className="rounded-md border border-[var(--primary)]/20 bg-[var(--primary-soft)] p-3 text-xs text-[var(--primary)] font-semibold">
                    <SparklesIcon className="h-4 w-4" /> Answer all 3 questions to verify mastery of today&apos;s curriculum. Scoring &ge; 60% automatically advances your roadmap.
                  </div>

                  {quizData.questions.map((q, idx) => (
                    <div key={q.id} className="rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)] p-4 text-xs">
                      <div className="font-bold text-[var(--foreground)] text-sm mb-3">
                        <span className="text-[var(--primary)] mr-1.5">Q{idx + 1}.</span>
                        {q.question_text}
                      </div>
                      <div className="space-y-2">
                        {q.options.map((opt) => (
                          <label
                            key={opt}
                            className={`flex items-center gap-2.5 rounded-md border p-2.5 cursor-pointer transition ${
                              quizAnswers[String(q.id)] === opt
                                ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--foreground)] font-semibold"
                                : "border-[var(--border-subtle)] bg-[var(--panel-soft)] text-[var(--foreground)] hover:border-[var(--primary)]"
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
                              className="accent-[var(--primary)]"
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
            <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
              <button
                type="button"
                onClick={() => {
                  setActiveQuizTask(null);
                  setQuizResult(null);
                }}
                className="rounded-md border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition"
              >
                {quizResult ? "Back to Roadmap" : "Cancel"}
              </button>

              {quizResult ? (
                quizResult.score < 60 && (
                  <button
                    type="button"
                    onClick={() => handleOpenDayQuiz(activeQuizTask)}
                    className="rounded-md bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--primary-hover)] transition shadow-xs"
                  >
                    Retake Day Quiz ↺
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitDayQuiz}
                  disabled={submittingQuiz || quizLoading || !quizData}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--primary-hover)] transition disabled:opacity-50 shadow-xs"
                >
                  <span>{submittingQuiz ? "Evaluating..." : "Submit Day Assessment"}</span>
                  {!submittingQuiz && <ArrowRightIcon className="h-3.5 w-3.5" />}
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
