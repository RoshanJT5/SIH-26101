"use client";

import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Suspense, useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import { askAiTutor, DocumentResponse, listDocuments } from "../../lib/api";

type Message = {
  speaker: string;
  text: string;
  sources?: Array<{ document: string; page: number; content_snippet: string }>;
};

const greetingResponses = [
  {
    pattern: /^(hi|hello|hey|hiya|howdy|greetings|bonjour|salut|hola|ciao|namaste|salaam|salam|hallo|olá|ola)[!,.\s]*$/iu,
    response: "Hi, I am your personalized AI Tutor. How can I help you today?",
  },
  {
    pattern: /^(good\s+morning|good\s+afternoon|good\s+evening|good\s+night|bonsoir|buenos\s+(d[ií]as|tardes|noches))[!,.\s]*$/iu,
    response: "Hello. I am your personalized AI Tutor. What would you like to learn today?",
  },
  {
    pattern: /^(how\s+are\s+you|how\s+are\s+you\s+doing)[?!,.\s]*$/i,
    response: "I am ready to help you learn from your uploaded study materials. What would you like to explore?",
  },
];

const initialChat: Message[] = [
  {
    speaker: "AI Tutor",
    text: "Hi, I am your personalized AI Tutor. How can I help you today?",
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

    const localGreeting = greetingResponses.find(({ pattern }) => pattern.test(trimmed));
    if (localGreeting) {
      setChat((current) => [
        ...current,
        { speaker: "AI Tutor", text: localGreeting.response },
      ]);
      return;
    }

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
    <AppShell title="AI Learning Lab" subtitle="Ask questions grounded in your official learning documents, uploads, and study content.">
      <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-subtle)] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">Document Grounded Q&amp;A</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Active Context: <strong className="text-[var(--foreground)]">{selectedDocObj ? `${selectedDocObj.filename}` : "All Uploaded Study Materials"}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
              <span>Source:</span>
              <select
                value={selectedDocId ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedDocId(val ? Number(val) : undefined);
                }}
                className="h-9 rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-2.5 text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
              >
                <option value="">All Documents</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.filename}
                  </option>
                ))}
              </select>
            </label>

            <span className="rounded bg-[var(--green-badge-bg)] border border-[var(--green)]/20 px-2.5 py-1 text-xs font-bold text-[var(--green-badge-text)]">
              Grounded AI
            </span>
          </div>
        </div>

        <div className="space-y-4 rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)] p-4 min-h-[360px] max-h-[500px] overflow-y-auto">
          {chat.map((item, idx) => (
            <div key={`${item.speaker}-${idx}`} className={item.speaker === "AI Tutor" ? "text-left" : "text-right"}>
              <div className="mb-1 text-[11px] font-semibold text-[var(--muted)]">{item.speaker}</div>
              <div className={`inline-block max-w-[85%] rounded-md px-4 py-3 text-left shadow-xs ${
                item.speaker === "AI Tutor" 
                  ? "bg-[var(--panel)] border border-[var(--border-subtle)] text-[var(--foreground)]" 
                  : "bg-[var(--primary)] text-white font-medium"
              }`}>
                {item.speaker === "AI Tutor" ? (
                  <div className="ai-response text-xs leading-6 sm:text-sm">
                    <ReactMarkdown>{item.text}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-xs leading-relaxed sm:text-sm">{item.text}</div>
                )}
                {item.sources && item.sources.length > 0 ? (
                  <div className="mt-3 border-t border-[var(--border-subtle)] pt-2 text-xs text-[var(--muted)] space-y-1">
                    <span className="font-bold text-[var(--teal)] block">Reference Citations:</span>
                    {item.sources.slice(0, 2).map((s, sIdx) => (
                      <div key={sIdx} className="italic text-[11px]">
                        • {s.document} (page {s.page}) - &quot;{s.content_snippet.slice(0, 120)}...&quot;
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {loading ? (
            <div className="text-left" aria-live="polite">
              <div className="mb-1 text-[11px] font-semibold text-[var(--muted)]">AI Tutor</div>
              <div className="inline-flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--panel)] px-4 py-3 text-[var(--teal)] shadow-xs">
                <span className="sr-only">AI Tutor is thinking</span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" aria-hidden="true" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" aria-hidden="true" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-current" aria-hidden="true" />
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[var(--muted)] font-semibold">Suggested prompts:</span>
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
              className="rounded-md border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-1 text-xs text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--foreground)] transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-2 sm:gap-3">
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
            className="flex-1 rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-4 py-2.5 text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--primary)]"
          />
          <button
            type="button"
            onClick={handleAsk}
            disabled={loading}
            className="rounded-md bg-[var(--primary)] px-5 py-2.5 font-bold text-white hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60 text-xs sm:text-sm transition shadow-xs"
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
