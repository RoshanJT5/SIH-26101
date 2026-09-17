"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearAuthSession,
  getAuthSession,
  getCurrentUserId,
  setCurrentUserId,
  fetchUserProfile,
  UserProfile,
} from "../../lib/api";
import {
  BellIcon,
  SearchIcon,
  DashboardIcon,
  TargetIcon,
  GraduationCapIcon,
  MapIcon,
  ClipboardIcon,
  RobotIcon,
  FileIcon,
  UserIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
} from "./icons";
import { ThemeToggle } from "./theme-toggle";

interface NavGroup {
  groupName: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupName: "MAIN",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
      { href: "/skill-gaps", label: "Skill Gaps", icon: TargetIcon },
      { href: "/courses", label: "Courses & iGOT", icon: GraduationCapIcon },
      { href: "/roadmap", label: "Learning Roadmap", icon: MapIcon },
      { href: "/assessments", label: "Assessments", icon: ClipboardIcon },
    ],
  },
  {
    groupName: "AI ASSISTANCE",
    items: [
      { href: "/ai-tutor", label: "AI Tutor", icon: RobotIcon },
      { href: "/documents", label: "Official Manuals", icon: FileIcon },
    ],
  },
  {
    groupName: "ACCOUNT",
    items: [
      { href: "/profile", label: "Official Profile", icon: UserIcon },
    ],
  },
];

