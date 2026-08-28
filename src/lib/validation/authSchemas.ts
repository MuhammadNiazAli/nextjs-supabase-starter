import { z } from "zod";

// Migrated from PasswordInput's previous hardcoded `required` attribute.
const requiredPassword = z.string().min(1, "Password is required");

// New strength rule requested for signup — login keeps the old "required only" rule
// so existing passwords set before this change still work.
const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number");

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: requiredPassword,
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  // Migrated from signup page's previous `minLength={3}` attribute.
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: strongPassword,
});

export type SignupFormValues = z.infer<typeof signupSchema>;
