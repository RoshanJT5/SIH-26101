"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "../components/app-shell";
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
    <AppShell title="Documents" subtitle="Upload learning material and let the AI tutor answer questions grounded in your source files.">
      <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Uploaded materials</h2>
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[#60a5fa] disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload file"}
          </button>
          <input ref={inputRef} type="file" accept=".pdf,.docx,.pptx,.txt" className="hidden" onChange={handleUpload} />
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">Loading uploaded materials...</div>
        ) : documents.length === 0 ? (
          <div className="rounded-md border border-dashed border-[var(--border)] p-12 text-center">
            <span className="text-3xl">📄</span>
            <h3 className="mt-3 text-base font-semibold text-white">No documents uploaded yet</h3>
            <p className="mt-1 text-sm text-[var(--muted)] max-w-md mx-auto">
              Upload official PDFs, DOCX, or PPTX training manuals to enable grounded AI tutoring and quiz generation.
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-4 rounded-md bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[#60a5fa]"
            >
              Upload your first document
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc, index) => (
              <div key={`doc-${doc.id ?? doc.name}-${index}`} className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[#303030] p-4">
                <div>
                  <div className="text-base font-medium text-white">{doc.name}</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">{doc.type} / Uploaded {doc.uploaded}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUseInAiTutor(doc)}
                    className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-slate-200 hover:border-[var(--teal)]"
                  >
                    Use in AI tutor
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerateQuiz(doc)}
                    className="rounded-md bg-[#14331f] px-3 py-1.5 text-sm font-medium text-[#37d46f] hover:bg-[#174026]"
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
