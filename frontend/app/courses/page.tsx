"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import { listCourses } from "../../lib/api";

const filters = ["Recommended", "Visualization", "Intermediate", "Under 6 hours", "iGOT"];

const coursesFallback = [
  {
    title: "Data Visualization for Official Statistics",
    source: "iGOT Karmayogi",
    level: "Intermediate",
    duration: "4h 20m",
    match: "94%",
    reason: "Recommended because your visualization competency is below the target level.",
    progress: 72,
  },
  {
    title: "Statistical Inference for Policy Analysis",
    source: "MoSPI Academy",
    level: "Advanced",
    duration: "6h 10m",
    match: "88%",
    reason: "Your assessment shows a priority gap in inference and interpretation.",
    progress: 40,
  },
  {
    title: "Survey Sampling and Field Quality",
    source: "National Statistical Training",
    level: "Intermediate",
    duration: "5h 00m",
    match: "81%",
    reason: "Matched to your survey methods role requirement and recent quiz result.",
    progress: 0,
  },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState(coursesFallback);

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      try {
        const response = await listCourses();
        if (!active) return;

        const mappedCourses = response.map((course) => ({
          title: course.title,
          source: course.source,
          level: course.level ?? "Intermediate",
          duration: course.duration_hours ? `${Math.floor(course.duration_hours / 60)}h ${course.duration_hours % 60}m` : "4h 00m",
          match: `${Math.round((course.id % 10) * 9 + 80)}%`,
          reason: course.description ?? "Recommended based on your current role and skill profile.",
          progress: 25 + (course.id % 5) * 15,
        }));

        setCourses(mappedCourses.length ? mappedCourses : coursesFallback);
      } catch {
        if (active) setCourses(coursesFallback);
      }
    }

    loadCourses();
    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell title="Learning" subtitle="Find courses matched to your current gaps, assessment results, and official role requirements.">
      <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="block">
            <span className="sr-only">Search courses</span>
            <input
              placeholder="Search courses, skills, departments, or source material"
              className="h-11 w-full rounded-md border border-[var(--border)] bg-[#303030] px-4 text-sm text-white placeholder:text-[var(--muted)] outline-none"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter, index) => (
              <button
                key={filter}
                className={`h-10 rounded-md border px-3 text-sm ${
                  index === 0
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
        {courses.map((course) => (
          <article key={course.title} className="panel-rise rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                  <span className="rounded-md bg-[#303030] px-2 py-1">{course.source}</span>
                  <span>{course.level}</span>
                  <span>{course.duration}</span>
                </div>
                <h2 className="mt-3 text-xl font-semibold text-white">{course.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{course.reason}</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2 w-full max-w-sm rounded-full bg-[#3a3a3a]">
                    <div className="h-2 rounded-full bg-[var(--teal)]" style={{ width: `${course.progress}%` }} />
                  </div>
                  <span className="text-xs text-[var(--muted)]">{course.progress ? `${course.progress}% complete` : "Not started"}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md bg-[#303030] p-4 lg:block">
                <div>
                  <div className="text-3xl font-semibold text-[#37d46f]">{course.match}</div>
                  <div className="text-sm text-[var(--muted)]">recommended for you</div>
                </div>
                <Link href="/roadmap" className="mt-0 inline-flex rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#60a5fa] lg:mt-5">
                  Continue
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
