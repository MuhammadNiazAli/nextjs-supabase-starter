"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Contributor } from "@/app/api/contributors/route";

const ADMIN_LOGIN = "MuhammadNiazAli";

type ApiResponse = {
  contributors: Contributor[];
  error?: string;
};

export default function ContributorsSection() {
  const { t } = useLanguage();
  const [contributors, setContributors] = useState<Contributor[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/contributors")
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json() as Promise<ApiResponse>;
      })
      .then((data) => {
        if (!cancelled) setContributors(data.contributors);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const admin = contributors?.find((c) => c.login === ADMIN_LOGIN) ?? null;
  const others = contributors?.filter((c) => c.login !== ADMIN_LOGIN) ?? [];

  return (
    <section className="contributors-reveal relative flex flex-col justify-center overflow-hidden rounded-t-[2.5rem] border-t border-primary/20 bg-white px-4 py-16 dark:bg-gray-950 sm:px-6">
      {/* Soft radial glow behind the heading, purely decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_45%_at_50%_0%,rgba(79,70,229,0.14),transparent)] dark:[background:radial-gradient(60%_45%_at_50%_0%,rgba(79,70,229,0.18),transparent)]"
      />

      <div className="contrib-fade-in relative mx-auto w-full max-w-4xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary dark:text-indigo-300/80">
            {t("home.contributors.eyebrow")}
          </p>
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              {t("home.contributors.title")}
            </h2>
            {contributors && (
              <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-white">
                {contributors.length}
              </span>
            )}
          </div>
          <p className="mx-auto mt-3 max-w-md text-sm text-gray-600 dark:text-gray-400">
            {t("home.contributors.subtitle")}
          </p>
        </div>

        {error && (
          <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400">
            {t("home.contributors.error")}
          </div>
        )}

        {!error && !contributors && <ContributorsSkeleton />}

        {!error && contributors && contributors.length === 0 && (
          <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400">
            {t("home.contributors.empty")}
          </div>
        )}

        {!error && contributors && contributors.length > 0 && (
          <div className="flex flex-col items-center gap-8">
            {/* Maintainer — a single, perfectly centered card on top. */}
            {admin && (
              <MaintainerSpotlight
                contributor={admin}
                badge={t("home.contributors.adminBadge")}
                viewGithubLabel={t("home.contributors.viewGithub")}
              />
            )}

            {/* Everyone else — a horizontal swipeable slider underneath. */}
            {others.length > 0 ? (
              <ContributorsSwiper contributors={others} />
            ) : (
              admin && (
                <div className="w-full rounded-3xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-500">
                  {t("home.contributors.empty")}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Centered maintainer spotlight card: a large rounded avatar with the
 * "MAINTAINER" badge, display name and a direct GitHub profile link
 * underneath. Styled in the site's own primary color, on a fixed
 * #141414 card surface — no yellow glow, no yellow hover border.
 */
function MaintainerSpotlight({
  contributor,
  badge,
  viewGithubLabel,
}: {
  contributor: Contributor;
  badge: string;
  viewGithubLabel: string;
}) {
  return (
    <div className="group flex w-full max-w-[380px] flex-col items-center justify-center gap-5 rounded-3xl border border-white/10 bg-[#141414] px-6 py-10 text-center transition-colors duration-300 hover:border-white/20">
      <div className="relative h-52 w-52 sm:h-64 sm:w-64">
        {/* Ambient glow behind the avatar — neutral/primary tinted, not yellow */}
        <div
          aria-hidden="true"
          className="absolute -inset-6 rounded-full bg-primary/25 blur-2xl transition-opacity duration-300 group-hover:opacity-80"
        />

        {/* Ring frame in the site's primary color, sitting just behind
            the photo so a thin band of brand color shows all the way
            around it */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 via-primary to-indigo-600 transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={contributor.avatarUrl}
          alt={contributor.login}
          loading="lazy"
          className="absolute inset-1 h-[calc(100%-8px)] w-[calc(100%-8px)] rounded-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      <span className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-300">
        {badge}
      </span>

      <div>
        <p className="text-lg font-bold text-white">
          {contributor.name || contributor.login}
        </p>
        <p className="text-xs text-gray-400">@{contributor.login}</p>
      </div>

      <a
        href={contributor.htmlUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full border border-gray-700 bg-black/30 px-3.5 py-1.5 text-xs font-medium text-gray-200 transition-colors hover:border-primary hover:text-white"
      >
        <GithubIcon className="h-4 w-4" aria-hidden="true" />
        {viewGithubLabel}
      </a>
    </div>
  );
}

/**
 * Horizontal, snap-scrolling swiper strip. One card per remaining
 * contributor — swipe/drag on touch and trackpads, or use the arrow
 * buttons on desktop. Grows however many contributors there are; it
 * never runs out of room since it just keeps scrolling sideways.
 */
function ContributorsSwiper({ contributors }: { contributors: Contributor[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCards = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = (card?.offsetWidth ?? 170) + 16;
    el.scrollBy({ left: step * 2 * direction, behavior: "smooth" });
  };

  return (
    <div className="contrib-swiper-panel relative w-full rounded-3xl border border-gray-200 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-900/40 sm:p-3">
      <div
        ref={trackRef}
        className="contrib-swiper"
        role="list"
        aria-label="Contributors"
      >
        {contributors.map((c) => (
          <a
            key={c.login}
            href={c.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            role="listitem"
            data-card
            className="card"
          >
            <div className="card__image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.avatarUrl}
                alt={c.login}
                loading="lazy"
                className="card__avatar"
              />
            </div>
            <div className="card__content">
              <span className="card__title">{c.name || c.login}</span>
              <p className="card__describe">
                @{c.login} ·{" "}
                {c.contributions === 1
                  ? "1 commit"
                  : `${c.contributions} commits`}
              </p>
            </div>
          </a>
        ))}
      </div>

      {/* Desktop swipe controls — hidden on touch-first small screens
          where the drag-to-swipe gesture is the primary interaction. */}
      {contributors.length > 2 && (
        <>
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            aria-label="Scroll contributors left"
            className="absolute left-1 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 p-2 text-gray-700 shadow-sm transition hover:scale-105 hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-black/60 dark:text-gray-200 dark:hover:text-white sm:flex"
          >
            <ChevronIcon className="h-4 w-4 rotate-180" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            aria-label="Scroll contributors right"
            className="absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 p-2 text-gray-700 shadow-sm transition hover:scale-105 hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-black/60 dark:text-gray-200 dark:hover:text-white sm:flex"
          >
            <ChevronIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="m9 6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 5.02 3.26 9.28 7.77 10.78.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.16.69-3.83-1.34-3.83-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.73 2.65 1.23 3.3.94.1-.73.4-1.23.72-1.51-2.52-.29-5.17-1.26-5.17-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.16a10.9 10.9 0 0 1 5.73 0c2.19-1.47 3.15-1.16 3.15-1.16.62 1.57.23 2.73.11 3.02.73.79 1.17 1.8 1.17 3.04 0 4.35-2.66 5.31-5.19 5.59.41.35.77 1.04.77 2.1 0 1.52-.01 2.74-.01 3.11 0 .3.2.66.79.55A11.26 11.26 0 0 0 23.25 11.75C23.25 5.48 18.27.5 12 .5Z" />
    </svg>
  );
}

function ContributorsSkeleton() {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="flex w-full max-w-[380px] animate-pulse flex-col items-center gap-4 rounded-3xl border border-gray-200 bg-gray-50 px-6 py-8 dark:border-gray-800 dark:bg-gray-900/60">
        <div className="h-52 w-52 rounded-full bg-gray-200 dark:bg-gray-800 sm:h-64 sm:w-64" />
        <div className="h-4 w-20 rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-7 w-28 rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="flex w-full animate-pulse gap-5 overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/40">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-48 w-full flex-shrink-0 rounded-lg bg-gray-200 dark:bg-gray-800"
          />
        ))}
      </div>
    </div>
  );
}
