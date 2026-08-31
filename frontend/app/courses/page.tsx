"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  GovernmentIcon,
  InfoIcon,
  XIcon,
} from "../components/icons";
import {
  createRoadmap,
  generateQuiz,
  getCurrentUserId,
  getUserRecommendations,
  listCourses,
  RecommendationItem,
} from "../../lib/api";

type CourseView = {
  id: string;
  externalId: string;
  title: string;
  source: string;
  level: string;
  duration: string;
  reason: string;
  match: string;
  progress: number;
  courseUrl: string;
  skills: string;
};

const defaultCourses: CourseView[] = [
  {
    id: "igot-1",
    externalId: "IGOT-STAT-001",
    title: "Data Visualization for Official Statistics",
    source: "iGOT Karmayogi",
    level: "Intermediate",
    duration: "6 hours",
    reason: "Directly bridges detected 38% priority gap in visual dissemination and dashboard reporting.",
    match: "94%",
    progress: 72,
    courseUrl: "https://portal.igotkarmayogi.gov.in",
    skills: "Data Visualization, Chart Selection, PowerBI, Dashboards",
  },
  {
    id: "igot-2",
    externalId: "IGOT-STAT-002",
    title: "Statistical Inference and Hypothesis Testing for Policy",
    source: "MoSPI Academy",
    level: "Advanced",
    duration: "8 hours",
    reason: "Aligned to national statistical officer benchmark requirements.",
    match: "88%",
    progress: 40,
    courseUrl: "https://portal.igotkarmayogi.gov.in",
    skills: "Hypothesis Testing, Sampling Error, P-Values, Regression",
  },
  {
    id: "igot-3",
    externalId: "IGOT-STAT-003",
    title: "Survey Sampling Methodology & Field Quality Assurance",
    source: "National Academy of Statistical Administration",
    level: "Intermediate",
    duration: "5 hours",
    reason: "Mandatory foundation for household and enterprise survey supervision.",
    match: "81%",
    progress: 0,
    courseUrl: "https://portal.igotkarmayogi.gov.in",
    skills: "Stratified Sampling, Cluster Sampling, Weighting, Non-Response",
  },
  {
    id: "igot-4",
    externalId: "IGOT-STAT-004",
    title: "Python for Data Cleaning & Statistical Process Automation",
    source: "Digital India Academy",
    level: "Foundation",
    duration: "10 hours",
    reason: "Supports modern automated microdata validation pipelines.",
    match: "79%",
    progress: 0,
    courseUrl: "https://portal.igotkarmayogi.gov.in",
    skills: "Python, Pandas, Data Cleaning, Validation Rules",
  },
  {
    id: "igot-5",
    externalId: "IGOT-STAT-005",
    title: "Official Statistics Governance & DPDP Act Compliance",
    source: "Department of Personnel & Training",
    level: "Foundation",
    duration: "4 hours",
    reason: "Statutory compliance requirement for handling national registry data.",
    match: "76%",
    progress: 0,
    courseUrl: "https://portal.igotkarmayogi.gov.in",
    skills: "Data Privacy, DPDP Act, Confidentiality, Metadata Standards",
  },
];

