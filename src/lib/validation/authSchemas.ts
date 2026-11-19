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

// One rule for usernames everywhere: signup and the profile form share it,
// so the two places can never drift apart.
// Migrated from signup page's previous `minLength={3}` attribute.
const usernameField = z.string().min(3, "Username must be at least 3 characters");

export const usernameSchema = z.object({
  username: usernameField,
});

export type UsernameFormValues = z.infer<typeof usernameSchema>;

export const signupSchema = z.object({
  username: usernameField,
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: strongPassword,
});

export const PASSWORDS_DO_NOT_MATCH = "Passwords do not match";

// The signup form asks for the password twice. The second copy only
// exists to catch typos, so it lives here on the form schema and is
// never sent to Supabase — signupSchema above stays the shape the API needs.
export const signupFormSchema = signupSchema
  .extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: PASSWORDS_DO_NOT_MATCH,
    path: ["confirmPassword"],
  });

export type SignupFormValues = z.infer<typeof signupFormSchema>;
