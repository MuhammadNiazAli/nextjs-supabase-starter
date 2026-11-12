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
import fr from "@/messages/fr.json";
import es from "@/messages/es.json";
import ur from "@/messages/ur.json";
import { defaultLocale, locales, type Locale } from "./config";

type Messages = typeof en;

const dictionaries: Record<Locale, Messages> = { en, ur, fr, es };

const STORAGE_KEY = "locale";

type TranslateFn = (path: string) => string;

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
};

function lookup(dict: Messages, path: string): string | undefined {
  const value = path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined,
      dict,
    );

  return typeof value === "string" ? value : undefined;
}

// Warned keys are remembered so a missing translation logs once per
// locale, instead of on every render of every component that uses it.
const warnedMissingKeys = new Set<string>();

function createTranslator(locale: Locale): TranslateFn {
  const dict = dictionaries[locale] ?? dictionaries[defaultLocale];
  const fallback = dictionaries[defaultLocale];
  return (path: string) => {
    const value = lookup(dict, path);
    if (value !== undefined) {
      return value;
    }
    // Development-only warning for a key that exists in the default
    // locale but is missing in the active one — previously this silently
    // rendered the raw key path. The rendered fallback is unchanged.
    if (
      process.env.NODE_ENV === "development" &&
      lookup(fallback, path) !== undefined
    ) {
      const warnKey = `${locale}:${path}`;
      if (!warnedMissingKeys.has(warnKey)) {
        warnedMissingKeys.add(warnKey);
        console.warn(
          `[i18n] Missing translation for key "${path}" in locale "${locale}". ` +
            `Add it to ${locale}.json.`,
        );
      }
    }
    return path;
  };
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

  // auto-detect locale
  try {
    const browserLanguages =
      window.navigator.languages && window.navigator.languages.length > 0
        ? window.navigator.languages
        : [window.navigator.language];

    for (const lang of browserLanguages) {
      if (!lang) continue;
      const normalized = lang.toLowerCase();
      if ((locales as readonly string[]).includes(normalized)) {
        return normalized as Locale;
      }
      const prefix = normalized.split("-")[0];
      if ((locales as readonly string[]).includes(prefix)) {
        return prefix as Locale;
      }
    }
  } catch {
    // ignore error
  }

  return defaultLocale;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    // Only the `lang` attribute changes with the locale. `dir` is kept fixed
    // at "ltr" on purpose so switching languages never reflows/shifts the
    // layout (navbar, cards, etc. must stay exactly where they are).
    document.documentElement.lang = locale;
    document.documentElement.dir = "ltr";

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
