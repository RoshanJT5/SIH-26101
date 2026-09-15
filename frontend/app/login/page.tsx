"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "../components/theme-toggle";
import { getAuthSession, loginUser, setAuthSession, setCurrentUserId } from "../../lib/api";

const fieldClass =
  "h-9 sm:h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3 text-xs sm:text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 transition";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    if (session) {
      const isAdmin = Boolean(
        session.user.is_admin ||
        session.user.role?.toLowerCase() === "admin" ||
        session.user.role_name?.toLowerCase() === "admin" ||
        session.user.email?.toLowerCase() === "admin@pragatiparikshan.demo"
      );
      if (isAdmin) {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const authUser = await loginUser({ email, password });
      setAuthSession({ userId: authUser.id, user: authUser });
      
      const isAdmin = Boolean(
        authUser.is_admin ||
        authUser.role?.toLowerCase() === "admin" ||
        authUser.role_name?.toLowerCase() === "admin" ||
        authUser.email.toLowerCase() === "admin@pragatiparikshan.demo"
      );

      if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Login failed. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between transition-colors duration-200">
      {/* Top Section: Tricolor Strip & Compact Institutional Header */}
      <div className="shrink-0">
        <div className="gov-tricolor-strip w-full" aria-hidden="true" />
        <header className="border-b border-[var(--border)] bg-[var(--header)] text-[var(--header-text)] px-4 py-2 sm:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-white/40 bg-white shadow-xs">
                <Image
                  src="/pragati-parikshan-logo.jpeg"
                  alt="PragatiParikshan Logo"
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                  priority
                />
              </span>
              <div>
                <span className="text-sm font-bold tracking-tight text-white block leading-none">
                  PragatiParikshan
                </span>
                <span className="text-[9px] text-slate-300 tracking-wider uppercase block mt-0.5 font-medium">
                  Official Competency &amp; Learning Platform
                </span>
              </div>
            </Link>
            <ThemeToggle />
          </div>
        </header>
      </div>

      {/* Main Container: Centered Login Panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-3 sm:py-4">
        <div className="w-full max-w-[440px] rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6 shadow-[var(--card-shadow)]">
          {/* Card Header: Brand Icon, Title, Subtitle */}
          <div className="text-center">
            <Link href="/" className="mx-auto inline-block">
              <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-[var(--border)] bg-white shadow-xs mx-auto">
                <Image
                  src="/pragati-parikshan-logo.jpeg"
                  alt="PragatiParikshan"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              </span>
            </Link>
            <h1 className="mt-2 text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
              Welcome back
            </h1>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              Sign in to your official learning workspace.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="mt-3.5 space-y-2.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--foreground)]">
                Official email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. officer@gov.in"
                className={fieldClass}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--foreground)]">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={fieldClass}
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-1.5 text-[var(--muted)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-3.5 w-3.5 rounded border-[var(--border)] accent-[var(--primary)]"
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-[var(--primary)] hover:underline font-medium">
                Forgot password?
              </a>
            </div>

            <div className="pt-1 space-y-1.5">
              <button
                type="submit"
                disabled={loading}
                className="h-10 w-full rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-xs sm:text-sm font-semibold text-white transition disabled:opacity-60 shadow-xs flex items-center justify-center cursor-pointer"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentUserId(1);
                  router.push("/dashboard");
                }}
                className="h-8 sm:h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--panel-soft)] hover:bg-[var(--surface-hover)] text-xs font-medium text-[var(--foreground)] transition cursor-pointer"
              >
                Continue with organization login
              </button>
            </div>
          </form>

          {/* Registration Prompt */}
          <p className="mt-2.5 text-center text-xs text-[var(--muted)]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-[var(--primary)] hover:underline ml-0.5">
              Register
            </Link>
          </p>

          {/* Integrated Prototype Demo Admin Access Section */}
          <div className="mt-3.5 pt-3 border-t border-[var(--border)]">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="font-bold text-[10px] uppercase tracking-wider text-[var(--foreground)]">
                DEMO ADMIN ACCESS
              </span>
              <span className="text-[9px] text-[var(--muted)] font-medium">
                SIH Prototype &bull; Demo Account
              </span>
            </div>

            <p className="text-[10px] text-[var(--muted)] mb-1.5 leading-tight">
              Use the prototype administrator account to explore workforce analytics.
            </p>

            <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--panel-soft)] px-2.5 py-1.5 text-xs space-y-0.5 mb-2 font-mono">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[var(--muted)] font-sans text-[10px]">Email</span>
                <span className="font-semibold text-[var(--foreground)] select-all text-[11px]">
                  admin@pragatiparikshan.demo
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[var(--muted)] font-sans text-[10px]">Password</span>
                <span className="font-semibold text-[var(--foreground)] select-all text-[11px]">
                  Admin@123
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setEmail("admin@pragatiparikshan.demo");
                setPassword("Admin@123");
              }}
              className="w-full h-8 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-xs transition flex items-center justify-center shadow-xs cursor-pointer"
            >
              Use Demo Admin
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="shrink-0 border-t border-[var(--border)] bg-[var(--header)] py-2 text-center text-[11px] text-slate-400">
        &copy; 2026 Government of India &bull; Ministry of Statistics and Programme Implementation
      </footer>
    </main>
  );
}
