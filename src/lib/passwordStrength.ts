export type PasswordStrengthLabel = "Weak" | "Medium" | "Strong";

export type PasswordStrengthResult = {
  score: number; // 0-4
  label: PasswordStrengthLabel;
};

/**
 * Lightweight heuristic password strength scorer for live UI feedback.
 * Not a substitute for the signup validation rules in authSchemas.ts —
 * this only drives the visual meter shown while the user is typing.
 */
export function getPasswordStrength(password: string): PasswordStrengthResult {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const label: PasswordStrengthLabel =
    score <= 2 ? "Weak" : score <= 3 ? "Medium" : "Strong";

  return { score, label };
}
