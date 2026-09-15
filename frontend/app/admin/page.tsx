"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckCircleIcon,
  CheckIcon,
  ClipboardIcon,
  GovernmentIcon,
  InfoIcon,
  LogOutIcon,
  MapIcon,
  SearchIcon,
  SparklesIcon,
  TrendingUpIcon,
  UsersIcon,
  XIcon,
} from "../components/icons";
import { ThemeToggle } from "../components/theme-toggle";
import {
  AdminAnalyticsData,
  clearAuthSession,
  EmployeeAlertItem,
  fetchAllOfficials,
  fetchAdminAnalytics,
  getAuthSession,
  OfficialSummaryItem,
  setCurrentUserId,
  UserProfile,
} from "../../lib/api";

export default function AdminPortalPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AdminAnalyticsData | null>(null);
  const [officials, setOfficials] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrg, setSelectedOrg] = useState("All Organizations");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [refreshing, setRefreshing] = useState(false);

  // Selected Employee for Detail Modal
  const [selectedEmployee, setSelectedEmployee] = useState<UserProfile | OfficialSummaryItem | EmployeeAlertItem | null>(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    const isAdmin = Boolean(
      session.user.is_admin ||
      session.user.role?.toLowerCase() === "admin" ||
      session.user.role_name?.toLowerCase() === "admin" ||
      session.user.email?.toLowerCase() === "admin@pragatiparikshan.demo"
    );
    if (!isAdmin) {
      router.replace("/dashboard");
      return;
    }
    setAuthorized(true);
  }, [router]);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [analyticsData, officialsData] = await Promise.all([
        fetchAdminAnalytics(),
        fetchAllOfficials(),
      ]);
      setAnalytics(analyticsData);
      setOfficials(officialsData);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!authorized) return;
    let active = true;
    async function init() {
      if (!active) return;
      await loadData();
    }
    init();
    return () => {
      active = false;
    };
  }, [authorized, loadData]);

  // Derived directory list with enriched summaries
  const officialsList: (OfficialSummaryItem | UserProfile)[] = useMemo(() => {
    if (analytics?.officials_summary && analytics.officials_summary.length > 0) {
      return analytics.officials_summary;
    }
    return officials;
  }, [analytics, officials]);

  const orgs = useMemo(() => {
    const list = officialsList.map((o) => {
      if ("organization" in o && typeof o.organization === "string") return o.organization;
      if ("organization_name" in o && typeof o.organization_name === "string") return o.organization_name;
      return "Ministry of Statistics & PI";
    }).filter(Boolean);
    return ["All Organizations", ...Array.from(new Set(list))];
  }, [officialsList]);

  const filteredOfficials = useMemo(() => {
    return officialsList.filter((o) => {
      const oOrg = ("organization" in o && o.organization) ? o.organization : (("organization_name" in o && o.organization_name) ? o.organization_name : "");
      if (selectedOrg !== "All Organizations" && oOrg !== selectedOrg) return false;

      const oStatus = "assessment_status" in o ? o.assessment_status : "";
      const oPriority = "priority" in o ? o.priority : "";

      if (selectedStatus === "Needs Attention") {
        if (oPriority !== "HIGH" && oPriority !== "CRITICAL") return false;
      } else if (selectedStatus === "Assessed") {
        if (oStatus !== "Assessed") return false;
      } else if (selectedStatus === "Pending Assessment") {
        if (oStatus !== "Pending Assessment") return false;
      } else if (selectedStatus === "On Target") {
        if (oPriority !== "ON TARGET" && oPriority !== "NONE") return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = o.name || "";
        const email = o.email || "";
        const role = ("role_name" in o ? o.role_name : "") || ("designation" in o ? o.designation : "") || "";
        const empId = ("employee_id" in o && o.employee_id) ? o.employee_id : "";
        return (
          name.toLowerCase().includes(q) ||
          email.toLowerCase().includes(q) ||
          role.toLowerCase().includes(q) ||
          oOrg.toLowerCase().includes(q) ||
          empId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [officialsList, selectedOrg, selectedStatus, searchQuery]);

  function handleSwitchUser(userId: number) {
    setCurrentUserId(userId);
    router.push("/dashboard");
  }

  // Category health helpers
  const categoryHealth = analytics?.category_health || {
    STATISTICAL: 64,
    TECHNICAL: 78,
    DIGITAL_GOVERNANCE: 71,
    BEHAVIOURAL_MANAGERIAL: 82,
  };

  const readiness = analytics?.workforce_readiness || {
    fully_ready_count: 5,
    fully_ready_pct: 38,
    needs_development_count: 5,
    needs_development_pct: 44,
    assessment_pending_count: 2,
    assessment_pending_pct: 18,
  };

  const learning = analytics?.learning_progress || {
    active_learners: 8,
    courses_started: 21,
    courses_completed: 14,
    average_completion_pct: 67,
  };

  const assessment = analytics?.assessment_overview || {
    assessments_completed: analytics?.total_assessments_conducted || 23,
    average_score: 76,
    pass_rate: 68,
    pending_assessments: 9,
  };

  const attentionList = analytics?.employees_needing_attention || [];

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-[var(--muted)] font-medium">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
          <span>Verifying administrator authorization...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200">
      {/* Top Institutional Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--panel)] shadow-[var(--card-shadow)]">
        <div className="mx-auto flex w-full max-w-[1720px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--primary)] text-white shadow-xs shrink-0">
              <GovernmentIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary)]">
                  Ministry of Statistics &amp; Programme Implementation
                </span>
                <span className="rounded bg-[var(--green-badge-bg)] border border-[var(--green)]/30 px-1.5 py-0.2 text-[10px] font-bold text-[var(--green-badge-text)]">
                  National Node
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-[var(--foreground)] leading-tight">
                WORKFORCE COMPETENCY INTELLIGENCE
              </h1>
            </div>
          </div>

          {/* Symmetrical Top Control Group */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={loadData}
              disabled={refreshing}
              className="h-10 px-3.5 inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--panel-soft)] text-xs font-semibold text-[var(--foreground)] hover:border-[var(--primary)] hover:bg-[var(--surface-hover)] transition shadow-xs whitespace-nowrap"
              title="Refresh Analytics Data"
            >
              <ArrowUpRightIcon className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                clearAuthSession();
                router.push("/login");
              }}
              className="h-10 px-3.5 inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--panel-soft)] text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition shadow-xs whitespace-nowrap"
              title="Sign Out"
            >
              <LogOutIcon className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>

            <div className="flex items-center h-10">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Analytical Body with Balanced Responsive Width */}
      <main className="mx-auto w-full max-w-[1720px] px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        
        {/* Page Subtitle Header */}
        <div className="pb-1">
          <p className="text-xs text-[var(--muted)]">
            Monitor workforce capability, competency gaps and learning readiness across the statistical system.
          </p>
        </div>

        {/* Attention Summary Strip */}
        {attentionList.length > 0 && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs w-full">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <span className="font-bold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                Attention Required
              </span>
              <span>
                <strong>{analytics?.high_deficiency_competencies.length || 5}</strong> priority competency gaps &middot; <strong>{attentionList.length}</strong> officials requiring capability intervention
              </span>
            </div>
            <a
              href="#attention-alerts"
              className="font-semibold text-amber-900 dark:text-amber-200 hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>Review Alerts</span>
              <span>&darr;</span>
            </a>
          </div>
        )}

        {/* TOP KPI ROW: 6 Major Institutional Metrics */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {/* KPI 1: Enrolled Officials */}
          <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4 shadow-xs">
            <div className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider">
              Enrolled Officials
            </div>
            <div className="mt-1.5 text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              {analytics?.total_officials ?? officials.length}
            </div>
            <div className="mt-1 text-[11px] text-[var(--muted)]">
              Statistical Cadre Officers
            </div>
          </div>

          {/* KPI 2: Active Learners */}
          <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4 shadow-xs">
            <div className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider">
              Active Learners
            </div>
            <div className="mt-1.5 text-2xl sm:text-3xl font-bold text-[var(--primary)]">
              {learning.active_learners}
            </div>
            <div className="mt-1 text-[11px] text-[var(--muted)]">
              {Math.round((learning.active_learners / Math.max(1, analytics?.total_officials || 12)) * 100)}% of Workforce
            </div>
          </div>

          {/* KPI 3: Competencies Tracked */}
          <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4 shadow-xs">
            <div className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider">
              Competencies
            </div>
            <div className="mt-1.5 text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              {analytics?.total_competencies ?? 41}
            </div>
            <div className="mt-1 text-[11px] text-[var(--muted)]">
              4 Cadre Categories
            </div>
          </div>

          {/* KPI 4: Priority Gaps */}
          <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4 shadow-xs">
            <div className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider">
              Priority Gaps
            </div>
            <div className="mt-1.5 text-2xl sm:text-3xl font-bold text-amber-700 dark:text-amber-400">
              {analytics?.high_deficiency_competencies.length ?? 8}
            </div>
            <div className="mt-1 text-[11px] text-[var(--muted)]">
              Critical &amp; High Deficits
            </div>
          </div>

          {/* KPI 5: Assessments Completed */}
          <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4 shadow-xs">
            <div className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider">
              Assessments Run
            </div>
            <div className="mt-1.5 text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              {analytics?.total_assessments_conducted ?? 23}
            </div>
            <div className="mt-1 text-[11px] text-[var(--muted)]">
              Diagnostic &amp; Daily Quizzes
            </div>
          </div>

          {/* KPI 6: Average Competency */}
          <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4 shadow-xs">
            <div className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider">
              Avg Competency
            </div>
            <div className="mt-1.5 text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-400">
              {analytics?.average_workforce_health_score ?? 72}%
            </div>
            <div className="mt-1 text-[11px] text-[var(--muted)]">
              Benchmark: &ge; 80%
            </div>
          </div>
        </section>

        {/* ANALYTICAL ROW 1: Workforce Health & Top Competency Gaps */}
        <section className="grid gap-5 lg:grid-cols-2">
          {/* Card 1: Workforce Competency Health */}
          <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                    Workforce Competency Health
                  </h2>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Aggregated proficiency score across the 4 official statistical categories.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[var(--primary)]">
                    {analytics?.average_workforce_health_score ?? 72}%
                  </span>
                  <div className="text-[10px] text-[var(--muted)]">Overall Health</div>
                </div>
              </div>

              {/* Horizontal Category Bars */}
              <div className="mt-5 space-y-3.5">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-[var(--foreground)]">Statistical Methodology</span>
                    <span className="font-mono font-bold text-[var(--foreground)]">{categoryHealth.STATISTICAL || 64}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-[var(--primary)] transition-all duration-300"
                      style={{ width: `${categoryHealth.STATISTICAL || 64}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-[var(--foreground)]">Technical &amp; Analytical</span>
                    <span className="font-mono font-bold text-[var(--foreground)]">{categoryHealth.TECHNICAL || 78}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-[var(--primary)] transition-all duration-300"
                      style={{ width: `${categoryHealth.TECHNICAL || 78}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-[var(--foreground)]">Digital Governance</span>
                    <span className="font-mono font-bold text-[var(--foreground)]">{categoryHealth.DIGITAL_GOVERNANCE || 71}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-[var(--primary)] transition-all duration-300"
                      style={{ width: `${categoryHealth.DIGITAL_GOVERNANCE || 71}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-[var(--foreground)]">Behavioural &amp; Managerial</span>
                    <span className="font-mono font-bold text-[var(--foreground)]">{categoryHealth.BEHAVIOURAL_MANAGERIAL || 82}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-[var(--primary)] transition-all duration-300"
                      style={{ width: `${categoryHealth.BEHAVIOURAL_MANAGERIAL || 82}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--muted)]">
              <span>Benchmark Standard: &ge; 80%</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">&bull; Behavioural category strongest</span>
            </div>
          </div>

          {/* Card 2: Top Competency Gaps */}
          <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                    Top Competency Gaps
                  </h2>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Highest proficiency deficits across officials requiring training intervention.
                  </p>
                </div>
                <Link
                  href="/courses"
                  className="text-xs font-semibold text-[var(--primary)] hover:underline"
                >
                  Explore Courses &rarr;
                </Link>
              </div>

              {/* Gap Breakdown List */}
              <div className="mt-4 space-y-2.5">
                {(analytics?.high_deficiency_competencies || []).slice(0, 5).map((gap) => (
                  <div
                    key={gap.competency_id || gap.competency_name}
                    className="p-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--foreground)] truncate">{gap.competency_name}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          gap.priority === "CRITICAL"
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                        }`}>
                          {gap.priority}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--muted)] mt-0.5">
                        {gap.officials_affected} officials affected &middot; Average Gap: -{gap.average_gap} levels
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-rose-700 dark:text-rose-400">
                        {Math.round((gap.average_gap / Math.max(1, gap.average_required_level || 3)) * 100)}% below target
                      </div>
                      <span className="text-[10px] text-[var(--muted)]">L{gap.average_current_level} / L{gap.average_required_level}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--muted)]">
              Scoring aggregates role competency requirements against current verified assessments.
            </div>
          </div>
        </section>

        {/* ANALYTICAL ROW 2: Department Health & Role Analytics */}
        <section className="grid gap-5 lg:grid-cols-2">
          {/* Card 3: Department / Organization Health */}
          <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
              Department &amp; Organization Health
            </h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Average competency benchmark coverage across ministries and nodal divisions.
            </p>

            <div className="mt-4 space-y-3">
              {(analytics?.department_analytics || [
                { organization_name: "Survey Design & Research Division (SDRD)", total_officials: 4, average_health_score: 68, top_gap_competencies: ["Sampling", "Data Quality"] },
                { organization_name: "National Data & Analytics Platform (NDAP)", total_officials: 3, average_health_score: 81, top_gap_competencies: ["Metadata Standards"] },
                { organization_name: "Field Operations Division (FOD - NSSO)", total_officials: 3, average_health_score: 59, top_gap_competencies: ["Survey Sampling", "Field Protocols"] },
                { organization_name: "Economic Statistics & National Accounts", total_officials: 2, average_health_score: 74, top_gap_competencies: ["Price Indices"] },
              ]).map((dept, idx) => (
                <div key={idx} className="p-3 rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-[var(--foreground)] truncate">{dept.organization_name}</span>
                    <span className="font-mono font-bold text-[var(--primary)]">{dept.average_health_score}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden mb-2">
                    <div
                      className="h-1.5 rounded-full bg-[var(--primary)]"
                      style={{ width: `${dept.average_health_score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
                    <span>{dept.total_officials} Officials Assigned</span>
                    {dept.top_gap_competencies.length > 0 && (
                      <span className="truncate">Top Gap: {dept.top_gap_competencies[0]}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Role Competency Overview */}
          <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
              Role Competency Overview
            </h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Proficiency standards compliance across designated statistical roles.
            </p>

            <div className="mt-4 space-y-3">
              {(analytics?.role_wise_analytics || []).slice(0, 4).map((roleItem) => (
                <div key={roleItem.role_id} className="p-3 rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-[var(--foreground)] truncate">{roleItem.role_name}</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{roleItem.average_health_score}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden mb-2">
                    <div
                      className="h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500"
                      style={{ width: `${roleItem.average_health_score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
                    <span>{roleItem.total_officials} Officials</span>
                    <span className="truncate">
                      Deficits: {roleItem.top_gap_competencies.slice(0, 2).join(", ") || "None"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ANALYTICAL ROW 3: Workforce Readiness & Assessment / Learning Progress */}
        <section className="grid gap-5 lg:grid-cols-2">
          {/* Card 5: Workforce Readiness */}
          <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                Workforce Readiness
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Proportion of officials meeting role proficiency targets.
              </p>

              {/* Segmented Bar */}
              <div className="mt-4 flex h-3 w-full rounded-md overflow-hidden bg-[var(--border)]">
                <div
                  className="bg-emerald-600 dark:bg-emerald-500 transition-all duration-300"
                  style={{ width: `${readiness.fully_ready_pct}%` }}
                  title={`Fully Ready: ${readiness.fully_ready_pct}%`}
                />
                <div
                  className="bg-amber-500 transition-all duration-300"
                  style={{ width: `${readiness.needs_development_pct}%` }}
                  title={`Needs Development: ${readiness.needs_development_pct}%`}
                />
                <div
                  className="bg-slate-400 dark:bg-slate-600 transition-all duration-300"
                  style={{ width: `${readiness.assessment_pending_pct}%` }}
                  title={`Assessment Pending: ${readiness.assessment_pending_pct}%`}
                />
              </div>

              {/* 3 Status Cards */}
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 rounded-md border border-emerald-500/20 bg-emerald-500/5">
                  <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                    {readiness.fully_ready_pct}%
                  </div>
                  <div className="text-[11px] font-semibold text-[var(--foreground)] mt-0.5">Fully Ready</div>
                  <div className="text-[10px] text-[var(--muted)]">{readiness.fully_ready_count} officials</div>
                </div>

                <div className="p-2.5 rounded-md border border-amber-500/20 bg-amber-500/5">
                  <div className="text-lg font-bold text-amber-700 dark:text-amber-400">
                    {readiness.needs_development_pct}%
                  </div>
                  <div className="text-[11px] font-semibold text-[var(--foreground)] mt-0.5">In Development</div>
                  <div className="text-[10px] text-[var(--muted)]">{readiness.needs_development_count} officials</div>
                </div>

                <div className="p-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)]">
                  <div className="text-lg font-bold text-[var(--muted)]">
                    {readiness.assessment_pending_pct}%
                  </div>
                  <div className="text-[11px] font-semibold text-[var(--foreground)] mt-0.5">Pending Test</div>
                  <div className="text-[10px] text-[var(--muted)]">{readiness.assessment_pending_count} officials</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--muted)]">
              Based on live role competency matrix and automated diagnostic assessment logs.
            </div>
          </div>

          {/* Card 6: Learning & Assessment Progress */}
          <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                Assessment &amp; Learning Progress
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Evaluation results and course completion metrics on iGOT Karmayogi &amp; NSSTA.
              </p>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)] text-center">
                  <div className="text-xl font-bold text-[var(--foreground)]">{assessment.assessments_completed}</div>
                  <div className="text-[11px] text-[var(--muted)] mt-0.5">Assessments</div>
                </div>

                <div className="p-3 rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)] text-center">
                  <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{assessment.pass_rate}%</div>
                  <div className="text-[11px] text-[var(--muted)] mt-0.5">Pass Rate (&ge;60%)</div>
                </div>

                <div className="p-3 rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)] text-center">
                  <div className="text-xl font-bold text-[var(--primary)]">{learning.courses_started}</div>
                  <div className="text-[11px] text-[var(--muted)] mt-0.5">Courses Started</div>
                </div>

                <div className="p-3 rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)] text-center">
                  <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{learning.courses_completed}</div>
                  <div className="text-[11px] text-[var(--muted)] mt-0.5">Completed</div>
                </div>
              </div>

              <div className="mt-3 p-3 rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)] flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-[var(--foreground)]">Average Assessment Score:</span>{" "}
                  <span className="font-mono font-bold text-[var(--foreground)]">{assessment.average_score}%</span>
                </div>
                <div>
                  <span className="font-semibold text-[var(--foreground)]">Avg Learning Completion:</span>{" "}
                  <span className="font-mono font-bold text-[var(--foreground)]">{learning.average_completion_pct}%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--muted)]">
              Verified certificates and diagnostic results automatically calculate proficiency level adjustments.
            </div>
          </div>
        </section>

        {/* MAJOR SECTION 4: EMPLOYEES NEEDING ATTENTION */}
        <section id="attention-alerts" className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">
                EMPLOYEES NEEDING ATTENTION
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Officials with high competency deficits or priority training intervention needs.
              </p>
            </div>
            <span className="text-xs text-[var(--muted)] font-medium">
              Showing top {attentionList.length} priority officials
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--muted)] font-semibold">
                  <th className="py-2.5 px-3">Official Name</th>
                  <th className="py-2.5 px-3">Designation / Role</th>
                  <th className="py-2.5 px-3">Organization</th>
                  <th className="py-2.5 px-3">Main Competency Gap</th>
                  <th className="py-2.5 px-3">Health</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {attentionList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-[var(--muted)]">
                      All registered officials currently meet competency threshold benchmarks.
                    </td>
                  </tr>
                ) : (
                  attentionList.map((emp) => (
                    <tr key={emp.id} className="hover:bg-[var(--panel-soft)] transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-[var(--foreground)]">{emp.name}</div>
                        <div className="text-[11px] text-[var(--muted)]">{emp.email}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-[var(--foreground)]">{emp.designation || emp.role_name}</span>
                      </td>

                      <td className="py-3 px-3 text-[var(--muted)]">
                        {emp.organization_name}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-rose-700 dark:text-rose-400">
                          {emp.primary_gap_competency}
                        </span>
                        <span className="text-[10px] text-[var(--muted)] ml-1.5">(Gap: {emp.gap_level})</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-[var(--foreground)]">{emp.health_score}%</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          emp.priority === "CRITICAL"
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                        }`}>
                          {emp.priority}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedEmployee(emp)}
                          className="px-2.5 py-1 rounded-md bg-[var(--panel-soft)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--foreground)] text-xs font-semibold transition"
                        >
                          View Profile &rarr;
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* MAJOR SECTION 5: OFFICIALS CADRE DIRECTORY */}
        <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">
                OFFICIALS CADRE DIRECTORY
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Complete roster of registered statistical personnel across participating divisions.
              </p>
            </div>
            <span className="text-xs text-[var(--muted)] font-medium">
              {filteredOfficials.length} {filteredOfficials.length === 1 ? "official" : "officials"} listed
            </span>
          </div>

          {/* Search & Filters */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search officials by name, role, organization..."
                className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
              >
                {orgs.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Needs Attention">Needs Attention (High/Critical Gap)</option>
                <option value="Assessed">Assessed</option>
                <option value="Pending Assessment">Pending Assessment</option>
                <option value="On Target">On Target</option>
              </select>
            </div>
          </div>

          {/* Directory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--muted)] font-semibold">
                  <th className="py-2.5 px-3">Official</th>
                  <th className="py-2.5 px-3">Assigned Role</th>
                  <th className="py-2.5 px-3">Organization</th>
                  <th className="py-2.5 px-3">Health</th>
                  <th className="py-2.5 px-3">Priority Gap</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-xs text-[var(--muted)]">
                      Loading workforce directory...
                    </td>
                  </tr>
                ) : filteredOfficials.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-xs text-[var(--muted)]">
                      No officials match the search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOfficials.map((official) => {
                    const oOrg = ("organization" in official && official.organization) ? official.organization : (("organization_name" in official && official.organization_name) ? official.organization_name : "MoSPI");
                    const oRole = ("role_name" in official && official.role_name) ? official.role_name : (("designation" in official && official.designation) ? official.designation : "Statistical Officer");
                    const oHealth = "health_score" in official ? official.health_score : 70;
                    const oGap = "primary_gap" in official ? official.primary_gap : "Sampling";
                    const oPriority = "priority" in official ? official.priority : "MEDIUM";
                    const oStatus = "assessment_status" in official ? official.assessment_status : "Assessed";
                    const oEmpId = ("employee_id" in official && official.employee_id) ? official.employee_id : `MOSPI-${official.id}`;

                    return (
                      <tr key={official.id} className="hover:bg-[var(--panel-soft)] transition">
                        <td className="py-3 px-3">
                          <div className="font-bold text-[var(--foreground)]">{official.name}</div>
                          <div className="text-[11px] text-[var(--muted)] font-mono">{oEmpId}</div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-medium text-[var(--foreground)]">{oRole}</span>
                        </td>

                        <td className="py-3 px-3 text-[var(--muted)]">
                          {oOrg}
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[var(--foreground)]">{oHealth}%</span>
                            <div className="w-12 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${
                                  oHealth >= 80 ? "bg-emerald-600" : oHealth >= 60 ? "bg-amber-500" : "bg-rose-500"
                                }`}
                                style={{ width: `${oHealth}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className={oPriority === "HIGH" || oPriority === "CRITICAL" ? "text-rose-700 dark:text-rose-400 font-semibold" : "text-[var(--foreground)]"}>
                            {oGap}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            oStatus === "Assessed"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-[var(--panel-soft)] text-[var(--muted)] border border-[var(--border)]"
                          }`}>
                            {oStatus}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedEmployee(official)}
                              className="px-2.5 py-1 rounded-md bg-[var(--panel-soft)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--foreground)] text-xs font-semibold transition"
                            >
                              Profile
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSwitchUser(official.id)}
                              className="px-2.5 py-1 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold transition inline-flex items-center gap-1"
                              title="Switch persona to this user"
                            >
                              <span>View Persona</span>
                              <ArrowRightIcon className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* EMPLOYEE DETAIL MODAL */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-md border border-[var(--border)] bg-[var(--panel)] p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[var(--border-subtle)] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                  Official Record &amp; Capability Card
                </span>
                <h3 className="text-lg font-bold text-[var(--foreground)] mt-0.5">
                  {selectedEmployee.name}
                </h3>
                <p className="text-xs text-[var(--muted)]">{selectedEmployee.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="rounded-md p-1.5 text-[var(--muted)] hover:bg-[var(--panel-soft)] hover:text-[var(--foreground)] transition"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[var(--panel-inner)] p-3 rounded-md border border-[var(--border-subtle)]">
              <div>
                <span className="text-[10px] text-[var(--muted)] uppercase font-semibold">Employee ID</span>
                <div className="font-mono font-bold text-[var(--foreground)] mt-0.5">
                  {"employee_id" in selectedEmployee && selectedEmployee.employee_id ? selectedEmployee.employee_id : `MOSPI-${selectedEmployee.id}`}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-[var(--muted)] uppercase font-semibold">Assigned Role</span>
                <div className="font-semibold text-[var(--foreground)] mt-0.5">
                  {"role_name" in selectedEmployee ? selectedEmployee.role_name : ("designation" in selectedEmployee ? selectedEmployee.designation : "Statistical Officer")}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-[var(--muted)] uppercase font-semibold">Organization</span>
                <div className="font-medium text-[var(--foreground)] mt-0.5">
                  {"organization" in selectedEmployee && selectedEmployee.organization ? selectedEmployee.organization : ("organization_name" in selectedEmployee && selectedEmployee.organization_name ? selectedEmployee.organization_name : "MoSPI")}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-[var(--muted)] uppercase font-semibold">Service Cadre</span>
                <div className="font-medium text-[var(--foreground)] mt-0.5">
                  {"service_cadre" in selectedEmployee && selectedEmployee.service_cadre ? selectedEmployee.service_cadre : "Indian Statistical Service (ISS)"}
                </div>
              </div>
            </div>

            {/* Competency Health Status */}
            <div className="p-3 rounded-md border border-[var(--border-subtle)] bg-[var(--panel-inner)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--foreground)]">Competency Health Score</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {"health_score" in selectedEmployee ? selectedEmployee.health_score : 72}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
                <div
                  className="h-2 rounded-full bg-emerald-600"
                  style={{ width: `${"health_score" in selectedEmployee ? selectedEmployee.health_score : 72}%` }}
                />
              </div>
            </div>

            {/* Priority Deficits */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Identified Skill Gaps &amp; Interventions
              </div>
              <div className="p-3 rounded-md border border-amber-500/20 bg-amber-500/5 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-900 dark:text-amber-200">
                    {"primary_gap" in selectedEmployee ? selectedEmployee.primary_gap : ("primary_gap_competency" in selectedEmployee ? selectedEmployee.primary_gap_competency : "Survey Sampling Methodology")}
                  </span>
                  <div className="text-[11px] text-[var(--muted)] mt-0.5">
                    Recommended: iGOT &amp; NSSTA Specialization
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300">
                  Priority Deficit
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="px-3 py-1.5 rounded-md border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleSwitchUser(selectedEmployee.id)}
                className="px-4 py-1.5 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold transition inline-flex items-center gap-1.5"
              >
                <span>Switch to Persona Dashboard</span>
                <ArrowRightIcon className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

