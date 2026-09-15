"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import { RobotIcon, CheckIcon, XIcon, ArrowRightIcon } from "../components/icons";
import {
  DocumentResponse,
  generateQuiz,
  generateRemediationRoadmap,
  getCurrentUserId,
  listDocuments,
  Question,
  QuizSubmitResponse,
  submitQuiz,
  formatScore,
} from "../../lib/api";

function AssessmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docIdParam = searchParams.get("docId");
  const topicParam = searchParams.get("topic");
  const compIdParam = searchParams.get("competency_id");
  const modeParam = searchParams.get("mode");

  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | undefined>(
    docIdParam ? parseInt(docIdParam, 10) : undefined
  );
  const [topic, setTopic] = useState(
    topicParam ? decodeURIComponent(topicParam) : "Survey Sampling Methodology & Statistical Inference"
  );
  const [numQuestions, setNumQuestions] = useState(5);

  const [quizId, setQuizId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRemediating, setIsRemediating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load documents list
  useEffect(() => {
    let active = true;

    async function fetchDocs() {
      try {
        const docs = await listDocuments();
        if (!active) return;
        if (docs && docs.length > 0) {
          setDocuments(docs);
          if (docIdParam) {
            const parsed = parseInt(docIdParam, 10);
            setSelectedDocId(parsed);
            const found = docs.find((d) => d.id === parsed);
            if (found && !topicParam) setTopic(found.filename.replace(/\.[^/.]+$/, ""));
          }
        }
      } catch {
        // preserve
      }
    }

    fetchDocs();
    return () => {
      active = false;
    };
  }, [docIdParam, topicParam]);

  // Initial load: generate diagnostic quiz for target competency / role baseline
  useEffect(() => {
    let active = true;

    async function initialGen() {
      try {
        const targetTopic = topicParam
          ? decodeURIComponent(topicParam)
          : "Survey Sampling Methodology & Statistical Inference";

        const data = await generateQuiz({
          document_id: docIdParam ? parseInt(docIdParam, 10) : undefined,
          competency_name: targetTopic,
          competency_id: compIdParam ? parseInt(compIdParam, 10) : undefined,
          num_questions: 5,
          quiz_type: modeParam === "diagnostic" ? "DIAGNOSTIC" : "COMPETENCY_EVALUATION",
        });

        if (!active) return;
        if (data && data.questions?.length) {
          setQuizId(data.quiz_id ?? data.id ?? null);
          setQuestions(data.questions);
        }
      } catch {
        // preserve fallback questions
      }
    }

    initialGen();
    return () => {
      active = false;
    };
  }, [docIdParam, topicParam, compIdParam, modeParam]);


  // Generate quiz handler
  async function handleGenerate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (isGenerating) return;
    setIsGenerating(true);
    setErrorMsg(null);
    setResult(null);
    setSelectedAnswers({});
    setCurrentIndex(0);

    try {
      const data = await generateQuiz({
        document_id: selectedDocId,
        competency_name: topic.trim() || undefined,
        num_questions: numQuestions,
      });

      if (data && data.questions) {
        setQuizId(data.quiz_id ?? data.id ?? null);
        setQuestions(data.questions);
      }
    } catch {
      setErrorMsg("Failed to generate assessment. Please ensure study documents or manuals are processed.");
    } finally {
      setIsGenerating(false);
    }
  }

  const currentQuestion = questions[currentIndex] || null;

  // Submit quiz handler
  async function handleSubmit() {
    if (isSubmitting || !quizId) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const userId = getCurrentUserId();
      const response = await submitQuiz(quizId, selectedAnswers, userId);
      setResult(response);
    } catch {
      setErrorMsg("Failed to submit assessment to backend. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Generate remediation roadmap handler
  async function handleGenerateRemedial() {
    if (isRemediating) return;
    setIsRemediating(true);
    try {
      if (result?.result_id) {
        await generateRemediationRoadmap(result.result_id, 3);
      }
      router.push("/roadmap");
    } catch {
      router.push("/roadmap");
    } finally {
      setIsRemediating(false);
    }
  }

  const currentDetail = result?.correct_details?.[String(currentQuestion?.id)];
  const userAnswer = selectedAnswers[String(currentQuestion?.id)];

  return (
    <AppShell
      title="Accredited Diagnostic Assessment"
      subtitle="Evaluates official competencies, records proficiency scores, and automatically promotes competency levels upon reaching 70% benchmark."
    >
      {/* Quiz Configuration Bar */}
      <div className="mb-5 rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Source Document / Manual</span>
              <select
                value={selectedDocId ?? ""}
                onChange={(e) => {
                  const id = e.target.value ? Number(e.target.value) : undefined;
                  setSelectedDocId(id);
                  const d = documents.find((doc) => doc.id === id);
                  if (d) setTopic(d.filename.replace(/\.[^/.]+$/, ""));
                }}
                className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
              >
                {documents.length ? (
                  documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.filename} ({doc.file_type.toUpperCase()})
                    </option>
                  ))
                ) : (
                  <option value="">No documents uploaded yet</option>
                )}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Target Competency / Topic</span>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Sampling, National Accounts, PLFS"
                className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--primary)]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Number of Questions</span>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
              >
                <option value={3}>3 Questions (Quick Diagnostic)</option>
                <option value={5}>5 Questions (Standard Evaluation)</option>
                <option value={10}>10 Questions (Comprehensive Benchmark)</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={isGenerating}
            className="h-10 rounded-md bg-[var(--primary)] px-5 text-xs font-bold text-white shadow-xs hover:bg-[var(--primary-hover)] transition disabled:opacity-60"
          >
            {isGenerating ? "Generating Assessment..." : "Generate AI Assessment"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-5 rounded-md border border-[var(--red)]/30 bg-[var(--badge-red-bg)] p-4 text-xs text-[var(--badge-red-text)]">
          {errorMsg}
        </div>
      )}

      {/* Main Assessment Container */}
      {questions.length === 0 ? (
        <div className="rounded-md border border-dashed border-[var(--border)] p-12 text-center bg-[var(--panel)] shadow-[var(--card-shadow)]">
          <RobotIcon className="mx-auto h-12 w-12 text-[var(--primary)]" />
          <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">Generate an Official Assessment</h2>
          <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] max-w-lg mx-auto leading-relaxed">
            Select a verified MoSPI / NSSTA manual above, then click &quot;Generate AI Assessment&quot; to test your official statistical competency.
          </p>
          {documents.length === 0 && (
            <div className="mt-5">
              <Link
                href="/documents"
                className="inline-flex rounded-md bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--primary-hover)] shadow-xs"
              >
                Upload Study Material First
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main Question / Assessment Panel */}
          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]">
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[var(--muted)]">
                <span>Assessment Progress</span>
                <span>Question {currentIndex + 1} of {questions.length} ({Math.round(((currentIndex + 1) / Math.max(questions.length, 1)) * 100)}%)</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-[var(--teal)] transition-all"
                  style={{ width: `${((currentIndex + 1) / Math.max(questions.length, 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="rounded-md bg-[var(--panel-inner)] border border-[var(--border-subtle)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)] font-semibold">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[var(--primary-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--primary)]">
                    Question {currentIndex + 1}
                  </span>
                  {currentQuestion?.competency_name && (
                    <span className="rounded bg-[var(--panel-soft)] border border-[var(--border-subtle)] px-2 py-0.5 text-[11px] font-medium text-[var(--foreground)]">
                      Competency: {currentQuestion.competency_name}
                    </span>
                  )}
                  {currentQuestion?.difficulty && (
                    <span className="text-[11px] text-[var(--muted)] uppercase font-semibold">
                      [{currentQuestion.difficulty}]
                    </span>
                  )}
                </div>

                {result && (
                  <span className={`inline-flex items-center gap-1.5 ${userAnswer === currentDetail?.correct ? "text-[var(--green-badge-text)] font-bold" : "text-[var(--badge-red-text)] font-bold"}`}>
                    {userAnswer === currentDetail?.correct ? <CheckIcon className="h-3.5 w-3.5" /> : <XIcon className="h-3.5 w-3.5" />}
                    <span>{userAnswer === currentDetail?.correct ? "Correct" : "Incorrect"}</span>
                  </span>
                )}
              </div>

              <h2 className="mt-4 text-base sm:text-lg font-bold leading-relaxed text-[var(--foreground)]">
                {currentQuestion?.question_text}
              </h2>

              <div className="mt-6 grid gap-3">
                {currentQuestion?.options.map((option, index) => {
                  const isSelected = selectedAnswers[String(currentQuestion.id)] === option;
                  const isSubmitted = Boolean(result);
                  const isCorrectOption = currentDetail && currentDetail.correct === option;

                  let borderClass = "border-[var(--border-subtle)] bg-[var(--panel)]";
                  if (isSubmitted) {
                    if (isCorrectOption) borderClass = "border-[var(--green)] bg-[var(--green-badge-bg)]";
                    else if (isSelected && !isCorrectOption) borderClass = "border-[var(--red)] bg-[var(--badge-red-bg)]";
                  } else if (isSelected) {
                    borderClass = "border-[var(--primary)] bg-[var(--primary-soft)]";
                  }

                  return (
                    <label
                      key={`${currentQuestion.id}-${option}`}
                      className={`flex min-h-12 items-center gap-3 rounded-md border px-4 text-xs sm:text-sm text-[var(--foreground)] transition cursor-pointer ${borderClass}`}
                    >
                      <input
                        type="radio"
                        disabled={isSubmitted}
                        name={`assessment-question-${currentQuestion.id}`}
                        checked={isSelected}
                        onChange={() =>
                          setSelectedAnswers((prev) => ({ ...prev, [String(currentQuestion.id)]: option }))
                        }
                        className="accent-[var(--primary)]"
                      />
                      <span className="font-bold text-[var(--muted)]">{String.fromCharCode(65 + index)}.</span>
                      <span className="flex-1 font-medium">{option}</span>
                      {isSubmitted && isCorrectOption && (
                        <span className="text-xs font-bold text-[var(--green-badge-text)]">Correct Answer</span>
                      )}
                    </label>
                  );
                })}
              </div>

              {/* Official Answer Explanation */}
              {result && currentDetail?.explanation && (
                <div className="mt-5 rounded-md border border-[var(--border-subtle)] bg-[var(--panel-soft)] p-4 text-xs leading-relaxed">
                  <span className="font-bold text-[var(--primary)] block mb-1">Official Methodology Note:</span>
                  <p className="text-[var(--foreground)]">{currentDetail.explanation}</p>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                className="rounded-md border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-2 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40 transition"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentIndex < questions.length - 1) {
                    setCurrentIndex((prev) => prev + 1);
                  } else if (!result) {
                    handleSubmit();
                  } else {
                    setCurrentIndex(0);
                  }
                }}
                className="rounded-md bg-[var(--primary)] px-5 py-2 text-xs font-bold text-white hover:bg-[var(--primary-hover)] transition shadow-xs"
              >
                {result
                  ? currentIndex === questions.length - 1
                    ? "Review From Beginning"
                    : "Next Question"
                  : currentIndex === questions.length - 1
                    ? isSubmitting
                      ? "Evaluating Assessment..."
                      : "Submit Official Assessment"
                    : "Next Question"}
              </button>
            </div>
          </section>

          {/* Right Sidebar: Questions Grid & Submission Results */}
          <aside className="space-y-5">
            <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">Assessment Overview</h2>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {questions.map((q, index) => {
                  const qNum = index + 1;
                  const isCurrent = index === currentIndex;
                  const isAnswered = Boolean(selectedAnswers[String(q.id)]);
                  const isSubmitted = Boolean(result);
                  const isCorrect = result?.correct_details?.[String(q.id)]?.correct === selectedAnswers[String(q.id)];

                  let statusBg = "bg-[var(--panel-soft)] text-[var(--muted)]";
                  if (isSubmitted) {
                    statusBg = isCorrect ? "bg-[var(--green-badge-bg)] text-[var(--green-badge-text)] font-bold" : "bg-[var(--badge-red-bg)] text-[var(--badge-red-text)] font-bold";
                  } else if (isAnswered) {
                    statusBg = "bg-[var(--primary-soft)] text-[var(--primary)] font-semibold";
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={`grid h-9 place-items-center rounded-md border text-xs font-bold transition ${
                        isCurrent ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/30" : "border-[var(--border-subtle)]"
                      } ${statusBg}`}
                    >
                      {qNum}
                    </button>
                  );
                })}
              </div>

              {/* Assessment Evaluation Breakdown */}
              {result && (
                <div className="mt-6 rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)] p-4 text-center">
                  <div className="text-3xl font-black text-[var(--foreground)]">{formatScore(result.score)}%</div>
                  <div className="mt-1 text-xs uppercase font-bold tracking-wider text-[var(--muted)]">
                    Diagnostic Score
                  </div>
                  <div className="mt-1 text-xs text-[var(--muted)]">
                    {result.correct_answers} of {result.total_questions} correct
                  </div>

                  {/* Level Upgrade Callout */}
                  {result.level_upgrades && result.level_upgrades.length > 0 && (
                    <div className="mt-4 rounded-md border border-[var(--green)]/40 bg-[var(--green-badge-bg)] p-3 text-left">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--green-badge-text)]">
                        <CheckIcon className="h-4 w-4 shrink-0" />
                        <span>Competency Promoted (+1 Level)!</span>
                      </div>
                      <p className="mt-1 text-[11px] text-[var(--green-badge-text)] leading-relaxed">
                        {result.level_upgrades.join(". ")}. Your official workforce competency level has been updated and recorded in the audit log.
                      </p>
                    </div>
                  )}

                  {/* Competency Breakdown Table */}
                  {result.competency_breakdown && result.competency_breakdown.length > 0 && (
                    <div className="mt-4 border-t border-[var(--border-subtle)] pt-3 text-left">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] block mb-2">
                        Competency Breakdown
                      </span>
                      <div className="space-y-2">
                        {result.competency_breakdown.map((cb, idx) => (
                          <div key={idx} className="rounded border border-[var(--border-subtle)] bg-[var(--panel)] p-2 text-xs">
                            <div className="flex items-center justify-between font-semibold text-[var(--foreground)]">
                              <span className="truncate max-w-[170px]">{cb.competency_name}</span>
                              <span className={cb.percentage >= 70 ? "text-[var(--green-badge-text)] font-bold" : "text-[var(--badge-red-text)] font-bold"}>
                                {formatScore(cb.percentage)}%
                              </span>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-[11px] text-[var(--muted)]">
                              <span>Level: L{cb.previous_level} → L{cb.new_level}</span>
                              <span className="font-semibold">{cb.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleGenerateRemedial}
                    disabled={isRemediating}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] py-2 text-xs font-bold text-white hover:bg-[var(--primary-hover)] transition shadow-xs"
                  >
                    <span>{isRemediating ? "Generating..." : "Generate Remedial Roadmap"}</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </button>

                  <Link
                    href="/courses"
                    className="mt-2 block w-full rounded-md border border-[var(--border)] bg-[var(--panel)] py-2 text-xs font-bold text-[var(--foreground)] hover:border-[var(--primary)] text-center transition"
                  >
                    View Targeted iGOT Courses
                  </Link>
                </div>
              )}
            </section>
          </aside>
        </div>
      )}
    </AppShell>
  );
}

export default function AssessmentsPage() {
  return (
    <Suspense fallback={null}>
      <AssessmentContent />
    </Suspense>
  );
}
