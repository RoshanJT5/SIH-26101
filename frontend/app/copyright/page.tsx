"use client";

import React from "react";
import Link from "next/link";
import { AccessibilityBar } from "../components/accessibility-bar";
import { InstitutionalHeader } from "../components/institutional-header";
import { InstitutionalFooter } from "../components/institutional-footer";

export default function CopyrightPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      <AccessibilityBar />
      <InstitutionalHeader />

      <main id="main-content" className="flex-1 py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-[var(--muted)] flex items-center gap-2">
            <Link href="/" className="hover:text-[var(--primary)]">Home</Link>
            <span>›</span>
            <span className="font-semibold text-[var(--foreground)]">Copyright Policy</span>
          </nav>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 sm:p-10 shadow-[var(--card-shadow)]">
            <span className="inline-block rounded bg-[var(--primary-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] mb-3">
              Prototype Content Attribution
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
              Copyright Policy &amp; Asset Attribution
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[var(--muted)]">
              Smart India Hackathon 2026 Prototype • Academic &amp; Demonstration Platform
            </p>

            <div className="mt-8 space-y-6 text-xs sm:text-sm leading-relaxed text-[var(--foreground)]/90">
              <section className="space-y-2">
                <h2 className="text-base font-bold text-[var(--foreground)]">1. Material Attribution</h2>
                <p className="text-[var(--muted)]">
                  The content featured on this demonstration website—including statistical classification guides (such as NIC-2008 and PLFS methodology references)—derives from publicly released Indian official statistical manuals published for public awareness and administrative training.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[var(--foreground)]">2. Educational &amp; Prototype Use</h2>
                <p className="text-[var(--muted)]">
                  All references to the Ministry of Statistics and Programme Implementation (MoSPI) and Mission Karmayogi are included strictly for hackathon problem-solving contextualization (SIH 2026 Problem Statement SIH26101) under fair-use and educational demonstration standards.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[var(--foreground)]">3. Software &amp; Codebase</h2>
                <p className="text-[var(--muted)]">
                  The proprietary code, user interface designs, and algorithmic scoring models developed by the student team for this hackathon entry are licensed under open educational terms for evaluation by Smart India Hackathon juries.
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
