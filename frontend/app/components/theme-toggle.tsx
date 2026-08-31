"use client";

import { MoonIcon, SunIcon } from "./icons";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = theme === "dark";

  if (!mounted) {
    return (
      <div
        aria-label="Toggle theme"
        className="relative inline-flex h-8 w-14 items-center rounded-full border border-[var(--border)] bg-[var(--panel-soft)] opacity-70"
      >
        <span className="absolute left-1 h-6 w-6 rounded-full bg-[var(--panel)] shadow-sm ring-1 ring-[var(--border)]" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label={`Toggle theme (current: ${theme})`}
      className={`relative inline-flex h-8 w-14 items-center rounded-full border transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
        isDark
          ? "border-[var(--primary)]/50 bg-[var(--primary-soft)]"
          : "border-[var(--border)] bg-[var(--panel-soft)]"
      }`}
    >
      <span className="sr-only">Toggle theme</span>

      <span
        className={`absolute left-1 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)] shadow-sm transition-transform duration-200 ${
          isDark ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {isDark ? <SunIcon className="h-3.5 w-3.5" /> : <MoonIcon className="h-3.5 w-3.5" />}
      </span>

      <span className="flex w-full items-center justify-between px-2 text-[var(--muted)]">
        <MoonIcon className="h-3 w-3 opacity-70" />
        <SunIcon className="h-3 w-3 opacity-70" />
      </span>
    </button>
  );
}
