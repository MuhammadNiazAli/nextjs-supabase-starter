"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Switch from "./Switch";

const STORAGE_KEY = "reduce-motion";

function getInitialReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "on") return true;
    if (stored === "off") return false;
  } catch {
    // localStorage can be unavailable (privacy mode, SSR, etc.) - ignore.
  }

  // No stored choice yet: follow the operating system, same as the
  // theme toggle follows prefers-color-scheme. Once the user flips
  // this toggle, the stored value wins over the OS setting.
  if (typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  return false;
}

export default function ReducedMotionToggle() {
  const { t } = useLanguage();
  const [reduced, setReduced] = useState<boolean>(getInitialReducedMotion);

  useEffect(() => {
    // The .reduce-motion rule in globals.css kills every animation
    // and transition in the app while this class is on <html>.
    document.documentElement.classList.toggle("reduce-motion", reduced);

    try {
      window.localStorage.setItem(STORAGE_KEY, reduced ? "on" : "off");
    } catch {
      // Ignore write errors (e.g. storage disabled/full).
    }
  }, [reduced]);

  // Keep tabs in sync: the storage event fires in every OTHER tab when
  // one tab changes the setting, so this tab follows along live. It never
  // fires in the tab that made the change, so there is no feedback loop.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return;
      if (event.newValue === "on") setReduced(true);
      if (event.newValue === "off") setReduced(false);
      // Any other value (for example the key being cleared) is ignored.
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // The switch carries the accessible name and the on/off state; the
  // text beside it is the same state label the old button showed, kept
  // for sighted users and hidden from screen readers so it is not
  // announced twice.
  return (
    <span className="inline-flex items-center gap-2">
      <Switch
        checked={reduced}
        onChange={setReduced}
        label={t("motion.toggleLabel")}
      />
      <span aria-hidden="true" className="text-sm">
        {reduced ? t("motion.on") : t("motion.off")}
      </span>
    </span>
  );
}
