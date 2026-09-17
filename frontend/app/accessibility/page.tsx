"use client";

import React from "react";
import Link from "next/link";
import { AccessibilityBar } from "../components/accessibility-bar";
import { InstitutionalHeader } from "../components/institutional-header";
import { InstitutionalFooter } from "../components/institutional-footer";

export default function AccessibilityStatementPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      <AccessibilityBar />
      <InstitutionalHeader />

      <main id="main-content" className="flex-1 py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-[var(--muted)] flex items-center gap-2">
            <Link href="/" className="hover:text-[var(--primary)]">Home</Link>
            <span>›</span>
            <span className="font-semibold text-[var(--foreground)]">Accessibility Statement</span>
          </nav>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 sm:p-10 shadow-[var(--card-shadow)]">
            <span className="inline-block rounded bg-[var(--primary-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] mb-3">
              Universal Access Commitment
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
              Accessibility Statement &amp; GIGW Conformance
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[var(--muted)]">
              Aligned with Guidelines for Indian Government Websites (GIGW 3.0) &amp; WCAG 2.1 Level AA
            </p>

            <div className="mt-8 space-y-6 text-xs sm:text-sm leading-relaxed text-[var(--foreground)]/90">
              <section className="space-y-2">
                <h2 className="text-base font-bold text-[var(--foreground)]">1. Commitment to Inclusion</h2>
                <p className="text-[var(--muted)]">
                  PragatiParikshan is engineered from the ground up to ensure civil servants and citizens with diverse abilities have equitable access to competency diagnosis, learning materials, and analytics. We design following the UX4G principles established for Indian public-sector digital platforms.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[var(--foreground)]">2. Conformance Standards</h2>
                <p className="text-[var(--muted)]">
                  The portal targets conformance with the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA and the Guidelines for Indian Government Websites (GIGW).
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[var(--foreground)]">3. Implemented Accessibility Features</h2>
                <ul className="list-disc pl-5 space-y-1.5 text-[var(--muted)]">
                  <li><strong>Skip to Main Content:</strong> An immediate, keyboard-accessible link bypasses repeated navigation bars.</li>
                  <li><strong>Text Sizing Controls:</strong> Instant text scale adjustment (A-, A, A+) directly modifies root rem calculations without breaking responsive grids.</li>
                  <li><strong>High-Contrast Visible Focus:</strong> Distinct 3px focus rings ensure keyboard navigability for interactive elements.</li>
                  <li><strong>Screen Reader Semantic Landmarks:</strong> Structured HTML5 elements (`header`, `main`, `nav`, `aside`, `footer`) and ARIA labels.</li>
                  <li><strong>Keyboard Accessible Components:</strong> All accordions, tab strips, and course carousels support standard arrow key and tab interactions.</li>
                  <li><strong>Color Contrast Ratios:</strong> Text content maintains a minimum contrast ratio of 4.5:1 against respective panel surfaces.</li>
                  <li><strong>Motion Restraint:</strong> Core UI transitions respect the `prefers-reduced-motion` operating system setting.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[var(--foreground)]">4. Feedback &amp; Assistance</h2>
                <p className="text-[var(--muted)]">
                  If you encounter any barrier while navigating this prototype with assistive technologies, please report the issue to the prototype evaluation team via the hackathon feedback channel.
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
