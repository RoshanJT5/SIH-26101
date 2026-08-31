"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import { ArrowRightIcon, FileIcon, GovernmentIcon, MapIcon } from "../components/icons";
import {
  DocumentResponse,
  getCurrentUserId,
  getUser,
  getUserRecommendations,
  getUserSkillGaps,
  listDocuments,
  listRoadmaps,
  RoadmapResponse,
} from "../../lib/api";

type SkillItem = {
  skill: string;
  category: string;
  current: number;
  target: number;
  gap: number;
  priority: string;
  activeRoadmap?: RoadmapResponse;
  groundedDocument?: DocumentResponse;
};

type CourseItem = {
  externalId: string;
  title: string;
  source: string;
  match: string;
  reason: string;
  courseUrl: string;
};

const initialCategories = [
  { name: "All Domains", count: 0 },
  { name: "Statistics", count: 0 },
  { name: "Data Science", count: 0 },
  { name: "Survey Methods", count: 0 },
  { name: "Visualization", count: 0 },
  { name: "Governance", count: 0 },
];

export default function SkillGapsPage() {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Domains");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSkillData() {
      try {
        const userId = getCurrentUserId();
        const [userProfile, gapsResponse, recsResponse, roadmapsResponse, docsResponse] =
          await Promise.all([
            getUser(userId),
            getUserSkillGaps(userId),
            getUserRecommendations(userId),
            listRoadmaps(userId),
            listDocuments(),
          ]);

        if (!active) return;

        const profileComps = userProfile?.competencies || [];
        const rawGaps = gapsResponse?.skill_gaps || [];
        const activeRoadmaps = roadmapsResponse || [];
        const activeDocs = docsResponse || [];

        // Build a dynamic map of all skills from profile + gaps + roadmaps
        const skillMap = new Map<string, SkillItem>();

        // Seed with profile competencies
        profileComps.forEach((comp) => {
          const req = Math.max(comp.required_level, 1);
          const currentPct = Math.round((comp.current_level / req) * 100);
          const gapPct = Math.max(0, 100 - currentPct);
          const priority =
            gapPct > 30 ? "High priority" : gapPct > 10 ? "Moderate gap" : "On track";

          skillMap.set(comp.competency_name, {
            skill: comp.competency_name,
            category: comp.category || "Statistics",
            current: Math.min(currentPct, 100),
            target: 100,
            gap: gapPct,
            priority,
          });
        });

        // Overlay with gaps response (priority level)
        rawGaps.forEach((gap) => {
          const req = Math.max(gap.required_level, 1);
          const currentPct = Math.round((gap.current_level / req) * 100);
          const gapPct = Math.max(0, 100 - currentPct);
          const priority =
            gap.priority === "HIGH" || gap.priority === "CRITICAL"
              ? "High priority"
              : gap.priority === "MEDIUM"
                ? "Moderate gap"
                : "On track";

          const existing = skillMap.get(gap.competency);
          if (existing) {
            existing.current = Math.min(currentPct, 100);
            existing.gap = gapPct;
            existing.priority = priority;
          } else {
            skillMap.set(gap.competency, {
              skill: gap.competency,
              category: "General",
              current: Math.min(currentPct, 100),
              target: 100,
              gap: gapPct,
              priority,
            });
          }
        });

        // Attach active roadmaps & grounded documents to each skill
        skillMap.forEach((item, name) => {
          const matchedRoadmap = activeRoadmaps.find((r) => {
            const compName = (r.competency_name || r.target_competency || "").toLowerCase();
            return compName === name.toLowerCase() || (compName !== "" && name.toLowerCase().includes(compName));
          });
          if (matchedRoadmap) {
            item.activeRoadmap = matchedRoadmap;
            // Bump proficiency dynamically based on roadmap progress
            const roadmapBonus = Math.round(matchedRoadmap.progress_percentage * 0.4);
            item.current = Math.min(100, item.current + roadmapBonus);
            item.gap = Math.max(0, item.target - item.current);
            if (item.gap <= 10) item.priority = "On track";
            else if (item.gap <= 25) item.priority = "Moderate gap";
          }

          // Matched grounded uploaded document
          const matchedDoc = activeDocs.find(
            (d) =>
              d.filename.toLowerCase().includes(name.toLowerCase()) ||
              name.toLowerCase().includes(d.file_type.toLowerCase())
          );
          if (matchedDoc) {
            item.groundedDocument = matchedDoc;
          }
        });

        // Fallback default skills if map is empty
        if (skillMap.size === 0) {
          const defaults: SkillItem[] = [
            { skill: "Data Visualization", category: "Visualization", current: 42, target: 80, gap: 38, priority: "High priority" },
            { skill: "Statistical Inference", category: "Statistics", current: 82, target: 90, gap: 8, priority: "On track" },
            { skill: "Survey Sampling Methodology", category: "Survey Methods", current: 73, target: 85, gap: 12, priority: "Moderate gap" },
            { skill: "Python for Data Analysis", category: "Data Science", current: 55, target: 80, gap: 25, priority: "Moderate gap" },
            { skill: "Official Statistics Standards", category: "Governance", current: 51, target: 75, gap: 24, priority: "Moderate gap" },
            { skill: "Data Quality & Cleaning", category: "Data Science", current: 88, target: 90, gap: 2, priority: "On track" },
          ];
          defaults.forEach((d) => skillMap.set(d.skill, d));
        }

        const formattedSkills = Array.from(skillMap.values()).sort((a, b) => b.gap - a.gap);

        const formattedCourses = (recsResponse || []).map((item) => ({
          externalId: item.external_id || "IGOT",
          title: item.title,
          source: item.source || "iGOT Karmayogi",
          match: `${Math.round(item.score * 100)}%`,
          reason: item.reason,
          courseUrl: item.course_url || "https://portal.igotkarmayogi.gov.in",
        }));

        setSkills(formattedSkills);
        setCourses(formattedCourses);
      } catch {
        if (active) {
          setSkills([]);
          setCourses([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSkillData();
    return () => {
      active = false;
    };
  }, []);

  // Compute dynamic category counts
  const dynamicCategories = initialCategories.map((cat) => {
    if (cat.name === "All Domains") return { ...cat, count: skills.length };
    const matches = skills.filter(
      (s) =>
        s.category.toLowerCase().includes(cat.name.toLowerCase()) ||
        s.skill.toLowerCase().includes(cat.name.toLowerCase())
    );
    return { ...cat, count: matches.length };
  });

  const displayedSkills = skills.filter((item) => {
    if (selectedCategory === "All Domains") return true;
    if (item.category.toLowerCase().includes(selectedCategory.toLowerCase())) return true;
    return item.skill.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const highlightSkill =
    skills.find((s) => s.priority === "High priority" && !s.activeRoadmap) ??
    skills.find((s) => s.priority === "High priority") ??
    skills[0] ??
    null;

  return (
    <AppShell
      title="Skill Map"
      subtitle="Your live competency profile dynamically updated by your active learning roadmaps, completed assessments, and uploaded government documents."
    >
      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        {/* Dynamic Categories Sidebar */}
        <aside className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--card-shadow)]">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-[var(--foreground)]">Domain Filters</h2>
            <span className="text-[11px] text-[var(--muted)]">{skills.length} skills</span>
          </div>

          <div className="mt-4 space-y-1.5">
            {dynamicCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition ${
                  selectedCategory === cat.name
                    ? "bg-[var(--primary-soft)] text-[var(--teal)] font-bold border border-[var(--teal)]/30"
                    : "text-[var(--muted)] hover:bg-[var(--panel-soft)] hover:text-[var(--foreground)]"
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${
                    selectedCategory === cat.name
                      ? "bg-[var(--teal)] text-black font-bold"
                      : "bg-[var(--panel-soft)] text-[var(--muted)] border border-[var(--border-subtle)]"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 border-t border-[var(--border-subtle)] pt-4 px-2">
            <div className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">
              Proficiency Benchmark
            </div>
            <div className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
              Mapped against official Ministry of Statistics &amp; Programme Implementation (MoSPI) cadre requirements.
            </div>
          </div>
        </aside>

        {/* Competency Gap Table */}
        <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                {selectedCategory} Competencies
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Proficiency scores automatically adapt as you complete roadmap day tasks and upload role manuals.
              </p>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--primary-hover)] transition shadow-xs"
            >
              <span>Explore iGOT Courses</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-[var(--muted)] text-xs">
                <tr>
                  <th className="px-4 py-2 font-medium">Competency &amp; Context</th>
                  <th className="px-4 py-2 font-medium">Current</th>
                  <th className="px-4 py-2 font-medium">Target</th>
                  <th className="px-4 py-2 font-medium">Gap</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium text-right">Roadmap Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-[var(--muted)]">
                      Loading dynamic competency analysis...
                    </td>
                  </tr>
                ) : displayedSkills.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-[var(--muted)]">
                      No competencies found under &quot;{selectedCategory}&quot;.
                    </td>
                  </tr>
                ) : (
                  displayedSkills.map((item) => (
                    <tr key={item.skill} className="bg-[var(--panel-inner)] text-[var(--foreground)] border border-[var(--border-subtle)]">
                      <td className="rounded-l-md px-4 py-3.5">
                        <div className="font-semibold text-[var(--foreground)]">{item.skill}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {item.activeRoadmap && (
                            <span className="inline-flex items-center gap-1 rounded bg-[var(--green-badge-bg)] border border-[var(--green)]/30 px-2 py-0.5 text-[10px] text-[var(--green-badge-text)] font-semibold">
                              <MapIcon className="h-3 w-3" />
                              <span>Roadmap: {item.activeRoadmap.progress_percentage}% done</span>
                            </span>
                          )}
                          {item.groundedDocument && (
                            <span
                              className="inline-flex items-center gap-1 rounded bg-[var(--primary-soft)] border border-[var(--primary)]/30 px-2 py-0.5 text-[10px] text-[var(--primary)] font-semibold truncate max-w-[180px]"
                              title={item.groundedDocument.filename}
                            >
                              <FileIcon className="h-3 w-3" />
                              <span className="truncate">{item.groundedDocument.filename}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="w-9 tabular-nums text-xs font-semibold text-[var(--foreground)]">{item.current}%</span>
                          <div className="h-2 w-24 rounded-full bg-[var(--border)] overflow-hidden">
                            <div
                              className="h-2 rounded-full bg-[var(--teal)] transition-all"
                              style={{ width: `${item.current}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 tabular-nums text-xs text-[var(--muted)]">{item.target}%</td>
                      <td className="px-4 py-3.5 tabular-nums text-xs font-medium">
                        {item.gap > 0 ? (
                          <span className="text-[var(--amber)] font-bold">-{item.gap}%</span>
                        ) : (
                          <span className="text-[var(--green)] font-bold">0%</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            item.priority === "High priority"
                              ? "bg-[var(--badge-red-bg)] text-[var(--badge-red-text)]"
                              : item.priority === "Moderate gap"
                                ? "bg-[var(--badge-amber-bg)] text-[var(--badge-amber-text)]"
                                : "bg-[var(--green-badge-bg)] text-[var(--green-badge-text)]"
                          }`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="rounded-r-md px-4 py-3.5 text-right">
                        <Link
                          href={`/roadmap?competency=${encodeURIComponent(item.skill)}`}
                          className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                            item.activeRoadmap
                              ? "border border-[var(--teal)]/40 bg-[var(--primary-soft)] text-[var(--teal)] hover:opacity-90"
                              : "border border-[var(--border)] bg-[var(--panel-soft)] text-[var(--foreground)] hover:border-[var(--teal)] hover:text-[var(--teal)]"
                          }`}
                        >
                          <span>{item.activeRoadmap ? "View Roadmap" : "+ Roadmap"}</span>
                          <ArrowRightIcon className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Highlights & Context Section */}
      <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]">
          {highlightSkill ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--red)]">
                    Highest Priority Skill Gap
                  </span>
                  <h2 className="text-xl font-bold text-[var(--foreground)] mt-0.5">{highlightSkill.skill}</h2>
                </div>
                <Link
                  href={`/roadmap?competency=${encodeURIComponent(highlightSkill.skill)}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[var(--badge-red-bg)] border border-[var(--red)]/30 px-3 py-1.5 text-xs font-semibold text-[var(--badge-red-text)] hover:opacity-90 transition"
                >
                  <span>Launch Focused Roadmap</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Identified based on your role benchmark vs. verified mastery from quizzes and training roadmaps.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-md bg-[var(--panel-inner)] border border-[var(--border-subtle)] p-4">
                  <div className="text-2xl font-bold text-[var(--foreground)]">{highlightSkill.current}%</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">Current Level</div>
                </div>
                <div className="rounded-md bg-[var(--panel-inner)] border border-[var(--border-subtle)] p-4">
                  <div className="text-2xl font-bold text-[var(--foreground)]">{highlightSkill.target}%</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">Target Role Level</div>
                </div>
                <div className="rounded-md bg-[var(--badge-red-bg)] border border-[var(--red)]/20 p-4">
                  <div className="text-2xl font-bold text-[var(--badge-red-text)]">{highlightSkill.gap}%</div>
                  <div className="mt-1 text-xs text-[var(--badge-red-text)] font-semibold">{highlightSkill.priority}</div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-sm text-[var(--muted)]">
              No priority skill gap identified. Your profile meets current role benchmarks.
            </div>
          )}
        </div>

        <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--foreground)]">Recommended iGOT Learning</h2>
            <span className="inline-flex items-center gap-1.5 rounded bg-[var(--green-badge-bg)] border border-[var(--green)]/30 px-2.5 py-1 text-xs font-bold text-[var(--green-badge-text)]">
              <GovernmentIcon className="h-3.5 w-3.5" />
              <span>iGOT Karmayogi</span>
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Government courses matched to close your specific competency deficits.
          </p>
          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="py-6 text-center text-xs text-[var(--muted)]">Loading recommendations...</div>
            ) : courses.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--muted)]">No learning recommendations pending.</div>
            ) : (
              courses.slice(0, 3).map((course) => (
                <div
                  key={course.title}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md bg-[var(--panel-inner)] border border-[var(--border-subtle)] p-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded bg-[var(--panel-soft)] px-2 py-0.5 font-mono text-[11px] text-[var(--teal)] border border-[var(--border-subtle)]">
                        {course.externalId}
                      </span>
                      <span className="text-xs text-[var(--green)] font-medium">{course.source || "iGOT Karmayogi"}</span>
                    </div>
                    <span className="text-sm font-semibold text-[var(--foreground)]">{course.title}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="rounded bg-[var(--green-badge-bg)] px-2.5 py-1 text-xs font-bold text-[var(--green-badge-text)]">
                      {course.match} match
                    </span>
                    <Link
                      href="/courses"
                      className="rounded-md bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-white hover:bg-[var(--primary-hover)] transition shadow-xs"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
