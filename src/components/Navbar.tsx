"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Navbar() {
  const { t } = useLanguage();

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
      <Link href="/" className="font-bold text-lg text-primary">
        {t("navbar.brand")}
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/login" className="text-sm hover:underline">
          {t("navbar.login")}
        </Link>
        <Link href="/signup" className="text-sm hover:underline">
          {t("navbar.signup")}
        </Link>
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </nav>
  );
}
