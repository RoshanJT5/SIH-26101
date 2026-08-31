"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUserId, getUser, UserProfile } from "../../lib/api";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/skill-gaps", label: "Skill Map" },
  { href: "/courses", label: "Learn" },
  { href: "/assessments", label: "Assessments" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/documents", label: "Documents" },
  { href: "/ai-tutor", label: "AI Lab" },
];

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const userId = getCurrentUserId();
        const data = await getUser(userId);
        if (!active) return;
        setProfile(data);

        if (data.competencies?.length) {
          const mapped = data.competencies.slice(0, 5).map((comp) => ({
            label: comp.competency_name,
            value: `${Math.round((comp.current_level / Math.max(comp.required_level, 1)) * 100)}%`,
          }));
          setSkills(mapped);
        } else {
          setSkills([]);
        }
      } catch {
        // preserve
      }
    }

    loadUser();
    return () => {
      active = false;
    };
  }, []);

  const displayName = profile?.name || "Official";
  const displayRole = profile?.designation || profile?.job_role || "Civil Services";
  const avatarLetter = displayName.trim().charAt(0).toUpperCase() || "O";

  const overallAvg =
    profile?.competencies && profile.competencies.length > 0
      ? Math.round(
          (profile.competencies.reduce((acc, c) => acc + c.current_level / Math.max(c.required_level, 1), 0) /
            profile.competencies.length) *
            100
        )
      : 0;

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--header)]">
        <div className="mx-auto flex min-h-16 w-full max-w-[1440px] items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md border border-[var(--border)] bg-[#1f1f1f] text-sm font-bold text-[var(--teal)]">
              SL
            </span>
            <span className="hidden text-base font-semibold tracking-tight text-white sm:block">StatLearn AI</span>
          </Link>

          <nav className="hidden flex-1 items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--panel-soft)] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <label className="hidden h-10 w-[240px] items-center gap-2 rounded-md bg-[#363636] px-3 text-sm text-[var(--muted)] md:flex">
              <span aria-hidden="true">Search</span>
              <input
                aria-label="Search courses, skills, assessments, and documents"
                className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-[var(--muted)]"
                placeholder="Search"
              />
            </label>
            <button
              aria-label="Notifications"
              className="grid h-10 w-10 place-items-center rounded-md border border-[var(--border)] bg-[var(--panel)] text-sm text-[var(--muted)] transition hover:text-white"
            >
              3
            </button>
            <Link
              href="/login"
              className="grid h-10 w-10 place-items-center rounded-full bg-[#8fb4ff] text-sm font-bold text-[#13213d]"
              aria-label="Profile"
            >
              {avatarLetter}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1440px] gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-5 xl:sticky xl:top-[88px] xl:h-[calc(100dvh-112px)] xl:overflow-auto">
          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="flex gap-4">
              <div className="grid h-24 w-24 shrink-0 place-items-center rounded-md bg-[#a8c7ff] text-4xl font-black text-[#416fd9]">
                {avatarLetter}
              </div>
              <div className="min-w-0 pt-1">
                <h2 className="truncate text-lg font-semibold text-white">{displayName}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{displayRole}</p>
                <p className="mt-2 text-xs text-emerald-400 font-medium">
                  {profile?.department ? `${profile.department}` : "Official Statistical System"}
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md bg-[#1d1d1d] p-3">
                <div className="text-xl font-semibold text-white">{overallAvg}%</div>
                <div className="text-[var(--muted)] text-xs mt-0.5">Competency Match</div>
              </div>
              <div className="rounded-md bg-[#1d1d1d] p-3">
                <div className="text-xl font-semibold text-white">{profile?.competencies?.length ?? 0}</div>
                <div className="text-[var(--muted)] text-xs mt-0.5">Tracked Skills</div>
              </div>
            </div>
            <Link
              href="/signup"
              className="mt-4 flex h-11 items-center justify-center rounded-md bg-[#14331f] text-sm font-medium text-[#37d46f] transition hover:bg-[#174026]"
            >
              Edit Profile
            </Link>
          </section>

          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <h2 className="text-base font-semibold text-white">Profile Overview</h2>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-start justify-between gap-2 border-b border-[#2b2b2b] pb-2">
                <span className="text-[var(--muted)]">Department</span>
                <span className="font-medium text-white text-right">{profile?.department || "Civil Service"}</span>
              </div>
              <div className="flex items-start justify-between gap-2 border-b border-[#2b2b2b] pb-2">
                <span className="text-[var(--muted)]">Designation</span>
                <span className="font-medium text-white text-right">{profile?.designation || "Officer"}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[var(--muted)]">Career Goal</span>
                <span className="font-medium text-emerald-300 text-right">{profile?.career_goal || "Competency Growth"}</span>
              </div>
            </div>
          </section>

          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <h2 className="text-base font-semibold text-white">Role Competencies</h2>
            <div className="mt-4 space-y-2">
              {skills.length ? (
                skills.map((skill) => (
                  <div key={skill.label} className="flex items-center justify-between text-xs rounded-md bg-[#282828] px-3 py-2">
                    <span className="text-slate-200">{skill.label}</span>
                    <span className="font-semibold text-emerald-400">{skill.value}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[var(--muted)]">No competencies configured yet.</div>
              )}
            </div>
          </section>
        </aside>

        <main className="min-w-0">
          <div className="mb-6 flex flex-col gap-4 rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
              {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{subtitle}</p> : null}
            </div>
            <Link
              href="/assessments"
              className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] bg-[#333333] px-4 text-sm font-medium text-white transition hover:border-[var(--teal)] hover:text-[var(--teal)]"
            >
              Reassess Skills
            </Link>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
