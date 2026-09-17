"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { getAuthSession } from "../../lib/api";
import { MenuIcon, XIcon } from "./icons";

const NAV_LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#workflow", label: "Framework" },
  { href: "/#igot-integration", label: "iGOT Integration" },
  { href: "/#assessment", label: "Matrix" },
  { href: "/#courses", label: "Courses" },
  { href: "/#analytics", label: "Analytics" },
  { href: "/#resources", label: "Resources" },
  { href: "/#faq", label: "FAQ" },
];

export function InstitutionalHeader() {
  const [authReady, setAuthReady] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const session = getAuthSession();
      setSessionName(session?.user?.name || "");
      setAuthReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const avatarLetter = sessionName.trim().charAt(0).toUpperCase() || "O";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--header)] text-[var(--header-text)] shadow-xs">
      <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* Project Branding */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-md border border-white/20 bg-white p-0.5 shadow-xs">
            <Image
              src="/pragati-parikshan-logo.jpeg"
              alt="PragatiParikshan Logo"
              width={44}
              height={44}
              className="h-full w-full object-contain"
              priority
            />
          </span>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-amber-300 transition">
                PragatiParikshan
              </span>
              <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 border border-white/10">
                SIH Prototype
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-200 tracking-normal line-clamp-1">
              National Statistical Competency &amp; Intelligence Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 text-xs sm:text-sm font-semibold lg:flex" aria-label="Main Navigation">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-slate-100 hover:bg-white/10 hover:text-white transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Header CTAs & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {authReady && sessionName ? (
            <Link
              href="/dashboard"
              aria-label={`Open ${sessionName}'s dashboard`}
              title={`Logged in as ${sessionName}. Open dashboard.`}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-[var(--primary)] pl-1 pr-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-[var(--primary-hover)] transition"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-[var(--primary)] font-black">
                {avatarLetter}
              </span>
              <span className="hidden sm:inline max-w-[100px] truncate">{sessionName}</span>
            </Link>
          ) : authReady ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                Officer Login
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-[var(--accent)] px-3.5 py-1.5 text-xs font-bold text-slate-900 shadow-xs hover:brightness-105 transition"
              >
                Register
              </Link>
            </div>
          ) : null}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="rounded-md p-2 text-slate-200 hover:bg-white/10 hover:text-white lg:hidden"
          >
            {mobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-[var(--header)] px-4 py-4 lg:hidden animate-fade-slide-up">
          <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md border border-white/20 bg-white/10 px-3 py-2 text-center text-xs font-bold text-white"
              >
                Officer Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md bg-[var(--accent)] px-3.5 py-2 text-center text-xs font-bold text-slate-900"
              >
                Officer Registration
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
