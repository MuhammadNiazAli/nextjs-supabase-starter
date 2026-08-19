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
      className="text-sm px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-transparent"
    >
      {locales.map((code) => (
        <option key={code} value={code}>
          {localeNames[code]}
        </option>
      ))}
    </select>
  );
}
