"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRightIcon, BookOpenIcon, GovernmentIcon } from "./icons";

interface CourseItem {
  id: string;
  title: string;
  category: string;
  source: string;
  level: string;
  duration: string;
  match: string;
  targetCadre: string;
  summary: string;
}

const COURSES: CourseItem[] = [
  {
    id: "c-1",
    title: "Data Visualization & Dashboarding for Official Reports",
    category: "Analytical Competency",
    source: "iGOT Karmayogi",
    level: "Intermediate",
    duration: "6h 00m",
    match: "94%",
    targetCadre: "Statistical Officer / JSO",
    summary: "Mastering PowerBI, tabular reporting, and GIGW-compliant charts for national survey dissemination.",
  },
  {
    id: "c-2",
    title: "System of National Accounts (SNA 2008 & 2025 Updates)",
    category: "Macroeconomic Statistics",
    source: "MoSPI Academy",
    level: "Advanced",
    duration: "8h 30m",
    match: "88%",
    targetCadre: "National Accounts Division",
    summary: "GDP computation, supply-use tables, gross fixed capital formation, and institutional sector accounts.",
  },
  {
    id: "c-3",
    title: "Survey Sampling Methodology & Field Quality Assurance",
    category: "Field Operations",
    source: "NSSO Training Wing",
    level: "Intermediate",
    duration: "5h 15m",
    match: "85%",
    targetCadre: "Field Operations Division",
    summary: "Stratified multi-stage design, non-sampling error minimization, and digital CAPI validation protocols.",
  },
  {
    id: "c-4",
    title: "Consumer Price Index (CPI) & Inflation Diagnostics",
    category: "Price Statistics",
    source: "Price Statistics Wing",
    level: "Foundation",
    duration: "4h 45m",
    match: "81%",
    targetCadre: "Economic Statistics Cadre",
    summary: "Base year revisions, geometric mean aggregation, rural/urban price indices, and imputation methods.",
  },
  {
    id: "c-5",
    title: "National Industrial Classification (NIC-2008) Standards",
    category: "Classification & Registry",
    source: "iGOT Karmayogi",
    level: "Foundation",
    duration: "3h 30m",
    match: "78%",
    targetCadre: "Annual Survey of Industries",
    summary: "Coding establishments, enterprise registries, and concordances with UN ISIC Rev. 4 taxonomy.",
  },
  {
    id: "c-6",
    title: "Digital Data Governance, Confidentiality & Ethics",
    category: "Governance & Ethics",
    source: "Digital India Academy",
    level: "All Officers",
    duration: "4h 00m",
    match: "75%",
    targetCadre: "All MoSPI Cadre Officers",
    summary: "Data protection legislation, statistical anonymization, microdata sharing guidelines, and officer ethics.",
  },
];

export function CourseCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const scrollAmount = containerRef.current.clientWidth * 0.75;
    containerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      scroll("left");
    } else if (e.key === "ArrowRight") {
      scroll("right");
    }
  };

  return (
    <section id="courses" className="py-16 bg-[var(--background)] border-t border-[var(--border)]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        {/* Header with Navigation Buttons */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)] border border-[var(--primary)]/20">
              <BookOpenIcon className="h-3.5 w-3.5" />
              <span>Accredited Learning Catalog</span>
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
              Featured iGOT Karmayogi Courses
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[var(--muted)]">
              Curriculum mapped directly to diagnostic gap indicators for civil service statistical cadres.
            </p>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center gap-2" role="group" aria-label="Course carousel navigation">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              title="Previous courses"
              aria-label="Previous courses"
              className="grid h-9 w-9 place-items-center rounded-md border border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)] shadow-xs transition hover:bg-[var(--panel-soft)] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              title="Next courses"
              aria-label="Next courses"
              className="grid h-9 w-9 place-items-center rounded-md border border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)] shadow-xs transition hover:bg-[var(--panel-soft)] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <Link
              href="/courses"
              className="ml-2 inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline"
            >
              <span>View All ({COURSES.length})</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Horizontal Carousel Track */}
        <div
          ref={containerRef}
          onScroll={checkScroll}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label="Course catalog list"
          className="flex gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          style={{ scrollbarWidth: "thin" }}
        >
          {COURSES.map((course) => (
            <div
              key={course.id}
              className="w-[300px] sm:w-[340px] shrink-0 snap-start rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)] flex flex-col justify-between hover:border-[var(--primary)]/50 transition-colors"
            >
              <div>
                {/* Card Top Metadata */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 rounded bg-[var(--panel-inner)] border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] font-bold text-[var(--teal)]">
                    <GovernmentIcon className="h-3 w-3" />
                    <span>{course.source}</span>
                  </span>
                  <span className="rounded bg-[var(--green-badge-bg)] border border-[var(--green)]/20 px-2 py-0.5 text-[10px] font-bold text-[var(--green-badge-text)]">
                    {course.match} Gap Match
                  </span>
                </div>

                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  {course.category}
                </div>

                <h3 className="mt-1 text-sm font-bold text-[var(--foreground)] leading-snug line-clamp-2">
                  {course.title}
                </h3>

                <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed line-clamp-2">
                  {course.summary}
                </p>

                <div className="mt-3 flex items-center gap-2 text-[11px] text-[var(--muted)] font-medium">
                  <span>{course.level}</span>
                  <span>•</span>
                  <span>{course.duration}</span>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="mt-5 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-[10px] text-[var(--muted)] font-semibold truncate max-w-[170px]">
                  {course.targetCadre}
                </span>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-1 rounded-md bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition"
                >
                  <span>Details</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
