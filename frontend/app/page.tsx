"use client";

import Link from "next/link";
import { ArrowRightIcon, CheckIcon, GovernmentIcon } from "./components/icons";
import { AccessibilityBar } from "./components/accessibility-bar";
import { InstitutionalHeader } from "./components/institutional-header";
import { StatStrip } from "./components/stat-strip";
import { IgotIntegrationSection } from "./components/igot-integration-section";
import { CourseCarousel } from "./components/course-carousel";
import { ResourceSection } from "./components/resource-section";
import { FaqAccordion } from "./components/faq-accordion";
import { InstitutionalFooter } from "./components/institutional-footer";

const competencyRows = [
  { label: "Statistical Inference & Probability", value: 82, target: 90, gap: 8, status: "On Track" },
  { label: "Data Analysis & Macroeconomic Modelling", value: 61, target: 85, gap: 24, status: "Moderate Gap" },
  { label: "Data Visualization & Official Dashboards", value: 42, target: 80, gap: 38, status: "Priority Gap" },
  { label: "Survey Sampling & CAPI Field Protocols", value: 73, target: 85, gap: 12, status: "Moderate Gap" },
  { label: "Statistical Quality Standards & Ethics", value: 51, target: 75, gap: 24, status: "Moderate Gap" },
];

const workflowSteps = [
  {
    step: "01",
    title: "Role Baseline Assessment",
    desc: "Rigorous diagnostic evaluation measuring officer competency across statistics, surveys, policy, and data governance.",
  },
  {
    step: "02",
    title: "Cadre Competency Mapping",
    desc: "Dynamic algorithmic benchmark of individual scores against MoSPI cadre standards and role requirements.",
  },
  {
    step: "03",
    title: "Personalized iGOT Trajectory",
    desc: "Automated recommendation of accredited Mission Karmayogi Bharat courses targeted to diagnosed priority gaps.",
  },
  {
    step: "04",
    title: "Milestone Audit & Reassessment",
    desc: "Verification of competency mastery feeding verified capability data back into the workforce development ledger.",
  },
];

const analytics = [
  { label: "Officers Assessed", value: "1,248", hint: "Active statistical cadre prototype cohort" },
  { label: "Learning Paths Active", value: "923", hint: "Across 18 statistical divisions" },
  { label: "Average Competency", value: "74%", hint: "Benchmark target threshold: 80%" },
  { label: "Priority Gaps Monitored", value: "17", hint: "Targeted with iGOT accredited modules" },
];

