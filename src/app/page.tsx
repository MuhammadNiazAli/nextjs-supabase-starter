"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useReveal } from "@/lib/useReveal";

const STEP_KEYS = [1, 2, 3, 4, 5, 6] as const;

// One small hand-drawn icon per step so the timeline reads at a glance
// instead of being six identical numbered circles.
const STEP_ICONS: Record<(typeof STEP_KEYS)[number], JSX.Element> = {
  1: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 8v4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="15.3" r="0.9" fill="currentColor" />
    </svg>
  ),
  2: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <circle cx="7" cy="6" r="2.1" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17" cy="6" r="2.1" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="17.5" r="2.1" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M7 8.1v2.4a2 2 0 0 0 2 2h1.5m6.5-4.4v2.4a2 2 0 0 1-2 2h-1.5m0 0v3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  ),
  3: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path
        d="M4 15.5v2.3A2.2 2.2 0 0 0 6.2 20h11.6a2.2 2.2 0 0 0 2.2-2.2v-2.3M12 4v10.2m0 0-3.6-3.6M12 14.2l3.6-3.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  4: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path
        d="m9 8-4 4 4 4m6-8 4 4-4 4M13.5 6l-3 12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  5: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <circle cx="6.5" cy="6" r="2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="6.5" cy="18" r="2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.5" cy="6" r="2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M6.5 8v8M6.5 8a5 5 0 0 0 5 5H15m0 0-2-2m2 2-2 2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  6: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="m8.3 12.3 2.4 2.4 5-5.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

export default function Home() {
  const { t } = useLanguage();
  const repoUrl = "https://github.com/MuhammadNiazAli/nextjs-supabase-starter";

  return (
    <>
      {/* Hero — home.png is a transparent PNG, so the section background is
          set to match the page background in each theme (white on light,
          gray-950 on dark) instead of a hardcoded dark fill, letting the
          image blend seamlessly into whichever theme is active. */}
      <div
        className="relative flex flex-col items-center justify-center text-center px-6 h-[600px] bg-cover bg-center bg-no-repeat bg-white dark:bg-gray-950"
        style={{ backgroundImage: "url(/assets/home.png)" }}
      >
        {/* Faint bottom fade only, so the image stays fully visible and just
            blends smoothly into the section below instead of being hidden
            behind a flat tint. */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/70 dark:from-black/10 dark:to-gray-950/70" />

        <div className="relative">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white dark:drop-shadow-md">
            {t("home.titlePrefix")}{" "}
            <span className="text-primary dark:text-indigo-300">{t("home.titleHighlight")}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-200 max-w-2xl mx-auto mb-8 dark:drop-shadow-sm">
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
              className="border border-gray-300 text-gray-900 px-5 py-2 rounded-md hover:bg-gray-900 hover:text-white hover:border-gray-900 transition dark:border-white/30 dark:text-white dark:hover:bg-white dark:hover:text-gray-900 dark:hover:border-white"
            >
              {t("home.viewOnGithub")}
            </a>
          </div>
        </div>
      </div>

      {/* How to contribute — a curriculum-style step grid: numbered cards
          in reading order, connected by a rail on desktop, so it reads
          like a checklist you work through rather than a decoration. */}
      <section className="bg-gray-50 px-6 py-24 dark:bg-gray-900/40">
        <div className="mx-auto mb-16 max-w-[1000px] text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {t("home.contribute.eyebrow")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-gray-900 dark:text-white">
            {t("home.contribute.title")}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t("home.contribute.subtitle")}
          </p>
        </div>

        <ol className="relative mx-auto grid max-w-[1120px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STEP_KEYS.map((step, idx) => (
            <StepCard key={step} step={step} index={idx} title={t(`home.contribute.step${step}Title`)} desc={t(`home.contribute.step${step}Desc`)} />
          ))}
        </ol>

        <div className="text-center mt-14">
          <a
            href={`${repoUrl}/issues`}
            className="inline-block rounded-md bg-primary px-7 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-[0_4px_0_0_rgba(0,0,0,0.15)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-[0_6px_0_0_rgba(0,0,0,0.15)] active:translate-y-0 active:shadow-[0_2px_0_0_rgba(0,0,0,0.15)]"
          >
            {t("home.contribute.cta")}
          </a>
        </div>
      </section>
    </>
  );
}

function StepCard({
  step,
  index,
  title,
  desc,
}: {
  step: (typeof STEP_KEYS)[number];
  index: number;
  title: string;
  desc: string;
}) {
  const { ref, visible } = useReveal<HTMLLIElement>();

  return (
    <li
      ref={ref}
      style={{ transitionDelay: visible ? `${index * 80}ms` : "0ms" }}
      className={`reveal group relative flex flex-col rounded-xl border border-gray-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg hover:shadow-primary/10 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary/60 ${
        visible ? "reveal-visible" : ""
      }`}
    >
      <span
        aria-hidden="true"
        className="absolute right-6 top-6 text-4xl font-black text-gray-100 transition-colors duration-300 group-hover:text-primary/10 dark:text-gray-800"
      >
        {String(step).padStart(2, "0")}
      </span>
      <div className="relative mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
        {STEP_ICONS[step]}
      </div>
      <h3 className="relative text-lg font-bold mb-2 text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="relative text-[15px] text-gray-600 dark:text-gray-300 leading-relaxed">
        {desc}
      </p>
    </li>
  );
}