const filters = ["All", "High Match (80%+)", "Official iGOT", "MoSPI Academy", "In Progress"];

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseView[]>(defaultCourses);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCourseModal, setSelectedCourseModal] = useState<CourseView | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      try {
        const query = new URLSearchParams(window.location.search).get("q");
        if (query) setSearchQuery(query);
        const userId = getCurrentUserId();
        const [recs, catalog] = await Promise.all([
          getUserRecommendations(userId),
          listCourses(),
        ]);

        if (!active) return;

        const combinedMap = new Map<string, CourseView>();

        defaultCourses.forEach((c) => combinedMap.set(c.title.toLowerCase(), c));

        if (catalog && catalog.length > 0) {
          catalog.forEach((item) => {
            const key = item.title.toLowerCase();
            const existing = combinedMap.get(key);
            combinedMap.set(key, {
              id: `db-${item.id}`,
              externalId: item.external_id || "IGOT-MOD",
              title: item.title,
              source: item.source || "iGOT Karmayogi",
              level: item.level || "Intermediate",
              duration: item.duration_hours ? `${item.duration_hours} hours` : "5 hours",
              reason: item.description || "Official national capacity building module.",
              match: existing ? existing.match : "80%",
              progress: existing ? existing.progress : 0,
              courseUrl: item.url && !item.url.includes("/app/toc/") ? item.url : "https://portal.igotkarmayogi.gov.in",
              skills: existing?.skills || "Statistical Analysis, Governance",
            });
          });
        }

        if (recs && recs.length > 0) {
          recs.forEach((rec: RecommendationItem) => {
            const key = rec.title.toLowerCase();
            const existing = combinedMap.get(key);
            if (existing) {
              existing.match = `${Math.round(rec.score * 100)}%`;
              existing.reason = rec.reason;
              if (rec.external_id) existing.externalId = rec.external_id;
            } else {
              combinedMap.set(key, {
                id: `rec-${rec.id || rec.course_id}`,
                externalId: rec.external_id || "IGOT-REC",
                title: rec.title,
                source: rec.source || "iGOT Karmayogi",
                level: "Applied",
                duration: "6 hours",
                reason: rec.reason,
                match: `${Math.round(rec.score * 100)}%`,
                progress: 0,
                courseUrl: rec.course_url || "https://portal.igotkarmayogi.gov.in",
                skills: "Role Competency Growth",
              });
            }
          });
        }

        const sorted = Array.from(combinedMap.values()).sort(
          (a, b) => parseInt(b.match, 10) - parseInt(a.match, 10)
        );
        setCourses(sorted);
      } catch {
        if (active) setCourses(defaultCourses);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCatalog();
    return () => {
      active = false;
    };
  }, []);

  const displayList = courses.filter((course) => {
    if (activeFilter === "High Match (80%+)") {
      if (parseInt(course.match, 10) < 80) return false;
    } else if (activeFilter === "Official iGOT") {
      if (!course.source.toLowerCase().includes("igot")) return false;
    } else if (activeFilter === "MoSPI Academy") {
      if (!course.source.toLowerCase().includes("mospi") && !course.source.toLowerCase().includes("national")) return false;
    } else if (activeFilter === "In Progress") {
      if (course.progress === 0) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        course.title.toLowerCase().includes(q) ||
        course.reason.toLowerCase().includes(q) ||
        course.skills.toLowerCase().includes(q) ||
        course.externalId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  async function handleContinue(course: CourseView) {
    try {
      const userId = getCurrentUserId();
      await createRoadmap(userId, {
        competency_name: course.title,
        duration_days: 7,
      });
      try {
        await generateQuiz({
          competency_name: course.title,
          num_questions: 5,
        });
      } catch {}
      router.push(`/roadmap?competency=${encodeURIComponent(course.title)}`);
    } catch {
      router.push(`/roadmap`);
    }
  }

  return (
    <AppShell
      title="iGOT Learning Catalog"
      subtitle="Accredited government curriculum mapped to close your detected role competency gaps."
    >
      <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <label className="block flex-1">
            <span className="sr-only">Search courses</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search iGOT courses, ID (e.g. IGOT-STAT-001), competencies, or keywords..."
              className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--primary)]"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`h-11 rounded-md border px-3 text-xs font-semibold transition ${
                  activeFilter === filter
                    ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "border-[var(--border)] bg-[var(--panel-soft)] text-[var(--muted)] hover:text-[var(--foreground)]"
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
            <article key={course.id + course.title} className="panel-rise rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded bg-[var(--green-badge-bg)] border border-[var(--green)]/30 px-2 py-0.5 font-bold text-[var(--green-badge-text)]">
                      <GovernmentIcon className="h-3.5 w-3.5" />
                      <span>{course.source}</span>
                    </span>
                    <span className="rounded bg-[var(--panel-soft)] px-2 py-0.5 text-[var(--teal)] font-mono text-[11px] border border-[var(--border-subtle)]">
                      {course.externalId}
                    </span>
                    <span className="text-[var(--muted)] font-medium">{course.level}</span>
                    <span className="text-[var(--muted)]">•</span>
                    <span className="text-[var(--muted)]">{course.duration}</span>
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-[var(--foreground)]">{course.title}</h2>
                  <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-[var(--muted)]">{course.reason}</p>

                  {course.skills ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {course.skills.split(",").map((s) => (
                        <span key={s.trim()} className="rounded bg-[var(--panel-inner)] px-2 py-0.5 text-[11px] text-[var(--foreground)] border border-[var(--border-subtle)]">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-1.5 w-full max-w-sm rounded-full bg-[var(--border)] overflow-hidden">
                      <div className="h-1.5 rounded-full bg-[var(--teal)]" style={{ width: `${course.progress}%` }} />
                    </div>
                    <span className="text-xs text-[var(--muted)] font-medium">{course.progress ? `${course.progress}% complete` : "Not started"}</span>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-md bg-[var(--panel-inner)] border border-[var(--border-subtle)] p-4 text-center lg:block">
                  <div>
                    <div className="text-2xl font-black text-[var(--green-badge-text)]">{course.match}</div>
                    <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mt-0.5 font-semibold">Role Gap Match</div>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCourseModal(course)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--teal)] hover:text-[var(--teal)] transition"
                    >
                      <span>Syllabus &amp; Overview</span>
                      <InfoIcon className="h-3.5 w-3.5" />
                    </button>
                    <a
                      href={course.courseUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[var(--green)]/40 bg-[var(--green-badge-bg)] px-3 py-2 text-xs font-bold text-[var(--green-badge-text)] hover:opacity-90 transition"
                    >
                      <span>Portal Enrollment</span>
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleContinue(course)}
                      className="inline-flex items-center justify-center rounded-md bg-[var(--primary)] px-3 py-2 text-xs font-bold text-white hover:bg-[var(--primary-hover)] transition shadow-xs"
                    >
                      Start In-App Roadmap
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      {/* Course Details & Syllabus Modal */}
      {selectedCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded bg-[var(--green-badge-bg)] border border-[var(--green)]/30 px-2 py-0.5 text-xs font-bold text-[var(--green-badge-text)]">
                    <GovernmentIcon className="h-3.5 w-3.5" />
                    <span>{selectedCourseModal.source}</span>
                  </span>
                  <span className="rounded bg-[var(--panel-soft)] px-2 py-0.5 font-mono text-[11px] text-[var(--teal)] border border-[var(--border-subtle)]">
                    {selectedCourseModal.externalId}
                  </span>
                  <span className="text-xs text-[var(--muted)]">{selectedCourseModal.level}</span>
                  <span className="text-xs text-[var(--muted)]">•</span>
                  <span className="text-xs text-[var(--muted)]">{selectedCourseModal.duration}</span>
                </div>
                <h2 className="text-xl font-bold text-[var(--foreground)] leading-tight mt-1">{selectedCourseModal.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourseModal(null)}
                className="rounded-md p-1.5 text-[var(--muted)] hover:bg-[var(--panel-soft)] hover:text-[var(--foreground)] transition"
                aria-label="Close modal"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-sm">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--teal)]">Course Description &amp; Rationale</h3>
                <p className="mt-1 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">{selectedCourseModal.reason}</p>
              </div>

              {selectedCourseModal.skills && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Targeted Competencies</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourseModal.skills.split(",").map((s) => (
                      <span key={s.trim()} className="inline-flex items-center gap-1.5 rounded-md bg-[var(--green-badge-bg)] border border-[var(--green)]/20 px-2.5 py-1 text-xs text-[var(--green-badge-text)] font-semibold">
                        <CheckIcon className="h-3.5 w-3.5" />
                        <span>{s.trim()}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Curriculum Modules (Mission Karmayogi Standards)</h3>
                <div className="space-y-2">
                  <div className="rounded border border-[var(--border-subtle)] bg-[var(--panel-inner)] p-3">
                    <div className="font-bold text-[var(--foreground)] text-xs">Module 1: Principles, Regulatory Framework &amp; Standards</div>
                    <div className="text-[11px] text-[var(--muted)] mt-0.5">Foundational standards, official guidelines, and statutory mandates.</div>
                  </div>
                  <div className="rounded border border-[var(--border-subtle)] bg-[var(--panel-inner)] p-3">
                    <div className="font-bold text-[var(--foreground)] text-xs">Module 2: Practical Methods &amp; Analytical Tooling</div>
                    <div className="text-[11px] text-[var(--muted)] mt-0.5">Hands-on applications, data validation workflows, and official reporting instruments.</div>
                  </div>
                  <div className="rounded border border-[var(--border-subtle)] bg-[var(--panel-inner)] p-3">
                    <div className="font-bold text-[var(--foreground)] text-xs">Module 3: Real-World Case Studies &amp; Public Policy Scenarios</div>
                    <div className="text-[11px] text-[var(--muted)] mt-0.5">Application to national statistics, departmental evaluations, and field quality controls.</div>
                  </div>
                  <div className="rounded border border-[var(--border-subtle)] bg-[var(--panel-inner)] p-3">
                    <div className="font-bold text-[var(--foreground)] text-xs">Module 4: Competency Assessment &amp; Certification</div>
                    <div className="text-[11px] text-[var(--muted)] mt-0.5">Scenario-based multiple choice assessment and verified competency leveling.</div>
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-[var(--green)]/20 bg-[var(--green-badge-bg)] p-3 text-xs text-[var(--green-badge-text)] flex items-start gap-2">
                <InfoIcon className="h-4 w-4" />
                <span>
                  This course is part of the <strong>Mission Karmayogi Bharat Capacity Building Framework</strong>. Civil service officers can access the official course materials via the Karmayogi Bharat portal or learn along our in-app tailored roadmap.
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
              <button
                type="button"
                onClick={() => setSelectedCourseModal(null)}
                className="rounded-md border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition"
              >
                Close
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={selectedCourseModal.courseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-[var(--green)]/40 bg-[var(--green-badge-bg)] px-3 py-2 text-xs font-bold text-[var(--green-badge-text)] hover:opacity-90 transition"
                >
                  <span>Open Karmayogi Portal</span>
                  <ArrowUpRightIcon className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const c = selectedCourseModal;
                    setSelectedCourseModal(null);
                    handleContinue(c);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--primary-hover)] transition shadow-xs"
                >
                  <span>Start In-App Roadmap</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
