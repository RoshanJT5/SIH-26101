"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
  mounted: false,
});

function enableThemeTransition() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.add("theme-transitioning");
  window.setTimeout(() => {
    root.classList.remove("theme-transitioning");
  }, 250);
}

function applyThemeToDOM(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    let initialTheme: Theme = "light";
    try {
      const saved = (localStorage.getItem("theme") || localStorage.getItem("sih_theme")) as Theme | null;
      if (saved === "light" || saved === "dark") {
        initialTheme = saved;
      }
    } catch {}
    setThemeState(initialTheme);
    applyThemeToDOM(initialTheme);
    setMounted(true);

    const handleStorage = (e: StorageEvent) => {
      if ((e.key === "theme" || e.key === "sih_theme") && (e.newValue === "light" || e.newValue === "dark")) {
        setThemeState(e.newValue as Theme);
        applyThemeToDOM(e.newValue as Theme);
      }
    };
    window.addEventListener("storage", handleStorage);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      try {
        const saved = localStorage.getItem("theme") || localStorage.getItem("sih_theme");
        if (!saved) {
          const sysTheme: Theme = e.matches ? "dark" : "light";
          enableThemeTransition();
          setThemeState(sysTheme);
          applyThemeToDOM(sysTheme);
        }
      } catch {}
    };
    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMediaChange);
      }
    };
  }, []);

  const setTheme = (newTheme: Theme) => {
    enableThemeTransition();
    setThemeState(newTheme);
    try {
      localStorage.setItem("theme", newTheme);
      localStorage.setItem("sih_theme", newTheme);
    } catch {}
    applyThemeToDOM(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
