"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export type DashboardTab = "overview" | "billing" | "settings";

const TABS: { id: DashboardTab; key: string }[] = [
  { id: "overview", key: "dashboard.tabs.overview" },
  { id: "billing", key: "dashboard.tabs.billing" },
  { id: "settings", key: "dashboard.tabs.settings" },
];

// The shortcut keys, in tab order: "1" opens Overview, "2" opens
// Billing, "3" opens Settings.
const SHORTCUT_KEYS = ["1", "2", "3"];

// A keypress must never steal a keystroke the user is typing, and
// never fight a browser shortcut (Ctrl+1 switches browser tabs).
function isTypingTarget(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  if (!element || typeof element.tagName !== "string") return false;
  const tag = element.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  return element.isContentEditable;
}

export default function DashboardNav({
  activeTab,
  onChange,
}: {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}) {
  const { t } = useLanguage();
  // The digit whose badge is mid-press-animation, or null. It is
  // cleared on a short timer (below), not by the animation itself.
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      const index = SHORTCUT_KEYS.indexOf(event.key);
      if (index === -1) return;
      setPressedKey(event.key);
      onChange(TABS[index].id);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onChange]);

  // Clear the press animation shortly after it starts. The timeout
  // is separate from the CSS animation on purpose: when reduced
  // motion is on, the animation never runs, so its animationend
  // event never fires — the timer still returns the badge to rest.
  useEffect(() => {
    if (pressedKey === null) return;
    const timer = window.setTimeout(() => setPressedKey(null), 200);
    return () => window.clearTimeout(timer);
  }, [pressedKey]);

  return (
    <div
      role="tablist"
      aria-label={t("dashboard.tabs.label")}
      className="w-full max-w-sm flex items-center gap-1 mb-4 bg-gray-100 dark:bg-gray-800/60 rounded-xl p-1"
    >
      {TABS.map((tab, index) => {
        const isActive = tab.id === activeTab;
        const shortcut = SHORTCUT_KEYS[index];
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-keyshortcuts={shortcut}
            onClick={() => onChange(tab.id)}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
              isActive
                ? "bg-white dark:bg-gray-900 text-primary shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {t(tab.key)}
            <kbd
              aria-hidden="true"
              className={`inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-md border border-gray-300 dark:border-gray-600 border-b-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-mono text-[11px] leading-none ${
                pressedKey === shortcut ? "keycap-pressed" : ""
              }`}
            >
              {shortcut}
            </kbd>
          </button>
        );
      })}
    </div>
  );
}
