"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Contributor } from "@/app/api/contributors/route";

const ADMIN_LOGIN = "MuhammadNiazAli";

// Beyond this many non-admin contributors, the grid stops growing the
// section's height and switches to an inner scroll area instead — 3
// columns x 3 rows fits on screen without pushing the sticky reveal
// section (and the rest of the page) taller than the viewport.
const VISIBLE_ROWS_BEFORE_SCROLL = 9;

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
  const needsScroll = others.length > VISIBLE_ROWS_BEFORE_SCROLL;

  return (
    <section
      ref={rootRef}
      className="contributors-reveal sticky top-0 z-10 flex flex-col justify-center overflow-hidden rounded-t-[2.5rem] border-t border-primary/20 bg-gray-950 px-6 py-16 shadow-[0_-25px_60px_-25px_rgba(0,0,0,0.65)]"
    >
      {/* Soft radial glow behind the heading, purely decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_45%_at_50%_0%,rgba(79,70,229,0.18),transparent)]"
      />

      <div className="relative mx-auto w-full max-w-3xl">
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
            }`}
          >
            {admin && (
              <AdminCard contributor={admin} badge={t("home.contributors.adminBadge")} />
            )}

            {others.length > 0 && (
              <div
                className={
                  needsScroll
                    ? "contributors-scroll max-h-[300px] overflow-y-auto pr-1"
                    : ""
                }
              >
                <div className="grid grid-cols-3 gap-3">
                  {others.map((c) => (
                    <ContributorCard key={c.login} contributor={c} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function AdminCard({
  contributor,
  badge,
}: {
  contributor: Contributor;
  badge: string;
}) {
  return (
    <div className="mb-8 flex justify-center">
      <a
        href={contributor.htmlUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col items-center rounded-2xl border border-primary/40 bg-gradient-to-b from-primary/10 to-transparent px-8 py-6 text-center shadow-[0_0_30px_-10px_rgba(79,70,229,0.5)] transition-transform duration-300 hover:-translate-y-1"
      >
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-primary/40 blur-md transition-opacity duration-300 group-hover:opacity-90" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={contributor.avatarUrl}
            alt={contributor.login}
            className="relative h-20 w-20 rounded-full border-2 border-primary object-cover"
            loading="lazy"
          />
        </div>
        <span className="mt-3 inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-200">
          {badge}
        </span>
        <p className="mt-2 text-base font-semibold text-white">
          {contributor.name || contributor.login}
        </p>
        <p className="text-xs text-gray-400">@{contributor.login}</p>
      </a>
    </div>
  );
}

function ContributorCard({ contributor }: { contributor: Contributor }) {
  return (
    <a
      href={contributor.htmlUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center rounded-xl border border-gray-800 bg-gray-900/60 px-2 py-3 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-gray-900"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={contributor.avatarUrl}
        alt={contributor.login}
        className="h-9 w-9 rounded-full border border-gray-700 object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <p className="mt-1.5 w-full truncate text-xs font-semibold text-white">
        {contributor.name || contributor.login}
      </p>
      <p className="w-full truncate text-[10px] text-gray-500">
        @{contributor.login}
      </p>
    </a>
  );
}

function ContributorsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3" role="status" aria-live="polite">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse flex-col items-center rounded-xl border border-gray-800 bg-gray-900/60 px-2 py-3"
        >
          <div className="h-9 w-9 rounded-full bg-gray-800" />
          <div className="mt-1.5 h-2.5 w-12 rounded bg-gray-800" />
          <div className="mt-1.5 h-2 w-9 rounded bg-gray-800" />
        </div>
      ))}
    </div>
  );
}
