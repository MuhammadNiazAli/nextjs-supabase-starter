import { describe, expect, it } from "vitest";
import { AUTH_ERROR_MAPPINGS, getLocalizedMessage } from "./authErrors";

describe("authErrors mapping and localization", () => {
  const dummyEnTranslator = (key: string): string => {
    const dict: Record<string, string> = {
      "errors.invalidCredentials": "Invalid login credentials",
      "errors.userAlreadyRegistered": "User already registered",
      "errors.rateLimitSeconds":
        "For security purposes, you can only request this once every 60 seconds.",
      "toasts.checkEmailConfirm": "Check your email to confirm your account.",
    };
    return dict[key] ?? key;
  };

  const dummyUrTranslator = (key: string): string => {
    const dict: Record<string, string> = {
      "errors.invalidCredentials": "لاگ ان کی تفصیلات غلط ہیں",
      "errors.userAlreadyRegistered": "یہ صارف پہلے سے رجسٹرڈ ہے",
      "errors.rateLimitSeconds":
        "سیکیورٹی وجوہات کی بناء پر، آپ ہر 60 سیکنڈ میں صرف ایک بار درخواست کر سکتے ہیں",
      "toasts.checkEmailConfirm":
        "اپنے اکاؤنٹ کی تصدیق کے لیے اپنی ای میل چیک کریں",
    };
    return dict[key] ?? key;
  };

  it("translates mapped Supabase errors into English", () => {
    const result = getLocalizedMessage(
      "Invalid login credentials",
      dummyEnTranslator
    );
    expect(result).toBe("Invalid login credentials");
  });

  it("translates mapped Supabase errors into Urdu", () => {
    const result = getLocalizedMessage(
      "Invalid login credentials",
      dummyUrTranslator
    );
    expect(result).toBe("لاگ ان کی تفصیلات غلط ہیں");
  });

  it("translates mapped application toast messages", () => {
    const result = getLocalizedMessage(
      "Check your email to confirm your account.",
      dummyUrTranslator
    );
    expect(result).toBe("اپنے اکاؤنٹ کی تصدیق کے لیے اپنی ای میل چیک کریں");
  });

  it("handles dynamic Supabase 60s rate limit strings", () => {
    const result = getLocalizedMessage(
      "For security purposes, you can only request this once every 60 seconds",
      dummyUrTranslator
    );
    expect(result).toBe(
      "سیکیورٹی وجوہات کی بناء پر، آپ ہر 60 سیکنڈ میں صرف ایک بار درخواست کر سکتے ہیں"
    );
  });

  it("handles direct i18n key paths", () => {
    const result = getLocalizedMessage(
      "errors.invalidCredentials",
      dummyUrTranslator
    );
    expect(result).toBe("لاگ ان کی تفصیلات غلط ہیں");
  });

  it("falls back to the raw message if it is not mapped", () => {
    const customError = "A very peculiar database constraint failed";
    const result = getLocalizedMessage(customError, dummyUrTranslator);
    expect(result).toBe(customError);
  });

  it("handles empty or falsy message strings safely", () => {
    expect(getLocalizedMessage("", dummyUrTranslator)).toBe("");
  });

  it("contains mappings for all expected Supabase auth error keys", () => {
    expect(AUTH_ERROR_MAPPINGS["Invalid login credentials"]).toBe(
      "errors.invalidCredentials"
    );
    expect(AUTH_ERROR_MAPPINGS["User already registered"]).toBe(
      "errors.userAlreadyRegistered"
    );
    expect(AUTH_ERROR_MAPPINGS["Email not confirmed"]).toBe(
      "errors.emailNotConfirmed"
    );
    expect(AUTH_ERROR_MAPPINGS["Password should be at least 6 characters"]).toBe(
      "errors.passwordTooShort"
    );
  });
});
