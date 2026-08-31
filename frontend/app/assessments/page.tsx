"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import {
  DocumentResponse,
  generateQuiz,
  generateRemediationRoadmap,
  getCurrentUserId,
  listDocuments,
  QuizSubmitResponse,
  submitQuiz,
} from "../../lib/api";

type QuizQuestionState = {
  id: number;
  question_text: string;
  options: string[];
};

function AssessmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docIdParam = searchParams.get("docId");

  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | undefined>(
    docIdParam ? parseInt(docIdParam, 10) : undefined
  );
  const [topic, setTopic] = useState("Official Statistical Sampling");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(5);

  const [questions, setQuestions] = useState<QuizQuestionState[]>([]);
  const [quizId, setQuizId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRemediating, setIsRemediating] = useState(false);

  // Load documents list
  useEffect(() => {
    let active = true;

    async function fetchDocs() {
      try {
        const docs = await listDocuments();
        if (!active) return;
        if (docs?.length) {
          setDocuments(docs);
          if (docIdParam) {
            const found = docs.find((d) => d.id === parseInt(docIdParam, 10));
            if (found) {
              setSelectedDocId(found.id);
              setTopic(found.filename.replace(/\.[^/.]+$/, ""));
            }
          } else {
            setSelectedDocId(docs[0].id);
            setTopic(docs[0].filename.replace(/\.[^/.]+$/, ""));
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
  }, [docIdParam]);

  // Generate quiz handler
  async function handleGenerateNewQuiz(docIdToUse = selectedDocId, topicToUse = topic) {
    if (!docIdToUse) {
      setErrorMsg("Please upload or select a document to generate a grounded assessment.");
      return;
    }
    setIsGenerating(true);
    setResult(null);
    setSelectedAnswers({});
    setCurrentIndex(0);
    setErrorMsg(null);

    try {
      const response = await generateQuiz(docIdToUse, topicToUse, numQuestions, difficulty);
      if (response?.id) {
        setQuizId(response.id);
      }
      if (response?.questions?.length) {
        setQuestions(
          response.questions.map((item) => ({
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
      title="Assessment: Statistical Methods"
      subtitle={`Question ${currentIndex + 1} of ${questions.length}. Validate current competency and feed results back into your skill map.`}
    >
      {/* Quiz Configuration & Document Selector Bar */}
      <div className="mb-5 rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs text-[var(--muted)]">Source Document</span>
              <select
                value={selectedDocId ?? ""}
                onChange={(e) => {
                  const id = e.target.value ? Number(e.target.value) : undefined;
                  setSelectedDocId(id);
                  const d = documents.find((doc) => doc.id === id);
                  if (d) setTopic(d.filename.replace(/\.[^/.]+$/, ""));
                }}
                className="h-10 w-full rounded-md border border-[var(--border)] bg-[#303030] px-3 text-xs text-white outline-none"
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
              <span className="mb-1 block text-xs text-[var(--muted)]">Assessment Topic</span>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Sampling, Data Cleaning"
                className="h-10 w-full rounded-md border border-[var(--border)] bg-[#303030] px-3 text-xs text-white placeholder:text-[var(--muted)] outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs text-[var(--muted)]">Difficulty & Size</span>
              <div className="flex gap-2">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="h-10 flex-1 rounded-md border border-[var(--border)] bg-[#303030] px-2 text-xs text-white outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="h-10 w-16 rounded-md border border-[var(--border)] bg-[#303030] px-2 text-xs text-white outline-none"
                >
                  <option value={3}>3 Qs</option>
                  <option value={5}>5 Qs</option>
                  <option value={10}>10 Qs</option>
                </select>
              </div>
            </label>
          </div>

          <button
            type="button"
            disabled={isGenerating || !selectedDocId}
            onClick={() => handleGenerateNewQuiz()}
            className="h-10 rounded-md bg-[var(--primary)] px-4 text-xs font-semibold text-white hover:bg-[#60a5fa] disabled:opacity-50 shrink-0"
          >
            {isGenerating ? "Generating..." : "Generate from Document"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-5 rounded-md border border-red-500/30 bg-red-950/20 p-4 text-xs text-red-300">
          {errorMsg}
        </div>
      )}

      {questions.length === 0 ? (
        <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-12 text-center">
          <span className="text-4xl">📝</span>
          <h2 className="mt-4 text-xl font-semibold text-white">Generate an AI Assessment</h2>
          <p className="mt-2 text-sm text-[var(--muted)] max-w-lg mx-auto leading-relaxed">
            Select an uploaded study document or manual above, then click &quot;Generate from Document&quot; to produce grounded multiple-choice questions aligned with your official curriculum.
          </p>
          {documents.length === 0 && (
            <div className="mt-5">
              <Link
                href="/documents"
                className="inline-flex rounded-md bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[#60a5fa]"
              >
                Upload Study Document First
              </Link>
            </div>
          )}
        </div>
      ) : (
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm text-[var(--muted)]">
              <span>Progress</span>
              <span>{Math.round(((currentIndex + 1) / Math.max(questions.length, 1)) * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-[#3a3a3a]">
              <div
                className="h-2 rounded-full bg-[var(--teal)] transition-all"
                style={{ width: `${((currentIndex + 1) / Math.max(questions.length, 1)) * 100}%` }}
              />
            </div>
          </div>

          <div className="rounded-md bg-[#303030] p-5">
            <div className="flex items-center justify-between text-sm text-[var(--muted)]">
              <span>Question {currentIndex + 1}</span>
              {result && (
                <span className={userAnswer === currentDetail?.correct ? "text-[#37d46f]" : "text-[#ff8f8f]"}>
                  {userAnswer === currentDetail?.correct ? "✓ Correct" : "✗ Incorrect"}
                </span>
              )}
            </div>
            <h2 className="mt-3 text-xl font-semibold leading-8 text-white">
              {currentQuestion?.question_text}
            </h2>

            <div className="mt-6 grid gap-3">
              {currentQuestion?.options.map((option, index) => {
                const isSelected = selectedAnswers[String(currentQuestion.id)] === option;
                const isSubmitted = Boolean(result);
                const isCorrectOption = currentDetail && currentDetail.correct === option;

                let borderClass = "border-[var(--border)]";
                if (isSubmitted) {
                  if (isCorrectOption) borderClass = "border-[#37d46f] bg-[#14331f]/30";
                  else if (isSelected && !isCorrectOption) borderClass = "border-[#ff8f8f] bg-[#3a2020]/30";
                } else if (isSelected) {
                  borderClass = "border-[var(--teal)]";
                }

                return (
                  <label
                    key={`${currentQuestion.id}-${option}`}
                    className={`flex min-h-12 items-center gap-3 rounded-md border bg-[var(--panel)] px-4 text-sm text-white transition cursor-pointer ${borderClass}`}
                  >
                    <input
                      type="radio"
                      disabled={isSubmitted}
                      name={`assessment-question-${currentQuestion.id}`}
                      checked={isSelected}
                      onChange={() =>
                        setSelectedAnswers((prev) => ({ ...prev, [String(currentQuestion.id)]: option }))
                      }
                      className="accent-[var(--teal)]"
                    />
                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                    <span className="flex-1">{option}</span>
                    {isSubmitted && isCorrectOption && (
                      <span className="text-xs font-semibold text-[#37d46f]">Correct Answer</span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Answer Explanation Display */}
            {result && currentDetail?.explanation && (
              <div className="mt-5 rounded-md border border-[var(--border)] bg-[#232323] p-4 text-xs leading-5">
                <span className="font-semibold text-[var(--teal)] block mb-1">Official Explanation:</span>
                <p className="text-[var(--muted)]">{currentDetail.explanation}</p>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              className="rounded-md border border-[var(--border)] bg-[#303030] px-4 py-2 text-sm font-medium text-white hover:border-[var(--teal)] disabled:cursor-not-allowed disabled:opacity-40"
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
              className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#60a5fa]"
            >
              {result
                ? currentIndex === questions.length - 1
                  ? "Review First"
                  : "Next"
                : currentIndex === questions.length - 1
                  ? isSubmitting
                    ? "Evaluating..."
                    : "Submit Assessment"
                  : "Next"}
            </button>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <h2 className="text-lg font-semibold text-white">Questions</h2>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {questions.map((q, index) => {
                const qNum = index + 1;
                const isCurrent = index === currentIndex;
                const isAnswered = Boolean(selectedAnswers[String(q.id)]);
                const isSubmitted = Boolean(result);
                const isCorrect = result?.correct_details?.[String(q.id)]?.correct === selectedAnswers[String(q.id)];

                let statusBg = "bg-[#303030] text-[var(--muted)]";
                if (isSubmitted) {
                  statusBg = isCorrect ? "bg-[#14331f] text-[#37d46f]" : "bg-[#3a2020] text-[#ff8f8f]";
                } else if (isAnswered) {
                  statusBg = "bg-[#14331f] text-[#37d46f]";
                }

                return (
                  <button
                    key={qNum}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`grid h-10 place-items-center rounded-md text-sm transition ${statusBg} ${
                      isCurrent ? "ring-2 ring-[var(--teal)]" : ""
                    }`}
                  >
                    {qNum}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <h2 className="text-lg font-semibold text-white">
              {result ? "Assessment Score" : "Estimated Result"}
            </h2>
            <div className="mt-4 rounded-md bg-[#303030] p-4">
              <div className="text-3xl font-semibold text-white">
                {result ? `${Math.round(result.score)}%` : "82%"}
              </div>
              <div className="mt-1 text-sm text-[var(--muted)]">
                {result ? `${result.correct_answers} of ${result.total_questions} correct` : "Competency estimate"}
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              {result
                ? result.feedback
                : "Current answers suggest strong statistical concepts and a moderate inference gap."}
            </p>

            {result && result.score < 75 ? (
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={handleGenerateRemedial}
                  disabled={isRemediating}
                  className="w-full rounded-md bg-[#14331f] px-4 py-2 text-sm font-semibold text-[#37d46f] hover:bg-[#174026] disabled:opacity-60"
                >
                  {isRemediating ? "Building Remediation Plan..." : "Generate Remedial Plan"}
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateNewQuiz()}
                  className="w-full rounded-md border border-[var(--border)] bg-[#303030] px-4 py-2 text-xs font-medium text-white hover:border-[var(--teal)]"
                >
                  Retake Assessment
                </button>
              </div>
            ) : result ? (
              <div className="mt-4 space-y-2">
                <div className="rounded-md bg-[#14331f] p-3 text-xs text-[#37d46f] text-center">
                  Competency Level Upgraded +1
                </div>
                <button
                  type="button"
                  onClick={() => handleGenerateNewQuiz()}
                  className="w-full rounded-md border border-[var(--border)] bg-[#303030] px-4 py-2 text-xs font-medium text-white hover:border-[var(--teal)]"
                >
                  Take Another Assessment
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="mt-4 w-full rounded-md bg-[#14331f] px-4 py-2 text-sm font-semibold text-[#37d46f] hover:bg-[#174026] disabled:opacity-60"
              >
                {isSubmitting ? "Evaluating..." : "Submit Assessment"}
              </button>
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
      <AssessmentsContent />
    </Suspense>
  );
}
