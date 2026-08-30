"use client";

import { useState } from "react";
import { AppShell } from "../components/app-shell";
import { askAiTutor } from "../../lib/api";

const initialChat = [
  { speaker: "AI Tutor", text: "Here is the summary of the uploaded policy note: the main emphasis is on evidence-driven monitoring and performance dashboards." },
  { speaker: "You", text: "Can you explain the difference between monitoring and evaluation in this context?" },
  { speaker: "AI Tutor", text: "Monitoring tracks indicators regularly, while evaluation assesses whether the intervention achieved measurable outcomes against objectives." },
];

export default function AiTutorPage() {
  const [chat, setChat] = useState(initialChat);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setChat((current) => [...current, { speaker: "You", text: trimmed }]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await askAiTutor(trimmed);
      setChat((current) => [...current, { speaker: "AI Tutor", text: response.answer }]);
    } catch {
      setChat((current) => [...current, { speaker: "AI Tutor", text: "I could not fetch a backend answer right now, but the document and RAG workflow is connected." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="AI Tutor" subtitle="Ask questions grounded in your learning documents, uploads, and official study content.">
      <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Document Q&A</h2>
          <span className="rounded-md bg-[rgba(32,196,183,0.12)] px-3 py-1 text-xs font-medium text-[var(--teal)]">
            Grounded AI
          </span>
        </div>

        <div className="space-y-4 rounded-md border border-[var(--border)] bg-[#303030] p-4">
          {chat.map((item) => (
            <div key={`${item.speaker}-${item.text}`} className={item.speaker === "AI Tutor" ? "text-slate-100" : "text-right text-slate-200"}>
              <div className="mb-1 text-xs text-[var(--muted)]">{item.speaker}</div>
              <div className={`inline-block max-w-[80%] rounded-md px-4 py-3 ${item.speaker === "AI Tutor" ? "bg-[var(--panel)] text-slate-200" : "bg-[var(--primary-soft)] text-blue-100"}`}>
                {item.text}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex gap-3">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleAsk();
            }}
            placeholder="Ask about your uploaded material..."
            className="flex-1 rounded-md border border-[var(--border)] bg-[#303030] px-4 py-3 text-white placeholder:text-[var(--muted)]"
          />
          <button
            type="button"
            onClick={handleAsk}
            disabled={loading}
            className="rounded-md bg-[var(--primary)] px-4 py-3 font-medium text-white hover:bg-[#60a5fa] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Asking..." : "Ask"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
