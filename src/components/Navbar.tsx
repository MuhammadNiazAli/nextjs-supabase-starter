"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Close the mobile drawer on resize back to desktop so it never gets
  // stuck open if the viewport crosses the breakpoint while it's open.
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 640px)");
    const handleChange = () => setMenuOpen(false);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  // Small elevation once the page scrolls under the sticky navbar, so it
  // reads as floating above the content instead of always looking flat.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While the drawer is open: lock page scroll and let Escape close it.
  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const linkClass =
    "relative py-1 text-sm font-medium text-gray-700 transition-colors duration-200 after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-0 after:rounded-full after:bg-primary after:transition-all after:duration-300 hover:text-primary hover:after:w-full dark:text-gray-300 dark:hover:text-white";

  const drawerLinkClass =
    "w-full rounded-xl px-4 py-3 text-[15px] font-medium text-gray-700 transition-colors duration-200 hover:bg-primary/10 hover:text-primary dark:text-gray-200 dark:hover:bg-primary/15";

  return (
    <>
      <nav
        aria-label="Main navigation"
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-all duration-300 ${
          scrolled
            ? "border-gray-200 bg-white/85 shadow-sm shadow-black/5 dark:border-gray-800 dark:bg-gray-950/85"
            : "border-transparent bg-white/70 dark:bg-gray-950/70"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 text-base font-bold tracking-tight text-gray-900 transition-transform duration-200 hover:scale-[1.02] dark:text-white sm:text-lg"
          >
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-primary text-sm font-black text-white shadow-sm shadow-primary/30"
            >
              {t("navbar.brand").trim().charAt(0)}
            </span>
            <span className="truncate">{t("navbar.brand")}</span>
          </Link>

          {/* Desktop / tablet links, hidden below sm */}
          <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:justify-end sm:gap-5">
            <Link href="/pricing" className={linkClass}>
              {t("navbar.pricing")}
            </Link>
            {user ? (
              <>
                <Link href="/profile" className={linkClass}>
                  {t("navbar.profile")}
                </Link>
                <button type="button" onClick={handleLogout} className={linkClass}>
                  {t("navbar.logout")}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={linkClass}>
                  {t("navbar.login")}
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white shadow-sm shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-md hover:shadow-primary/40"
                >
                  {t("navbar.signup")}
                </Link>
              </>
            )}
            <span aria-hidden="true" className="h-5 w-px bg-gray-200 dark:bg-gray-800" />
            <LanguageSwitcher />
            <ThemeToggle />
          </div>

          {/* Hamburger toggle, shown only below sm */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={t("navbar.toggleMenu")}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-300 text-gray-700 transition-colors hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-200 sm:hidden"
          >
            <span className="relative block h-3.5 w-4">
              <span
                className={`absolute left-0 top-0 h-0.5 w-4 bg-current transition-all duration-300 ${
                  menuOpen ? "top-1.5 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-0.5 w-4 bg-current transition-opacity duration-200 ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 top-3 h-0.5 w-4 bg-current transition-all duration-300 ${
                  menuOpen ? "top-1.5 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* Backdrop behind the off-canvas drawer — fades in/out and closes
          the drawer on tap, sitting under the drawer but above content. */}
      <div
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-40 bg-gray-950/50 backdrop-blur-sm transition-opacity duration-300 sm:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Off-canvas mobile drawer — slides in from the right, independent
          of document flow so it always sits above everything else. */}
      <div
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={t("navbar.toggleMenu")}
        className={`fixed inset-y-0 right-0 z-50 flex w-[82%] max-w-xs flex-col border-l border-gray-200 bg-white px-4 py-4 shadow-2xl transition-transform duration-300 ease-out dark:border-gray-800 dark:bg-gray-950 sm:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-3 flex items-center justify-between px-1">
          <span className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-primary text-xs font-black text-white"
            >
              {t("navbar.brand").trim().charAt(0)}
            </span>
            {t("navbar.brand")}
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label={t("navbar.toggleMenu")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-900"
          >
            <CloseIcon className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto py-2">
          <Link href="/pricing" className={drawerLinkClass} onClick={() => setMenuOpen(false)}>
            {t("navbar.pricing")}
          </Link>
          {user ? (
            <>
              <Link href="/profile" className={drawerLinkClass} onClick={() => setMenuOpen(false)}>
                {t("navbar.profile")}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className={`${drawerLinkClass} text-left`}
              >
                {t("navbar.logout")}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={drawerLinkClass} onClick={() => setMenuOpen(false)}>
                {t("navbar.login")}
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="mt-1 w-full rounded-xl bg-primary px-4 py-3 text-center text-[15px] font-semibold text-white shadow-sm shadow-primary/30 transition-colors hover:bg-indigo-600"
              >
                {t("navbar.signup")}
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
