"use client";

import React from "react";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, ExternalLinkIcon, GovernmentIcon } from "./icons";

const CAPABILITIES = [
  {
    title: "Diagnostic Competency Mapping",
    status: "IMPLEMENTED",
    statusColor: "bg-[var(--green-badge-bg)] text-[var(--green-badge-text)] border-[var(--green)]/30",
    desc: "Evaluates statistical officers across inference, survey sampling, and data visualization against MoSPI cadre standards.",
  },
  {
    title: "Accredited Course Recommendation Engine",
    status: "IMPLEMENTED",
    statusColor: "bg-[var(--green-badge-bg)] text-[var(--green-badge-text)] border-[var(--green)]/30",
    desc: "Directly matches diagnosed officer gaps with catalogued course modules from the Mission Karmayogi curriculum.",
  },
  {
    title: "MoSPI Statistical Cadre Taxonomy",
    status: "IMPLEMENTED",
    statusColor: "bg-[var(--green-badge-bg)] text-[var(--green-badge-text)] border-[var(--green)]/30",
    desc: "Structured hierarchy covering Junior Statistical Officers (JSO), Statistical Officers (SO), and Senior Directors.",
  },
  {
    title: "Federated Civil Service SSO (JanParichay)",
    status: "PLANNED INTEGRATION",
    statusColor: "bg-[var(--badge-amber-bg)] text-[var(--badge-amber-text)] border-[var(--amber)]/30",
    desc: "Architecture planned for seamless authentication via National Single Sign-On (NSSO / JanParichay).",
  },
  {
    title: "e-HRMS Workforce Capability Ledger Sync",
    status: "PROPOSED INTEGRATION",
    statusColor: "bg-[var(--primary-soft)] text-[var(--primary)] border-[var(--primary)]/30",
    desc: "Proposed bi-directional webhook synchronization to update verified officer competency milestones.",
  },
];

export function IgotIntegrationSection() {
  return (
    <section id="igot-integration" className="py-16 border-t border-[var(--border)] bg-[var(--panel-warm)]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-xs font-bold text-[var(--primary)] shadow-xs">
            <GovernmentIcon className="h-4 w-4" />
            <span>Capacity Building Interoperability</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--foreground)] tracking-tight">
            Integrated with the iGOT Karmayogi Ecosystem
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--muted)] leading-relaxed">
            PragatiParikshan is designed as a specialized statistical diagnosis and intelligence layer that feeds role-targeted capability data into Mission Karmayogi Bharat&apos;s digital learning infrastructure.
          </p>
        </div>

        {/* Integration Flow Architecture Diagram */}
        <div className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 sm:p-8 shadow-[var(--card-shadow)]">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-4">
            Demonstrated Prototype Data Flow
          </div>

          <div className="grid gap-4 md:grid-cols-3 items-center">
            {/* Step 1: PragatiParikshan */}
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--panel-inner)] p-5">
              <div className="inline-block rounded bg-[var(--primary)] px-2 py-0.5 text-[10px] font-bold text-white mb-2">
                DIAGNOSIS ENGINE
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)]">PragatiParikshan Platform</h3>
              <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
                Dynamic skill diagnostics, role-based benchmark testing, and automated gap identification.
              </p>
              <div className="mt-3 text-[11px] font-semibold text-[var(--teal)]">
                Output: Diagnosed Gap Vector
              </div>
            </div>

            {/* Step 2: Intermediate Mapping Layer */}
            <div className="relative rounded-lg border-2 border-dashed border-[var(--primary)]/40 bg-[var(--primary-soft)] p-5">
              <div className="inline-block rounded bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold text-slate-900 mb-2">
                INTEROPERABILITY LAYER
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)]">Competency Taxonomy Matcher</h3>
              <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
                Algorithmic alignment of statistical gaps to accredited civil service course IDs &amp; learning units.
              </p>
              <div className="mt-3 text-[11px] font-semibold text-[var(--primary)]">
                Status: REST API &amp; JSON Schema
              </div>
            </div>

            {/* Step 3: iGOT Karmayogi */}
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--panel-inner)] p-5">
              <div className="inline-block rounded bg-[var(--green)] px-2 py-0.5 text-[10px] font-bold text-white mb-2">
                LEARNING ECOSYSTEM
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)]">iGOT Karmayogi Bharat</h3>
              <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
                Accredited course delivery, officer progress records, and official competency certification.
              </p>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-[var(--green)]">
                <span>External Platform</span>
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-4 text-xs text-[var(--muted)]">
            <span className="font-medium">
              Notice: This platform is a demonstration prototype for Smart India Hackathon. It does not claim official iGOT ownership.
            </span>
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 font-bold text-[var(--primary)] hover:underline"
            >
              <span>Explore Course Mappings</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Capability Status Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((cap) => (
            <div
              key={cap.title}
              className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`rounded px-2 py-0.5 text-[10px] font-black border ${cap.statusColor}`}>
                    {cap.status}
                  </span>
                  <CheckIcon className="h-4 w-4 text-[var(--green)]" />
                </div>
                <h4 className="text-sm font-bold text-[var(--foreground)] leading-snug">
                  {cap.title}
                </h4>
                <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
                  {cap.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
