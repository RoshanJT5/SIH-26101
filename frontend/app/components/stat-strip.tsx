"use client";

import React from "react";
import { UsersIcon, BookOpenIcon, CheckIcon, TrendingUpIcon, TargetIcon } from "./icons";

const STATS = [
  {
    value: "1,248+",
    label: "Statistical Officers Assessed",
    subtitle: "Prototype cohort across cadres",
    icon: UsersIcon,
  },
  {
    value: "18",
    label: "Statistical Divisions Represented",
    subtitle: "Survey, National Accounts & Price Indices",
    icon: TargetIcon,
  },
  {
    value: "6,200+",
    label: "iGOT Karmayogi Course Mappings",
    subtitle: "Accredited competency taxonomy",
    icon: BookOpenIcon,
  },
  {
    value: "82%",
    label: "Benchmark Readiness Target",
    subtitle: "Cadre role-level proficiency threshold",
    icon: CheckIcon,
  },
  {
    value: "100%",
    label: "GIGW & UX4G Accessible",
    subtitle: "WCAG 2.1 AA compliant design architecture",
    icon: TrendingUpIcon,
  },
];

export function StatStrip() {
  return (
    <section aria-label="Platform Benchmark Metrics" className="border-y border-[var(--border)] bg-[var(--panel)] py-8 shadow-xs">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
          {STATS.map((stat) => {
            const IconComp = stat.icon;
            return (
              <div key={stat.label} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="mb-2.5 flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--border-subtle)]">
                    <IconComp className="h-5 w-5" />
                  </span>
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--primary)]">
                    {stat.value}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] leading-snug">
                  {stat.label}
                </h3>
                <p className="mt-0.5 text-[11px] text-[var(--muted)] leading-normal">
                  {stat.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
