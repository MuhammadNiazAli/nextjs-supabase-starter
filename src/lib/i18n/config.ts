// Supported locales for the app. Add a new code here + a matching
// src/messages/<code>.json file to add a language.
export const locales = ["en", "ur", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

// Locales that read right-to-left. Add a code here when a new RTL
// language (e.g. Arabic) is added — the layout direction follows this
// list, so no other file needs to know which locales are RTL.
export const rtlLocales: ReadonlySet<Locale> = new Set<Locale>(["ur"]);

export function isRtlLocale(locale: Locale): boolean {
  return rtlLocales.has(locale);
}

export const localeNames: Record<Locale, string> = {
  en: "English",
  ur: "اردو",
  fr: "Français",
};
