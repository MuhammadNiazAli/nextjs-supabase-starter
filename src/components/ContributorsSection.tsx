"use client";

import { useEffect, useId, useRef, useState } from "react";
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
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  // Fades/slides the content in the moment the reveal section scrolls
  // into view, instead of showing everything already-visible on load.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const admin = contributors?.find((c) => c.login === ADMIN_LOGIN) ?? null;
  const others = contributors?.filter((c) => c.login !== ADMIN_LOGIN) ?? [];

  return (
    <section
      ref={rootRef}
      className="contributors-reveal sticky top-0 z-10 flex flex-col justify-center overflow-hidden rounded-t-[2.5rem] border-t border-primary/20 bg-gray-950 px-4 py-16 sm:px-6"
    >
      {/* Soft radial glow behind the heading, purely decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_45%_at_50%_0%,rgba(79,70,229,0.18),transparent)]"
      />

      <div className="relative mx-auto w-full max-w-4xl">
        <div
          className={`mb-10 text-center transition-all duration-700 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/80">
            {t("home.contributors.eyebrow")}
          </p>
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              {t("home.contributors.title")}
            </h2>
            {contributors && (
              <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-white">
                {contributors.length}
              </span>
            )}
          </div>
          <p className="mx-auto mt-3 max-w-md text-sm text-gray-400">
            {t("home.contributors.subtitle")}
          </p>
        </div>

        {error && (
          <div className="mx-auto max-w-md rounded-2xl border border-gray-800 bg-gray-900/60 p-8 text-center text-sm text-gray-400">
            {t("home.contributors.error")}
          </div>
        )}

        {!error && !contributors && <ContributorsSkeleton />}

        {!error && contributors && contributors.length === 0 && (
          <div className="mx-auto max-w-md rounded-2xl border border-gray-800 bg-gray-900/60 p-8 text-center text-sm text-gray-400">
            {t("home.contributors.empty")}
          </div>
        )}

        {!error && contributors && contributors.length > 0 && (
          <div
            className={`transition-all delay-100 duration-700 ease-out ${
              visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            } ${
              admin
                ? "grid grid-cols-1 items-stretch gap-6 md:grid-cols-[minmax(0,300px)_1fr] md:gap-8"
                : ""
            }`}
          >
            {/* Maintainer, shown first so it's on top on mobile and on
                the left on md+ screens. */}
            {admin && (
              <MaintainerSpotlight
                contributor={admin}
                badge={t("home.contributors.adminBadge")}
                viewGithubLabel={t("home.contributors.viewGithub")}
              />
            )}

            {others.length > 0 ? (
              <ContributorsSwiper contributors={others} />
            ) : (
              admin && (
                <div className="flex items-center justify-center rounded-3xl border border-dashed border-gray-800 p-8 text-center text-sm text-gray-500">
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
 * Left-hand maintainer spotlight: avatar clipped into a rotated,
 * three-rounded-corners / one-sharp-corner triangle, with the
 * "MAINTAINER" badge, display name and a direct GitHub profile link
 * underneath — everything here is data-driven off the repo's admin
 * contributor so it never needs to be hand-edited.
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
  const rawId = useId();
  const clipId = `maintainer-shape-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-primary/30 bg-gradient-to-b from-primary/10 to-transparent px-6 py-8 text-center shadow-[0_0_40px_-15px_rgba(79,70,229,0.55)]">
      <div className="relative h-32 w-32 -rotate-6 sm:h-36 sm:w-36">
        {/* Ambient glow behind the shaped avatar */}
        <div
          aria-hidden="true"
          className="absolute -inset-4 rounded-full bg-primary/30 blur-2xl"
        />

        {/* Reusable clip-path: a rounded triangle with one sharp corner,
            defined in objectBoundingBox units so it scales with whatever
            box it's applied to instead of being pinned to fixed pixels. */}
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <defs>
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              <path d="M0.586,0.227 L0.839,0.673 Q0.925,0.825 0.75,0.825 L0.075,0.825 L0.414,0.227 Q0.5,0.075 0.586,0.227 Z" />
            </clipPath>
          </defs>
        </svg>

        {/* Colored frame, same shape, sitting just behind the photo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-primary via-indigo-400 to-primary"
          style={{ clipPath: `url(#${clipId})` }}
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={contributor.avatarUrl}
          alt={contributor.login}
          loading="lazy"
          className="absolute inset-[3px] h-[calc(100%-6px)] w-[calc(100%-6px)] object-cover"
          style={{ clipPath: `url(#${clipId})` }}
        />
      </div>

      <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-200">
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
        className="inline-flex items-center gap-1.5 rounded-full border border-gray-700 bg-gray-900/70 px-3.5 py-1.5 text-xs font-medium text-gray-200 transition-colors hover:border-primary hover:text-white"
      >
        <GithubIcon className="h-4 w-4" aria-hidden="true" />
        {viewGithubLabel}
      </a>
    </div>
  );
}

/**
 * Right-hand side: an Uiverse-style (by edu-amr) snap-scrolling card
 * swiper. It renders one card per remaining contributor, so the strip
 * simply keeps growing — never running out of room — as the repo gains
 * more contributors. Styling lives in globals.css under .contrib-swiper.
 */
function ContributorsSwiper({ contributors }: { contributors: Contributor[] }) {
  return (
    <div className="contrib-swiper-panel rounded-3xl border border-gray-800 bg-gray-900/40 p-2 sm:p-3">
      <div
        className="contrib-swiper scroll-1"
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
            className="card"
          >
            <div
              className="card__image"
              style={{ backgroundImage: `url(${c.avatarUrl})` }}
            />
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
    </div>
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
    <div
      className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,300px)_1fr] md:gap-8"
      role="status"
      aria-live="polite"
    >
      <div className="flex animate-pulse flex-col items-center gap-4 rounded-3xl border border-gray-800 bg-gray-900/60 px-6 py-8">
        <div className="h-32 w-32 rounded-full bg-gray-800 sm:h-36 sm:w-36" />
        <div className="h-4 w-20 rounded-full bg-gray-800" />
        <div className="h-4 w-32 rounded bg-gray-800" />
        <div className="h-3 w-24 rounded bg-gray-800" />
        <div className="h-7 w-28 rounded-full bg-gray-800" />
      </div>
      <div className="flex animate-pulse gap-5 overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/40 p-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-48 w-full flex-shrink-0 rounded-lg bg-gray-800"
          />
        ))}
      </div>
    </div>
  );
}
