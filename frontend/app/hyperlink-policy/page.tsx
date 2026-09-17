"use client";

import React from "react";
import Link from "next/link";
import { AccessibilityBar } from "../components/accessibility-bar";
import { InstitutionalHeader } from "../components/institutional-header";
import { InstitutionalFooter } from "../components/institutional-footer";

export default function HyperlinkPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      <AccessibilityBar />
      <InstitutionalHeader />

      <main id="main-content" className="flex-1 py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-[var(--muted)] flex items-center gap-2">
            <Link href="/" className="hover:text-[var(--primary)]">Home</Link>
            <span>›</span>
            <span className="font-semibold text-[var(--foreground)]">Hyperlinking Policy</span>
          </nav>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 sm:p-10 shadow-[var(--card-shadow)]">
            <span className="inline-block rounded bg-[var(--primary-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] mb-3">
              External Linkage Standards
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
              Hyperlinking Policy
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[var(--muted)]">
              GIGW 3.0 External Navigation &amp; Linking Disclosures
            </p>

            <div className="mt-8 space-y-6 text-xs sm:text-sm leading-relaxed text-[var(--foreground)]/90">
              <section className="space-y-2">
                <h2 className="text-base font-bold text-[var(--foreground)]">1. Links to External Portals</h2>
                <p className="text-[var(--muted)]">
                  Throughout this prototype platform, links to external portals (such as iGOT Karmayogi Bharat, Digital India, or the Smart India Hackathon portal) are provided for reference, context, and accreditation. When you follow an external link, you leave this prototype and become subject to the respective external website&apos;s privacy and security policies.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[var(--foreground)]">2. External Link Indicators</h2>
                <p className="text-[var(--muted)]">
                  In compliance with GIGW 3.0 and UX4G guidelines, external links are accompanied by an external link icon (↗) and explicit screen reader notices to alert users that they are departing the prototype application.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[var(--foreground)]">3. Inbound Linking to This Prototype</h2>
                <p className="text-[var(--muted)]">
                  Evaluation teams, mentors, and hackathon organizers are permitted to link directly to the homepage or public demonstration routes of this platform. We do not permit our pages to be loaded into frames on external sites without explicit context.
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
