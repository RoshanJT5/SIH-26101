"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import { ArrowRightIcon, GovernmentIcon } from "../components/icons";
import { getCurrentUserId, getUser, getUserRecommendations, getUserSkillGaps } from "../../lib/api";

const initialScoreBands = [
  { label: "Core", value: "19/24", color: "text-[var(--teal)]" },
  { label: "Applied", value: "3/12", color: "text-[var(--amber)]" },
  { label: "Priority", value: "0/7", color: "text-[var(--red)]" },
];

const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

const activity = Array.from({ length: 168 }, (_, index) => {
  if (index > 124 && index < 164) return [0, 1, 2, 3][index % 4];
  if (index % 19 === 0) return 1;
  return 0;
});

export default function DashboardPage() {
  const [recent, setRecent] = useState<{ title: string; date: string; state: string }[]>([]);
  const [gaps, setGaps] = useState<{ skill: string; current: number; target: number; severity: string }[]>([]);
  const [recommendations, setRecommendations] = useState<{ externalId: string; title: string; reason: string; match: string; source: string; courseUrl: string }[]>([]);
  const [solvedCount, setSolvedCount] = useState(0);
  const [scoreBands, setScoreBands] = useState(initialScoreBands);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const userId = getCurrentUserId();
        const [userResponse, skillResponse, recResponse] = await Promise.all([
          getUser(userId),
          getUserSkillGaps(userId),
          getUserRecommendations(userId),
        ]);

        if (!active) return;

        const userName = userResponse?.name || "Official";
        const comps = userResponse?.competencies || [];
        const rawGaps = skillResponse?.skill_gaps ?? [];

        // Solved skills: where current_level >= required_level
        const solved = comps.filter((c) => c.current_level >= c.required_level).length;
        setSolvedCount(solved);

        // Core, Applied, Priority stats
        const coreMet = comps.filter((c) => c.current_level >= c.required_level).length;
        const inProg = comps.filter((c) => c.current_level < c.required_level).length;
        const critGaps = rawGaps.filter((g) => g.priority === "HIGH" || g.priority === "CRITICAL").length;

        setScoreBands([
          { label: "Core Met", value: `${coreMet}/${comps.length || 1}`, color: "text-[var(--teal)]" },
          { label: "In Progress", value: `${inProg}/${comps.length || 1}`, color: "text-[var(--amber)]" },
          { label: "Priority Gaps", value: `${critGaps}/${rawGaps.length || 0}`, color: "text-[var(--red)]" },
        ]);

        const formattedSkillGaps = rawGaps.map((gap) => ({
          skill: gap.competency,
          current: Math.max(10, Math.min(100, Math.round((gap.current_level / Math.max(gap.required_level, 1)) * 100))),
          target: 100,
          severity: gap.priority === "HIGH" || gap.priority === "CRITICAL" ? "High" : gap.priority === "MEDIUM" ? "Medium" : "Low",
        }));

        const formattedRecommendations = (recResponse ?? []).map((item) => ({
          externalId: item.external_id || "IGOT",
          title: item.title,
          reason: item.reason,
          match: `${Math.round(item.score * 100)}%`,
          source: item.source || "iGOT Karmayogi",
          courseUrl: (item.course_url && !item.course_url.includes("/app/toc/")) ? item.course_url : "https://portal.igotkarmayogi.gov.in",
        }));

        const activities = [
          { title: `${userName} Profile Synced`, date: "Active", state: `${comps.length} competencies tracked` },
        ];
        if (rawGaps.length > 0) {
          activities.push({ title: "Skill Gap Detection", date: "Recent", state: `${rawGaps.length} areas need training` });
        }
        if (formattedRecommendations.length > 0) {
          activities.push({ title: "iGOT Recommendations", date: "Updated", state: `${formattedRecommendations.length} courses matched` });
        }

        setRecent(activities);
        setGaps(formattedSkillGaps);
        setRecommendations(formattedRecommendations);
      } catch {
        if (active) {
          setRecent([]);
          setGaps([]);
          setRecommendations([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell title="Dashboard" subtitle="Your official competency profile, diagnostic gaps, iGOT recommended paths, and learning telemetry.">
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <section className="panel-rise rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="grid gap-5 sm:grid-cols-[1fr_112px]">
            <div className="flex min-h-48 items-center justify-center">
              <div className="relative grid h-44 w-44 place-items-center rounded-full bg-[conic-gradient(var(--teal)_0_46%,var(--amber)_46%_66%,var(--red)_66%_76%,var(--border)_76%_100%)]">
                <div className="grid h-36 w-36 place-items-center rounded-full bg-[var(--panel)]">
                  <div className="text-center">
                    <div className="text-4xl font-semibold text-[var(--foreground)]">{solvedCount}</div>
                    <div className="text-xs text-[var(--muted)]">/ 150 competencies</div>
                    <div className="mt-1 text-xs font-bold text-[var(--green)]">Certified</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-2.5">
              {scoreBands.map((band) => (
                <div key={band.label} className="rounded-md bg-[var(--panel-inner)] border border-[var(--border-subtle)] p-2.5 text-center">
                  <div className={`text-xs font-semibold ${band.color}`}>{band.label}</div>
                  <div className="mt-1 text-sm font-bold text-[var(--foreground)]">{band.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel-rise rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-medium text-[var(--muted)]">Accredited Badges</p>
              <div className="mt-1 text-3xl font-bold text-[var(--foreground)]">3</div>
            </div>
            <div className="grid h-20 w-20 place-items-center rounded-xl border border-[var(--border)] bg-[var(--panel-inner)] text-center text-xs font-bold text-[var(--amber)] shadow-xs">
              <GovernmentIcon className="h-7 w-7" />
              <span className="block text-[10px] text-[var(--muted)] font-normal">SIH</span>
            </div>
          </div>
          <div className="mt-8">
            <p className="text-xs font-medium text-[var(--muted)]">Upcoming Milestone</p>
            <h2 className="mt-1 text-base font-bold text-[var(--foreground)]">National Statistical Competency Certification</h2>
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-bold text-[var(--foreground)]">
            <span className="text-xl">59</span> Learning &amp; Assessment Actions
          </h2>
          <p className="text-xs text-[var(--muted)]">Active days: 20 &nbsp;•&nbsp; Streak: 4 days</p>
        </div>
        <div className="mt-5 overflow-x-auto pb-2">
          <div className="grid min-w-[860px] grid-cols-12 gap-4">
            {months.map((month, monthIndex) => (
              <div key={month}>
                <div className="grid grid-cols-4 gap-1">
                  {activity.slice(monthIndex * 14, monthIndex * 14 + 14).map((level, dayIndex) => (
                    <span
                      key={`${month}-${dayIndex}`}
                      className={`h-3 w-3 rounded-[2px] ${
                        level === 0
                          ? "bg-[var(--panel-inner)] border border-[var(--border-subtle)]"
                          : level === 1
                            ? "bg-[var(--green)]/40"
                            : level === 2
                              ? "bg-[var(--green)]/70"
                              : "bg-[var(--green)]"
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-2 text-center text-[11px] font-medium text-[var(--muted)]">{month}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">
            {["Recent Submissions", "Saved Lists", "Course Progress", "Audit Trail"].map((tab, index) => (
              <button
                key={tab}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  index === 0 ? "bg-[var(--panel-soft)] text-[var(--foreground)] border border-[var(--border-subtle)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {tab}
              </button>
            ))}
            <Link href="/assessments" className="ml-auto inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]">
              <span>View All</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 space-y-2.5">
            {loading ? (
              <div className="py-6 text-center text-xs text-[var(--muted)]">Loading activity log...</div>
            ) : recent.length ? (
              recent.map((item, index) => (
                <div key={`${item.title}-${index}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-md bg-[var(--panel-inner)] border border-[var(--border-subtle)] p-3 text-xs">
                  <span className="font-semibold text-[var(--foreground)]">{item.title}</span>
                  <span className="text-[var(--muted)]">{item.state}</span>
                  <span className="text-[var(--muted)] font-mono">{item.date}</span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-[var(--muted)]">No recent activity records.</div>
            )}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <h2 className="text-base font-bold text-[var(--foreground)]">Priority Skill Gaps</h2>
            <div className="mt-4 space-y-3.5">
              {loading ? (
                <div className="py-4 text-center text-xs text-[var(--muted)]">Loading gaps...</div>
              ) : gaps.length ? (
                gaps.map((gap) => (
                  <div key={gap.skill}>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="font-semibold text-[var(--foreground)]">{gap.skill}</span>
                      <span className={`font-bold ${gap.severity === "High" ? "text-[var(--red)]" : "text-[var(--amber)]"}`}>{gap.severity}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                      <div className="h-1.5 rounded-full bg-[var(--teal)]" style={{ width: `${gap.current}%` }} />
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--muted)]">Current {gap.current}% / Benchmark {gap.target}%</div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-[var(--muted)]">
                  No active skill gaps identified.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--foreground)]">iGOT Recommendations</h2>
              <span className="inline-flex items-center gap-1 rounded bg-[var(--green-badge-bg)] border border-[var(--green)]/20 px-2 py-0.5 text-[10px] font-bold text-[var(--green-badge-text)]">
                <GovernmentIcon className="h-3.5 w-3.5" />
                <span>iGOT</span>
              </span>
            </div>
            <div className="mt-4 space-y-2.5">
              {loading ? (
                <div className="py-4 text-center text-xs text-[var(--muted)]">Loading recommendations...</div>
              ) : recommendations.length ? (
                recommendations.map((course) => (
                  <Link key={course.title} href="/courses" className="block rounded-md bg-[var(--panel-inner)] border border-[var(--border-subtle)] p-3 transition hover:border-[var(--primary)]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {course.externalId ? (
                          <div className="text-[10px] font-mono text-[var(--teal)] mb-0.5">{course.externalId}</div>
                        ) : null}
                        <h3 className="text-xs font-bold text-[var(--foreground)] leading-snug">{course.title}</h3>
                      </div>
                      <span className="shrink-0 rounded bg-[var(--green-badge-bg)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--green-badge-text)]">{course.match}</span>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--muted)]">{course.reason}</p>
                  </Link>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-[var(--muted)]">No recommendations pending.</div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
