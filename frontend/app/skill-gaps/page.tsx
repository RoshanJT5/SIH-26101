"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import { DUMMY_USER_ID, getUserSkillGaps, getUserRecommendations } from "../../lib/api";

const categories = ["Statistics", "Data Analysis", "Data Management", "Visualization", "Survey Methods", "Policy"];

const skillsFallback = [
  { skill: "Statistics", current: 86, target: 90, gap: 4, priority: "Meets target" },
  { skill: "Data Analysis", current: 61, target: 85, gap: 24, priority: "Moderate gap" },
  { skill: "Data Visualization", current: 42, target: 80, gap: 38, priority: "High priority" },
  { skill: "Survey Methods", current: 73, target: 85, gap: 12, priority: "Moderate gap" },
  { skill: "Policy Interpretation", current: 51, target: 75, gap: 24, priority: "Moderate gap" },
];

const coursesFallback = [
  { title: "Data Visualization for Official Reports", match: "94%" },
  { title: "Dashboard Design with Statistical Indicators", match: "87%" },
  { title: "Communicating Uncertainty in Public Data", match: "81%" },
];

export default function SkillGapsPage() {
  const [skills, setSkills] = useState(skillsFallback);
  const [courses, setCourses] = useState(coursesFallback);

  useEffect(() => {
    let active = true;

    async function loadSkillData() {
      try {
        const [gapResponse, recommendationResponse] = await Promise.all([
          getUserSkillGaps(DUMMY_USER_ID),
          getUserRecommendations(DUMMY_USER_ID),
        ]);

        if (!active) return;

        const mappedSkills = (gapResponse?.skill_gaps ?? []).map((gap) => ({
          skill: gap.competency,
          current: Math.max(10, Math.min(100, 100 - gap.gap * 18)),
          target: 85,
          gap: gap.gap * 18,
          priority: gap.priority === "HIGH" || gap.priority === "CRITICAL" ? "High priority" : gap.priority === "MEDIUM" ? "Moderate gap" : "Meets target",
        }));

        const mappedCourses = (recommendationResponse ?? []).map((item) => ({
          title: item.title,
          match: `${Math.round(item.score * 100)}%`,
        }));

        setSkills(mappedSkills.length ? mappedSkills : skillsFallback);
        setCourses(mappedCourses.length ? mappedCourses : coursesFallback);
      } catch {
        if (active) {
          setSkills(skillsFallback);
          setCourses(coursesFallback);
        }
      }
    }

    loadSkillData();
    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell title="Skill Map" subtitle="Your competency profile across the statistical workforce framework, with current level, target level, and visible gap severity.">
      <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4">
          <h2 className="px-2 text-sm font-semibold text-white">Skill categories</h2>
          <div className="mt-4 space-y-1">
            {categories.map((category, index) => (
              <button
                key={category}
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                  index === 3 ? "bg-[#3a3a3a] text-white" : "text-[var(--muted)] hover:bg-[#303030] hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Competency Map</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Current scores are benchmarked against role targets.</p>
            </div>
            <Link href="/courses" className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#60a5fa]">
              Start Recommended Path
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-2 font-medium">Skill</th>
                  <th className="px-4 py-2 font-medium">Current</th>
                  <th className="px-4 py-2 font-medium">Target</th>
                  <th className="px-4 py-2 font-medium">Gap</th>
                  <th className="px-4 py-2 font-medium">Priority</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((item) => (
                  <tr key={item.skill} className="bg-[#303030] text-white">
                    <td className="rounded-l-md px-4 py-4 font-medium">{item.skill}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-10 tabular-nums">{item.current}%</span>
                        <div className="h-2 w-28 rounded-full bg-[#444444]">
                          <div className="h-2 rounded-full bg-[var(--teal)]" style={{ width: `${item.current}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 tabular-nums">{item.target}%</td>
                    <td className="px-4 py-4 tabular-nums">{item.gap}%</td>
                    <td className="rounded-r-md px-4 py-4">
                      <span
                        className={`rounded-md px-2 py-1 text-xs ${
                          item.priority === "High priority"
                            ? "bg-[#3a2020] text-[#ff8f8f]"
                            : item.priority === "Moderate gap"
                              ? "bg-[#3a311d] text-[#ffd46b]"
                              : "bg-[#14331f] text-[#37d46f]"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="text-xl font-semibold text-white">Data Visualization</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Required for interpreting and communicating official statistical outputs.</p>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-md bg-[#303030] p-4">
              <div className="text-2xl font-semibold text-white">42%</div>
              <div className="mt-1 text-xs text-[var(--muted)]">Current</div>
            </div>
            <div className="rounded-md bg-[#303030] p-4">
              <div className="text-2xl font-semibold text-white">80%</div>
              <div className="mt-1 text-xs text-[var(--muted)]">Target</div>
            </div>
            <div className="rounded-md bg-[#3a2020] p-4">
              <div className="text-2xl font-semibold text-[#ff8f8f]">38%</div>
              <div className="mt-1 text-xs text-[#ffc0c0]">High gap</div>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="text-xl font-semibold text-white">Recommended learning</h2>
          <div className="mt-4 space-y-3">
            {courses.map((course) => (
              <div key={course.title} className="flex items-center justify-between gap-4 rounded-md bg-[#303030] p-4">
                <span className="text-sm font-medium text-white">{course.title}</span>
                <span className="rounded-md bg-[#14331f] px-2 py-1 text-xs text-[#37d46f]">{course.match} match</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
