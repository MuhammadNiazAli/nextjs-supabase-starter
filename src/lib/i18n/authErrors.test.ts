import { describe, expect, it } from "vitest";
import { AUTH_ERROR_MAPPINGS, getLocalizedMessage } from "./authErrors";

describe("authErrors mapping and localization", () => {
  const dummyEnTranslator = (key: string): string => {
    const dict: Record<string, string> = {
      "errors.invalidCredentials": "Invalid login credentials",
      "errors.userAlreadyRegistered": "User already registered",
      "errors.rateLimitSeconds":
        "For security purposes, you can only request this once every {seconds} seconds.",
      "toasts.checkEmailConfirm": "Check your email to confirm your account.",
      "toasts.passwordResetSent":
        "Password reset email sent — check your inbox.",
      "toasts.verificationSent":
        "Verification email sent — check your inbox.",
    };
    return dict[key] ?? key;
  };

  const dummyUrTranslator = (key: string): string => {
    const dict: Record<string, string> = {
      "errors.invalidCredentials": "لاگ ان کی تفصیلات غلط ہیں",
      "errors.userAlreadyRegistered": "یہ صارف پہلے سے رجسٹرڈ ہے",
      "errors.rateLimitSeconds":
        "سیکیورٹی وجوہات کی بناء پر، آپ ہر {seconds} سیکنڈ میں صرف ایک بار درخواست کر سکتے ہیں",
      "toasts.checkEmailConfirm":
        "اپنے اکاؤنٹ کی تصدیق کے لیے اپنی ای میل چیک کریں",
      "toasts.passwordResetSent":
        "پاس ورڈ ری سیٹ ای میل بھیج دی گئی ہے — اپنا ان باکس چیک کریں",
      "toasts.verificationSent":
        "تصدیقی ای میل بھیج دی گئی ہے — اپنا ان باکس چیک کریں",
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

  it("translates real dashboard toast strings containing em dash", () => {
    const resetResult = getLocalizedMessage(
      "Password reset email sent — check your inbox.",
      dummyUrTranslator
    );
    expect(resetResult).toBe(
      "پاس ورڈ ری سیٹ ای میل بھیج دی گئی ہے — اپنا ان باکس چیک کریں"
    );

    const verifyResult = getLocalizedMessage(
      "Verification email sent — check your inbox.",
      dummyUrTranslator
    );
    expect(verifyResult).toBe(
      "تصدیقی ای میل بھیج دی گئی ہے — اپنا ان باکس چیک کریں"
    );
  });

  it("also supports legacy hyphen toast variants", () => {
    const resetHyphen = getLocalizedMessage(
      "Password reset email sent - check your inbox.",
      dummyUrTranslator
    );
    expect(resetHyphen).toBe(
      "پاس ورڈ ری سیٹ ای میل بھیج دی گئی ہے — اپنا ان باکس چیک کریں"
    );

    const verifyHyphen = getLocalizedMessage(
      "Verification email sent - check your inbox.",
      dummyUrTranslator
    );
    expect(verifyHyphen).toBe(
      "تصدیقی ای میل بھیج دی گئی ہے — اپنا ان باکس چیک کریں"
    );
  });

  it("handles dynamic Supabase rate limit strings with variable intervals", () => {
    const result60 = getLocalizedMessage(
      "For security purposes, you can only request this once every 60 seconds",
      dummyUrTranslator
    );
    expect(result60).toBe(
      "سیکیورٹی وجوہات کی بناء پر، آپ ہر 60 سیکنڈ میں صرف ایک بار درخواست کر سکتے ہیں"
    );

    const result30 = getLocalizedMessage(
      "For security purposes, you can only request this once every 30 seconds",
      dummyEnTranslator
    );
    expect(result30).toBe(
      "For security purposes, you can only request this once every 30 seconds."
    );

    const result120 = getLocalizedMessage(
      "For security purposes, you can only request this once every 120 seconds",
      dummyUrTranslator
    );
    expect(result120).toBe(
      "سیکیورٹی وجوہات کی بناء پر، آپ ہر 120 سیکنڈ میں صرف ایک بار درخواست کر سکتے ہیں"
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
    expect(
      AUTH_ERROR_MAPPINGS["Password reset email sent — check your inbox."]
    ).toBe("toasts.passwordResetSent");
    expect(
      AUTH_ERROR_MAPPINGS["Verification email sent — check your inbox."]
    ).toBe("toasts.verificationSent");
  });
});
