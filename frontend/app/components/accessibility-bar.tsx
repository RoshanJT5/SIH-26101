"use client";

import React, { useEffect, useState } from "react";

export function AccessibilityBar() {
  const [scale, setScale] = useState<"sm" | "base" | "lg">("base");
  const [lang, setLang] = useState<"en" | "hi">("en");

  useEffect(() => {
    try {
      const savedScale = localStorage.getItem("sih_font_scale") as "sm" | "base" | "lg" | null;
      if (savedScale) {
        setScale(savedScale);
        document.documentElement.setAttribute("data-font-scale", savedScale);
      }
      const savedLang = localStorage.getItem("sih_lang") as "en" | "hi" | null;
      if (savedLang) {
        setLang(savedLang);
      }
    } catch {}
  }, []);

  const changeScale = (newScale: "sm" | "base" | "lg") => {
    setScale(newScale);
    try {
      localStorage.setItem("sih_font_scale", newScale);
      document.documentElement.setAttribute("data-font-scale", newScale);
    } catch {}
  };

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "hi" : "en";
    setLang(nextLang);
    try {
      localStorage.setItem("sih_lang", nextLang);
    } catch {}
  };

  return (
    <>
      {/* Keyboard-accessible Skip to Main Content Link (GIGW / WCAG 2.1 AA) */}
      <a href="#main-content" className="skip-link">
        Skip to Main Content
      </a>

      {/* Top Institutional Accessibility Strip */}
      <aside
        aria-label="Accessibility and official options bar"
        className="border-b border-[var(--border)] bg-[var(--panel-warm)] px-3 py-1.5 text-xs text-[var(--foreground)]"
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-2 sm:px-4">
          {/* Left: Prototype Context Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--accent)] border border-[var(--accent)]/30">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
              SIH 2026 Prototype
            </span>
            <span className="hidden sm:inline text-[11px] text-[var(--muted)] font-medium">
              National Statistical Cadre Capacity Building Platform
            </span>
          </div>

          {/* Right: Accessibility Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Screen Reader Access Hint */}
            <span className="hidden md:inline text-[11px] text-[var(--muted)]" title="Screen Reader Access Compatible">
              Screen Reader Access
            </span>

            <div className="h-3 w-px bg-[var(--border)] hidden sm:block" aria-hidden="true" />

            {/* Font Sizing Controls */}
            <div className="flex items-center gap-1" role="group" aria-label="Text Size Controls">
              <span className="text-[11px] font-semibold text-[var(--muted)] hidden sm:inline mr-1">
                Text Size:
              </span>
              <button
                type="button"
                onClick={() => changeScale("sm")}
                title="Decrease font size"
                aria-label="Decrease font size"
                className={`h-6 w-6 rounded border text-[11px] font-bold transition flex items-center justify-center ${
                  scale === "sm"
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                    : "border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)] hover:bg-[var(--panel-soft)]"
                }`}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => changeScale("base")}
                title="Default font size"
                aria-label="Normal font size"
                className={`h-6 w-6 rounded border text-[11px] font-bold transition flex items-center justify-center ${
                  scale === "base"
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                    : "border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)] hover:bg-[var(--panel-soft)]"
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => changeScale("lg")}
                title="Increase font size"
                aria-label="Increase font size"
                className={`h-6 w-6 rounded border text-[11px] font-bold transition flex items-center justify-center ${
                  scale === "lg"
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                    : "border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)] hover:bg-[var(--panel-soft)]"
                }`}
              >
                A+
              </button>
            </div>

            <div className="h-3 w-px bg-[var(--border)]" aria-hidden="true" />

            {/* Bilingual Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              title={`Switch language to ${lang === "en" ? "Hindi (हिन्दी)" : "English"}`}
              aria-label={`Language selector, current language is ${lang === "en" ? "English" : "Hindi"}`}
              className="inline-flex items-center gap-1 rounded border border-[var(--border)] bg-[var(--panel)] px-2 py-0.5 text-[11px] font-semibold text-[var(--foreground)] hover:bg-[var(--panel-soft)] transition"
            >
              <span>{lang === "en" ? "हिन्दी" : "English"}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
