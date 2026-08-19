"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-24">
      <h1 className="text-4xl font-bold mb-4">
        {t("home.titlePrefix")}{" "}
        <span className="text-primary">{t("home.titleHighlight")}</span>
      </h1>
      <p className="text-gray-500 max-w-xl mb-8">{t("home.subtitle")}</p>
      <div className="flex gap-4">
        <a
          href="/signup"
          className="bg-primary text-white px-5 py-2 rounded-md"
        >
          {t("home.getStarted")}
        </a>
        <a
          href="https://github.com/MuhammadNiazAli/nextjs-supabase-starter"
          className="border border-gray-300 dark:border-gray-700 px-5 py-2 rounded-md"
        >
          {t("home.viewOnGithub")}
        </a>
      </div>
    </div>
  );
}
