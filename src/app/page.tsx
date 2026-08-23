"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div
      className="relative flex flex-col items-center justify-center text-center px-6 py-28 min-h-[80vh] bg-cover bg-center"
      style={{ backgroundImage: "url(/assets/home.png)" }}
    >
      {/* Dark overlay keeps the hero text readable on top of the image in
          both light and dark mode. */}
      <div className="absolute inset-0 bg-white/70 dark:bg-gray-950/80" />

      <div className="relative">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          {t("home.titlePrefix")}{" "}
          <span className="text-primary">{t("home.titleHighlight")}</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          {t("home.subtitle")}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="/signup"
            className="bg-primary text-white px-5 py-2 rounded-md hover:bg-primary/90 transition shadow-sm shadow-primary/30"
          >
            {t("home.getStarted")}
          </a>
          <a
            href="https://github.com/MuhammadNiazAli/nextjs-supabase-starter"
            className="border border-gray-300 dark:border-gray-700 px-5 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            {t("home.viewOnGithub")}
          </a>
        </div>
      </div>
    </div>
  );
}
