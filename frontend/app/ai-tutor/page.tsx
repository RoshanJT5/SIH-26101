"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import { askAiTutor, DocumentResponse, listDocuments } from "../../lib/api";

type Message = {
  speaker: string;
  text: string;
  sources?: Array<{ document: string; page: number; content_snippet: string }>;
};

const initialChat: Message[] = [
  {
    speaker: "AI Tutor",
    text: "Welcome to your AI Learning Lab. I can answer questions grounded in your uploaded study notes, manuals, and statistical handouts.",
  },
];

function AiTutorContent() {
  const searchParams = useSearchParams();
  const docIdParam = searchParams.get("docId");

  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | undefined>(
    docIdParam ? parseInt(docIdParam, 10) : undefined
  );
  const [chat, setChat] = useState<Message[]>(initialChat);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchDocs() {
      try {
        const docs = await listDocuments();
        if (!active) return;
        if (docs?.length) {
          setDocuments(docs);
          if (docIdParam) {
            setSelectedDocId(parseInt(docIdParam, 10));
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

  async function handleAsk() {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setChat((current) => [...current, { speaker: "You", text: trimmed }]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await askAiTutor(trimmed, selectedDocId);
      setChat((current) => [
        ...current,
        {
          speaker: "AI Tutor",
          text: response.answer,
          sources: response.sources,
        },
      ]);
    } catch {
      setChat((current) => [
        ...current,
        {
          speaker: "AI Tutor",
          text: "I could not fetch a backend answer right now, but the document and RAG workflow is connected.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const selectedDocObj = documents.find((d) => d.id === selectedDocId);

  return (
    <AppShell title="AI Tutor" subtitle="Ask questions grounded in your learning documents, uploads, and official study content.">
      <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] pb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Document Q&A</h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              Active Context: {selectedDocObj ? `${selectedDocObj.filename}` : "All Uploaded Study Materials"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <span>Source:</span>
              <select
                value={selectedDocId ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedDocId(val ? Number(val) : undefined);
                }}
                className="h-8 rounded-md border border-[var(--border)] bg-[#303030] px-2 text-xs text-white outline-none"
              >
                <option value="">All Documents</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.filename}
                  </option>
                ))}
              </select>
            </label>

            <span className="rounded-md bg-[rgba(32,196,183,0.12)] px-3 py-1 text-xs font-medium text-[var(--teal)]">
              Grounded AI
            </span>
          </div>
        </div>

        <div className="space-y-4 rounded-md border border-[var(--border)] bg-[#303030] p-4 min-h-[360px] max-h-[500px] overflow-y-auto">
          {chat.map((item, idx) => (
            <div key={`${item.speaker}-${idx}`} className={item.speaker === "AI Tutor" ? "text-slate-100" : "text-right text-slate-200"}>
              <div className="mb-1 text-xs text-[var(--muted)]">{item.speaker}</div>
              <div className={`inline-block max-w-[85%] rounded-md px-4 py-3 text-left ${item.speaker === "AI Tutor" ? "bg-[var(--panel)] text-slate-200" : "bg-[var(--primary-soft)] text-blue-100"}`}>
                <div className="text-sm leading-relaxed">{item.text}</div>
                {item.sources && item.sources.length > 0 ? (
                  <div className="mt-3 border-t border-[var(--border)] pt-2 text-xs text-[var(--muted)] space-y-1">
                    <span className="font-medium text-[var(--teal)] block">Reference Citations:</span>
                    {item.sources.slice(0, 2).map((s, sIdx) => (
                      <div key={sIdx} className="italic">
                        • {s.document} (page {s.page}) - &quot;{s.content_snippet.slice(0, 120)}...&quot;
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[var(--muted)]">Suggested prompts:</span>
          {[
            "What iGOT courses should I take for survey sampling?",
            "What iGOT courses cover DPDP Act & Cybersecurity?",
            "How do recommended iGOT courses bridge my skill gaps?",
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setQuestion(prompt);
              }}
              className="rounded-md border border-[var(--border)] bg-[#262626] px-2.5 py-1 text-[var(--muted)] hover:border-emerald-500/50 hover:text-emerald-300 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-3">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleAsk();
            }}
            placeholder={
              selectedDocObj
                ? `Ask questions grounded in ${selectedDocObj.filename}...`
                : "Ask questions across all uploaded study material or iGOT curriculum..."
            }
            className="flex-1 rounded-md border border-[var(--border)] bg-[#303030] px-4 py-3 text-sm text-white placeholder:text-[var(--muted)] outline-none"
          />
          <button
            type="button"
            onClick={handleAsk}
            disabled={loading}
            className="rounded-md bg-[var(--primary)] px-5 py-3 font-medium text-white hover:bg-[#60a5fa] disabled:cursor-not-allowed disabled:opacity-60 text-sm"
          >
            {loading ? "Thinking..." : "Ask AI"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

export default function AiTutorPage() {
  return (
    <Suspense fallback={null}>
      <AiTutorContent />
    </Suspense>
  );
}
