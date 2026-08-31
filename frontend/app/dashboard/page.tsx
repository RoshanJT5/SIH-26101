"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
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
    <AppShell title="Dashboard" subtitle="Your LeetCode-style learning profile for competency, gaps, recommended courses, and recent activity.">
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <section className="panel-rise rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="grid gap-5 sm:grid-cols-[1fr_112px]">
            <div className="flex min-h-48 items-center justify-center">
              <div className="relative grid h-44 w-44 place-items-center rounded-full bg-[conic-gradient(var(--teal)_0_46%,var(--amber)_46%_66%,var(--red)_66%_76%,#343434_76%_100%)]">
                <div className="grid h-36 w-36 place-items-center rounded-full bg-[var(--panel)]">
                  <div className="text-center">
                    <div className="text-4xl font-semibold text-white">{solvedCount}</div>
                    <div className="text-sm text-white">/ 4041 skills</div>
                    <div className="mt-1 text-sm text-[var(--green)]">Solved</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-3">
              {scoreBands.map((band) => (
                <div key={band.label} className="rounded-md bg-[#333333] p-3 text-center">
                  <div className={`text-sm font-semibold ${band.color}`}>{band.label}</div>
                  <div className="mt-1 text-sm text-white">{band.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel-rise rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-sm text-[var(--muted)]">Badges</p>
              <div className="mt-1 text-3xl text-white">3</div>
            </div>
            <div className="grid h-24 w-24 place-items-center rounded-full border border-[#3c3320] bg-[#2d2618] text-center text-sm text-[var(--amber)]">
              SIH
              <span className="block text-xs text-[var(--muted)]">Aug</span>
            </div>
          </div>
          <div className="mt-10">
            <p className="text-sm text-[var(--muted)]">Locked Badge</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Workforce Skill Challenge</h2>
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-white">
            <span className="text-2xl">59</span> learning actions in the past one year
          </h2>
          <p className="text-sm text-[var(--muted)]">Total active days: 20&nbsp;&nbsp;&nbsp; Max streak: 4</p>
        </div>
        <div className="mt-6 overflow-x-auto pb-2">
          <div className="grid min-w-[860px] grid-cols-12 gap-5">
            {months.map((month, monthIndex) => (
              <div key={month}>
                <div className="grid grid-cols-4 gap-1">
                  {activity.slice(monthIndex * 14, monthIndex * 14 + 14).map((level, dayIndex) => (
                    <span
                      key={`${month}-${dayIndex}`}
                      className={`h-3 w-3 rounded-[3px] ${
                        level === 0
                          ? "bg-[#383838]"
                          : level === 1
                            ? "bg-[#1d7438]"
                            : level === 2
                              ? "bg-[#2db55d]"
                              : "bg-[#8be28e]"
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-3 text-center text-sm text-[var(--muted)]">{month}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="flex flex-wrap gap-3 border-b border-[var(--border)] pb-4">
            {["Recent AC", "List", "Solutions", "Discuss"].map((tab, index) => (
              <button
                key={tab}
                className={`rounded-md px-4 py-2 text-sm font-medium ${
                  index === 0 ? "bg-[#3a3a3a] text-white" : "text-[var(--muted)] hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
            <Link href="/assessments" className="ml-auto rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:text-white">
              View all submissions
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="py-6 text-center text-xs text-[var(--muted)]">Loading activity log...</div>
            ) : recent.length ? (
              recent.map((item, index) => (
                <div key={`${item.title}-${index}`} className={`grid gap-3 rounded-md px-4 py-4 text-sm sm:grid-cols-[1fr_auto_auto] ${index % 2 === 0 ? "bg-[#373737]" : "bg-transparent"}`}>
                  <span className="font-medium text-white">{item.title}</span>
                  <span className="text-[var(--muted)]">{item.state}</span>
                  <span className="text-[var(--muted)]">{item.date}</span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-[var(--muted)]">No recent activity records.</div>
            )}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <h2 className="text-lg font-semibold text-white">Priority gaps</h2>
            <div className="mt-4 space-y-4">
              {loading ? (
                <div className="py-4 text-center text-xs text-[var(--muted)]">Loading gaps...</div>
              ) : gaps.length ? (
                gaps.map((gap) => (
                  <div key={gap.skill}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-medium text-white">{gap.skill}</span>
                      <span className="text-[var(--muted)]">{gap.severity}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#3a3a3a]">
                      <div className="h-2 rounded-full bg-[var(--teal)]" style={{ width: `${gap.current}%` }} />
                    </div>
                    <div className="mt-1 text-xs text-[var(--muted)]">Current {gap.current}% / Target {gap.target}%</div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-[var(--muted)]">
                  No active skill gaps identified. All competencies meet role requirements.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">iGOT Recommendations</h2>
              <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                🏛️ Official iGOT
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="py-4 text-center text-xs text-[var(--muted)]">Loading recommendations...</div>
              ) : recommendations.length ? (
                recommendations.map((course) => (
                  <Link key={course.title} href="/courses" className="block rounded-md bg-[#303030] p-4 transition hover:bg-[#363636]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {course.externalId ? (
                          <div className="text-[10px] font-mono text-sky-400 mb-0.5">{course.externalId}</div>
                        ) : null}
                        <h3 className="text-sm font-semibold text-white">{course.title}</h3>
                      </div>
                      <span className="shrink-0 rounded-md bg-[#14331f] px-2 py-1 text-xs text-[#37d46f]">{course.match}</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{course.reason}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-400">
                      <span>Source: {course.source || "iGOT Karmayogi"}</span>
                      <span className="text-[var(--muted)] hover:text-white">View details →</span>
                    </div>
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
