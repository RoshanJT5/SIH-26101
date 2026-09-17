"use client";

import React from "react";
import Link from "next/link";
import { AccessibilityBar } from "../components/accessibility-bar";
import { InstitutionalHeader } from "../components/institutional-header";
import { InstitutionalFooter } from "../components/institutional-footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      <AccessibilityBar />
      <InstitutionalHeader />

      <main id="main-content" className="flex-1 py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-[var(--muted)] flex items-center gap-2">
            <Link href="/" className="hover:text-[var(--primary)]">Home</Link>
            <span>›</span>
            <span className="font-semibold text-[var(--foreground)]">Privacy Policy</span>
          </nav>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 sm:p-10 shadow-[var(--card-shadow)]">
            <span className="inline-block rounded bg-[var(--primary-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] mb-3">
              Prototype Data Protection Framework
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
              Privacy Policy &amp; Data Governance
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[var(--muted)]">
              Last Updated: September 2026 • Compliant with Indian Digital Data Protection Principles
            </p>

            <div className="mt-8 space-y-6 text-xs sm:text-sm leading-relaxed text-[var(--foreground)]/90">
              <section className="space-y-2">
                <h2 className="text-base font-bold text-[var(--foreground)]">1. Purpose &amp; Scope</h2>
                <p className="text-[var(--muted)]">
                  PragatiParikshan is an academic and technological prototype developed for the Smart India Hackathon 2026 (Problem Statement SIH26101). This policy outlines how user information, diagnostic assessment responses, and competency records are managed within this demonstration environment.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[var(--foreground)]">2. Information Collected</h2>
                <p className="text-[var(--muted)]">
                  During registration and diagnostic evaluation, the platform collects:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[var(--muted)]">
                  <li>Officer identification details (Name, Government email, Cadre designation, Ministry wing).</li>
                  <li>Diagnostic assessment responses across statistical competency modules.</li>
                  <li>Derived proficiency scores and competency gap indicators.</li>
                  <li>Learning trajectory milestones and course interaction events.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[var(--foreground)]">3. How Data is Used</h2>
                <p className="text-[var(--muted)]">
                  Information is processed exclusively to:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[var(--muted)]">
                  <li>Generate individualized skill gap diagnoses and learning path recommendations.</li>
                  <li>Power the statistical AI tutor assistant with grounded context.</li>
                  <li>Produce anonymized, aggregated cadre capability reports for demonstration.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[var(--foreground)]">4. Data Sharing &amp; Retention</h2>
                <p className="text-[var(--muted)]">
                  No personal data is sold, rented, or commercialized. All demonstration records are retained securely in isolated prototype datastores and are expunged upon hackathon evaluation completion.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[var(--foreground)]">5. Prototype Notice &amp; Contact</h2>
                <p className="text-[var(--muted)]">
                  This prototype is not an official Government of India or MoSPI portal. For queries regarding prototype data handling, contact the development team through the official hackathon submission ledger.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <InstitutionalFooter />
    </div>
  );
}
