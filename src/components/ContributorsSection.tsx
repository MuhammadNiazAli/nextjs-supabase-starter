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
      className="contributors-reveal sticky top-0 z-10 flex flex-col justify-center overflow-hidden rounded-t-[2.5rem] border-t border-primary/20 bg-gray-950 px-6 py-20 shadow-[0_-25px_60px_-25px_rgba(0,0,0,0.65)]"
    >
      {/* Soft radial glow behind the heading, purely decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_45%_at_50%_0%,rgba(79,70,229,0.22),transparent)]"
      />

      <div className="relative mx-auto w-full max-w-5xl">
        <div
          className={`mb-14 text-center transition-all duration-700 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/80">
            {t("home.contributors.eyebrow")}
          </p>
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              {t("home.contributors.title")}
            </h2>
            {contributors && (
              <span className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-primary px-2 text-sm font-semibold text-white">
                {contributors.length}
              </span>
            )}
          </div>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">
            {t("home.contributors.subtitle")}
          </p>
        </div>

        {error && (
          <div className="mx-auto max-w-md rounded-2xl border border-gray-800 bg-gray-900/60 p-8 text-center text-gray-400">
            {t("home.contributors.error")}
          </div>
        )}

        {!error && !contributors && <ContributorsSkeleton />}

        {!error && contributors && contributors.length === 0 && (
          <div className="mx-auto max-w-md rounded-2xl border border-gray-800 bg-gray-900/60 p-8 text-center text-gray-400">
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
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {others.map((c) => (
                  <ContributorCard key={c.login} contributor={c} />
                ))}
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
    <div className="mb-10 flex justify-center">
      <a
        href={contributor.htmlUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col items-center rounded-3xl border border-primary/40 bg-gradient-to-b from-primary/10 to-transparent px-10 py-8 text-center shadow-[0_0_45px_-10px_rgba(79,70,229,0.55)] transition-transform duration-300 hover:-translate-y-1"
      >
        <div className="relative">
          <div className="absolute -inset-1.5 rounded-full bg-primary/40 blur-md transition-opacity duration-300 group-hover:opacity-90" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={contributor.avatarUrl}
            alt={contributor.login}
            className="relative h-24 w-24 rounded-full border-2 border-primary object-cover"
            loading="lazy"
          />
        </div>
        <span className="mt-4 inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
          {badge}
        </span>
        <p className="mt-2 text-lg font-semibold text-white">
          {contributor.name || contributor.login}
        </p>
        <p className="text-sm text-gray-400">@{contributor.login}</p>
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
      className="group flex flex-col items-center rounded-2xl border border-gray-800 bg-gray-900/60 px-4 py-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-gray-900"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={contributor.avatarUrl}
        alt={contributor.login}
        className="h-14 w-14 rounded-full border border-gray-700 object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <p className="mt-3 w-full truncate text-sm font-semibold text-white">
        {contributor.name || contributor.login}
      </p>
      <p className="w-full truncate text-xs text-gray-500">@{contributor.login}</p>
    </a>
  );
}

function ContributorsSkeleton() {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
      role="status"
      aria-live="polite"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse flex-col items-center rounded-2xl border border-gray-800 bg-gray-900/60 px-4 py-6"
        >
          <div className="h-14 w-14 rounded-full bg-gray-800" />
          <div className="mt-3 h-3 w-16 rounded bg-gray-800" />
          <div className="mt-2 h-2 w-12 rounded bg-gray-800" />
        </div>
      ))}
    </div>
  );
}
