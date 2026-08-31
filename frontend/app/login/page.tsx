"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getCurrentUserId, getUser, setCurrentUserId } from "../../lib/api";

const fieldClass =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[#303030] px-3 text-sm text-white outline-none placeholder:text-[var(--muted)]";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      // Check current or default user
      const currentId = getCurrentUserId();
      await getUser(currentId);
    } catch {
      setCurrentUserId(1);
    } finally {
      setLoading(false);
      router.push("/dashboard");
    }
  }

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[var(--background)] px-4 py-10 text-white">
      <div className="w-full max-w-[420px] rounded-md border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
        <div className="text-center">
          <Link href="/" className="mx-auto grid h-11 w-11 place-items-center rounded-md border border-[var(--border)] bg-[#1f1f1f] text-sm font-bold text-[var(--teal)]">
            SL
          </Link>
          <h1 className="mt-5 text-2xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Sign in to your learning workspace.</p>
        </div>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-[var(--muted)]">Official email</span>
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
            <span className="mb-2 block text-sm text-[var(--muted)]">Password</span>
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
            <label className="flex items-center gap-2 text-[var(--muted)]">
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--teal)]" />
              Remember me
            </label>
            <a href="#" className="text-[var(--teal)] hover:text-white">Forgot password?</a>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center rounded-md bg-[var(--primary)] text-sm font-semibold text-white hover:bg-[#60a5fa] disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrentUserId(1);
              router.push("/dashboard");
            }}
            className="h-11 w-full rounded-md border border-[var(--border)] bg-[#303030] text-sm font-medium text-white hover:border-[var(--teal)]"
          >
            Continue with organization login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-[var(--teal)] hover:text-white">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
