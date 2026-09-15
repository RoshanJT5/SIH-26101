"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRightIcon, CheckIcon, GovernmentIcon, TrendingUpIcon, UsersIcon, BookOpenIcon } from "./components/icons";
import { ThemeToggle } from "./components/theme-toggle";
import { getAuthSession } from "../lib/api";

const competencyRows = [
  { label: "Statistical Inference", value: 82, target: 90, gap: 8, status: "On Track" },
  { label: "Data Analysis & Modelling", value: 61, target: 85, gap: 24, status: "Moderate Gap" },
  { label: "Data Visualization & Dashboards", value: 42, target: 80, gap: 38, status: "Priority Gap" },
  { label: "Survey Sampling Methodology", value: 73, target: 85, gap: 12, status: "Moderate Gap" },
  { label: "Policy & Official Standards", value: 51, target: 75, gap: 24, status: "Moderate Gap" },
];

const igotStats = [
  { value: "1,72,19,660+", label: "Total Civil Servants Onboarded", icon: UsersIcon, color: "text-[var(--accent)]" },
  { value: "6,272", label: "Accredited Competency Courses", icon: BookOpenIcon, color: "text-blue-400" },
  { value: "15,08,47,245", label: "Learning Completions", icon: CheckIcon, color: "text-[#37d46f]" },
  { value: "16,08,456", label: "Monthly Active Learners", icon: TrendingUpIcon, color: "text-red-400" },
];

const workflowSteps = [
  { step: "01", title: "Baseline Assessment", desc: "Measure role-level competency across statistics, surveys, policy, and data visualization." },
  { step: "02", title: "Competency Mapping", desc: "Benchmark current capability against MoSPI cadre standards and role requirements." },
  { step: "03", title: "Personalized Learning Path", desc: "Recommend accredited iGOT Karmayogi courses targeted specifically to your diagnosed gaps." },
  { step: "04", title: "Reassessment & Audit", desc: "Verify milestone mastery and feed verified capability data back into the workforce ledger." },
];

const showcasedCourses = [
  { title: "Data Visualization for Official Statistics", source: "iGOT Karmayogi", level: "Intermediate", duration: "6h 00m", match: "94%", badge: "Role Priority" },
  { title: "Statistical Inference for Policy Analysis", source: "MoSPI Academy", level: "Advanced", duration: "8h 00m", match: "88%", badge: "Core Cadre" },
  { title: "Survey Sampling & Field Quality Assurance", source: "National Academy", level: "Intermediate", duration: "5h 00m", match: "81%", badge: "Methodology" },
  { title: "Digital Governance & Data Quality Standards", source: "Digital India", level: "Foundation", duration: "4h 00m", match: "76%", badge: "Governance" },
];

const analytics = [
  { label: "Officers Assessed", value: "1,248", hint: "Active statistical cadre" },
  { label: "Learning Paths Active", value: "923", hint: "Across 18 departments" },
  { label: "Average Competency", value: "74%", hint: "Benchmark target: 80%" },
  { label: "Priority Gaps Monitored", value: "17", hint: "Targeted with iGOT modules" },
];

