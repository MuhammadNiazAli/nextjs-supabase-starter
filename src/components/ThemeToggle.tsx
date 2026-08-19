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
    document.documentElement.classList.toggle("dark", dark);

    try {
      window.localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
    } catch {
      // Ignore write errors (e.g. storage disabled/full).
    }
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
