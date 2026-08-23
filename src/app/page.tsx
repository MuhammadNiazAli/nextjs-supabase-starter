"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

const STEP_KEYS = [1, 2, 3, 4, 5, 6] as const;

export default function Home() {
  const { t } = useLanguage();
  const repoUrl = "https://github.com/MuhammadNiazAli/nextjs-supabase-starter";

  return (
    <>
      {/* Hero */}
      <div
        className="relative flex flex-col items-center justify-center text-center px-6 py-32 min-h-[80vh] bg-cover bg-center bg-no-repeat bg-gray-950"
        style={{ backgroundImage: "url(/assets/home.png)" }}
      >
        {/* Faint bottom fade only, so the image stays fully visible and just
            blends smoothly into the section below instead of being hidden
            behind a flat tint. */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-gray-950/40 dark:to-gray-950/70" />

        <div className="relative">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white drop-shadow-md">
            {t("home.titlePrefix")}{" "}
            <span className="text-indigo-300">{t("home.titleHighlight")}</span>
          </h1>
          <p className="text-gray-200 max-w-2xl mx-auto mb-8 drop-shadow-sm">
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
              href={repoUrl}
              className="border border-white/30 text-white px-5 py-2 rounded-md hover:bg-white/10 transition"
            >
              {t("home.viewOnGithub")}
            </a>
          </div>
        </div>
      </div>

      {/* How to contribute */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            {t("home.contribute.title")}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t("home.contribute.subtitle")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STEP_KEYS.map((step) => (
            <div
              key={step}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-black/30 p-6 flex flex-col"
            >
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold mb-4">
                {step}
              </div>
              <h3 className="font-semibold mb-2">
                {t(`home.contribute.step${step}Title`)}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t(`home.contribute.step${step}Desc`)}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href={`${repoUrl}/issues`}
            className="inline-block bg-primary text-white px-5 py-2 rounded-md hover:bg-primary/90 transition shadow-sm shadow-primary/30"
          >
            {t("home.contribute.cta")}
          </a>
        </div>
      </section>
    </>
  );
}
