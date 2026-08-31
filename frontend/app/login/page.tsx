"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "../components/theme-toggle";
import { getAuthSession, loginUser, setAuthSession, setCurrentUserId } from "../../lib/api";

const fieldClass =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)]";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getAuthSession()) router.replace("/dashboard");
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const authUser = await loginUser({ email, password });
      setAuthSession({ userId: authUser.id, user: authUser });
      router.push("/dashboard");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Login failed. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between transition-colors duration-200">
      {/* Subtle National Accent Strip */}
      <div className="gov-tricolor-strip w-full" aria-hidden="true" />

      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--header)] text-[var(--header-text)] px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-md border border-[var(--border)] bg-[var(--panel-inner)] text-xs font-bold text-[var(--teal)]">
              SL
            </div>
            <span className="text-sm font-bold text-white">StatLearn AI</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Login Card */}
      <div className="grid place-items-center px-4 py-10 flex-1">
        <div className="w-full max-w-[420px] rounded-md border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--card-shadow)]">
          <div className="text-center">
            <Link href="/" className="mx-auto grid h-11 w-11 place-items-center rounded-md border border-[var(--border)] bg-[var(--panel-inner)] text-sm font-bold text-[var(--teal)]">
              SL
            </Link>
            <h1 className="mt-5 text-2xl font-semibold text-[var(--foreground)]">Welcome back</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">Sign in to your official learning workspace.</p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">Official email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. officer@gov.in"
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={fieldClass}
              />
            </label>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[var(--muted)] cursor-pointer">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--primary)]" />
                Remember me
              </label>
              <a href="#" className="text-[var(--teal)] hover:underline">Forgot password?</a>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center rounded-md bg-[var(--primary)] text-sm font-semibold text-white hover:bg-[var(--primary-hover)] transition disabled:opacity-60 shadow-xs"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentUserId(1);
                router.push("/dashboard");
              }}
              className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--panel-soft)] text-sm font-medium text-[var(--foreground)] hover:border-[var(--primary)] transition"
            >
              Continue with organization login
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-[var(--teal)] hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--header)] py-4 text-center text-[11px] text-slate-400">
        © 2026 Government of India • Ministry of Statistics and Programme Implementation
      </footer>
    </main>
  );
}