const DEMO_PERSONAS = [
  { id: 1, name: "Aditya Sharma", role: "Statistical Officer (Survey Design)" },
  { id: 2, name: "Priya Sharma", role: "Junior Statistical Officer (PLFS Analytics)" },
  { id: 3, name: "Dr. Amitabh Verma", role: "Deputy Director (National Accounts)" },
  { id: 4, name: "Sunita Roy", role: "Senior Field Enumeration Supervisor" },
  { id: 5, name: "Rajesh Nair", role: "Data Systems & Privacy Analyst" },
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
  const [currentId, setCurrentId] = useState<number>(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!getAuthSession()) {
      router.replace("/login");
      return;
    }
    setAuthChecked(true);
    setCurrentId(getCurrentUserId());
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;
    let active = true;

    async function loadUser() {
      try {
        const userId = getCurrentUserId();
        const data = await fetchUserProfile(userId);
        if (!active) return;
        setProfile(data);
      } catch {
        // preserve fallback
      }
    }

    loadUser();
    return () => {
      active = false;
    };
  }, [authChecked, currentId]);

  const handlePersonaSwitch = async (newId: number) => {
    setCurrentUserId(newId);
    setCurrentId(newId);
    try {
      const data = await fetchUserProfile(newId);
      setProfile(data);
    } catch {}
    window.location.reload();
  };

  const displayName = profile?.name || "Official";
  const displayRole = profile?.role_name || profile?.designation || "Statistical Officer";
  const displayOrg = profile?.organization_name || profile?.organization || "Ministry of Statistics & PI";
  const avatarLetter = displayName.trim().charAt(0).toUpperCase() || "O";

  if (!authChecked) {
    return <div className="min-h-[100dvh] bg-[var(--background)]" aria-busy="true" />;
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200 flex flex-col">
      {/* Subtle National Accent Strip */}
      <div className="gov-tricolor-strip w-full h-1" aria-hidden="true" />

      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--header)] text-[var(--header-text)] shadow-xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-15 gap-4">
            
            {/* LEFT: Mobile menu button + Logo & Platform Identity */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden w-8 h-8 rounded-md bg-white/10 hover:bg-white/15 text-white flex items-center justify-center transition"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
              </button>

              <Link href="/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/20 flex items-center justify-center bg-white shadow-xs">
                  <Image
                    src="/pragati-parikshan-logo.jpeg"
                    alt="PragatiParikshan Logo"
                    width={36}
                    height={36}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white tracking-tight leading-none">
                      PragatiParikshan
                    </span>
                    <span className="hidden sm:inline-block text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-emerald-300 font-semibold border border-white/10">
                      MoSPI SIH26101
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 hidden md:block mt-0.5">
                    India&apos;s Official Statistical System • Capacity Engine
                  </p>
                </div>
              </Link>
            </div>

            {/* CENTER: Contextual Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md items-center mx-4">
              <div className="relative w-full">
                <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search competencies, manuals, iGOT courses..."
                  className="w-full h-9 pl-9 pr-3 rounded-md bg-white/10 border border-white/15 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-white/40 transition"
                />
              </div>
            </div>

            {/* RIGHT: User Profile Context & Theme Toggle */}
            <div className="flex items-center gap-3">
              {/* Notification Pill */}
              <button
                type="button"
                className="w-8 h-8 rounded-md bg-white/10 hover:bg-white/15 text-slate-200 flex items-center justify-center transition"
                title="Notifications"
                aria-label="Notifications"
              >
                <BellIcon className="h-4 w-4" />
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Avatar & Context Button */}
              <Link
                href="/profile"
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-md hover:bg-white/10 transition border border-transparent hover:border-white/10"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {avatarLetter}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-white leading-tight truncate max-w-[130px]">
                    {displayName}
                  </div>
                  <div className="text-[10px] text-slate-300 leading-tight truncate max-w-[130px]">
                    {displayRole}
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* BODY CONTAINER: LEFT SIDEBAR NAVIGATION + RIGHT CONTENT */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col xl:flex-row gap-6">
        
        {/* LEFT-SIDE PRIMARY WORKSPACE NAVIGATION CONTAINER (Desktop Container) */}
        <aside className="hidden xl:block w-64 shrink-0">
          <div className="sticky top-20 space-y-4">
            
            {/* Whole Div Navigation Container */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3.5 shadow-[var(--card-shadow)] flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] px-2 mb-2.5">
                  Workspace Navigation
                </div>

                <nav className="space-y-4" aria-label="Authenticated Navigation">
                  {NAV_GROUPS.map((group) => (
                    <div key={group.groupName} className="space-y-1">
                      <div className="text-[9px] font-bold tracking-wider text-[var(--muted-soft)] uppercase px-2 py-0.5">
                        {group.groupName}
                      </div>
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                          pathname === item.href ||
                          (item.href !== "/dashboard" && pathname.startsWith(item.href));

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition group ${
                              isActive
                                ? "bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/30 shadow-xs"
                                : "text-[var(--foreground)] hover:bg-[var(--panel-soft)] hover:text-[var(--primary)]"
                            }`}
                          >
                            <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[var(--primary)]" : "text-[var(--muted)] group-hover:text-[var(--primary)]"}`} />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  ))}

                  {/* Sign Out Action */}
                  <div className="pt-2 border-t border-[var(--border-subtle)]">
                    <button
                      type="button"
                      onClick={() => {
                        clearAuthSession();
                        router.push("/login");
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition"
                    >
                      <LogOutIcon className="h-4 w-4 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </nav>
              </div>
            </div>

            {/* Persona Switcher Container */}
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-soft)] p-3 text-xs shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                Official Persona Switcher
              </div>
              <select
                value={currentId}
                onChange={(e) => handlePersonaSwitch(Number(e.target.value))}
                className="w-full h-8 rounded border border-[var(--border)] bg-[var(--input-bg)] px-2 text-[11px] font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] cursor-pointer"
              >
                {DEMO_PERSONAS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <div className="text-[10px] text-[var(--muted)] mt-1.5 leading-tight truncate">
                {displayRole}
              </div>
            </div>

          </div>
        </aside>

        {/* MAIN CONTENT AREA (Right of the Navigation Sidebar) */}
        <main className="flex-1 min-w-0">
          {/* Page Title & Breadcrumb Context */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--foreground)]">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="truncate max-w-[220px]">{displayOrg}</span>
              </div>
            </div>
          </div>

          {/* Render Page Children */}
          {children}
        </main>
      </div>

      {/* MOBILE / TABLET LEFT DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel on Left */}
          <div className="relative mr-auto w-72 max-w-[85vw] h-full bg-[var(--panel)] border-r border-[var(--border)] p-4 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-slate-900 border border-[var(--border)] flex items-center justify-center p-1">
                    <Image
                      src="/pragati-parikshan-logo.jpeg"
                      alt="Logo"
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <span className="font-bold text-sm text-[var(--foreground)]">PragatiParikshan</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="space-y-4">
                {NAV_GROUPS.map((group) => (
                  <div key={group.groupName} className="space-y-1">
                    <div className="text-[9px] font-bold tracking-wider text-[var(--muted-soft)] uppercase px-2 py-0.5">
                      {group.groupName}
                    </div>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href));

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition ${
                            isActive
                              ? "bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/30 font-bold"
                              : "text-[var(--foreground)] hover:bg-[var(--panel-soft)]"
                          }`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[var(--primary)]" : "text-[var(--muted)]"}`} />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </div>

            {/* Drawer Bottom */}
            <div className="pt-4 border-t border-[var(--border)] mt-4 space-y-3">
              <div className="text-xs">
                <span className="text-[10px] text-[var(--muted)] uppercase font-bold block mb-1">
                  Persona Switcher:
                </span>
                <select
                  value={currentId}
                  onChange={(e) => {
                    handlePersonaSwitch(Number(e.target.value));
                    setMobileMenuOpen(false);
                  }}
                  className="w-full h-8 rounded border border-[var(--border)] bg-[var(--input-bg)] px-2 text-xs font-semibold text-[var(--foreground)]"
                >
                  {DEMO_PERSONAS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  clearAuthSession();
                  router.push("/login");
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20"
              >
                <LogOutIcon className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-[var(--border)] bg-[var(--header)] py-4 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-white">PragatiParikshan</span> • SIH 2026 Prototype Demonstration Platform
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <span>MoSPI Challenge SIH26101</span>
            <span>•</span>
            <span>Aligned with iGOT Karmayogi Framework</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
