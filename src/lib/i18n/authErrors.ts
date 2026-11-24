/**
 * Mapping table for Supabase authentication error strings and application toast messages
 * to internationalized translation keys.
 */
export const AUTH_ERROR_MAPPINGS: Record<string, string> = {
  // Supabase Auth errors
  "Invalid login credentials": "errors.invalidCredentials",
  "invalid_credentials": "errors.invalidCredentials",
  "User already registered": "errors.userAlreadyRegistered",
  "user_already_exists": "errors.userAlreadyRegistered",
  "Email not confirmed": "errors.emailNotConfirmed",
  "email_not_confirmed": "errors.emailNotConfirmed",
  "Password should be at least 6 characters": "errors.passwordTooShort",
  "Signup requires a valid password": "errors.invalidPassword",
  "Email rate limit exceeded": "errors.rateLimit",
  "over_email_send_rate_limit": "errors.rateLimit",
  "Auth session missing!": "errors.sessionMissing",
  "Your session has expired. Please log in again.": "errors.sessionExpired",
  "Failed to delete account.": "errors.accountDeleteFailed",

  // Common application toasts (supporting both em dash '—' used in dashboard and hyphen '-')
  "Check your email to confirm your account.": "toasts.checkEmailConfirm",
  "Password reset email sent — check your inbox.": "toasts.passwordResetSent",
  "Password reset email sent - check your inbox.": "toasts.passwordResetSent",
  "Verification email sent — check your inbox.": "toasts.verificationSent",
  "Verification email sent - check your inbox.": "toasts.verificationSent",
  "Your account has been deleted.": "toasts.accountDeleted",
};

/**
 * Returns the localized text for an error message or toast string using
 * the provided translator function. Falls back to the original message if unmapped.
 */
export function getLocalizedMessage(
  message: string,
  t: (key: string) => string
): string {
  if (!message) return "";

  // 1. Direct lookup in mapped errors
  const mappedKey = AUTH_ERROR_MAPPINGS[message];
  if (mappedKey) {
    const translated = t(mappedKey);
    if (translated && translated !== mappedKey) {
      return translated;
    }
  }

  // 2. Pattern matching for dynamic security rate limit messages (extracts interval seconds)
  const rateLimitMatch = message.match(
    /only request this once every\s+(\d+)\s+seconds/i
  );
  if (rateLimitMatch) {
    const seconds = rateLimitMatch[1];
    const translated = t("errors.rateLimitSeconds");
    if (translated && translated !== "errors.rateLimitSeconds") {
      return translated.replace("{seconds}", seconds);
    }
  }

  // 3. Direct i18n key passed (e.g. "errors.xxx" or "toasts.xxx")
  if (message.startsWith("errors.") || message.startsWith("toasts.")) {
    const translated = t(message);
    if (translated && translated !== message) {
      return translated;
    }
  }

  // 4. Default fallback: return original message
  return message;
}
