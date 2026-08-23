"use client";

import { locales, localeNames, type Locale } from "@/lib/i18n/config";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <select
      value={locale}
      onChange={(event) => setLocale(event.target.value as Locale)}
      aria-label={t("language.label")}
      // Fixed width so the navbar never resizes/shifts when the selected
      // language's label length changes (e.g. "English" vs "اردو").
      className="w-[92px] shrink-0 text-sm px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
    >
      {locales.map((code) => (
        <option key={code} value={code}>
          {localeNames[code]}
        </option>
      ))}
    </select>
  );
}
