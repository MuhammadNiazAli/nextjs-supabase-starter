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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Close the mobile menu on resize back to desktop so it never gets
  // stuck open if the viewport crosses the breakpoint while it's open.
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 640px)");
    const handleChange = () => setMenuOpen(false);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const linkClass =
    "text-sm hover:underline sm:hover:no-underline sm:hover:text-primary transition-colors";

  return (
    <nav
      aria-label="Main navigation"
      className="relative px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 dark:border-gray-800"
    >
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="font-bold text-lg text-primary">
          {t("navbar.brand")}
        </Link>

        {/* Desktop / tablet links, hidden below sm */}
        <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:justify-end sm:gap-4">
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
              <Link href="/signup" className={linkClass}>
                {t("navbar.signup")}
              </Link>
            </>
          )}
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {/* Hamburger toggle, shown only below sm */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-menu"
          aria-label={t("navbar.toggleMenu")}
          className="sm:hidden inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 transition-colors hover:border-primary hover:text-primary"
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

      {/* Mobile dropdown menu */}
      <div
        id="mobile-nav-menu"
        className={`sm:hidden grid overflow-hidden transition-all duration-300 ease-out ${
          menuOpen ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 flex flex-col items-start gap-3 pt-1">
          <Link href="/pricing" className={linkClass} onClick={() => setMenuOpen(false)}>
            {t("navbar.pricing")}
          </Link>
          {user ? (
            <>
              <Link href="/profile" className={linkClass} onClick={() => setMenuOpen(false)}>
                {t("navbar.profile")}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className={linkClass}
              >
                {t("navbar.logout")}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass} onClick={() => setMenuOpen(false)}>
                {t("navbar.login")}
              </Link>
              <Link href="/signup" className={linkClass} onClick={() => setMenuOpen(false)}>
                {t("navbar.signup")}
              </Link>
            </>
          )}
          <div className="flex items-center gap-3 pt-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
