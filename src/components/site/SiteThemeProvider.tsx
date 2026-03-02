"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type SiteThemeId = "minimal" | "dark" | "contemporary";

const STORAGE_KEY = "site-theme";

type ThemeContextValue = {
  theme: SiteThemeId;
  setTheme: (id: SiteThemeId) => void;
};

const SiteThemeContext = createContext<ThemeContextValue | null>(null);

export function SiteThemeProvider({
  children,
  defaultTheme = "minimal",
}: {
  children: React.ReactNode;
  defaultTheme?: SiteThemeId;
}) {
  const [theme, setThemeState] = useState<SiteThemeId>(defaultTheme);

  const setTheme = useCallback((id: SiteThemeId) => {
    setThemeState(id);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", id);
      try {
        localStorage.setItem(STORAGE_KEY, id);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY) as SiteThemeId | null;
    if (stored && ["minimal", "dark", "contemporary"].includes(stored)) {
      setThemeState(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <SiteThemeContext.Provider value={value}>
      <div data-theme={theme} className="min-h-screen bg-site-background text-site-foreground">
        {children}
      </div>
    </SiteThemeContext.Provider>
  );
}

export function useSiteTheme(): ThemeContextValue {
  const ctx = useContext(SiteThemeContext);
  if (!ctx) throw new Error("useSiteTheme must be used within SiteThemeProvider");
  return ctx;
}
