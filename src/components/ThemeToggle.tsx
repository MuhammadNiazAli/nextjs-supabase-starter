"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const STORAGE_KEY = "theme";

function getInitialTheme(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "dark") return true;
    if (stored === "light") return false;
  } catch {
    // localStorage can be unavailable (privacy mode, SSR, etc.) - ignore.
  }

  if (typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  return false;
}

export default function ThemeToggle() {
  const { t } = useLanguage();
  const [dark, setDark] = useState<boolean>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;

    // Different components carry their own hover transition durations
    // (200ms here, 300ms there, none somewhere else). Left alone, the
    // dark/light class flip rides on whichever of those each element
    // happens to have, so the swap looks fast in one spot and laggy in
    // another. Killing every transition for a single frame around the
    // class toggle makes the whole page flip color at the exact same
    // instant everywhere, then restores normal hover/interaction
    // transitions right after.
    root.classList.add("theme-transition-off");
    root.classList.toggle("dark", dark);

    // Force a reflow so the browser actually applies "no transitions"
    // before we toggle the class, instead of batching both class
    // changes into the same paint and skipping the effect entirely.
    void root.offsetHeight;

    const raf = requestAnimationFrame(() => {
      root.classList.remove("theme-transition-off");
    });

    try {
      window.localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
    } catch {
      // Ignore write errors (e.g. storage disabled/full).
    }

    return () => cancelAnimationFrame(raf);
  }, [dark]);

  return (
    <button
      onClick={() => setDark((prev) => !prev)}
      className="text-sm px-3 py-1 rounded border border-gray-300 dark:border-gray-700"
      aria-label={t("theme.toggleLabel")}
    >
      {dark ? t("theme.light") : t("theme.dark")}
    </button>
  );
}
