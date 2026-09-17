"use client";

import React from "react";
import Link from "next/link";
import { AccessibilityBar } from "../components/accessibility-bar";
import { InstitutionalHeader } from "../components/institutional-header";
import { InstitutionalFooter } from "../components/institutional-footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      <AccessibilityBar />
      <InstitutionalHeader />

      <main id="main-content" className="flex-1 py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-[var(--muted)] flex items-center gap-2">
            <Link href="/" className="hover:text-[var(--primary)]">Home</Link>
            <span>›</span>
            <span className="font-semibold text-[var(--foreground)]">Terms of Use</span>
          </nav>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 sm:p-10 shadow-[var(--card-shadow)]">
            <span className="inline-block rounded bg-[var(--primary-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] mb-3">
              Prototype Demonstration Agreement
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
              Terms &amp; Conditions of Use
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[var(--muted)]">
              Last Updated: September 2026 • SIH 2026 Prototype Demonstration
            </p>

            <div className="mt-8 space-y-6 text-xs sm:text-sm leading-relaxed text-[var(--foreground)]/90">
              <section className="space-y-2">
                <h2 className="text-base font-bold text-[var(--foreground)]">1. Acceptance of Terms</h2>
                <p className="text-[var(--muted)]">
                  By accessing and testing PragatiParikshan, evaluators, officers, and visitors agree to the operational boundaries of this hackathon demonstration prototype.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[var(--foreground)]">2. Non-Production &amp; Demonstration Scope</h2>
                <p className="text-[var(--muted)]">
                  The platform is built to evaluate technical feasibility for MoSPI problem statement SIH26101. Diagnostic questions, scoring metrics, and course linkages represent prototype simulations and should not be considered binding government civil service evaluations.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[var(--foreground)]">3. Appropriate Use</h2>
                <p className="text-[var(--muted)]">
                  Users agree not to attempt unauthorized penetration testing, automated scraping, or data injection into the demonstration backend services.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[var(--foreground)]">4. Intellectual Property</h2>
                <p className="text-[var(--muted)]">
                  The software architecture, diagnostic models, and user experience components are submitted under the rules and guidelines of the Smart India Hackathon 2026.
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
