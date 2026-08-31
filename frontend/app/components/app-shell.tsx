"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuthSession, getAuthSession, getCurrentUserId, getUser, UserProfile } from "../../lib/api";
import { BellIcon, SearchIcon } from "./icons";
import { ThemeToggle } from "./theme-toggle";

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
  const pathname = usePathname();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<{ label: string; value: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!getAuthSession()) {
      router.replace("/login");
      return;
    }

    setAuthChecked(true);
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;
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
        // preserve fallback
      }
    }

    loadUser();
    return () => {
      active = false;
    };
  }, [authChecked]);

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
      : 82;

  if (!authChecked) {
    return <div className="min-h-[100dvh] bg-[var(--background)]" aria-busy="true" />;
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200">
      {/* Subtle National Accent Strip */}
      <div className="gov-tricolor-strip w-full" aria-hidden="true" />

      {/* Top Header / Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--header)] text-[var(--header-text)]">
        <div className="mx-auto flex min-h-16 w-full max-w-[1440px] items-center gap-4 px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-md border border-[var(--border)] bg-[var(--panel-inner)] text-sm font-bold text-[var(--teal)]">
              SL
            </span>
            <span className="hidden text-base font-semibold tracking-tight text-white sm:block">StatLearn AI</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-[var(--header-nav-active)] text-white font-semibold"
                      : "text-[var(--muted)] hover:bg-[var(--header-nav-hover)] hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="ml-auto flex items-center gap-3">
            <label className="hidden h-12 w-[280px] items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--panel-soft)] px-3 text-sm text-[var(--muted)] transition-colors focus-within:border-[var(--teal)] focus-within:bg-[var(--panel)] focus-within:ring-2 focus-within:ring-[var(--teal)]/20 md:flex">
              <SearchIcon className="h-5 w-5 shrink-0 text-[var(--teal)]" />
              <input
                aria-label="Search courses, skills, assessments, and documents"
                className="app-search-input min-w-0 flex-1 bg-transparent text-base leading-6 text-[var(--foreground)] placeholder:text-[var(--muted)]"
                placeholder="Search learning content"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && searchQuery.trim()) {
                    router.push(`/courses?q=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
              />
            </label>

            {/* HYDRATION-SAFE SINGLE THEME TOGGLE BUTTON ON NAVBAR */}
            <ThemeToggle />

            <button
              aria-label="Notifications"
              className="grid h-9 w-9 place-items-center text-[var(--muted)] transition duration-200 hover:text-[var(--accent)] hover:drop-shadow-[0_0_6px_rgba(255,153,51,0.45)] focus-visible:text-[var(--accent)]"
            >
              <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="sr-only">3 notifications</span>
            </button>
            <Link
              href="/dashboard"
              className="grid h-9 w-9 place-items-center rounded-full bg-[var(--primary)] text-xs font-bold text-white shadow-xs hover:opacity-90"
              aria-label="Profile"
            >
              {avatarLetter}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="mx-auto grid w-full max-w-[1440px] gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="space-y-5 xl:sticky xl:top-[88px] xl:h-[calc(100dvh-112px)] xl:overflow-auto">
          {/* Officer Profile Card */}
          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="flex gap-4">
              <div className="grid h-24 w-24 shrink-0 place-items-center rounded-md bg-[var(--primary-soft)] text-4xl font-black text-[var(--primary)] border border-[var(--border-subtle)]">
                {avatarLetter}
              </div>
              <div className="min-w-0 pt-1">
                <h2 className="truncate text-lg font-semibold text-[var(--foreground)]">{displayName}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{displayRole}</p>
                <p className="mt-2 text-xs text-[var(--green)] font-medium">
                  {profile?.department ? `${profile.department}` : "Official Statistical System"}
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md bg-[var(--panel-inner)] border border-[var(--border-subtle)] p-3">
                <div className="text-xl font-semibold text-[var(--foreground)]">{overallAvg}%</div>
                <div className="text-[var(--muted)] text-xs mt-0.5">Competency Match</div>
              </div>
              <div className="rounded-md bg-[var(--panel-inner)] border border-[var(--border-subtle)] p-3">
                <div className="text-xl font-semibold text-[var(--foreground)]">{profile?.competencies?.length ?? 0}</div>
                <div className="text-[var(--muted)] text-xs mt-0.5">Tracked Skills</div>
              </div>
            </div>
            <Link
              href="/profile"
              className="mt-4 flex h-11 items-center justify-center rounded-md bg-[var(--green-badge-bg)] text-sm font-medium text-[var(--green-badge-text)] border border-[var(--green)]/20 transition hover:opacity-90"
            >
              Edit Profile
            </Link>
            <button
              type="button"
              onClick={() => {
                clearAuthSession();
                router.replace("/login");
              }}
              className="mt-2 flex h-11 w-full items-center justify-center rounded-md border border-red-400/40 bg-red-500/10 text-sm font-semibold text-red-400 shadow-[0_4px_16px_rgba(239,68,68,0.12)] backdrop-blur-md transition hover:border-red-400/70 hover:bg-red-500/20 hover:text-red-300"
            >
              Log out
            </button>
          </section>

          {/* Profile Overview */}
          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <h2 className="text-base font-semibold text-[var(--foreground)]">Profile Overview</h2>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-start justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
                <span className="text-[var(--muted)]">Department</span>
                <span className="font-medium text-[var(--foreground)] text-right">{profile?.department || "Civil Service"}</span>
              </div>
              <div className="flex items-start justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
                <span className="text-[var(--muted)]">Designation</span>
                <span className="font-medium text-[var(--foreground)] text-right">{profile?.designation || "Officer"}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[var(--muted)]">Career Goal</span>
                <span className="font-medium text-[var(--green)] text-right">{profile?.career_goal || "Competency Growth"}</span>
              </div>
            </div>
          </section>

          {/* Role Competencies */}
          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <h2 className="text-base font-semibold text-[var(--foreground)]">Role Competencies</h2>
            <div className="mt-4 space-y-2">
              {skills.length ? (
                skills.map((skill) => (
                  <div key={skill.label} className="flex items-center justify-between text-xs rounded-md bg-[var(--panel-soft)] border border-[var(--border-subtle)] px-3 py-2">
                    <span className="text-[var(--foreground)]">{skill.label}</span>
                    <span className="font-semibold text-[var(--green)]">{skill.value}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[var(--muted)]">No competencies configured yet.</div>
              )}
            </div>
          </section>
        </aside>

        {/* Content Area */}
        <main className="min-w-0">
          <div className="mb-6 flex flex-col gap-4 rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">{title}</h1>
              {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{subtitle}</p> : null}
            </div>
            <Link
              href="/assessments"
              className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--panel-soft)] px-4 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--teal)] hover:text-[var(--teal)]"
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
