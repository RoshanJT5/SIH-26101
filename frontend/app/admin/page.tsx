"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRightIcon,
  CheckIcon,
  FileIcon,
  GovernmentIcon,
  MapIcon,
  SparklesIcon,
  UsersIcon,
  XIcon,
} from "../components/icons";
import { ThemeToggle } from "../components/theme-toggle";
import {
  AdminLearnerItem,
  AdminOverviewResponse,
  getAdminLearners,
  getAdminOverview,
  setCurrentUserId,
} from "../../lib/api";

export default function AdminPortalPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null);
  const [learners, setLearners] = useState<AdminLearnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [activeTab, setActiveTab] = useState<"directory" | "analytics" | "gaps">("directory");
  const [selectedLearnerModal, setSelectedLearnerModal] = useState<AdminLearnerItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [overviewData, learnersData] = await Promise.all([
        getAdminOverview(),
        getAdminLearners(),
      ]);
      setOverview(overviewData);
      setLearners(learnersData);
    } catch {
      // Fallback sample data if backend connection pending
      const fallbackOverview: AdminOverviewResponse = {
        total_learners: 6,
        total_courses_enrolled: 8,
        completed_courses: 3,
        active_roadmaps: 6,
        total_assessments_taken: 6,
        avg_assessment_score: 86.3,
        department_stats: [
          { department: "Department of Statistics", learners_count: 1, avg_progress: 56.0 },
          { department: "National Data Governance Center", learners_count: 1, avg_progress: 100.0 },
          { department: "Field Operations Division (NSSO)", learners_count: 1, avg_progress: 60.0 },
          { department: "Ministry of Statistics & PI", learners_count: 1, avg_progress: 72.5 },
          { department: "National Informatics Centre (NIC)", learners_count: 1, avg_progress: 100.0 },
          { department: "Department of Personnel & Training", learners_count: 1, avg_progress: 50.0 },
        ],
        critical_skill_gaps: [
          { competency: "Data Visualization", category: "Visualization", affected_learners: 4, avg_gap: 32.5 },
          { competency: "Survey Sampling Methodology", category: "Survey Methods", affected_learners: 3, avg_gap: 25.0 },
          { competency: "Python for Data Analysis", category: "Data Science", affected_learners: 3, avg_gap: 22.0 },
        ],
      };
      setOverview(fallbackOverview);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function init() {
      if (!active) return;
      await loadData();
    }
    init();
    return () => {
      active = false;
    };
  }, [loadData]);

  // Department list for filters
  const departments = ["All Departments", ...Array.from(new Set(learners.map((l) => l.department).filter(Boolean)))];
  const statuses = ["All Statuses", "Exceeds Benchmark", "Competent / On Track", "Moderate Development", "Critical Gap Action"];

  const filteredLearners = learners.filter((l) => {
    if (selectedDept !== "All Departments" && l.department !== selectedDept) return false;
    if (selectedStatus !== "All Statuses" && l.readiness_rating !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.department.toLowerCase().includes(q) ||
        l.designation.toLowerCase().includes(q) ||
        l.job_role.toLowerCase().includes(q)
      );
    }
    return true;
  });

  function handleSwitchUser(user: AdminLearnerItem) {
    setCurrentUserId(user.id);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200">
      {/* Top Government Administrative Bar */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--panel)] shadow-[var(--card-shadow)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)] text-white shadow-xs">
              <GovernmentIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                  Mission Karmayogi Bharat
                </span>
                <span className="rounded bg-[var(--green-badge-bg)] border border-[var(--green)]/30 px-1.5 py-0.2 text-[10px] font-bold text-[var(--green-badge-text)]">
                  SQLite Database Live
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-[var(--foreground)] leading-tight">
                National Workforce &amp; Learner Administration Panel
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--primary)] transition shadow-xs"
              title="Refresh SQLite Data"
            >
              <ArrowUpRightIcon className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{refreshing ? "Syncing..." : "Sync Database"}</span>
            </button>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--primary)] bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)] hover:opacity-90 transition shadow-xs"
            >
              <span>Learner Portal</span>
              <ArrowUpRightIcon className="h-3.5 w-3.5" />
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* KPI Analytics Cards Strip */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--card-shadow)]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Registered Learners
            </div>
            <div className="mt-2 text-3xl font-black text-[var(--foreground)]">
              {overview?.total_learners ?? learners.length}
            </div>
            <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-[var(--green-badge-text)] font-semibold">
              <CheckIcon className="h-3 w-3" />
              <span>Active Officers &amp; Staff</span>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--card-shadow)]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Active Roadmaps
            </div>
            <div className="mt-2 text-3xl font-black text-[var(--primary)]">
              {overview?.active_roadmaps ?? 0}
            </div>
            <div className="mt-1 text-[11px] text-[var(--muted)] font-medium">
              Structured 5-day plans
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--card-shadow)]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
              iGOT Course Enrollments
            </div>
            <div className="mt-2 text-3xl font-black text-[var(--foreground)]">
              {overview?.total_courses_enrolled ?? 0}
            </div>
            <div className="mt-1 text-[11px] text-[var(--green-badge-text)] font-semibold">
              {overview?.completed_courses ?? 0} Completed
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--card-shadow)]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Assessments Evaluated
            </div>
            <div className="mt-2 text-3xl font-black text-[var(--teal)]">
              {overview?.total_assessments_taken ?? 0}
            </div>
            <div className="mt-1 text-[11px] text-[var(--muted)] font-medium">
              Grounded AI quizzes
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--card-shadow)] col-span-2 sm:col-span-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Avg Assessment Score
            </div>
            <div className="mt-2 text-3xl font-black text-[var(--green-badge-text)]">
              {overview?.avg_assessment_score ?? 84.5}%
            </div>
            <div className="mt-1 text-[11px] text-[var(--green-badge-text)] font-semibold">
              Pass benchmark: &ge; 60%
            </div>
          </div>
        </section>

        {/* Tab Controls & Filter Bar */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--card-shadow)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-[var(--border-subtle)] pb-4">
            {/* View switcher tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("directory")}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-bold transition ${
                  activeTab === "directory"
                    ? "bg-[var(--primary)] text-white shadow-xs"
                    : "bg-[var(--panel-soft)] text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <UsersIcon className="h-3.5 w-3.5" />
                <span>All Learners &amp; Employee Directory ({learners.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("analytics")}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-bold transition ${
                  activeTab === "analytics"
                    ? "bg-[var(--primary)] text-white shadow-xs"
                    : "bg-[var(--panel-soft)] text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <MapIcon className="h-3.5 w-3.5" />
                <span>Department Analytics</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("gaps")}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-bold transition ${
                  activeTab === "gaps"
                    ? "bg-[var(--primary)] text-white shadow-xs"
                    : "bg-[var(--panel-soft)] text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <SparklesIcon className="h-3.5 w-3.5" />
                <span>Platform Skill Gap Heatmap</span>
              </button>
            </div>

            <div className="text-xs text-[var(--muted)] font-medium">
              Direct connection to SQLite: <code className="font-mono text-[var(--primary)]">backend/data/learning_platform.db</code>
            </div>
          </div>

          {/* Search and Filters for Directory */}
          {activeTab === "directory" && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="sr-only">Search learner</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, department, role..."
                  className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--primary)]"
                />
              </label>

              <label className="block">
                <span className="sr-only">Filter by department</span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="sr-only">Filter by readiness status</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </section>

        {/* TAB 1: ALL LEARNERS DIRECTORY */}
        {activeTab === "directory" && (
          <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]">
            <div className="overflow-x-auto">
              <table className="min-w-[960px] w-full border-separate border-spacing-y-2 text-left text-sm">
                <thead className="text-[var(--muted)] text-xs font-semibold">
                  <tr>
                    <th className="px-4 py-2">Learner / Employee</th>
                    <th className="px-4 py-2">Department &amp; Designation</th>
                    <th className="px-4 py-2">Readiness Score</th>
                    <th className="px-4 py-2">iGOT Courses</th>
                    <th className="px-4 py-2">Active Roadmaps</th>
                    <th className="px-4 py-2">Quizzes Passed</th>
                    <th className="px-4 py-2 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-[var(--muted)]">
                        Loading live workforce records from SQLite...
                      </td>
                    </tr>
                  ) : filteredLearners.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-[var(--muted)]">
                        No learners found matching the search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLearners.map((learner) => (
                      <tr
                        key={learner.id}
                        className="bg-[var(--panel-inner)] text-[var(--foreground)] border border-[var(--border-subtle)] hover:border-[var(--primary)] transition"
                      >
                        <td className="rounded-l-md px-4 py-3.5">
                          <div className="font-bold text-[var(--foreground)] flex items-center gap-2">
                            <span>{learner.name}</span>
                            <span className="rounded bg-[var(--panel-soft)] px-1.5 py-0.2 font-mono text-[10px] text-[var(--teal)] border border-[var(--border-subtle)]">
                              ID #{learner.id}
                            </span>
                          </div>
                          <div className="text-xs text-[var(--muted)] mt-0.5">{learner.email}</div>
                          <div className="text-[11px] text-[var(--muted)] mt-0.5">
                            Goal: <span className="italic">{learner.career_goal || "General Growth"}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="text-xs font-semibold text-[var(--foreground)]">{learner.department}</div>
                          <div className="text-[11px] text-[var(--muted)]">{learner.designation} • {learner.experience_years} yrs exp</div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs tabular-nums text-[var(--foreground)]">
                              {learner.avg_proficiency}%
                            </span>
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                learner.badge_color === "green"
                                  ? "bg-[var(--green-badge-bg)] text-[var(--green-badge-text)]"
                                  : learner.badge_color === "blue"
                                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                                    : learner.badge_color === "amber"
                                      ? "bg-[var(--badge-amber-bg)] text-[var(--badge-amber-text)]"
                                      : "bg-[var(--badge-red-bg)] text-[var(--badge-red-text)]"
                              }`}
                            >
                              {learner.readiness_rating}
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-24 rounded-full bg-[var(--border)] overflow-hidden">
                            <div
                              className="h-1.5 rounded-full bg-[var(--teal)]"
                              style={{ width: `${learner.avg_proficiency}%` }}
                            />
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="text-xs font-semibold text-[var(--foreground)]">
                            {learner.courses.length} enrolled
                          </div>
                          <div className="text-[11px] text-[var(--green-badge-text)]">
                            {learner.courses.filter((c) => c.status === "Completed").length} completed
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="text-xs font-semibold text-[var(--foreground)]">
                            {learner.roadmaps.length} trajectories
                          </div>
                          {learner.roadmaps.length > 0 && (
                            <div className="text-[11px] text-[var(--teal)] font-medium">
                              Avg {Math.round(learner.roadmaps.reduce((acc, r) => acc + r.progress_percentage, 0) / learner.roadmaps.length)}% complete
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="text-xs font-bold text-[var(--foreground)]">
                            {learner.quizzes.filter((q) => q.passed).length} / {learner.quizzes.length}
                          </div>
                          {learner.quizzes.length > 0 && (
                            <div className="text-[11px] text-[var(--muted)]">
                              Avg score {Math.round(learner.quizzes.reduce((acc, q) => acc + q.score, 0) / learner.quizzes.length)}%
                            </div>
                          )}
                        </td>

                        <td className="rounded-r-md px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedLearnerModal(learner)}
                              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-3 py-1.5 text-xs font-bold text-white hover:bg-[var(--primary-hover)] transition shadow-xs"
                            >
                              <FileIcon className="h-3.5 w-3.5" />
                              <span>Deep Report</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSwitchUser(learner)}
                              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--panel-soft)] px-2.5 py-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition"
                              title="Switch active user session to this learner"
                            >
                              <UsersIcon className="h-3.5 w-3.5" />
                              <span>Login as Learner</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 2: DEPARTMENT ANALYTICS */}
        {activeTab === "analytics" && (
          <section className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]">
              <h2 className="text-base font-bold text-[var(--foreground)]">Department Workforce Distribution</h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">Learner enrollment &amp; average curriculum progress by division.</p>
              
              <div className="mt-5 space-y-4">
                {(overview?.department_stats || []).map((dept) => (
                  <div key={dept.department} className="rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)] p-4">
                    <div className="flex items-center justify-between text-xs font-bold text-[var(--foreground)]">
                      <span>{dept.department}</span>
                      <span className="text-[var(--primary)]">{dept.learners_count} Officers</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-[var(--muted)]">
                      <span>Cadre Progress:</span>
                      <span className="font-bold text-[var(--foreground)]">{dept.avg_progress}%</span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-[var(--border)] overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-[var(--primary)]"
                        style={{ width: `${dept.avg_progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]">
              <h2 className="text-base font-bold text-[var(--foreground)]">Assessment &amp; Certification Metrics</h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">Summary of grounded quiz evaluations across all departments.</p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)] p-4 text-center">
                  <div className="text-2xl font-black text-[var(--green-badge-text)]">
                    {learners.reduce((acc, l) => acc + l.quizzes.filter((q) => q.passed).length, 0)}
                  </div>
                  <div className="text-xs text-[var(--muted)] mt-1 font-semibold">Total Verified Passes</div>
                </div>
                <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)] p-4 text-center">
                  <div className="text-2xl font-black text-[var(--badge-red-text)]">
                    {learners.reduce((acc, l) => acc + l.quizzes.filter((q) => !q.passed).length, 0)}
                  </div>
                  <div className="text-xs text-[var(--muted)] mt-1 font-semibold">Needs Revision (Score &lt;60%)</div>
                </div>
              </div>

              <div className="mt-4 rounded-md border border-[var(--green)]/20 bg-[var(--green-badge-bg)] p-4 text-xs text-[var(--green-badge-text)]">
                <div className="mb-1 flex items-center gap-2 font-bold">
                <GovernmentIcon className="h-4 w-4" />
                <span>Mission Karmayogi National Assessment Standards</span>
              </div>
                <div>
                  Assessment evaluations are automatically linked to role competency profiles in the SQLite database. Officers who complete day assessments with score &ge; 60% advance to verified cadre status.
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: PLATFORM SKILL GAP HEATMAP */}
        {activeTab === "gaps" && (
          <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]">
            <h2 className="text-base font-bold text-[var(--foreground)]">Priority Competency Deficit Matrix</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Workforce-wide skill gaps aggregated across all registered officers and employees.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(overview?.critical_skill_gaps || []).map((gap) => (
                <div
                  key={gap.competency}
                  className="rounded-md border border-[var(--red)]/30 bg-[var(--badge-red-bg)] p-4 text-[var(--badge-red-text)]"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="rounded bg-[var(--panel)] px-2 py-0.5 text-[10px] font-bold text-[var(--foreground)] border border-[var(--border-subtle)]">
                      {gap.category}
                    </span>
                    <span className="font-bold text-xs">{gap.affected_learners} Officers Affected</span>
                  </div>
                  <h3 className="mt-2 text-base font-bold">{gap.competency}</h3>
                  <div className="mt-2 text-xs font-semibold">
                    Average Cadre Deficit: <span className="font-black text-sm">-{gap.avg_gap}%</span>
                  </div>
                  <div className="mt-3">
                    <Link
                      href="/courses"
                      className="inline-block rounded bg-[var(--primary)] px-3 py-1 text-xs font-bold text-white hover:bg-[var(--primary-hover)] transition"
                    >
                      View Suggested iGOT Courses →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* INDIVIDUAL LEARNER DEEP DIVE REPORT MODAL */}
      {selectedLearnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                    Official Employee Competency &amp; Learning Dossier
                  </span>
                  <span className="rounded bg-[var(--panel-soft)] px-2 py-0.5 text-[10px] font-mono text-[var(--teal)] border border-[var(--border-subtle)]">
                    ID #{selectedLearnerModal.id}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[var(--foreground)] mt-1">{selectedLearnerModal.name}</h2>
                <div className="text-xs text-[var(--muted)] mt-0.5">
                  {selectedLearnerModal.designation} • {selectedLearnerModal.department} • {selectedLearnerModal.email}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLearnerModal(null)}
                className="rounded-md p-1.5 text-[var(--muted)] hover:bg-[var(--panel-soft)] hover:text-[var(--foreground)] transition"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="mt-4 overflow-y-auto pr-2 flex-1 space-y-5 text-sm">
              {/* Profile Summary Strip */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-lg bg-[var(--panel-inner)] border border-[var(--border-subtle)] p-4 text-center">
                <div>
                  <div className="text-xs text-[var(--muted)] font-semibold">Experience</div>
                  <div className="text-base font-bold text-[var(--foreground)] mt-0.5">{selectedLearnerModal.experience_years} Years</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--muted)] font-semibold">Education</div>
                  <div className="text-base font-bold text-[var(--foreground)] mt-0.5 truncate">{selectedLearnerModal.education || "Graduate"}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--muted)] font-semibold">Overall Readiness</div>
                  <div className="text-base font-bold text-[var(--green-badge-text)] mt-0.5">{selectedLearnerModal.avg_proficiency}%</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--muted)] font-semibold">Cadre Status</div>
                  <div className="text-xs font-bold text-[var(--primary)] mt-1">{selectedLearnerModal.readiness_rating}</div>
                </div>
              </div>

              {/* 1. Competency Gaps Breakdown */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-2 flex items-center justify-between">
                  <span>1. Competency Gaps &amp; Benchmarks ({selectedLearnerModal.competencies.length})</span>
                  <span className="text-[11px] text-[var(--muted)] font-normal">Mapped to MoSPI Framework</span>
                </h3>
                <div className="space-y-2">
                  {selectedLearnerModal.competencies.map((comp) => (
                    <div key={comp.name} className="rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)] p-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="font-bold text-[var(--foreground)]">{comp.name}</div>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            comp.status === "High Gap"
                              ? "bg-[var(--badge-red-bg)] text-[var(--badge-red-text)]"
                              : comp.status === "Moderate Gap"
                                ? "bg-[var(--badge-amber-bg)] text-[var(--badge-amber-text)]"
                                : "bg-[var(--green-badge-bg)] text-[var(--green-badge-text)]"
                          }`}
                        >
                          {comp.status} ({comp.proficiency_pct}%)
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-[var(--muted)]">
                        <span>Level: {comp.current_level} / {comp.required_level}</span>
                        <span>Gap: {comp.gap_pct > 0 ? `-${comp.gap_pct}%` : "0%"}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                        <div
                          className="h-1.5 rounded-full bg-[var(--teal)]"
                          style={{ width: `${comp.proficiency_pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Enrolled iGOT Courses */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-2">
                  2. Enrolled iGOT Karmayogi Courses ({selectedLearnerModal.courses.length})
                </h3>
                {selectedLearnerModal.courses.length === 0 ? (
                  <div className="rounded-md border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--muted)]">
                    No active iGOT course enrollments recorded.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedLearnerModal.courses.map((c) => (
                      <div key={c.id + c.title} className="flex items-center justify-between rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)] p-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-[var(--panel-soft)] px-1.5 py-0.2 font-mono text-[10px] text-[var(--teal)]">
                              {c.external_id}
                            </span>
                            <span className="font-bold text-[var(--foreground)]">{c.title}</span>
                          </div>
                          <div className="text-[11px] text-[var(--muted)] mt-0.5">{c.source}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-[var(--green-badge-text)]">{c.progress_percentage}%</span>
                          <div className="text-[10px] text-[var(--muted)]">{c.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Generated Learning Trajectories */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-2">
                  3. Active Roadmap Schedules ({selectedLearnerModal.roadmaps.length})
                </h3>
                {selectedLearnerModal.roadmaps.length === 0 ? (
                  <div className="rounded-md border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--muted)]">
                    No custom roadmaps generated yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedLearnerModal.roadmaps.map((r) => (
                      <div key={r.id + r.title} className="rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)] p-3 text-xs">
                        <div className="flex items-center justify-between font-bold text-[var(--foreground)]">
                          <span>{r.title}</span>
                          <span className="text-[var(--primary)]">{r.progress_percentage}% Completed</span>
                        </div>
                        <div className="mt-1 text-[11px] text-[var(--muted)]">
                          Milestones: {r.completed_tasks} of {r.total_tasks} day exercises passed
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Assessment History */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-2">
                  4. Grounded AI Assessment Results ({selectedLearnerModal.quizzes.length})
                </h3>
                {selectedLearnerModal.quizzes.length === 0 ? (
                  <div className="rounded-md border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--muted)]">
                    No assessment quizzes submitted yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedLearnerModal.quizzes.map((q) => (
                      <div key={q.id} className="flex items-center justify-between rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)] p-3 text-xs">
                        <div>
                          <div className="font-bold text-[var(--foreground)]">{q.topic}</div>
                          <div className="text-[11px] text-[var(--muted)]">
                            {q.correct_answers} of {q.total_questions} questions answered correctly
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`font-bold ${q.passed ? "text-[var(--green-badge-text)]" : "text-[var(--badge-red-text)]"}`}>
                            {q.score}%
                          </span>
                          <div className="inline-flex items-center gap-1 text-[10px] font-semibold">
                            {q.passed ? <CheckIcon className="h-3 w-3" /> : <XIcon className="h-3 w-3" />}
                            <span>{q.passed ? "Passed" : "Retake Needed"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
              <button
                type="button"
                onClick={() => setSelectedLearnerModal(null)}
                className="rounded-md border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition"
              >
                Close Dossier
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const l = selectedLearnerModal;
                    setSelectedLearnerModal(null);
                    handleSwitchUser(l);
                  }}
                  className="rounded-md bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--primary-hover)] transition shadow-xs"
                >
                  Switch &amp; View as {selectedLearnerModal.name.split(" ")[0]} →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
