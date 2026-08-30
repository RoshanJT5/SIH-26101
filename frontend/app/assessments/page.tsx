"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import { DUMMY_USER_ID, generateQuiz, submitQuiz } from "../../lib/api";

const fallbackOptions = [
  "Simple random sampling",
  "Stratified sampling",
  "Convenience sampling",
  "Snowball sampling",
];

const nav = Array.from({ length: 20 }, (_, index) => index + 1);

export default function AssessmentsPage() {
  const [questions, setQuestions] = useState<{ id: number; question_text: string; options: string[] }[]>([
    {
      id: 1,
      question_text: "Which sampling method is most appropriate when separate estimates are required for rural and urban households?",
      options: fallbackOptions,
    },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; feedback: string } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadQuiz() {
      try {
        const response = await generateQuiz(1, "Sampling Methods", 5, "medium");
        if (!active) return;

        if (response?.questions?.length) {
          setQuestions(response.questions.map((item) => ({ id: item.id, question_text: item.question_text, options: item.options })));
        }
      } catch {
        // keep the current mock question if backend is unavailable
      }
    }

    loadQuiz();
    return () => {
      active = false;
    };
  }, []);

  const currentQuestion = questions[currentIndex];

  async function handleSubmit() {
    if (!currentQuestion) return;

    const payload = Object.fromEntries(
      Object.entries(selectedAnswers).filter(([key]) => Number(key) === currentQuestion.id || key === String(currentQuestion.id)),
    );

    try {
      const response = await submitQuiz(1, payload, DUMMY_USER_ID);
      setResult({ score: response.score, feedback: response.feedback });
    } catch {
      setResult({ score: 82, feedback: "Current answers suggest strong statistical concepts and a moderate inference gap." });
    }
  }

  return (
    <AppShell title="Assessment: Statistical Methods" subtitle="Question 4 of 20. Validate current competency and feed results back into your skill map.">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm text-[var(--muted)]">
              <span>Progress</span>
              <span>{Math.round(((currentIndex + 1) / Math.max(questions.length, 1)) * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-[#3a3a3a]">
              <div className="h-2 rounded-full bg-[var(--teal)]" style={{ width: `${((currentIndex + 1) / Math.max(questions.length, 1)) * 100}%` }} />
            </div>
          </div>

          <div className="rounded-md bg-[#303030] p-5">
            <div className="text-sm text-[var(--muted)]">Question {currentIndex + 1}</div>
            <h2 className="mt-3 text-xl font-semibold leading-8 text-white">
              {currentQuestion?.question_text}
            </h2>
            <div className="mt-6 grid gap-3">
              {currentQuestion?.options.map((option, index) => (
                <label
                  key={`${currentQuestion.id}-${option}`}
                  className="flex min-h-12 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--panel)] px-4 text-sm text-white transition hover:border-[var(--teal)]"
                >
                  <input
                    type="radio"
                    name={`assessment-question-${currentQuestion.id}`}
                    checked={selectedAnswers[String(currentQuestion.id)] === option}
                    onChange={() => setSelectedAnswers((prev) => ({ ...prev, [String(currentQuestion.id)]: option }))}
                    className="accent-[var(--teal)]"
                  />
                  <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                  <span>{option}</span>
                </label>
              ))}
            </div>
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
                } else {
                  handleSubmit();
                }
              }}
              className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#60a5fa]"
            >
              {currentIndex === questions.length - 1 ? "Submit" : "Next"}
            </button>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <h2 className="text-lg font-semibold text-white">Questions</h2>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {nav.map((item) => (
                <button
                  key={item}
                  className={`grid h-10 place-items-center rounded-md text-sm ${
                    item <= questions.length
                      ? "bg-[#14331f] text-[#37d46f]"
                      : "bg-[#303030] text-[var(--muted)]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>
          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <h2 className="text-lg font-semibold text-white">Estimated Result</h2>
            <div className="mt-4 rounded-md bg-[#303030] p-4">
              <div className="text-3xl font-semibold text-white">{result ? `${result.score}%` : "82%"}</div>
              <div className="mt-1 text-sm text-[var(--muted)]">Competency estimate</div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              {result ? result.feedback : "Current answers suggest strong statistical concepts and a moderate inference gap."}
            </p>
            <button type="button" onClick={handleSubmit} className="mt-4 w-full rounded-md bg-[#14331f] px-4 py-2 text-sm font-semibold text-[#37d46f]">
              Submit Assessment
            </button>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
