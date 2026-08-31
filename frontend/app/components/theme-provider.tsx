"use client";

import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
  mounted: false,
});

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isServer = useSyncExternalStore(
    subscribe,
    () => false,
    () => true
  );

  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("sih_theme") as Theme | null;
        if (saved === "light" || saved === "dark") return saved;
      } catch {}
    }
    return "dark";
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", theme);
    } catch {}
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("sih_theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    } catch {}
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted: !isServer }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
