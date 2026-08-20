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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
      <Link href="/" className="font-bold text-lg text-primary">
        {t("navbar.brand")}
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/pricing" className="text-sm hover:underline">
          {t("navbar.pricing")}
        </Link>
        {user ? (
          <>
            <Link href="/profile" className="text-sm hover:underline">
              {t("navbar.profile")}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm hover:underline"
            >
              {t("navbar.logout")}
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm hover:underline">
              {t("navbar.login")}
            </Link>
            <Link href="/signup" className="text-sm hover:underline">
              {t("navbar.signup")}
            </Link>
          </>
        )}
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </nav>
  );
}
