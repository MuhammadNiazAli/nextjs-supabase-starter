"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import en from "@/messages/en.json";
import ur from "@/messages/ur.json";
import { defaultLocale, locales, type Locale } from "./config";

type Messages = typeof en;

const dictionaries: Record<Locale, Messages> = { en, ur };

const STORAGE_KEY = "locale";

type TranslateFn = (path: string) => string;

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
};

function resolve(dict: Messages, path: string): string {
  const value = path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined,
      dict,
    );

  return typeof value === "string" ? value : path;
}

function createTranslator(locale: Locale): TranslateFn {
  const dict = dictionaries[locale] ?? dictionaries[defaultLocale];
  return (path: string) => resolve(dict, path);
}

// Sensible default so components can call useLanguage() even when they are
// rendered outside a <LanguageProvider> (e.g. in isolated unit tests or
// Storybook stories) - they simply fall back to the default locale.
const defaultContextValue: LanguageContextValue = {
  locale: defaultLocale,
  setLocale: () => {},
  t: createTranslator(defaultLocale),
};

const LanguageContext = createContext<LanguageContextValue>(defaultContextValue);

function getInitialLocale(): Locale {
  if (typeof window === "undefined") {
    return defaultLocale;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && (locales as readonly string[]).includes(stored)) {
      return stored as Locale;
    }
  } catch {
    // localStorage can be unavailable (privacy mode, SSR, etc.) - ignore.
  }

  return defaultLocale;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ur" ? "rtl" : "ltr";

    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // Ignore write errors (e.g. storage disabled/full).
    }
  }, [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, t: createTranslator(locale) }),
    [locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
