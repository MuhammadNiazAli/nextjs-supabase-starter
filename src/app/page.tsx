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
        className="relative flex flex-col items-center justify-center text-center px-6 h-[600px] bg-cover bg-center bg-no-repeat bg-gray-950"
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
              className="border border-white/30 text-white px-5 py-2 rounded-md hover:bg-white hover:text-gray-900 hover:border-white transition"
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

        <div className="relative max-w-2xl mx-auto">
          {STEP_KEYS.map((step, idx) => (
            <div key={step}>
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold shadow-sm shadow-primary/40">
                  {step}
                </div>
                <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-black/30 p-6">
                  <h3 className="font-semibold mb-2">
                    {t(`home.contribute.step${step}Title`)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t(`home.contribute.step${step}Desc`)}
                  </p>
                </div>
              </div>

              {idx < STEP_KEYS.length - 1 && (
                <div className="flex flex-col items-center w-11">
                  <div className="w-px h-3 bg-primary/30" />
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    className="text-primary/50 dark:text-primary/60"
                  >
                    <path
                      d="M8 2v10.5M8 12.5l-4-4M8 12.5l4-4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="w-px h-3 bg-primary/30" />
                </div>
              )}
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