export default function Home() {
  const [authReady, setAuthReady] = useState(false);
  const [sessionName, setSessionName] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const session = getAuthSession();
      setSessionName(session?.user.name || "");
      setAuthReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const avatarLetter = sessionName.trim().charAt(0).toUpperCase() || "O";

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200">
      {/* Subtle National Accent Strip */}
      <div className="gov-tricolor-strip w-full" aria-hidden="true" />

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--header)] text-[var(--header-text)]">
        <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white bg-white">
              <Image
                src="/pragati-parikshan-logo.jpeg"
                alt="PragatiParikshan"
                width={40}
                height={40}
                className="h-full w-full object-contain"
              />
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white">PragatiParikshan</span>
                <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                  MoSPI • SIH &apos;26
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-1.5 text-sm font-semibold lg:flex" aria-label="Main Navigation">
            {["Platform", "Workflow", "Assessment", "Courses", "Analytics"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="rounded-md px-4 py-2.5 text-[var(--muted)] transition hover:bg-[var(--header-nav-hover)] hover:text-white"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Right Header: Theme Toggle (Navbar Only!) + Auth CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* HYDRATION-SAFE SINGLE THEME TOGGLE BUTTON */}
            <ThemeToggle />

            {authReady && sessionName ? (
              <Link
                href="/dashboard"
                aria-label={`Open ${sessionName}'s dashboard`}
                title={`Open ${sessionName}'s dashboard`}
                className="grid h-10 w-10 place-items-center rounded-full bg-[var(--primary)] text-sm font-bold text-white shadow-xs transition hover:opacity-90"
              >
                {avatarLetter}
              </Link>
            ) : authReady ? (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-md border border-[var(--border)] bg-[var(--panel-soft)] px-3.5 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--teal)] sm:inline-flex"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md bg-[var(--primary)] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[var(--primary-hover)] transition"
                >
                  Register
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {/* Hero Section (iGOT Karmayogi Inspired Layout) */}
      <section id="platform" className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-b from-[var(--panel-warm-soft)] via-[var(--panel-inner)] to-[var(--background)] py-12 lg:py-16">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] items-center">
          {/* Left Column */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-xs font-bold text-[var(--accent)] mb-4 shadow-xs">
              <GovernmentIcon className="h-4 w-4" />
              <span>Ministry of Statistics &amp; Programme Implementation (MoSPI)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--foreground)] leading-[1.15]">
              Transforming &amp; Empowering India&apos;s Statistical Workforce
            </h1>

            <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-[var(--muted)]">
              An intelligent national competency framework aligned with <strong>iGOT Karmayogi</strong>. Automatically diagnose skill gaps, personalize accredited training trajectories, and measure workforce capability.
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
                className="inline-flex h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--panel)] px-6 text-xs sm:text-sm font-semibold text-[var(--foreground)] shadow-xs hover:border-[var(--teal)] transition"
              >
                Explore Dashboard
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="mt-8 flex flex-wrap gap-2 text-xs font-semibold">
              {[
                "Role-to-Role Learning",
                "iGOT Karmayogi Synced",
                "Accredited Evaluation",
              ].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5 rounded-md bg-[var(--panel)] border border-[var(--border)] px-3 py-1.5 text-[var(--foreground)] shadow-xs">
                  <CheckIcon className="h-3.5 w-3.5 text-[var(--green)]" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Live Officer Profile Card */}
          <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--card-shadow)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-md bg-[var(--primary-soft)] text-xl font-bold text-[var(--primary)] border border-[var(--border-subtle)]">
                  R
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--foreground)]">Roshan JT5</h2>
                  <p className="text-xs text-[var(--muted)]">Statistical Officer • MoSPI Central Cadre</p>
                </div>
              </div>
              <span className="rounded bg-[var(--green-badge-bg)] border border-[var(--green)]/20 px-2.5 py-1 text-xs font-bold text-[var(--green-badge-text)]">
                82% Ready
              </span>
            </div>

            {/* Competency Bars */}
            <div className="space-y-3">
              {competencyRows.slice(0, 4).map((row) => (
                <div key={row.label} className="rounded-md bg-[var(--panel-inner)] border border-[var(--border-subtle)] p-3">
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="font-semibold text-[var(--foreground)]">{row.label}</span>
                    <span className="text-[var(--muted)]">{row.value}% / Target {row.target}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-[var(--teal)] transition-all"
                      style={{ width: `${row.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Priority Callout */}
            <div className="mt-4 rounded-md bg-[var(--panel-soft)] border border-[var(--border-subtle)] p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">Priority Recommendation</div>
                <div className="text-xs font-bold text-[var(--foreground)]">Data Visualization for Official Reports</div>
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

      {/* Official Statistics Strip (iGOT Karmayogi Numbers) */}
      <section className="border-y border-[var(--border)] bg-[var(--header)] text-white py-8">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-6 px-4 sm:px-6 lg:grid-cols-4">
          {igotStats.map((stat) => {
            const IconComp = stat.icon;
            return (
              <div key={stat.label} className="text-center sm:text-left">
                <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
                  <IconComp className={`h-7 w-7 sm:h-8 sm:w-8 ${stat.color}`} />
                  <div className={`text-2xl font-black sm:text-3xl ${stat.color}`}>{stat.value}</div>
                </div>
                <div className="mt-0.5 text-xs sm:text-sm font-bold text-white">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Continuous Competency Loop Section */}
      <section id="workflow" className="py-14 bg-[var(--background)]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="rounded bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--teal)]">
              Continuous Competency Loop
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              From Diagnostic Assessment to Accredited Growth
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[var(--muted)]">
              An evidence-driven learning framework for civil service statisticians, data analysts, and officers.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((step) => (
              <div key={step.step} className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)] flex flex-col justify-between">
                <div>
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[var(--primary-soft)] text-xs font-black text-[var(--teal)] border border-[var(--border-subtle)]">
                    {step.step}
                  </div>
                  <h3 className="mt-3 text-base font-bold text-[var(--foreground)]">{step.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competency Gap Analysis & Matrix Section */}
      <section id="assessment" className="py-14 border-t border-[var(--border)] bg-[var(--panel-warm-soft)]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
            {/* Competency Table */}
            <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--card-shadow)]">
              <div className="mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--teal)]">Evaluation Engine</span>
                <h3 className="text-xl font-bold text-[var(--foreground)]">Official Competency Matrix</h3>
                <p className="mt-1 text-xs text-[var(--muted)]">Calculated proficiency benchmarked against cadre standards</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-[var(--border)] text-[var(--muted)]">
                    <tr>
                      <th className="pb-3 font-semibold">Competency</th>
                      <th className="pb-3 font-semibold">Score</th>
                      <th className="pb-3 font-semibold">Target</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {competencyRows.map((row) => (
                      <tr key={row.label}>
                        <td className="py-3.5 font-semibold text-[var(--foreground)]">{row.label}</td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[var(--foreground)]">{row.value}%</span>
                            <div className="h-1.5 w-16 rounded-full bg-[var(--border)] overflow-hidden">
                              <div className="h-1.5 rounded-full bg-[var(--teal)]" style={{ width: `${row.value}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 text-[var(--muted)]">{row.target}%</td>
                        <td className="py-3.5">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                              row.gap > 30
                                ? "bg-[var(--badge-red-bg)] text-[var(--badge-red-text)]"
                                : row.gap > 10
                                  ? "bg-[var(--badge-amber-bg)] text-[var(--badge-amber-text)]"
                                  : "bg-[var(--green-badge-bg)] text-[var(--green-badge-text)]"
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

            {/* AI Recommendation & Pathway */}
            <div className="space-y-5">
              <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--card-shadow)]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-[var(--foreground)]">Personalized Trajectory</h3>
                  <span className="rounded bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--accent)]">
                    iGOT Synced
                  </span>
                </div>

                <div className="space-y-2.5">
                  {["Data Visualization & Reporting / 72% Complete", "Statistical Inference / 40% Complete", "Survey Methodology & Sampling / Planned"].map((path, idx) => (
                    <div key={path} className="flex items-center gap-3 rounded-md bg-[var(--panel-inner)] border border-[var(--border-subtle)] p-3 text-xs font-semibold text-[var(--foreground)]">
                      <span className="grid h-6 w-6 place-items-center rounded-md bg-[var(--primary)] text-xs font-bold text-white">
                        {idx + 1}
                      </span>
                      <span>{path}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-md bg-[var(--green-badge-bg)] border border-[var(--green)]/20 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--green-badge-text)]">AI Diagnostic Recommendation</div>
                  <p className="mt-1 text-xs text-[var(--foreground)] leading-relaxed">
                    Prioritize <strong>Data Visualization for Official Reports</strong> to close your 38% priority gap before next month&apos;s reporting cycle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcased Courses Section */}
      <section id="courses" className="py-14 bg-[var(--background)]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="rounded bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              Accredited Curriculum
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              Showcased iGOT Courses
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[var(--muted)]">
              Role-relevant capacity building modules from Mission Karmayogi Bharat.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {showcasedCourses.map((res) => (
              <div key={res.title} className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 rounded bg-[var(--panel-inner)] border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] font-bold text-[var(--teal)]">
                      <GovernmentIcon className="h-3.5 w-3.5" />
                      <span>{res.source}</span>
                    </span>
                    <span className="rounded bg-[var(--green-badge-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--green-badge-text)]">
                      {res.match} Match
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--foreground)] leading-snug">{res.title}</h4>
                  <div className="mt-2 text-xs text-[var(--muted)]">{res.level} • {res.duration}</div>
                </div>
                <Link
                  href="/courses"
                  className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--panel-soft)] py-2 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--teal)] hover:text-[var(--teal)] transition"
                >
                  <span>View Details</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workforce Capability Analytics Section */}
      <section id="analytics" className="py-14 border-t border-[var(--border)] bg-[var(--panel-inner)]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
            {/* Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {analytics.map((metric) => (
                <div key={metric.label} className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--card-shadow)]">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{metric.label}</div>
                  <div className="mt-2 text-3xl font-black text-[var(--foreground)]">{metric.value}</div>
                  <div className="mt-1 text-[11px] text-[var(--muted)]">{metric.hint}</div>
                </div>
              ))}
            </div>

            {/* Problem Solver Card */}
            <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-6 sm:p-8 shadow-[var(--card-shadow)]">
              <div className="inline-flex items-center gap-2 rounded bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold text-[var(--accent)] mb-3">
                <span>Smart India Hackathon 2026</span>
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)]">MoSPI Problem Statement: SIH26101</h3>
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[var(--muted)]">
                A production-ready platform delivering complete end-to-end capabilities: registration, diagnostic testing, automated skill gap mapping, iGOT course recommendations, and grounded RAG Q&A.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--primary)] px-5 text-xs font-bold text-white shadow-xs hover:bg-[var(--primary-hover)] transition"
                >
                  Open Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--header)] text-[var(--header-text)] py-8">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-xs text-[var(--muted)]">
            <div>
              <div className="text-sm font-bold text-white">PragatiParikshan — National Statistical Intelligence Platform</div>
              <p className="mt-1 text-slate-400">Developed for Ministry of Statistics and Programme Implementation (MoSPI) • SIH 2026</p>
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-medium">
              <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
              <Link href="/skill-gaps" className="hover:text-white">Skill Map</Link>
              <Link href="/courses" className="hover:text-white">Courses</Link>
              <Link href="/assessments" className="hover:text-white">Assessments</Link>
            </div>
          </div>
          <div className="mt-6 border-t border-white/10 pt-4 text-center text-[11px] text-slate-400">
            © 2026 Government of India • Ministry of Statistics and Programme Implementation • Digital India Initiative
          </div>
        </div>
      </footer>
    </main>
  );
}
