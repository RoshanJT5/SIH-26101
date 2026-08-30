import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/skill-gaps", label: "Skill Map" },
  { href: "/courses", label: "Learn" },
  { href: "/assessments", label: "Assessments" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/documents", label: "Documents" },
  { href: "/ai-tutor", label: "AI Lab" },
];

const communityStats = [
  { label: "Assessments", value: "18", hint: "Last week 3" },
  { label: "Courses", value: "12", hint: "Completed 4" },
  { label: "Documents", value: "07", hint: "Ready for AI" },
  { label: "Streak", value: "7", hint: "Best 12 days" },
];

const sideSkills = [
  { label: "Statistics", value: "86%" },
  { label: "Sampling", value: "73%" },
  { label: "Visualization", value: "42%" },
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
              R
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1440px] gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-5 xl:sticky xl:top-[88px] xl:h-[calc(100dvh-112px)] xl:overflow-auto">
          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="flex gap-4">
              <div className="grid h-24 w-24 shrink-0 place-items-center rounded-md bg-[#a8c7ff] text-4xl font-black text-[#416fd9]">
                R
              </div>
              <div className="min-w-0 pt-1">
                <h2 className="truncate text-lg font-semibold text-white">Roshan JT5</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">Statistical Officer</p>
                <p className="mt-4 text-sm text-white">Readiness rank 42,46,168</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md bg-[#1d1d1d] p-3">
                <div className="text-xl font-semibold text-white">82%</div>
                <div className="text-[var(--muted)]">Competency</div>
              </div>
              <div className="rounded-md bg-[#1d1d1d] p-3">
                <div className="text-xl font-semibold text-white">7 days</div>
                <div className="text-[var(--muted)]">Streak</div>
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
            <h2 className="text-base font-semibold text-white">Community Stats</h2>
            <div className="mt-4 space-y-4">
              {communityStats.map((stat) => (
                <div key={stat.label} className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-white">{stat.label}</div>
                    <div className="mt-1 text-xs text-[var(--muted-soft)]">{stat.hint}</div>
                  </div>
                  <div className="text-sm font-semibold text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <h2 className="text-base font-semibold text-white">Languages</h2>
            <div className="mt-4 space-y-3">
              {sideSkills.map((skill) => (
                <div key={skill.label} className="flex items-center justify-between text-sm">
                  <span className="rounded-full bg-[#333333] px-3 py-1 text-[var(--muted)]">{skill.label}</span>
                  <span className="text-white">{skill.value}</span>
                </div>
              ))}
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
