"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "../components/app-shell";
import {
  fetchSkillGaps,
  fetchRecommendedCourses,
  fetchUserRoadmaps,
  fetchUserQuizHistory,
  fetchUserProfile,
  SkillGapData,
  CourseRecommendation,
  Roadmap,
  UserProfile,
  getCurrentUserId,
  formatScore,
} from "../../lib/api";
import {
  ActivityIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClipboardIcon,
  GraduationCapIcon,
  MapIcon,
  TargetIcon,
  TrendingUpIcon,
} from "../components/icons";

interface DomainScore {
  domain: string;
  score: number;
}

export default function DashboardPage() {
  const [gapData, setGapData] = useState<SkillGapData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setLoadError(null);
      const userId = getCurrentUserId();

      const [gaps, profile, recs, rms, quizzes] = await Promise.all([
        fetchSkillGaps(userId).catch(() => null),
        fetchUserProfile(userId).catch(() => null),
        fetchRecommendedCourses(userId).catch(() => []),
        fetchUserRoadmaps(userId).catch(() => []),
        fetchUserQuizHistory(userId).catch(() => []),
      ]);

      setGapData(gaps);
      setUserProfile(profile);
      setRecommendations(recs || []);
      setRoadmaps(rms || []);
      setQuizHistory(quizzes || []);
    } catch (err: any) {
      console.error("Dashboard load failed:", err);
      setLoadError("Unable to load your competency data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Derive role-relevant competency names for strict data consistency
  const roleCompetencyNames = useMemo(() => {
    const list: string[] = [];
    if (gapData?.skill_gaps) {
      gapData.skill_gaps.forEach((g) => list.push(g.competency.toLowerCase()));
    }
    if (userProfile?.competencies) {
      userProfile.competencies.forEach((c) => {
        if (!list.includes(c.competency_name.toLowerCase())) {
          list.push(c.competency_name.toLowerCase());
        }
      });
    }
    return list;
  }, [gapData, userProfile]);

  // Compute simplified domain breakdowns
  const domainScores: DomainScore[] = useMemo(() => {
    if (!gapData?.skill_gaps?.length) {
      return [
        { domain: "Statistical", score: 70 },
        { domain: "Technical", score: 65 },
        { domain: "Digital", score: 80 },
        { domain: "Behavioural", score: 75 },
      ];
    }

    const map: Record<string, { totalCurrent: number; totalRequired: number }> = {
      Statistical: { totalCurrent: 0, totalRequired: 0 },
      Technical: { totalCurrent: 0, totalRequired: 0 },
      Digital: { totalCurrent: 0, totalRequired: 0 },
      Behavioural: { totalCurrent: 0, totalRequired: 0 },
    };

    gapData.skill_gaps.forEach((g) => {
      const cat = g.category?.toUpperCase() || "";
      let targetKey = "Behavioural";
      if (cat.includes("STAT") || cat === "STATISTICAL") {
        targetKey = "Statistical";
      } else if (cat.includes("TECH") || cat.includes("DATA") || cat === "TECHNICAL") {
        targetKey = "Technical";
      } else if (cat.includes("GOV") || cat.includes("PRIVACY") || cat.includes("DIGITAL")) {
        targetKey = "Digital";
      }

      map[targetKey].totalCurrent += g.current_level;
      map[targetKey].totalRequired += Math.max(g.required_level, 1);
    });

    return Object.entries(map).map(([domain, val]) => {
      const score = val.totalRequired > 0 ? Math.round((val.totalCurrent / val.totalRequired) * 100) : 100;
      return {
        domain,
        score: Math.min(score, 100),
      };
    });
  }, [gapData]);

  // Derived metrics
  const healthScore = gapData?.overall_health_score || 0;
  const criticalGaps = gapData?.skill_gaps.filter((g) => g.priority === "CRITICAL") || [];
  const highGaps = gapData?.skill_gaps.filter((g) => g.priority === "HIGH") || [];
  const mediumGaps = gapData?.skill_gaps.filter((g) => g.priority === "MEDIUM") || [];
  const priorityGapsCount = criticalGaps.length + highGaps.length;

  // Highest priority gap for Next Step
  const topGap = useMemo(() => {
    if (criticalGaps.length > 0) return criticalGaps[0];
    if (highGaps.length > 0) return highGaps[0];
    if (mediumGaps.length > 0) return mediumGaps[0];
    return gapData?.skill_gaps?.find((g) => g.gap > 0) || null;
  }, [criticalGaps, highGaps, mediumGaps, gapData]);

  // Filter Active Roadmap to ensure strict role relevance
  const activeRoadmap = useMemo(() => {
    if (!roadmaps || roadmaps.length === 0) return null;
    return roadmaps.find((rm) => {
      const target = (rm.target_competency || "").toLowerCase();
      const title = (rm.title || "").toLowerCase();
      return roleCompetencyNames.some((rc) =>
        target.includes(rc) || rc.includes(target) || title.includes(rc)
      );
    }) || null;
  }, [roadmaps, roleCompetencyNames]);

  const nextPendingTask = activeRoadmap?.tasks?.find((t) => t.status === "Pending");
  const completedTasksCount = activeRoadmap?.tasks?.filter((t) => t.status === "Completed").length || 0;
  const totalTasksCount = activeRoadmap?.tasks?.length || 0;
  const roadmapProgress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Filter Latest Assessment for role relevance
  const latestQuiz = useMemo(() => {
    if (!quizHistory || quizHistory.length === 0) return null;
    const roleQuiz = quizHistory.find((q) => {
      const topic = (q.topic || "").toLowerCase();
      return (
        roleCompetencyNames.some((rc) => topic.includes(rc) || rc.includes(topic)) ||
        topic.includes("survey") ||
        topic.includes("sampling") ||
        topic.includes("statistical") ||
        topic.includes("accounts") ||
        topic.includes("index") ||
        topic.includes("python") ||
        topic.includes("plfs") ||
        topic.includes("microdata") ||
        topic.includes("privacy")
      );
    });
    return roleQuiz || quizHistory[0];
  }, [quizHistory, roleCompetencyNames]);

  // Primary Action
  const primaryCTA = useMemo(() => {
    if (topGap && topGap.gap > 0) {
      return {
        label: "Start Diagnostic",
        href: `/assessments?competency_id=${topGap.competency_id}&topic=${encodeURIComponent(topGap.competency)}&mode=diagnostic`,
      };
    }
    if (activeRoadmap && nextPendingTask) {
      return {
        label: "Continue Learning",
        href: "/roadmap",
      };
    }
    return {
      label: "View Skill Gaps",
      href: "/skill-gaps",
    };
  }, [topGap, activeRoadmap, nextPendingTask]);

  return (
    <AppShell
      title="Dashboard"
      subtitle="Competency overview, priority skill gaps, and personalized learning."
    >
      {loadError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-center">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">{loadError}</p>
          <button
            onClick={loadDashboardData}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-1.5 text-xs font-bold text-white hover:bg-[var(--primary-hover)] transition"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        /* SKELETON LOADER */
        <div className="space-y-4 animate-pulse" aria-busy="true">
          <div className="h-20 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4" />
          <div className="h-16 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-48 rounded-xl border border-[var(--border)] bg-[var(--panel)]" />
            <div className="h-48 rounded-xl border border-[var(--border)] bg-[var(--panel)]" />
          </div>
        </div>
      ) : (
        <div className="space-y-5">

          {/* ================= 1. SIMPLIFIED WELCOME HEADER ================= */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:p-5 shadow-[var(--card-shadow)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  Welcome back
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-[var(--foreground)] mt-0.5">
                  {gapData?.user_name || userProfile?.name || "Official"}
                </h1>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  <strong className="text-[var(--foreground)]">{gapData?.role_name || userProfile?.role_name || "Statistical Official"}</strong> • {gapData?.organization_name || userProfile?.organization_name || "MoSPI"}
                </p>
                <p className="text-xs text-[var(--primary)] font-semibold mt-1">
                  {priorityGapsCount > 0 ? `${priorityGapsCount} priority skills need attention.` : "Your competencies meet role requirements."}
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  href={primaryCTA.href}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-[var(--primary)] text-xs font-bold text-white hover:bg-[var(--primary-hover)] transition shadow-xs"
                >
                  <ClipboardIcon className="h-3.5 w-3.5" />
                  <span>{primaryCTA.label}</span>
                </Link>
              </div>
            </div>
          </section>

          {/* ================= 2. COMPACT NEXT STEP ================= */}
          {topGap && topGap.gap > 0 ? (
            <section className="rounded-xl border border-[var(--primary)]/30 bg-[var(--primary-soft)] p-3.5 sm:p-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                      Next Step
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[var(--panel)] text-[var(--muted)] border border-[var(--border-subtle)]">
                      Gap: {topGap.gap} lvl
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-[var(--foreground)]">
                    Complete {topGap.competency} Assessment
                  </h2>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {topGap.competency} is currently {topGap.gap} level{topGap.gap > 1 ? "s" : ""} below the requirement for your role.
                  </p>
                </div>

                <div className="shrink-0">
                  <Link
                    href={`/assessments?competency_id=${topGap.competency_id}&topic=${encodeURIComponent(topGap.competency)}&mode=diagnostic`}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-md bg-[var(--primary)] text-xs font-bold text-white hover:bg-[var(--primary-hover)] transition shadow-xs"
                  >
                    <span>Start Assessment →</span>
                  </Link>
                </div>
              </div>
            </section>
          ) : null}

          {/* ================= 3. FOUR CLEAN KPI METRICS ================= */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* KPI 1 */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3.5 shadow-[var(--card-shadow)]">
              <div className="flex items-center justify-between text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">
                <span>Competency Health</span>
                <ActivityIcon className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <div className="mt-1.5 text-2xl font-black text-[var(--foreground)]">
                {formatScore(healthScore)}%
              </div>
              <div className="mt-2 w-full bg-[var(--panel-inner)] h-1.5 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(healthScore, 100)}%` }}
                />
              </div>
            </div>

            {/* KPI 2 */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3.5 shadow-[var(--card-shadow)]">
              <div className="flex items-center justify-between text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">
                <span>Priority Gaps</span>
                <TargetIcon className="h-3.5 w-3.5 text-red-500" />
              </div>
              <div className="mt-1.5 text-2xl font-black text-red-600 dark:text-red-400">
                {priorityGapsCount}
              </div>
              <div className="mt-2 text-[11px] text-[var(--muted)]">
                {gapData?.total_competencies ? `${gapData.total_competencies} competencies assessed` : "No baseline"}
              </div>
            </div>

            {/* KPI 3 */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3.5 shadow-[var(--card-shadow)]">
              <div className="flex items-center justify-between text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">
                <span>Learning Progress</span>
                <GraduationCapIcon className="h-3.5 w-3.5 text-[var(--primary)]" />
              </div>
              <div className="mt-1.5 text-2xl font-black text-[var(--foreground)]">
                {activeRoadmap ? `${formatScore(roadmapProgress)}%` : "0%"}
              </div>
              <div className="mt-2 w-full bg-[var(--panel-inner)] h-1.5 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                <div
                  className="bg-[var(--primary)] h-full rounded-full transition-all"
                  style={{ width: `${roadmapProgress}%` }}
                />
              </div>
            </div>

            {/* KPI 4 */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3.5 shadow-[var(--card-shadow)]">
              <div className="flex items-center justify-between text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">
                <span>Last Assessment</span>
                <TrendingUpIcon className="h-3.5 w-3.5 text-sky-500" />
              </div>
              <div className="mt-1.5 text-2xl font-black text-[var(--foreground)]">
                {latestQuiz ? `${formatScore(latestQuiz.score)}%` : "—"}
              </div>
              <div className="mt-2 text-[11px] text-[var(--muted)] truncate">
                {latestQuiz ? (latestQuiz.score >= 70 ? "Passed" : "Review needed") : "Not assessed"}
              </div>
            </div>

          </section>

          {/* ================= 4. COMPETENCY HEALTH & BIGGEST SKILL GAPS ================= */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* LEFT: Competency Health */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:p-5 shadow-[var(--card-shadow)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-sm font-bold text-[var(--foreground)]">
                      Competency Health
                    </h2>
                    <p className="text-[11px] text-[var(--muted)]">
                      Your current competency levels
                    </p>
                  </div>
                  <div className="text-base font-mono font-black text-[var(--foreground)]">
                    {formatScore(healthScore)}%
                  </div>
                </div>

                <div className="space-y-3 mt-3">
                  {domainScores.map((d) => (
                    <div key={d.domain} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-[var(--foreground)]">{d.domain}</span>
                        <span className="font-mono text-[var(--muted)]">{formatScore(d.score)}%</span>
                      </div>
                      <div className="w-full bg-[var(--panel-inner)] h-2 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                        <div
                          className={`h-full rounded-full transition-all ${
                            d.score >= 75
                              ? "bg-emerald-500"
                              : d.score >= 60
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${d.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end">
                <Link
                  href="/skill-gaps"
                  className="text-xs font-semibold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
                >
                  <span>View Skill Gaps</span>
                  <ChevronRightIcon className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* RIGHT: Biggest Skill Gaps */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:p-5 shadow-[var(--card-shadow)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-sm font-bold text-[var(--foreground)]">
                      Biggest Skill Gaps
                    </h2>
                    <p className="text-[11px] text-[var(--muted)]">
                      Priority areas needing improvement
                    </p>
                  </div>
                  <Link
                    href="/skill-gaps"
                    className="text-xs font-semibold text-[var(--primary)] hover:underline"
                  >
                    View All →
                  </Link>
                </div>

                <div className="space-y-2">
                  {[...criticalGaps, ...highGaps, ...mediumGaps].slice(0, 3).map((g) => (
                    <div
                      key={g.competency_id}
                      className="rounded-lg border border-[var(--border-subtle)] bg-[var(--panel-soft)] px-3 py-2 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[var(--foreground)] truncate">
                          {g.competency}
                        </div>
                        <div className="text-[11px] text-[var(--muted)] flex items-center gap-2 mt-0.5">
                          <span>Level {g.current_level} → Level {g.required_level}</span>
                          <span
                            className={`text-[9px] font-mono font-bold uppercase ${
                              g.priority === "CRITICAL"
                                ? "text-red-600 dark:text-red-400"
                                : g.priority === "HIGH"
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-sky-600 dark:text-sky-400"
                            }`}
                          >
                            {g.priority}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/assessments?competency_id=${g.competency_id}&topic=${encodeURIComponent(g.competency)}&mode=diagnostic`}
                        className="shrink-0 text-xs font-bold px-2.5 py-1 rounded bg-[var(--panel)] border border-[var(--border)] text-[var(--primary)] hover:border-[var(--primary)] transition"
                      >
                        Diagnose
                      </Link>
                    </div>
                  ))}

                  {priorityGapsCount === 0 && (
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center text-xs text-emerald-700 dark:text-emerald-300">
                      <CheckCircleIcon className="mx-auto h-5 w-5 mb-1 text-emerald-500" />
                      All competencies currently satisfy role standards.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--muted)]">
                <span>{gapData?.total_competencies || 0} competencies assessed</span>
                <Link href="/skill-gaps" className="font-semibold text-[var(--primary)] hover:underline">
                  Gap Matrix →
                </Link>
              </div>
            </div>

          </section>

          {/* ================= 5. RECOMMENDED FOR YOU ================= */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:p-5 shadow-[var(--card-shadow)]">
            <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[var(--border-subtle)]">
              <div>
                <h2 className="text-sm font-bold text-[var(--foreground)]">
                  Recommended for You
                </h2>
                <p className="text-[11px] text-[var(--muted)]">
                  Courses targeting your highest-priority gaps
                </p>
              </div>
              <Link href="/courses" className="text-xs font-semibold text-[var(--primary)] hover:underline shrink-0">
                View Full Catalog →
              </Link>
            </div>

            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {recommendations.slice(0, 3).map((rec) => {
                  const isIgot = (rec.source || "").toLowerCase().includes("igot");
                  return (
                    <div
                      key={rec.course_id}
                      className="rounded-lg border border-[var(--border-subtle)] bg-[var(--panel-soft)] p-3.5 flex flex-col justify-between hover:border-[var(--primary)] transition"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                              isIgot
                                ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20"
                                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                            }`}
                          >
                            {rec.source || "iGOT Karmayogi"}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {rec.match_percentage}% Match
                          </span>
                        </div>

                        <h3 className="font-bold text-xs text-[var(--foreground)] line-clamp-2 leading-snug">
                          {rec.title}
                        </h3>

                        <div className="mt-1.5 text-[11px] text-[var(--muted)] line-clamp-1">
                          Addresses: <strong>{rec.skills_addressed.slice(0, 2).join(" • ") || "Role Skills"}</strong>
                        </div>

                        <p className="mt-1 text-[11px] text-[var(--muted-soft)] line-clamp-2">
                          {rec.reason || "Recommended based on your current skill gap."}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between">
                        <span className="text-[10px] text-[var(--muted)] font-mono">
                          {rec.duration_hours ? `${rec.duration_hours} hrs` : "Self-paced"}
                        </span>
                        <a
                          href={rec.course_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--primary)] text-white text-xs font-bold hover:bg-[var(--primary-hover)] transition"
                        >
                          <span>Start Course →</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-[var(--muted)]">
                No course recommendations available yet.
              </div>
            )}
          </section>

          {/* ================= 6. CONTINUE LEARNING & LATEST ASSESSMENT ================= */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Continue Learning */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:p-5 shadow-[var(--card-shadow)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <MapIcon className="h-4 w-4 text-[var(--primary)]" />
                    <h2 className="text-sm font-bold text-[var(--foreground)]">
                      Continue Learning
                    </h2>
                  </div>
                  <Link href="/roadmap" className="text-xs font-semibold text-[var(--primary)] hover:underline">
                    Roadmap →
                  </Link>
                </div>

                {activeRoadmap ? (
                  <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--panel-soft)] p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--foreground)] truncate">
                        {activeRoadmap.target_competency}
                      </span>
                      <span className="text-xs font-mono font-bold text-[var(--primary)]">
                        {roadmapProgress}%
                      </span>
                    </div>

                    <div className="w-full bg-[var(--panel-inner)] h-1.5 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                      <div
                        className="bg-[var(--primary)] h-full rounded-full transition-all"
                        style={{ width: `${roadmapProgress}%` }}
                      />
                    </div>

                    {nextPendingTask && (
                      <div className="text-[11px] text-[var(--muted)] pt-1">
                        <span className="font-semibold text-[var(--foreground)]">Next: </span>
                        <span>{nextPendingTask.task_title}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--muted)]">
                    <p>No active learning path.</p>
                    <Link
                      href="/roadmap"
                      className="mt-2 inline-flex items-center rounded bg-[var(--primary)] px-3 py-1 text-xs font-bold text-white hover:bg-[var(--primary-hover)] transition"
                    >
                      Start Learning →
                    </Link>
                  </div>
                )}
              </div>

              {activeRoadmap && (
                <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-end">
                  <Link href="/roadmap" className="text-xs font-semibold text-[var(--primary)] hover:underline">
                    Continue →
                  </Link>
                </div>
              )}
            </div>

            {/* Latest Assessment */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:p-5 shadow-[var(--card-shadow)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <ClipboardIcon className="h-4 w-4 text-emerald-500" />
                    <h2 className="text-sm font-bold text-[var(--foreground)]">
                      Latest Assessment
                    </h2>
                  </div>
                  <Link href="/assessments" className="text-xs font-semibold text-[var(--primary)] hover:underline">
                    Take Test →
                  </Link>
                </div>

                {latestQuiz ? (
                  <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--panel-soft)] p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--foreground)] truncate max-w-[180px]">
                        {latestQuiz.topic || "Statistical Diagnostic"}
                      </span>
                      <span className="text-sm font-mono font-bold text-[var(--foreground)]">
                        {formatScore(latestQuiz.score)}%
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-[var(--muted)]">
                      <span>Result:</span>
                      <span className="font-semibold text-[var(--foreground)]">
                        {latestQuiz.correct_answers} / {latestQuiz.total_questions} correct
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-[var(--muted)]">
                      <span>Status:</span>
                      <span className={`font-bold ${latestQuiz.score >= 70 ? "text-emerald-500" : "text-amber-500"}`}>
                        {latestQuiz.score >= 70 ? "Passed" : "Needs improvement"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--muted)]">
                    <p>Complete your diagnostic to validate your competency.</p>
                    <Link
                      href="/assessments"
                      className="mt-2 inline-flex items-center rounded bg-[var(--primary)] px-3 py-1 text-xs font-bold text-white hover:bg-[var(--primary-hover)] transition"
                    >
                      Start Diagnostic →
                    </Link>
                  </div>
                )}
              </div>

              {latestQuiz && (
                <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-end">
                  <Link href="/assessments" className="text-xs font-semibold text-[var(--primary)] hover:underline">
                    View Result →
                  </Link>
                </div>
              )}
            </div>

          </section>

        </div>
      )}
    </AppShell>
  );
}
