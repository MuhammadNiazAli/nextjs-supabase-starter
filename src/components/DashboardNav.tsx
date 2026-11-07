"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export type DashboardTab = "overview" | "billing" | "settings";

const TABS: { id: DashboardTab; key: string }[] = [
  { id: "overview", key: "dashboard.tabs.overview" },
  { id: "billing", key: "dashboard.tabs.billing" },
  { id: "settings", key: "dashboard.tabs.settings" },
];

export default function DashboardNav({
  activeTab,
  onChange,
}: {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}) {
  const { t } = useLanguage();

  return (
    <div
      role="tablist"
      aria-label={t("dashboard.tabs.label")}
      className="w-full max-w-sm flex items-center gap-1 mb-4 bg-gray-100 dark:bg-gray-800/60 rounded-xl p-1"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition ${
              isActive
                ? "bg-white dark:bg-gray-900 text-primary shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {t(tab.key)}
          </button>
        );
      })}
    </div>
  );
}
