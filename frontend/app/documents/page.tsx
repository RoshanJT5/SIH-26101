"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "../components/app-shell";
import { FileIcon } from "../components/icons";
import { listDocuments, uploadDocument } from "../../lib/api";

type DocItem = {
  id?: number;
  name: string;
  type: string;
  uploaded: string;
};

export default function DocumentsPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadDocs() {
      try {
        const response = await listDocuments();
        if (!active) return;
        if (response) {
          const mapped: DocItem[] = response.map((doc) => ({
            id: doc.id,
            name: doc.filename,
            type: doc.file_type.toUpperCase(),
            uploaded: doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : "recently",
          }));
          setDocuments(mapped);
        }
      } catch {
        if (active) setDocuments([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDocs();
    return () => {
      active = false;
    };
  }, []);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || uploading) return;
    setUploading(true);

    try {
      const response = await uploadDocument(file);
      if (response?.id) {
        setDocuments((prev) => [
          {
            id: response.id,
            name: response.filename,
            type: response.file_type.toUpperCase(),
            uploaded: "Just now",
          },
          ...prev,
        ]);
      }
    } catch {
      // upload error handled
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleUseInAiTutor(doc: DocItem) {
    if (doc.id) {
      router.push(`/ai-tutor?docId=${doc.id}`);
    } else {
      router.push(`/ai-tutor`);
    }
  }

  function handleGenerateQuiz(doc: DocItem) {
    if (doc.id) {
      router.push(`/assessments?docId=${doc.id}`);
    } else {
      router.push(`/assessments`);
    }
  }

  return (
    <AppShell title="Documents Repository" subtitle="Upload learning manuals and let the AI tutor answer questions grounded in your official files.">
      <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]">
        <div className="mb-6 flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">Uploaded Training Materials</h2>
            <p className="mt-0.5 text-xs text-[var(--muted)]">Study documents used for RAG grounding and AI assessments.</p>
          </div>
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--primary-hover)] disabled:opacity-60 transition shadow-xs"
          >
            {uploading ? "Uploading..." : "+ Upload File"}
          </button>
          <input ref={inputRef} type="file" accept=".pdf,.docx,.pptx,.txt" className="hidden" onChange={handleUpload} />
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs sm:text-sm text-[var(--muted)]">Loading uploaded materials...</div>
        ) : documents.length === 0 ? (
          <div className="rounded-md border border-dashed border-[var(--border)] p-12 text-center">
            <FileIcon className="mx-auto h-12 w-12 text-[var(--muted)]" />
            <h3 className="mt-3 text-base font-bold text-[var(--foreground)]">No documents uploaded yet</h3>
            <p className="mt-1 text-xs sm:text-sm text-[var(--muted)] max-w-md mx-auto leading-relaxed">
              Upload official PDFs, DOCX, or PPTX training manuals to enable grounded AI tutoring and automated quiz generation.
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-4 rounded-md bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--primary-hover)] transition shadow-xs"
            >
              Upload Your First Document
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc, index) => (
              <div key={`doc-${doc.id ?? doc.name}-${index}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)] p-4 transition hover:border-[var(--primary)]">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-[var(--primary-soft)] text-lg font-bold text-[var(--teal)] shrink-0">
                    <FileIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[var(--foreground)]">{doc.name}</div>
                    <div className="mt-0.5 text-xs text-[var(--muted)]">
                      <span className="rounded bg-[var(--panel-soft)] px-1.5 py-0.5 font-bold text-[var(--teal)] border border-[var(--border-subtle)] mr-2">
                        {doc.type}
                      </span>
                      Uploaded {doc.uploaded}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleUseInAiTutor(doc)}
                    className="rounded-md border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--teal)] hover:text-[var(--teal)] transition"
                  >
                    Use in AI Tutor
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerateQuiz(doc)}
                    className="rounded-md bg-[var(--green-badge-bg)] border border-[var(--green)]/30 px-3 py-1.5 text-xs font-bold text-[var(--green-badge-text)] hover:opacity-90 transition shadow-xs"
                  >
                    Generate Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
