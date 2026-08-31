"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import {
  getCurrentUserId,
  getUserSkillGaps,
  getUserRecommendations,
  getUserRoadmaps,
  listDocuments,
  RoadmapItem,
  DocumentResponse,
} from "../../lib/api";

type SkillItem = {
  skill: string;
  current: number;
  target: number;
  gap: number;
  priority: string;
  activeRoadmap?: {
    id: number;
    title: string;
    progress_percentage: number;
  };
  groundedDocument?: {
    id: number;
    filename: string;
  };
};

type RecommendedCourse = {
  externalId: string;
  title: string;
  match: string;
  source: string;
};

export default function SkillGapsPage() {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [courses, setCourses] = useState<RecommendedCourse[]>([]);
  const [roadmaps, setRoadmaps] = useState<RoadmapItem[]>([]);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Competencies");

  useEffect(() => {
    let active = true;

    async function loadSkillData() {
      try {
        const userId = getCurrentUserId();
        const [gapResponse, recommendationResponse, roadmapResponse, docResponse] = await Promise.all([
          getUserSkillGaps(userId).catch(() => ({ user_id: userId, skill_gaps: [] })),
          getUserRecommendations(userId).catch(() => []),
          getUserRoadmaps(userId).catch(() => []),
          listDocuments().catch(() => []),
        ]);

        if (!active) return;

        const rawGaps = gapResponse?.skill_gaps ?? [];
        const rawRoadmaps = roadmapResponse ?? [];
        const rawDocs = docResponse ?? [];

        setRoadmaps(rawRoadmaps);
        setDocuments(rawDocs);

        // Build quick lookup for roadmaps by competency name
        const roadmapMap = new Map<string, RoadmapItem>();
        for (const rm of rawRoadmaps) {
          if (rm.target_competency) {
            roadmapMap.set(rm.target_competency.trim().toLowerCase(), rm);
          }
        }

        // Map skill items
        const mappedSkills: SkillItem[] = rawGaps.map((gap) => {
          const gapKey = gap.competency.trim().toLowerCase();
          const activeRm = roadmapMap.get(gapKey);

          // If active roadmap has progress, dynamically boost current level
          let currentPct = Math.max(10, Math.min(100, Math.round((gap.current_level / Math.max(gap.required_level, 1)) * 100)));
          if (activeRm && activeRm.progress_percentage > 0) {
            // Give up to +20% boost based on roadmap completion
            const roadmapBonus = Math.round((activeRm.progress_percentage / 100) * 20);
            currentPct = Math.min(100, currentPct + roadmapBonus);
          }

          const gapPct = Math.max(0, 100 - currentPct);

          // Find if an uploaded document relates to this competency
          const matchedDoc = rawDocs.find(
            (d) =>
              d.filename.toLowerCase().includes(gapKey) ||
              gapKey.split(" ").some((word) => word.length > 3 && d.filename.toLowerCase().includes(word))
          );

          return {
            skill: gap.competency,
            current: currentPct,
            target: 100,
            gap: gapPct,
            priority:
              currentPct >= 90
                ? "Meets target"
                : gap.priority === "HIGH" || gap.priority === "CRITICAL"
                  ? "High priority"
                  : "Moderate gap",
            activeRoadmap: activeRm
              ? {
                  id: activeRm.id,
                  title: activeRm.title,
                  progress_percentage: activeRm.progress_percentage,
                }
              : undefined,
            groundedDocument: matchedDoc
              ? {
                  id: matchedDoc.id,
                  filename: matchedDoc.filename,
                }
              : undefined,
          };
        });

        // Also incorporate any custom roadmaps that might not be in the initial core competency list
        for (const rm of rawRoadmaps) {
          const compName = rm.target_competency?.trim() || "";
          if (compName && !mappedSkills.some((s) => s.skill.toLowerCase() === compName.toLowerCase())) {
            const currentPct = Math.max(20, rm.progress_percentage);
            mappedSkills.push({
              skill: compName,
              current: currentPct,
              target: 100,
              gap: Math.max(0, 100 - currentPct),
              priority: currentPct >= 80 ? "Meets target" : "Moderate gap",
              activeRoadmap: {
                id: rm.id,
                title: rm.title,
                progress_percentage: rm.progress_percentage,
              },
            });
          }
        }

        const mappedCourses: RecommendedCourse[] = (recommendationResponse ?? []).map((item) => ({
          externalId: item.external_id || "IGOT",
          title: item.title,
          match: `${Math.round(item.score * 100)}%`,
          source: item.source || "iGOT Karmayogi",
        }));

        setSkills(mappedSkills);
        setCourses(mappedCourses);
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

  // Dynamically compute categories from actual data
  const dynamicCategories: { name: string; count: number }[] = [
    { name: "All Competencies", count: skills.length },
  ];

  const activeRoadmapsCount = skills.filter((s) => s.activeRoadmap).length;
  if (activeRoadmapsCount > 0 || roadmaps.length > 0) {
    dynamicCategories.push({
      name: "Active in Roadmaps",
      count: activeRoadmapsCount,
    });
  }

  const documentGroundedCount = skills.filter((s) => s.groundedDocument).length;
  if (documentGroundedCount > 0 || documents.length > 0) {
    dynamicCategories.push({
      name: "Document Covered",
      count: documentGroundedCount,
    });
  }

  // Derive domain categories dynamically
  const domainTags = [
    { label: "Statistical Methods", filter: ["survey", "sampling", "price", "labour", "statistics", "national accounts"] },
    { label: "Data & Programming", filter: ["python", "sql", "api", "database", "analytics", "r programming", "r "] },
    { label: "Visualization & GIS", filter: ["visualization", "gis", "mapping", "dashboard"] },
    { label: "Governance & Policy", filter: ["policy", "cybersecurity", "privacy", "leadership", "communication"] },
  ];

  for (const domain of domainTags) {
    const count = skills.filter((s) =>
      domain.filter.some((f) => s.skill.toLowerCase().includes(f))
    ).length;
    if (count > 0) {
      dynamicCategories.push({ name: domain.label, count });
    }
  }

  // Filter skills based on selected dynamic category
  const displayedSkills = skills.filter((item) => {
    if (selectedCategory === "All Competencies") return true;
    if (selectedCategory === "Active in Roadmaps") return !!item.activeRoadmap;
    if (selectedCategory === "Document Covered") return !!item.groundedDocument;

    const matchedDomain = domainTags.find((d) => d.label === selectedCategory);
    if (matchedDomain) {
      return matchedDomain.filter.some((f) => item.skill.toLowerCase().includes(f));
    }
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
        <aside className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-semibold text-white">Dynamic Filters</h2>
            <span className="text-[11px] text-[var(--muted)]">{skills.length} skills</span>
          </div>

          <div className="mt-4 space-y-1.5">
            {dynamicCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition ${
                  selectedCategory === cat.name
                    ? "bg-[rgba(32,196,183,0.15)] text-[var(--teal)] font-semibold border border-[var(--teal)]/30"
                    : "text-[var(--muted)] hover:bg-[#303030] hover:text-white"
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${
                    selectedCategory === cat.name
                      ? "bg-[var(--teal)] text-black font-bold"
                      : "bg-[#333] text-slate-300"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Document & Roadmap summary stats in sidebar */}
          <div className="mt-6 border-t border-[var(--border)] pt-4 px-2 space-y-3 text-xs">
            <div className="text-[var(--muted)] font-medium uppercase tracking-wider text-[10px]">
              Training Integrations
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span>🗺️</span>
                <span>Active Roadmaps</span>
              </span>
              <span className="font-semibold text-white">{roadmaps.length}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span>📄</span>
                <span>Uploaded Manuals</span>
              </span>
              <span className="font-semibold text-white">{documents.length}</span>
            </div>
          </div>
        </aside>

        {/* Competency Table */}
        <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-white">Dynamic Competency Map</h2>
                <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-400">
                  Live Synced
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Proficiency scores automatically adapt as you complete roadmap day tasks and upload role manuals.
              </p>
            </div>
            <Link
              href="/courses"
              className="rounded-md bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[#60a5fa] transition"
            >
              Explore iGOT Courses →
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
                    <tr key={item.skill} className="bg-[#303030] text-white">
                      <td className="rounded-l-md px-4 py-3.5">
                        <div className="font-medium text-white">{item.skill}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {item.activeRoadmap && (
                            <span className="inline-flex items-center gap-1 rounded bg-teal-950/80 border border-teal-500/30 px-2 py-0.5 text-[10px] text-teal-300">
                              <span>🗺️</span>
                              <span>Roadmap: {item.activeRoadmap.progress_percentage}% done</span>
                            </span>
                          )}
                          {item.groundedDocument && (
                            <span
                              className="inline-flex items-center gap-1 rounded bg-sky-950/70 border border-sky-500/30 px-2 py-0.5 text-[10px] text-sky-300 truncate max-w-[180px]"
                              title={item.groundedDocument.filename}
                            >
                              <span>📄</span>
                              <span className="truncate">{item.groundedDocument.filename}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="w-9 tabular-nums text-xs font-semibold">{item.current}%</span>
                          <div className="h-2 w-24 rounded-full bg-[#444444] overflow-hidden">
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
                          <span className="text-amber-300">-{item.gap}%</span>
                        ) : (
                          <span className="text-emerald-400">0%</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                            item.priority === "High priority"
                              ? "bg-[#3a2020] text-[#ff8f8f] border border-red-500/20"
                              : item.priority === "Moderate gap"
                                ? "bg-[#3a311d] text-[#ffd46b] border border-amber-500/20"
                                : "bg-[#14331f] text-[#37d46f] border border-emerald-500/20"
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
                              ? "border border-teal-500/40 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20"
                              : "border border-[var(--border)] bg-[#383838] text-white hover:border-[var(--teal)] hover:text-[var(--teal)]"
                          }`}
                        >
                          <span>{item.activeRoadmap ? "View Roadmap" : "+ Roadmap"}</span>
                          <span>→</span>
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
        <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          {highlightSkill ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">
                    Highest Priority Skill Gap
                  </span>
                  <h2 className="text-xl font-semibold text-white mt-0.5">{highlightSkill.skill}</h2>
                </div>
                <Link
                  href={`/roadmap?competency=${encodeURIComponent(highlightSkill.skill)}`}
                  className="rounded-md bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
                >
                  Launch Focused Roadmap →
                </Link>
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Identified based on your role benchmark vs. verified mastery from quizzes and training roadmaps.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-md bg-[#303030] p-4">
                  <div className="text-2xl font-semibold text-white">{highlightSkill.current}%</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">Current Level</div>
                </div>
                <div className="rounded-md bg-[#303030] p-4">
                  <div className="text-2xl font-semibold text-white">{highlightSkill.target}%</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">Target Role Level</div>
                </div>
                <div className="rounded-md bg-[#3a2020] p-4">
                  <div className="text-2xl font-semibold text-[#ff8f8f]">{highlightSkill.gap}%</div>
                  <div className="mt-1 text-xs text-[#ffc0c0]">{highlightSkill.priority}</div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-sm text-[var(--muted)]">
              No priority skill gap identified. Your profile meets current role benchmarks.
            </div>
          )}
        </div>

        <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recommended iGOT Learning</h2>
            <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-xs font-medium text-emerald-400">
              🏛️ Official iGOT Karmayogi
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
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md bg-[#303030] p-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded bg-[#202020] px-2 py-0.5 font-mono text-[11px] text-sky-300 border border-[#3a3a3a]">
                        {course.externalId}
                      </span>
                      <span className="text-xs text-emerald-400 font-medium">{course.source || "iGOT Karmayogi"}</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{course.title}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="rounded-md bg-[#14331f] px-2.5 py-1 text-xs font-medium text-[#37d46f]">
                      {course.match} match
                    </span>
                    <Link
                      href="/courses"
                      className="rounded-md bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-white hover:bg-[#60a5fa] transition-colors"
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