const updates = [
  {
    date: "17 Sep 2026",
    category: "Cadre Framework",
    title: "National Industrial Classification (NIC) competency module updated for 2026-27 cohort.",
  },
  {
    date: "12 Sep 2026",
    category: "iGOT Integration",
    title: "Added 42 accredited course mappings for Periodic Labour Force Survey (PLFS) methodologies.",
  },
  {
    date: "05 Sep 2026",
    category: "Diagnostic Engine",
    title: "Released multi-dimensional statistical gap analysis vector v2.4 for Senior Statistical Officers.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200 flex flex-col">
      {/* 1. GIGW / UX4G Accessibility Bar */}
      <AccessibilityBar />

      {/* 2. National Tricolour Accent Strip */}
      <div className="gov-tricolor-strip w-full" aria-hidden="true" />

      {/* 3. Institutional Government-Style Masthead */}
      <InstitutionalHeader />

      {/* 4. Main Hero Section */}
      <main id="main-content" className="flex-1">
        <section
          id="platform"
          className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-b from-[var(--panel-warm-soft)] via-[var(--panel-inner)] to-[var(--background)] py-12 lg:py-16"
        >
          <div className="mx-auto grid max-w-[1440px] gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] items-center">
            {/* Left Column: Mission & Institutional Pitch */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-xs font-bold text-[var(--accent)] mb-4 shadow-xs">
                <GovernmentIcon className="h-4 w-4 text-[var(--accent)]" />
                <span>Smart India Hackathon 2026 Prototype • MoSPI Statistical Challenge</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--foreground)] leading-[1.15]">
                Empowering India&apos;s Official Statistical Cadre Through Evidence-Based Capacity Building
              </h1>

              <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-[var(--muted)]">
                An intelligent national competency framework aligned with <strong>iGOT Karmayogi</strong>. Automatically diagnose role-specific skill gaps, personalize accredited training trajectories, and benchmark civil service capability for India&apos;s Official Statistical System.
              </p>

              {/* CTAs */}
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-6 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[var(--primary-hover)] transition"
                >
                  <span>Start Officer Assessment</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--panel)] px-6 text-xs sm:text-sm font-semibold text-[var(--foreground)] shadow-xs hover:border-[var(--primary)] transition"
                >
                  Explore Prototype Dashboard
                </Link>
              </div>

              {/* Feature Badges */}
              <div className="mt-8 flex flex-wrap gap-2 text-xs font-semibold">
                {[
                  "Role-to-Role Diagnostics",
                  "iGOT Karmayogi Synced",
                  "Accredited Evaluation",
                  "UX4G / GIGW Accessible",
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[var(--panel)] border border-[var(--border)] px-3 py-1.5 text-[var(--foreground)] shadow-xs"
                  >
                    <CheckIcon className="h-3.5 w-3.5 text-[var(--green)]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column: Live Officer Competency Profile Preview */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--card-shadow)]">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-[var(--primary-soft)] text-xl font-bold text-[var(--primary)] border border-[var(--border-subtle)]">
                    R
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[var(--foreground)]">Roshan JT5</h2>
                    <p className="text-xs text-[var(--muted)]">Statistical Officer • MoSPI Central Cadre</p>
                  </div>
                </div>
                <span className="rounded-md bg-[var(--green-badge-bg)] border border-[var(--green)]/20 px-2.5 py-1 text-xs font-bold text-[var(--green-badge-text)]">
                  82% Readiness Target
                </span>
              </div>

              {/* Competency Bars */}
              <div className="space-y-3">
                {competencyRows.slice(0, 4).map((row) => (
                  <div key={row.label} className="rounded-lg bg-[var(--panel-inner)] border border-[var(--border-subtle)] p-3">
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="font-semibold text-[var(--foreground)]">{row.label}</span>
                      <span className="text-[var(--muted)]">{row.value}% / Target {row.target}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-[var(--primary)] transition-all"
                        style={{ width: `${row.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Priority Callout */}
              <div className="mt-4 rounded-lg bg-[var(--panel-soft)] border border-[var(--border-subtle)] p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                    Priority Diagnostic Finding
                  </div>
                  <div className="text-xs font-bold text-[var(--foreground)]">
                    Data Visualization for Official Reports
                  </div>
                </div>
                <Link
                  href="/courses"
                  className="rounded-md bg-[var(--primary)] px-3 py-1.5 text-xs font-bold text-white hover:bg-[var(--primary-hover)] transition"
                >
                  View Course
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Context Metric Strip */}
        <StatStrip />

        {/* 6. About the Initiative Section */}
        <section id="about" className="py-16 bg-[var(--background)]">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)] border border-[var(--primary)]/20">
                  <span>Institutional Framework</span>
                </span>
                <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--foreground)] tracking-tight">
                  Modernizing the Capability of India&apos;s Statistical Infrastructure
                </h2>
                <p className="mt-4 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  India&apos;s Official Statistical System generates crucial macro-economic aggregates, national accounts, consumer price indices, and sample surveys (PLFS, ASI, NSS) that steer government policymaking.
                </p>
                <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  In line with the <strong>National Programme for Civil Services Capacity Building (Mission Karmayogi)</strong>, PragatiParikshan provides an evidence-based, competency-oriented diagnostic engine that replaces subjective training with data-driven skill gap mapping and personalized learning recommendations.
                </p>

                <div className="mt-6 space-y-2.5">
                  {[
                    "Cadre-benchmarked competency standards for JSOs, SOs, and Senior Directors.",
                    "Evidence-based assessment vectors covering 5 core statistical domains.",
                    "Seamless alignment with Mission Karmayogi accredited digital learning units.",
                  ].map((pt) => (
                    <div key={pt} className="flex items-start gap-2.5 text-xs text-[var(--foreground)]">
                      <CheckIcon className="h-4 w-4 text-[var(--green)] shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Three Core Pillars Cards */}
              <div className="space-y-4">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">Pillar 01</div>
                  <h3 className="text-base font-bold text-[var(--foreground)] mt-1">Diagnostic Precision</h3>
                  <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                    Automated testing vectors identify precise cognitive and procedural gaps in survey sampling, inference, and macroeconomic accounts.
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">Pillar 02</div>
                  <h3 className="text-base font-bold text-[var(--foreground)] mt-1">Targeted Karmayogi Learning</h3>
                  <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                    Officers are spared from generic course catalogs; the system directly recommends certified modules mapped to detected gaps.
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--green)]">Pillar 03</div>
                  <h3 className="text-base font-bold text-[var(--foreground)] mt-1">Verifiable Workforce Capability</h3>
                  <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                    Provides ministry leadership with real-time, anonymized capability analytics across regional statistical wings and cadres.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Continuous Competency Loop */}
        <section id="workflow" className="py-16 border-t border-[var(--border)] bg-[var(--panel-warm)]">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="rounded bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--primary)] border border-[var(--primary)]/20">
                Continuous Competency Loop
              </span>
              <h2 className="mt-3 text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
                From Diagnostic Assessment to Accredited Mastery
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[var(--muted)]">
                A 4-stage systematic capability development workflow designed for the Indian civil service statistical cadre.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {workflowSteps.map((step) => (
                <div
                  key={step.step}
                  className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--card-shadow)] flex flex-col justify-between hover:border-[var(--primary)]/50 transition-colors"
                >
                  <div>
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-sm font-black text-[var(--primary)] border border-[var(--border-subtle)]">
                      {step.step}
                    </div>
                    <h3 className="mt-4 text-base font-bold text-[var(--foreground)]">{step.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Dedicated iGOT Karmayogi Ecosystem Integration */}
        <IgotIntegrationSection />

        {/* 9. Official Competency Matrix & Gap Diagnostic Engine */}
        <section id="assessment" className="py-16 border-t border-[var(--border)] bg-[var(--background)]">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-start">
              {/* Competency Table */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--card-shadow)]">
                <div className="mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                    Diagnostic Benchmarking Engine
                  </span>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">Official Competency Matrix</h3>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Cadre proficiency scores compared against MoSPI national readiness thresholds
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="border-b border-[var(--border)] text-[var(--muted)]">
                      <tr>
                        <th className="pb-3 font-semibold">Competency Domain</th>
                        <th className="pb-3 font-semibold">Score</th>
                        <th className="pb-3 font-semibold">Target</th>
                        <th className="pb-3 font-semibold">Cadre Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {competencyRows.map((row) => (
                        <tr key={row.label}>
                          <td className="py-3.5 font-semibold text-[var(--foreground)]">{row.label}</td>
                          <td className="py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[var(--foreground)]">{row.value}%</span>
                              <div className="h-2 w-20 rounded-full bg-[var(--border)] overflow-hidden">
                                <div className="h-2 rounded-full bg-[var(--primary)]" style={{ width: `${row.value}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 text-[var(--muted)]">{row.target}%</td>
                          <td className="py-3.5">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                                row.gap > 30
                                  ? "bg-[var(--badge-red-bg)] text-[var(--badge-red-text)] border-[var(--red)]/20"
                                  : row.gap > 10
                                    ? "bg-[var(--badge-amber-bg)] text-[var(--badge-amber-text)] border-[var(--amber)]/20"
                                    : "bg-[var(--green-badge-bg)] text-[var(--green-badge-text)] border-[var(--green)]/20"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Personalized Trajectory & AI Recommendation */}
              <div className="space-y-5">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--card-shadow)]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-[var(--foreground)]">Personalized Trajectory</h3>
                    <span className="rounded bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--accent)] border border-[var(--accent)]/30">
                      iGOT Synced
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      "Data Visualization & Reporting / 72% Complete",
                      "Statistical Inference & Probability / 40% Complete",
                      "Survey Methodology & Sampling / Planned",
                    ].map((path, idx) => (
                      <div
                        key={path}
                        className="flex items-center gap-3 rounded-lg bg-[var(--panel-inner)] border border-[var(--border-subtle)] p-3 text-xs font-semibold text-[var(--foreground)]"
                      >
                        <span className="grid h-6 w-6 place-items-center rounded-md bg-[var(--primary)] text-xs font-bold text-white">
                          {idx + 1}
                        </span>
                        <span>{path}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-lg bg-[var(--green-badge-bg)] border border-[var(--green)]/20 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--green-badge-text)]">
                      AI Diagnostic Recommendation
                    </div>
                    <p className="mt-1 text-xs text-[var(--foreground)] leading-relaxed">
                      Prioritize <strong>Data Visualization for Official Reports</strong> to close your 38% priority gap before the upcoming survey dissemination cycle.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 10. Showcased Courses Horizontal Carousel */}
        <CourseCarousel />

        {/* 11. Cadre Capability Analytics Section */}
        <section id="analytics" className="py-16 border-t border-[var(--border)] bg-[var(--panel-inner)]">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
              {/* Metric Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                {analytics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--card-shadow)]"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      {metric.label}
                    </div>
                    <div className="mt-2 text-3xl font-black text-[var(--foreground)]">{metric.value}</div>
                    <div className="mt-1 text-[11px] text-[var(--muted)]">{metric.hint}</div>
                  </div>
                ))}
              </div>

              {/* Problem Solver Card */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 sm:p-8 shadow-[var(--card-shadow)]">
                <div className="inline-flex items-center gap-2 rounded bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold text-[var(--accent)] mb-3 border border-[var(--accent)]/30">
                  <span>Smart India Hackathon 2026</span>
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)]">MoSPI Problem Statement: SIH26101</h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[var(--muted)]">
                  A high-credibility digital service prototype delivering complete end-to-end capabilities: registration, diagnostic assessment, automated skill gap mapping, iGOT course recommendations, and grounded RAG AI assistance.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--primary)] px-5 text-xs font-bold text-white shadow-xs hover:bg-[var(--primary-hover)] transition"
                  >
                    Open Officer Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 12. Cadre Reference Library & Guidelines */}
        <ResourceSection />

        {/* 13. Latest Announcements & Cadre Updates */}
        <section id="updates" className="py-16 border-t border-[var(--border)] bg-[var(--background)]">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)] border border-[var(--primary)]/20">
                  Announcements
                </span>
                <h2 className="mt-2 text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
                  Latest Cadre &amp; Framework Updates
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[var(--muted)]">
                  Curriculum revisions, diagnostic releases, and capacity building milestones.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-xs divide-y divide-[var(--border-subtle)] overflow-hidden">
              {updates.map((item) => (
                <div key={item.title} className="p-5 sm:flex sm:items-center sm:justify-between gap-4 hover:bg-[var(--panel-soft)] transition">
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="shrink-0 rounded bg-[var(--panel-inner)] border border-[var(--border)] px-2.5 py-1 text-xs font-mono font-bold text-[var(--primary)]">
                      {item.date}
                    </span>
                    <div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] mr-2">
                        [{item.category}]
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-[var(--foreground)]">
                        {item.title}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 14. Frequently Asked Questions */}
        <FaqAccordion />
      </main>

      {/* 15. Institutional Public-Sector Footer */}
      <InstitutionalFooter />
    </div>
  );
}
