"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useReveal } from "@/lib/useReveal";
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
    <section className="border-t border-gray-200 bg-white px-4 py-20 dark:border-gray-800 dark:bg-gray-950 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {t("home.contributors.eyebrow")}
          </p>
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              {t("home.contributors.title")}
            </h2>
            {contributors && (
              <span className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-primary px-2.5 text-sm font-bold text-white">
                {contributors.length}
              </span>
            )}
          </div>
          <p className="mx-auto mt-3 max-w-md text-sm text-gray-600 dark:text-gray-400">
            {t("home.contributors.subtitle")}
          </p>
        </div>

        {error && (
          <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400">
            {t("home.contributors.error")}
          </div>
        )}

        {!error && !contributors && <ContributorsSkeleton />}

        {!error && contributors && contributors.length === 0 && (
          <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400">
            {t("home.contributors.empty")}
          </div>
        )}

        {!error && contributors && contributors.length > 0 && (
          <div className="flex flex-col items-center gap-12">
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
                <div className="w-full rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-500">
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
 * Maintainer spotlight — the one card on the page allowed a real flourish:
 * a slow rotating conic-gradient ring peeking out behind the avatar, a
 * gently pulsing badge, and a one-shot light sweep across the card on
 * hover. The avatar itself stays untouched — no glow or ring drawn over
 * the PNG, only around it.
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
    <div className="group relative flex w-full max-w-sm flex-col items-center gap-5 overflow-hidden rounded-2xl border border-white/10 bg-gray-950 px-8 py-9 text-center shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-10 top-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"
      />

      {/* One-shot light sweep, triggered on hover only */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
      />

      <span className="maintainer-badge inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-indigo-300">
        <StarIcon className="h-3 w-3" aria-hidden="true" />
        {badge}
      </span>

      <div className="relative h-28 w-28 sm:h-32 sm:w-32">
        <div
          aria-hidden="true"
          className="maintainer-ring absolute inset-[-4px] rounded-[1.4rem] opacity-70 blur-[1.5px] transition-opacity duration-300 group-hover:opacity-100"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={contributor.avatarUrl}
          alt={contributor.login}
          loading="lazy"
          className="relative h-full w-full rounded-2xl border border-white/10 object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        <span
          aria-hidden="true"
          className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-gray-950 bg-primary text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
        >
          <CrownIcon className="h-3.5 w-3.5" />
        </span>
      </div>

      <div>
        <p className="text-lg font-bold text-white">
          {contributor.name || contributor.login}
        </p>
        <p className="mt-0.5 text-xs text-gray-400">@{contributor.login}</p>
      </div>

      <a
        href={contributor.htmlUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary"
      >
        <GithubIcon className="h-4 w-4" aria-hidden="true" />
        {viewGithubLabel}
      </a>
    </div>
  );
}

/**
 * Horizontal, snap-scrolling swiper strip. One card per remaining
 * contributor — swipe on touch, drag with a mouse on desktop, or use
 * the arrow buttons. Arrows and drag only kick in once the row
 * actually overflows its container; a handful of contributors that
 * already fit are simply centered instead of hugging the left edge.
 * Grows however many contributors there are — it just keeps scrolling
 * sideways as more people join.
 */
function ContributorsSwiper({ contributors }: { contributors: Contributor[] }) {
  const { ref: revealRef, visible } = useReveal<HTMLDivElement>();
  const trackRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const dragState = useRef({ active: false, startX: 0, startScroll: 0, moved: false });

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const measure = () => setHasOverflow(el.scrollWidth > el.clientWidth + 4);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [contributors.length]);

  const scrollByCards = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = (card?.offsetWidth ?? 168) + 16;
    el.scrollBy({ left: step * 2 * direction, behavior: "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el || e.pointerType === "touch") return;
    dragState.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
    el.setPointerCapture(e.pointerId);
    el.classList.add("is-dragging");
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el || !dragState.current.active) return;
    const delta = e.clientX - dragState.current.startX;
    if (Math.abs(delta) > 3) dragState.current.moved = true;
    el.scrollLeft = dragState.current.startScroll - delta;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (el && e.pointerType !== "touch") {
      el.classList.remove("is-dragging");
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore — capture may already have been released.
      }
    }
    dragState.current.active = false;
  };

  const onTrackClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragState.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragState.current.moved = false;
    }
  };

  return (
    <div
      ref={revealRef}
      className={`reveal relative w-full rounded-2xl border border-gray-200 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-900/40 sm:p-3 ${
        visible ? "reveal-visible" : ""
      }`}
    >
      <div
        ref={trackRef}
        className={`contrib-swiper ${hasOverflow ? "" : "contrib-swiper--centered"}`}
        role="list"
        aria-label="Contributors"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onTrackClickCapture}
      >
        {contributors.map((c) => (
          <a
            key={c.login}
            href={c.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-card
            draggable={false}
            className="card group flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-6 text-center transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-lg hover:shadow-primary/10 dark:border-gray-800 dark:bg-gray-900"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.avatarUrl}
              alt={c.login}
              loading="lazy"
              draggable={false}
              className="h-16 w-16 rounded-full border border-gray-200 object-cover transition-transform duration-200 group-hover:scale-105 dark:border-gray-700"
            />
            <div className="min-w-0 w-full">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {c.name || c.login}
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                @{c.login}
              </p>
              <p className="mt-1 text-xs font-medium text-primary">
                {c.contributions === 1 ? "1 commit" : `${c.contributions} commits`}
              </p>
            </div>
          </a>
        ))}
      </div>

      {hasOverflow && (
        <>
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            aria-label="Scroll contributors left"
            className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white p-2 text-gray-700 shadow-lg shadow-black/5 transition hover:scale-105 hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:text-white sm:flex"
          >
            <ChevronIcon className="h-4 w-4 rotate-180" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            aria-label="Scroll contributors right"
            className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white p-2 text-gray-700 shadow-lg shadow-black/5 transition hover:scale-105 hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:text-white sm:flex"
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

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="m12 2.5 2.9 6.06 6.6.83-4.86 4.6 1.28 6.6L12 17.4l-5.92 3.19 1.28-6.6-4.86-4.6 6.6-.83L12 2.5Z" />
    </svg>
  );
}

function CrownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3 8.5 7 11l5-6 5 6 4-2.5-1.6 9.5H4.6L3 8.5Zm2.1 11.5h13.8v2H5.1v-2Z" />
    </svg>
  );
}

function ContributorsSkeleton() {
  return (
    <div className="flex w-full flex-col items-center gap-12">
      <div className="flex w-full max-w-sm animate-pulse flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-8 py-9 dark:border-gray-800 dark:bg-gray-900/60">
        <div className="h-5 w-24 rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="h-28 w-28 rounded-2xl bg-gray-200 dark:bg-gray-800 sm:h-32 sm:w-32" />
        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-7 w-28 rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="grid w-full animate-pulse grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-40 w-full rounded-xl bg-gray-200 dark:bg-gray-800"
          />
        ))}
      </div>
    </div>
  );
}
