// Live state of the signup form's confirm-password field.
// "empty" means the user has not typed a confirmation yet, so the field
// stays neutral instead of shouting "mismatch" before they even start.
export type PasswordMatchState = "empty" | "match" | "mismatch";

export function getPasswordMatchState(
  password: string,
  confirmPassword: string,
): PasswordMatchState {
  if (confirmPassword === "") return "empty";
  return password === confirmPassword ? "match" : "mismatch";
}

// CSS classes (defined in globals.css) that colour the confirm field's border.
export function matchStateClassName(state: PasswordMatchState): string {
  if (state === "match") return "confirm-password-input is-match";
  if (state === "mismatch") return "confirm-password-input is-mismatch";
  return "confirm-password-input";
}
