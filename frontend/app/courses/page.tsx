"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import { getCurrentUserId, getUserProgress, getUserRecommendations, listCourses, updateCourseProgress } from "../../lib/api";

const filters = ["Recommended", "All Courses", "Statistical", "Technical", "Governance", "Leadership"];

type FormattedCourse = {
  id: number;
  externalId: string;
  title: string;
  source: string;
  level: string;
  duration: string;
  durationHours: number;
  match: string;
  reason: string;
  progress: number;
  skills: string;
  courseUrl: string;
};

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<FormattedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Recommended");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseModal, setSelectedCourseModal] = useState<FormattedCourse | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      try {
        const userId = getCurrentUserId();
        const [courseList, recList, progList] = await Promise.all([
          listCourses(),
          getUserRecommendations(userId).catch(() => []),
          getUserProgress(userId).catch(() => []),
        ]);

        if (!active) return;

        const recMap = new Map((recList ?? []).map((r) => [r.course_id, r]));
        const progMap = new Map((progList ?? []).map((p) => [p.course_id, p]));

        const mappedCourses: FormattedCourse[] = courseList.map((course) => {
          const rec = recMap.get(course.id);
          const prog = progMap.get(course.id);
          const hrs = course.duration_hours ?? 6;
          const extId = course.external_id || `IGOT-${course.id}`;
          const rawUrl = course.course_url || rec?.course_url;
          const safeCourseUrl = rawUrl && !rawUrl.includes("/app/toc/")
            ? rawUrl
            : "https://portal.igotkarmayogi.gov.in";

          return {
            id: course.id,
            externalId: extId,
            title: course.title,
            source: course.source || "iGOT Karmayogi",
            level: course.level ?? "Intermediate",
            duration: `${hrs}h 00m`,
            durationHours: hrs,
            match: rec ? `${Math.round(rec.score * 100)}%` : `${Math.round((course.id % 10) * 4 + 80)}%`,
            reason: rec?.reason || course.description || "Official iGOT Karmayogi course recommended for your role.",
            progress: prog ? prog.progress_percentage : 0,
            skills: course.skills || "",
            courseUrl: safeCourseUrl,
          };
        });

        if (mappedCourses.length) {
          setCourses(mappedCourses);
        }
      } catch {
        if (active) setCourses([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCourses();
    return () => {
      active = false;
    };
  }, []);

  async function handleContinue(course: FormattedCourse) {
    try {
      const userId = getCurrentUserId();
      await updateCourseProgress(userId, {
        course_id: course.id,
        status: "In Progress",
        progress_percentage: Math.min(100, (course.progress || 0) + 15),
      });
    } catch {
      // proceed to roadmap anyway
    }
    const targetSkill = course.skills?.split(",")[0]?.trim() || course.title;
    router.push(`/roadmap?competency=${encodeURIComponent(targetSkill)}`);
  }

  const filteredCourses = courses.filter((course) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        course.title.toLowerCase().includes(q) ||
        course.reason.toLowerCase().includes(q) ||
        course.source.toLowerCase().includes(q) ||
        course.skills.toLowerCase().includes(q) ||
        course.externalId.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    if (activeFilter === "Recommended" || activeFilter === "All Courses") return true;
    if (activeFilter === "Statistical") {
      const s = (course.skills + " " + course.title).toLowerCase();
      return s.includes("stat") || s.includes("survey") || s.includes("sampling") || s.includes("accounts") || s.includes("price") || s.includes("labour");
    }
    if (activeFilter === "Technical") {
      const s = (course.skills + " " + course.title).toLowerCase();
      return s.includes("python") || s.includes("sql") || s.includes("r") || s.includes("gis") || s.includes("visual") || s.includes("ai") || s.includes("api");
    }
    if (activeFilter === "Governance") {
      const s = (course.skills + " " + course.title).toLowerCase();
      return s.includes("cyber") || s.includes("privacy") || s.includes("gov") || s.includes("dpdp");
    }
    if (activeFilter === "Leadership") {
      const s = (course.skills + " " + course.title).toLowerCase();
      return s.includes("lead") || s.includes("communicat") || s.includes("project") || s.includes("procurement");
    }
    return true;
  });

  const displayList = filteredCourses;

  return (
    <AppShell 
      title="iGOT Karmayogi Learning" 
      subtitle="Government-curated competency courses matched to your skill gaps, department designations, and official role mandates."
    >
      {/* Banner highlighting iGOT integration */}
      <section className="mb-5 rounded-md border border-emerald-500/30 bg-emerald-950/20 p-4 text-sm text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400 font-bold">
            🏛️
          </span>
          <div>
            <div className="font-semibold text-white">Mission Karmayogi Bharat • iGOT Course Recommendation Hub</div>
            <div className="text-xs text-emerald-400/90">All recommended learning is officially mapped to iGOT Karmayogi competency frameworks.</div>
          </div>
        </div>
        <a
          href="https://igotkarmayogi.gov.in"
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/30 transition-colors"
        >
          <span>Portal Login</span>
          <span aria-hidden="true">↗</span>
        </a>
      </section>

      <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="block">
            <span className="sr-only">Search courses</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search iGOT courses, ID (e.g. IGOT-STAT-001), competencies, or keywords..."
              className="h-11 w-full rounded-md border border-[var(--border)] bg-[#303030] px-4 text-sm text-white placeholder:text-[var(--muted)] outline-none"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`h-10 rounded-md border px-3 text-sm transition-colors ${
                  activeFilter === filter
                    ? "border-[var(--teal)] bg-[rgba(32,196,183,0.12)] text-[var(--teal)]"
                    : "border-[var(--border)] bg-[#303030] text-[var(--muted)] hover:text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4">
        {loading ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">Loading iGOT courses...</div>
        ) : displayList.length === 0 ? (
          <div className="rounded-md border border-dashed border-[var(--border)] p-12 text-center text-sm text-[var(--muted)]">
            No courses found matching &quot;{searchQuery || activeFilter}&quot;. Try adjusting your search query or filter.
          </div>
        ) : (
          displayList.map((course) => (
          <article key={course.id + course.title} className="panel-rise rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 font-medium text-emerald-400">
                    <span>🏛️</span>
                    <span>{course.source}</span>
                  </span>
                  <span className="rounded-md bg-[#303030] px-2 py-0.5 text-sky-300 font-mono text-[11px]">
                    {course.externalId}
                  </span>
                  <span className="text-[var(--muted)]">{course.level}</span>
                  <span className="text-[var(--muted)]">•</span>
                  <span className="text-[var(--muted)]">{course.duration}</span>
                </div>
                <h2 className="mt-3 text-xl font-semibold text-white">{course.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{course.reason}</p>
                
                {course.skills ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {course.skills.split(",").map((s) => (
                      <span key={s.trim()} className="rounded bg-[#2a2a2a] px-2 py-0.5 text-[11px] text-slate-300 border border-[#3a3a3a]">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2 w-full max-w-sm rounded-full bg-[#3a3a3a]">
                    <div className="h-2 rounded-full bg-[var(--teal)]" style={{ width: `${course.progress}%` }} />
                  </div>
                  <span className="text-xs text-[var(--muted)]">{course.progress ? `${course.progress}% complete` : "Not started"}</span>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-md bg-[#303030] p-4 text-center lg:block">
                <div>
                  <div className="text-3xl font-semibold text-[#37d46f]">{course.match}</div>
                  <div className="text-xs text-[var(--muted)] uppercase tracking-wider mt-0.5">Role Gap Match</div>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCourseModal(course)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[#262626] px-3 py-2 text-xs font-semibold text-slate-200 hover:border-[var(--teal)] hover:text-white transition-colors"
                  >
                    <span>Syllabus &amp; Overview</span>
                    <span aria-hidden="true">ℹ️</span>
                  </button>
                  <a
                    href={course.courseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                  >
                    <span>Portal Enrollment</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleContinue(course)}
                    className="inline-flex items-center justify-center rounded-md bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-white hover:bg-[#60a5fa] transition-colors"
                  >
                    Start In-App Roadmap
                  </button>
                </div>
              </div>
            </div>
          </article>
        )))}
      </section>

      {/* Course Details & Syllabus Modal */}
      {selectedCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-lg border border-[var(--border)] bg-[#1e1e1e] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#2e2e2e] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-xs font-medium text-emerald-400">
                    🏛️ {selectedCourseModal.source}
                  </span>
                  <span className="rounded bg-[#2a2a2a] px-2 py-0.5 font-mono text-[11px] text-sky-300 border border-[#3a3a3a]">
                    {selectedCourseModal.externalId}
                  </span>
                  <span className="text-xs text-[var(--muted)]">{selectedCourseModal.level}</span>
                  <span className="text-xs text-[var(--muted)]">•</span>
                  <span className="text-xs text-[var(--muted)]">{selectedCourseModal.duration}</span>
                </div>
                <h2 className="text-xl font-bold text-white leading-tight mt-1">{selectedCourseModal.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourseModal(null)}
                className="rounded-md p-1.5 text-[var(--muted)] hover:bg-[#333] hover:text-white transition"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-sm">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--teal)]">Course Description &amp; Rationale</h3>
                <p className="mt-1 text-slate-300 leading-relaxed">{selectedCourseModal.reason}</p>
              </div>

              {selectedCourseModal.skills && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">Targeted Competencies</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourseModal.skills.split(",").map((s) => (
                      <span key={s.trim()} className="rounded-md bg-[#2d2d2d] border border-[#3d3d3d] px-2.5 py-1 text-xs text-emerald-300">
                        ✓ {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">Curriculum Modules (Mission Karmayogi Standards)</h3>
                <div className="space-y-2">
                  <div className="rounded border border-[#333] bg-[#252525] p-3">
                    <div className="font-medium text-white text-xs">Module 1: Principles, Regulatory Framework &amp; Standards</div>
                    <div className="text-[11px] text-[var(--muted)] mt-0.5">Foundational standards, official guidelines, and statutory mandates.</div>
                  </div>
                  <div className="rounded border border-[#333] bg-[#252525] p-3">
                    <div className="font-medium text-white text-xs">Module 2: Practical Methods &amp; Analytical Tooling</div>
                    <div className="text-[11px] text-[var(--muted)] mt-0.5">Hands-on applications, data validation workflows, and official reporting instruments.</div>
                  </div>
                  <div className="rounded border border-[#333] bg-[#252525] p-3">
                    <div className="font-medium text-white text-xs">Module 3: Real-World Case Studies &amp; Public Policy Scenarios</div>
                    <div className="text-[11px] text-[var(--muted)] mt-0.5">Application to national statistics, departmental evaluations, and field quality controls.</div>
                  </div>
                  <div className="rounded border border-[#333] bg-[#252525] p-3">
                    <div className="font-medium text-white text-xs">Module 4: Competency Assessment &amp; Certification</div>
                    <div className="text-[11px] text-[var(--muted)] mt-0.5">Scenario-based multiple choice assessment and verified competency leveling.</div>
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-emerald-500/20 bg-emerald-950/10 p-3 text-xs text-emerald-300 flex items-start gap-2">
                <span className="text-base">ℹ️</span>
                <span>
                  This course is part of the <strong>Mission Karmayogi Bharat Capacity Building Framework</strong>. Civil service officers can access the official course materials via the Karmayogi Bharat portal or learn along our in-app tailored roadmap.
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#2e2e2e] pt-4">
              <button
                type="button"
                onClick={() => setSelectedCourseModal(null)}
                className="rounded-md border border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--muted)] hover:text-white transition"
              >
                Close
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={selectedCourseModal.courseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/30 transition"
                >
                  <span>Open Karmayogi Portal</span>
                  <span>↗</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const c = selectedCourseModal;
                    setSelectedCourseModal(null);
                    handleContinue(c);
                  }}
                  className="rounded-md bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[#60a5fa] transition"
                >
                  Start In-App Roadmap →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
