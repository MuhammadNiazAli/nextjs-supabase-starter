// Supported locales for the app. Add a new code here + a matching
// src/messages/<code>.json file to add a language.
export const locales = ["en", "ur"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  ur: "اردو",
};
