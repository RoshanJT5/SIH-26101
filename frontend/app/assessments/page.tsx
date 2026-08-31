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
  QuizSubmitResponse,
  submitQuiz,
} from "../../lib/api";

type QuestionItem = {
  id: number;
  question_text: string;
  options: string[];
};

function AssessmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docIdParam = searchParams.get("docId");

  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | undefined>(
    docIdParam ? parseInt(docIdParam, 10) : undefined
  );
  const [topic, setTopic] = useState("Survey Sampling & Statistical Inference");
  const [numQuestions, setNumQuestions] = useState(5);

  const [quizId, setQuizId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
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

    async function fetchDocuments() {
      try {
        const docs = await listDocuments();
        if (!active) return;
        if (docs && docs.length > 0) {
          setDocuments(docs);
          if (docIdParam) {
            const parsed = parseInt(docIdParam, 10);
            setSelectedDocId(parsed);
            const found = docs.find((d) => d.id === parsed);
            if (found) setTopic(found.filename.replace(/\.[^/.]+$/, ""));
          } else {
            setSelectedDocId(docs[0].id);
            setTopic(docs[0].filename.replace(/\.[^/.]+$/, ""));
          }
        }
      } catch {
        // preserve
      }
    }

    fetchDocuments();
    return () => {
      active = false;
    };
  }, [docIdParam]);

  // Initial load: generate initial quiz on mount
  useEffect(() => {
    let active = true;

    async function initialGen() {
      try {
        const data = await generateQuiz({
          document_id: docIdParam ? parseInt(docIdParam, 10) : undefined,
          competency_name: "Survey Sampling Methodology & Statistical Inference",
          num_questions: 5,
        });

        if (!active) return;
        if (data && data.questions?.length) {
          setQuizId(data.quiz_id ?? data.id ?? null);
          setQuestions(
            data.questions.map((item) => ({
              id: item.id,
              question_text: item.question_text,
              options: item.options,
            }))
          );
        }
      } catch {
        // preserve fallback questions
      }
    }

    initialGen();
    return () => {
      active = false;
    };
  }, [docIdParam]);

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
        setQuestions(
          data.questions.map((item) => ({
            id: item.id,
            question_text: item.question_text,
            options: item.options,
          }))
        );
      }
    } catch {
      setErrorMsg("Failed to generate quiz. Please verify that the selected document has been processed.");
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

  // Check correctness of options for post-submission review
  const currentDetail = result?.correct_details?.[String(currentQuestion?.id)];
  const userAnswer = selectedAnswers[String(currentQuestion?.id)];

  return (
    <AppShell
      title="Accredited Skill Assessment"
      subtitle={`Question ${currentIndex + 1} of ${questions.length}. Validate current competency and feed verified results into your workforce record.`}
    >
      {/* Quiz Configuration & Document Selector Bar */}
      <div className="mb-5 rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Source Document</span>
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
              <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Topic / Domain</span>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Sampling, Visualization, Inference"
                className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--primary)]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Question Count</span>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={isGenerating}
            className="h-10 rounded-md bg-[var(--primary)] px-4 text-xs font-bold text-white shadow-xs hover:bg-[var(--primary-hover)] transition disabled:opacity-60"
          >
            {isGenerating ? "Generating..." : "Generate from Document"}
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
          <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">Generate an AI Assessment</h2>
          <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] max-w-lg mx-auto leading-relaxed">
            Select an uploaded study document or manual above, then click &quot;Generate from Document&quot; to produce grounded multiple-choice questions aligned with your official curriculum.
          </p>
          {documents.length === 0 && (
            <div className="mt-5">
              <Link
                href="/documents"
                className="inline-flex rounded-md bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--primary-hover)] shadow-xs"
              >
                Upload Study Document First
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]">
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[var(--muted)]">
                <span>Assessment Progress</span>
                <span>{Math.round(((currentIndex + 1) / Math.max(questions.length, 1)) * 100)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-[var(--teal)] transition-all"
                  style={{ width: `${((currentIndex + 1) / Math.max(questions.length, 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="rounded-md bg-[var(--panel-inner)] border border-[var(--border-subtle)] p-5">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] font-semibold">
                <span>Question {currentIndex + 1}</span>
                {result && (
                  <span className={`inline-flex items-center gap-1.5 ${userAnswer === currentDetail?.correct ? "text-[var(--green-badge-text)] font-bold" : "text-[var(--badge-red-text)] font-bold"}`}>
                    {userAnswer === currentDetail?.correct ? <CheckIcon className="h-3.5 w-3.5" /> : <XIcon className="h-3.5 w-3.5" />}
                    <span>{userAnswer === currentDetail?.correct ? "Correct" : "Incorrect"}</span>
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-lg font-bold leading-relaxed text-[var(--foreground)]">
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

              {/* Answer Explanation Display */}
              {result && currentDetail?.explanation && (
                <div className="mt-5 rounded-md border border-[var(--border-subtle)] bg-[var(--panel-soft)] p-4 text-xs leading-relaxed">
                  <span className="font-bold text-[var(--primary)] block mb-1">Official Explanation:</span>
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
                className="rounded-md bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--primary-hover)] transition shadow-xs"
              >
                {result
                  ? currentIndex === questions.length - 1
                    ? "Review First Question"
                    : "Next Question"
                  : currentIndex === questions.length - 1
                    ? isSubmitting
                      ? "Evaluating..."
                      : "Submit Assessment"
                    : "Next Question"}
              </button>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]">
              <h2 className="text-base font-bold text-[var(--foreground)]">Questions Grid</h2>
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

              {result && (
                <div className="mt-6 rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)] p-4 text-center">
                  <div className="text-3xl font-black text-[var(--foreground)]">{result.score}%</div>
                  <div className="mt-1 text-xs uppercase font-bold tracking-wider text-[var(--muted)]">Verified Score</div>
                  <div className="mt-2 text-xs text-[var(--muted)]">
                    {result.correct_answers} of {result.total_questions} questions answered correctly
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateRemedial}
                    disabled={isRemediating}
                    className="mt-4 w-full rounded-md bg-[var(--green-badge-bg)] border border-[var(--green)]/30 py-2 text-xs font-bold text-[var(--green-badge-text)] hover:opacity-90 transition shadow-xs"
                  >
                    <span>{isRemediating ? "Generating Roadmap..." : "Generate Remedial Roadmap"}</span>
                    {!isRemediating && <ArrowRightIcon className="h-3.5 w-3.5" />}
                  </button>
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
