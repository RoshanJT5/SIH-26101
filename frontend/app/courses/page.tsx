"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "../components/app-shell";
import {
  fetchRecommendedCourses,
  fetchTrainingProgrammes,
  CourseRecommendation,
  TrainingProgramme,
  getCurrentUserId
} from "../../lib/api";

export default function CoursesPage() {
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [programmes, setProgrammes] = useState<TrainingProgramme[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"RECOMMENDED" | "ALL" | "IGOT" | "NSSTA">("RECOMMENDED");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadCatalog() {
      try {
        setLoading(true);
        const userId = getCurrentUserId();
        const [recs, progs] = await Promise.all([
          fetchRecommendedCourses(userId),
          fetchTrainingProgrammes(),
        ]);
        setRecommendations(recs);
        setProgrammes(progs);
      } catch (err) {
        console.error("Failed to load courses data", err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const formatReason = (reason: string, skills: string[]): string => {
    if (!reason || reason.trim() === "") {
      if (skills && skills.length > 0) {
        return `Addresses your ${skills.slice(0, 2).join(" and ")} skill gap.`;
      }
      return "Recommended based on your role competency requirements.";
    }
    let cleaned = reason
      .replace(/^Directly addresses your role competency gap in\s*/i, "Addresses your ")
      .replace(/^Directly addresses your\s*/i, "Addresses your ")
      .replace(/\s*\(Score.*?\)/g, "")
      .trim();
    if (!cleaned.endsWith(".")) cleaned += ".";
    return cleaned;
  };

  const q = searchQuery.toLowerCase().trim();

  // Filter recommendations
  const filteredRecs = recommendations.filter((r) => {
    const matchSearch =
      q === "" ||
      r.title.toLowerCase().includes(q) ||
      r.provider.toLowerCase().includes(q) ||
      r.skills_addressed.some((s) => s.toLowerCase().includes(q));

    if (!matchSearch) return false;
    if (activeTab === "IGOT") return r.source.toLowerCase().includes("igot");
    return true;
  });

  // Filter NSSTA programmes
  const filteredProgrammes = programmes.filter((p) => {
    const matchSearch =
      q === "" ||
      p.title.toLowerCase().includes(q) ||
      p.provider.toLowerCase().includes(q) ||
      p.competencies.toLowerCase().includes(q);

    return matchSearch;
  });

  const showRecs = activeTab === "RECOMMENDED" || activeTab === "ALL" || activeTab === "IGOT";
  const showProgs = activeTab === "ALL" || activeTab === "NSSTA";

  const totalResultsCount =
    (showRecs ? filteredRecs.length : 0) + (showProgs ? filteredProgrammes.length : 0);

  return (
    <AppShell
      title="LEARNING RESOURCES"
      subtitle="Courses and training programmes matched to your role and skill gaps."
    >
      <div className="space-y-6 w-full">

        {/* Top Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[var(--border)]">
          {/* Institutional Source Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab("RECOMMENDED")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                activeTab === "RECOMMENDED"
                  ? "bg-[#123B63] text-white shadow-sm dark:bg-[#163F68]"
                  : "bg-[var(--surface)] text-[var(--muted-foreground)] border border-[var(--border)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              Recommended {recommendations.length > 0 && `(${recommendations.length})`}
            </button>
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                activeTab === "ALL"
                  ? "bg-[#123B63] text-white shadow-sm dark:bg-[#163F68]"
                  : "bg-[var(--surface)] text-[var(--muted-foreground)] border border-[var(--border)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              All Resources
            </button>
            <button
              onClick={() => setActiveTab("IGOT")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                activeTab === "IGOT"
                  ? "bg-[#123B63] text-white shadow-sm dark:bg-[#163F68]"
                  : "bg-[var(--surface)] text-[var(--muted-foreground)] border border-[var(--border)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              iGOT Karmayogi
            </button>
            <button
              onClick={() => setActiveTab("NSSTA")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                activeTab === "NSSTA"
                  ? "bg-[#123B63] text-white shadow-sm dark:bg-[#163F68]"
                  : "bg-[var(--surface)] text-[var(--muted-foreground)] border border-[var(--border)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              NSSTA / TPAC {programmes.length > 0 && `(${programmes.length})`}
            </button>
          </div>

          {/* Institutional Search Input */}
          <div className="w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses and training programmes..."
              className="w-full px-3.5 py-1.5 text-xs rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[#123B63] transition"
            />
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[17px] sm:text-[19px] font-bold text-[var(--foreground)] tracking-tight">
              {activeTab === "RECOMMENDED"
                ? "RECOMMENDED FOR YOU"
                : activeTab === "IGOT"
                ? "iGOT KARMAYOGI COURSES"
                : activeTab === "NSSTA"
                ? "NSSTA / TPAC PROGRAMMES"
                : "ALL LEARNING RESOURCES"}
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              {activeTab === "RECOMMENDED"
                ? "Based on your role and skill gaps."
                : "Specialized training matched to official statistics competencies."}
            </p>
          </div>
          <span className="text-xs text-[var(--muted-foreground)] font-medium">
            {totalResultsCount} {totalResultsCount === 1 ? "resource" : "resources"}
          </span>
        </div>

        {/* Loading Skeleton (3-Column Grid) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="p-5 rounded-md bg-[var(--surface)] border border-[var(--border)] animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="h-3.5 w-24 bg-[var(--surface-hover)] rounded" />
                  <div className="h-3.5 w-16 bg-[var(--surface-hover)] rounded" />
                </div>
                <div className="h-5 w-3/4 bg-[var(--surface-hover)] rounded" />
                <div className="h-8 w-full bg-[var(--surface-hover)] rounded" />
                <div className="h-3.5 w-36 bg-[var(--surface-hover)] rounded" />
                <div className="pt-3 border-t border-[var(--border)] flex justify-between items-center">
                  <div className="h-4 w-12 bg-[var(--surface-hover)] rounded" />
                  <div className="h-7 w-28 bg-[var(--surface-hover)] rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : totalResultsCount === 0 ? (
          /* Empty Search / Recommendations State */
          <div className="p-10 rounded-md bg-[var(--surface)] border border-[var(--border)] text-center max-w-lg mx-auto space-y-3">
            {searchQuery ? (
              <>
                <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
                  NO RESOURCES FOUND
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Try another search query or clear the filter.
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 rounded-md bg-[var(--surface-hover)] hover:bg-[var(--border)] text-xs font-semibold text-[var(--foreground)] border border-[var(--border)] transition"
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
                  RECOMMENDATIONS NOT AVAILABLE YET
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Complete your competency assessment to receive personalized learning recommendations.
                </p>
                <Link
                  href="/assessments"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-md bg-[#123B63] hover:bg-[#1B456F] text-white text-xs font-semibold transition"
                >
                  Start Assessment →
                </Link>
              </>
            )}
          </div>
        ) : (
          /* 3-Column Course Cards Grid (Full-Width Responsive) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. iGOT Courses */}
            {showRecs &&
              filteredRecs.map((course) => {
                const visibleSkills = course.skills_addressed.slice(0, 3);
                const remainingCount = course.skills_addressed.length - visibleSkills.length;
                const skillsText = visibleSkills.join(" · ") + (remainingCount > 0 ? ` +${remainingCount}` : "");

                return (
                  <div
                    key={course.course_id}
                    className="p-5 rounded-md bg-[var(--surface)] border border-[var(--border)] hover:border-slate-400 dark:hover:border-slate-600 transition shadow-none flex flex-col justify-between"
                  >
                    <div>
                      {/* Top: Source & Match % */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
                          {course.source || "iGOT Karmayogi"}
                        </span>
                        {course.match_percentage > 0 && (
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                            {course.match_percentage}% Match
                          </span>
                        )}
                      </div>

                      {/* Course Title */}
                      <h3 className="text-[16px] font-semibold text-[var(--foreground)] line-clamp-2 mt-2 leading-snug">
                        {course.title}
                      </h3>

                      {/* Short Recommendation Reason */}
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-1.5 line-clamp-2 leading-relaxed">
                        {formatReason(course.reason, course.skills_addressed)}
                      </p>

                      {/* Competencies */}
                      {skillsText && (
                        <p className="text-[11px] text-[var(--muted-foreground)] font-medium mt-2.5">
                          {skillsText}
                        </p>
                      )}
                    </div>

                    {/* Bottom: Duration & Primary Action */}
                    <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[var(--muted-foreground)]">
                        ⏱ {course.duration_hours ? `${course.duration_hours} hrs` : "Self-paced"}
                      </span>

                      <a
                        href={course.course_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition inline-flex items-center gap-1 shrink-0"
                      >
                        <span>Start Course on iGOT</span>
                        <span className="text-xs">↗</span>
                      </a>
                    </div>
                  </div>
                );
              })}

            {/* 2. NSSTA / TPAC Programmes */}
            {showProgs &&
              filteredProgrammes.map((prog) => {
                const progSkills = prog.competencies
                  ? prog.competencies.split(",").map((s) => s.trim()).filter(Boolean)
                  : [];
                const visibleSkills = progSkills.slice(0, 3);
                const remainingCount = progSkills.length - visibleSkills.length;
                const skillsText = visibleSkills.join(" · ") + (remainingCount > 0 ? ` +${remainingCount}` : "");

                return (
                  <div
                    key={`prog-${prog.id}`}
                    className="p-5 rounded-md bg-[var(--surface)] border border-[var(--border)] hover:border-slate-400 dark:hover:border-slate-600 transition shadow-none flex flex-col justify-between"
                  >
                    <div>
                      {/* Top: Source & Programme Type */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
                          NSSTA / TPAC
                        </span>
                        <span className="text-[11px] text-[var(--muted-foreground)] font-medium">
                          {prog.programme_type || "In-Service"}
                        </span>
                      </div>

                      {/* Programme Title */}
                      <h3 className="text-[16px] font-semibold text-[var(--foreground)] line-clamp-2 mt-2 leading-snug">
                        {prog.title}
                      </h3>

                      {/* Description / Provider */}
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-1.5 line-clamp-2 leading-relaxed">
                        {prog.description || `${prog.provider} specialized programme.`}
                      </p>

                      {/* Competencies */}
                      {skillsText && (
                        <p className="text-[11px] text-[var(--muted-foreground)] font-medium mt-2.5">
                          {skillsText}
                        </p>
                      )}
                    </div>

                    {/* Bottom: Duration & Primary Action */}
                    <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[var(--muted-foreground)]">
                        ⏱ {prog.duration || "Residential"}
                      </span>

                      <a
                        href={prog.registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-md bg-[#123B63] hover:bg-[#1B456F] text-white text-xs font-semibold transition inline-flex items-center gap-1 shrink-0"
                      >
                        <span>View Programme</span>
                        <span className="text-xs">↗</span>
                      </a>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

      </div>
    </AppShell>
  );
}



