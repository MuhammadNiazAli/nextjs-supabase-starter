"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 text-sm text-center text-gray-500">
      {t("footer.text")}
    </footer>
  );
}
