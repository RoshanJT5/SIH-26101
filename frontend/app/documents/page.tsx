"use client";

import { useRef, useState } from "react";
import { AppShell } from "../components/app-shell";
import { uploadDocument } from "../../lib/api";

const initialDocuments = [
  { name: "Policy Framework.pdf", type: "PDF", uploaded: "2 days ago" },
  { name: "Data Governance Notes.docx", type: "DOCX", uploaded: "5 days ago" },
  { name: "Survey Methods deck.pptx", type: "PPTX", uploaded: "1 week ago" },
];

export default function DocumentsPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [documents, setDocuments] = useState(initialDocuments);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const response = await uploadDocument(file);
      setDocuments((current) => [
        { name: response.filename, type: response.file_type.toUpperCase(), uploaded: "just now" },
        ...current,
      ]);
    } catch {
      setDocuments((current) => [{ name: file.name, type: file.name.split(".").pop()?.toUpperCase() ?? "FILE", uploaded: "just now" }, ...current]);
    } finally {
      event.target.value = "";
    }
  }

  return (
    <AppShell title="Documents" subtitle="Upload learning material and let the AI tutor answer questions grounded in your source files.">
      <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Uploaded materials</h2>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[#60a5fa]"
          >
            Upload file
          </button>
          <input ref={inputRef} type="file" className="hidden" onChange={handleUpload} />
        </div>

        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={`${doc.name}-${doc.uploaded}`} className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[#303030] p-4">
              <div>
                <div className="text-base font-medium text-white">{doc.name}</div>
                <div className="mt-1 text-xs text-[var(--muted)]">{doc.type} / Uploaded {doc.uploaded}</div>
              </div>
              <button className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-slate-200 hover:border-[var(--teal)]">
                Use in AI tutor
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
