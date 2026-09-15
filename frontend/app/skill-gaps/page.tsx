"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "../components/app-shell";
import {
  fetchSkillGaps,
  fetchUserProfile,
  SkillGapData,
  SkillGapDetail,
  UserProfile,
  getCurrentUserId
} from "../../lib/api";

export default function SkillGapsPage() {
  const [gapData, setGapData] = useState<SkillGapData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  useEffect(() => {
    async function loadGaps() {
      try {
        setLoading(true);
        const userId = getCurrentUserId();
        const [gaps, prof] = await Promise.all([
          fetchSkillGaps(userId),
          fetchUserProfile(userId),
        ]);
        setGapData(gaps);
        setProfile(prof);
      } catch (err) {
        console.error("Failed to load skill gaps", err);
      } finally {
        setLoading(false);
      }
    }
    loadGaps();
  }, []);

  const categories = [
    { key: "ALL", label: "All" },
    { key: "STATISTICAL", label: "Statistical" },
    { key: "TECHNICAL", label: "Technical" },
    { key: "DIGITAL_GOVERNANCE", label: "Digital" },
    { key: "BEHAVIOURAL_MANAGERIAL", label: "Managerial" },
  ];

  const formatCategory = (cat: string) => {
    if (cat === "BEHAVIOURAL_MANAGERIAL") return "BEHAVIOURAL & MANAGERIAL";
    return cat.replace(/_/g, " ");
  };

  const getPriorityBadge = (item: SkillGapDetail): "HIGH" | "MEDIUM" | "ON TARGET" => {
    if (item.gap <= 0) return "ON TARGET";
    if (item.priority === "CRITICAL" || item.priority === "HIGH" || item.gap >= 2) return "HIGH";
    return "MEDIUM";
  };

  const filteredGaps = gapData?.skill_gaps.filter((g) => {
    if (selectedCategory === "ALL") return true;
    return g.category === selectedCategory;
  }) || [];

  const totalGapsCount = gapData?.skill_gaps.filter((g) => g.gap > 0).length ?? 0;

  return (
    <AppShell
      title="YOUR SKILL GAPS"
      subtitle="See which skills need improvement for your current role."
    >
      {loading ? (
        <div className="py-20 text-center text-sm text-[var(--muted-foreground)]">
          <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p>Loading your skill gaps...</p>
        </div>
      ) : !gapData ? (
        <div className="p-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            Unable to compute skill gaps. Please check your assigned role.
          </p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* User / Role Card with Clear Hierarchy */}
          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold font-mono">
                  {gapData.service_cadre || "Official Statistics Cadre"}
                </span>
                <span className="text-xs text-[var(--muted-foreground)] font-medium">
                  {gapData.organization_name}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
                {gapData.role_name}
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                {gapData.total_competencies} competencies required for this role
              </p>
            </div>

            {/* Summary Metrics with Dominant Numbers */}
            <div className="flex items-center gap-6 sm:gap-8 border-t md:border-t-0 md:border-l border-[var(--border)] pt-4 md:pt-0 md:pl-8 shrink-0">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-400 leading-none">
                  {gapData.overall_health_score}%
                </div>
                <div className="text-[11px] sm:text-xs text-[var(--muted-foreground)] font-medium mt-1.5">
                  Competency Health
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-rose-400 leading-none">
                  {gapData.critical_gaps_count + gapData.high_gaps_count}
                </div>
                <div className="text-[11px] sm:text-xs text-[var(--muted-foreground)] font-medium mt-1.5">
                  Priority Gaps
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-400 leading-none">
                  {gapData.strengths_count}
                </div>
                <div className="text-[11px] sm:text-xs text-[var(--muted-foreground)] font-medium mt-1.5">
                  Skills On Target
                </div>
              </div>
            </div>
          </div>

          {/* Page Summary Alert Message */}
          <div className="px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs sm:text-sm">
            {totalGapsCount > 0 ? (
              <span className="font-semibold text-amber-400">
                {totalGapsCount} {totalGapsCount === 1 ? "skill needs" : "skills need"} your attention.
              </span>
            ) : (
              <span className="font-semibold text-emerald-400">
                Your current skills meet the requirements for your role.
              </span>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((c) => {
              const isActive = selectedCategory === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setSelectedCategory(c.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-[var(--surface)] text-[var(--muted-foreground)] border border-[var(--border)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Skill Gaps Table Section */}
          <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)]">
                  YOUR SKILL GAPS
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Your current level compared with the level required for your role.
                </p>
              </div>
              <span className="text-xs text-[var(--muted-foreground)] font-mono">
                {filteredGaps.length} {filteredGaps.length === 1 ? "Item" : "Items"}
              </span>
            </div>

            {filteredGaps.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--muted-foreground)]">
                No skills found in this category.
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--surface-hover)] text-[var(--muted-foreground)] uppercase tracking-wider text-[11px]">
                        <th className="py-3.5 px-4 font-semibold">SKILL</th>
                        <th className="py-3.5 px-4 text-center font-semibold">REQUIRED</th>
                        <th className="py-3.5 px-4 text-center font-semibold">CURRENT</th>
                        <th className="py-3.5 px-4 text-center font-semibold">GAP</th>
                        <th className="py-3.5 px-4 text-center font-semibold">PRIORITY</th>
                        <th className="py-3.5 px-4 text-right font-semibold">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {filteredGaps.map((item) => {
                        const priority = getPriorityBadge(item);
                        const hasGap = item.gap > 0;

                        return (
                          <tr
                            key={item.competency_id}
                            className={`transition group ${
                              hasGap
                                ? "hover:bg-[var(--surface-hover)]/60"
                                : "opacity-85 hover:opacity-100 hover:bg-[var(--surface-hover)]/40"
                            }`}
                          >
                            {/* Skill Name & Description */}
                            <td className="py-4 px-4 font-medium text-[var(--foreground)] max-w-sm">
                              <div className="font-semibold text-[15px] text-[var(--foreground)]">
                                {item.competency}
                              </div>
                              {item.why_it_matters && (
                                <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-1 mt-0.5">
                                  {item.why_it_matters}
                                </p>
                              )}
                              <span className="text-[10px] text-[var(--muted-foreground)] px-1.5 py-0.5 rounded bg-[var(--surface-hover)] border border-[var(--border)] whitespace-nowrap inline-block mt-1">
                                {formatCategory(item.category)}
                              </span>
                            </td>

                            {/* Required Level */}
                            <td className="py-4 px-4 text-center">
                              <span className="text-sm font-semibold text-[var(--foreground)]">
                                Level {item.required_level}
                              </span>
                              <span className="text-[10px] text-[var(--muted-foreground)]"> / 5</span>
                            </td>

                            {/* Current Level */}
                            <td className="py-4 px-4 text-center">
                              <span
                                className={`text-sm font-bold ${
                                  item.current_level >= item.required_level
                                    ? "text-emerald-400"
                                    : "text-amber-400"
                                }`}
                              >
                                Level {item.current_level}
                              </span>
                              <span className="text-[10px] text-[var(--muted-foreground)]"> / 5</span>
                            </td>

                            {/* Gap */}
                            <td className="py-4 px-4 text-center">
                              {hasGap ? (
                                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                  {item.gap} {item.gap === 1 ? "LEVEL" : "LEVELS"}
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  ON TARGET
                                </span>
                              )}
                            </td>

                            {/* Priority */}
                            <td className="py-4 px-4 text-center">
                              <span
                                className={`px-2.5 py-0.5 rounded text-[11px] font-bold inline-block border ${
                                  priority === "HIGH"
                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                    : priority === "MEDIUM"
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                }`}
                              >
                                {priority}
                              </span>
                            </td>

                            {/* Action (Assess is Primary, iGOT is Secondary) */}
                            <td className="py-4 px-4 text-right">
                              {hasGap ? (
                                <div className="flex items-center justify-end gap-2">
                                  <Link
                                    href={`/assessments?topic=${encodeURIComponent(item.competency)}`}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition inline-flex items-center gap-1"
                                  >
                                    Assess →
                                  </Link>
                                  <Link
                                    href={`/courses?search=${encodeURIComponent(item.competency)}`}
                                    className="px-2.5 py-1.5 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--border)] text-[var(--foreground)] border border-[var(--border)] text-xs font-medium transition inline-flex items-center gap-1"
                                    title="View related iGOT learning modules"
                                  >
                                    iGOT ↗
                                  </Link>
                                </div>
                              ) : (
                                <span className="text-xs text-emerald-400 font-semibold inline-block py-1 px-2">
                                  ✓ On Target
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Responsive Stacked Card View */}
                <div className="md:hidden divide-y divide-[var(--border)]">
                  {filteredGaps.map((item) => {
                    const priority = getPriorityBadge(item);
                    const hasGap = item.gap > 0;

                    return (
                      <div key={item.competency_id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-sm text-[var(--foreground)]">
                              {item.competency}
                            </div>
                            <span className="text-[10px] text-[var(--muted-foreground)] px-1.5 py-0.5 rounded bg-[var(--surface-hover)] border border-[var(--border)] inline-block mt-1">
                              {formatCategory(item.category)}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                              priority === "HIGH"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : priority === "MEDIUM"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            }`}
                          >
                            {priority}
                          </span>
                        </div>

                        {item.why_it_matters && (
                          <p className="text-[11px] text-[var(--muted-foreground)]">
                            {item.why_it_matters}
                          </p>
                        )}

                        <div className="grid grid-cols-3 gap-2 text-xs py-2 text-center bg-[var(--surface-hover)] rounded-lg p-2">
                          <div>
                            <div className="text-[10px] text-[var(--muted-foreground)] uppercase font-medium">Required</div>
                            <div className="font-bold text-[var(--foreground)] mt-0.5">Level {item.required_level}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-[var(--muted-foreground)] uppercase font-medium">Current</div>
                            <div
                              className={`font-bold mt-0.5 ${
                                item.current_level >= item.required_level ? "text-emerald-400" : "text-amber-400"
                              }`}
                            >
                              Level {item.current_level}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-[var(--muted-foreground)] uppercase font-medium">Gap</div>
                            <div className={`font-bold mt-0.5 ${hasGap ? "text-rose-400" : "text-emerald-400"}`}>
                              {hasGap ? `${item.gap} Levels` : "On Target"}
                            </div>
                          </div>
                        </div>

                        {hasGap ? (
                          <div className="flex items-center gap-2 pt-1">
                            <Link
                              href={`/assessments?topic=${encodeURIComponent(item.competency)}`}
                              className="flex-1 text-center py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
                            >
                              Assess →
                            </Link>
                            <Link
                              href={`/courses?search=${encodeURIComponent(item.competency)}`}
                              className="px-4 py-2 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--border)] text-[var(--foreground)] border border-[var(--border)] text-xs font-medium transition"
                            >
                              iGOT ↗
                            </Link>
                          </div>
                        ) : (
                          <div className="text-center py-1 text-xs text-emerald-400 font-semibold">
                            ✓ On Target
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

        </div>
      )}
    </AppShell>
  );
}


