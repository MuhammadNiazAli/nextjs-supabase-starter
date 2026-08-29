import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema } from "./authSchemas";

describe("authSchemas validation", () => {
  describe("loginSchema", () => {
    it("accepts valid email and password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "any-password",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty email", () => {
      const result = loginSchema.safeParse({
        email: "",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Email is required");
      }
    });

    it("rejects invalid email format", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Enter a valid email address");
      }
    });

    it("rejects empty password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password is required");
      }
    });
  });

  describe("signupSchema", () => {
    it("accepts valid username, email, and strong password", () => {
      const result = signupSchema.safeParse({
        username: "johndoe",
        email: "john@example.com",
        password: "Password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects username shorter than 3 characters", () => {
      const result = signupSchema.safeParse({
        username: "ab",
        email: "user@example.com",
        password: "Password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Username must be at least 3 characters"
        );
      }
    });

    it("rejects invalid email format", () => {
      const result = signupSchema.safeParse({
        username: "johndoe",
        email: "invalid-email",
        password: "Password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Enter a valid email address");
      }
    });

    it("rejects password shorter than 8 characters", () => {
      const result = signupSchema.safeParse({
        username: "johndoe",
        email: "john@example.com",
        password: "Pass1",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (i) => i.message === "Password must be at least 8 characters"
          )
        ).toBe(true);
      }
    });

    it("rejects password missing lowercase letter", () => {
      const result = signupSchema.safeParse({
        username: "johndoe",
        email: "john@example.com",
        password: "PASSWORD123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (i) => i.message === "Password must include a lowercase letter"
          )
        ).toBe(true);
      }
    });

    it("rejects password missing uppercase letter", () => {
      const result = signupSchema.safeParse({
        username: "johndoe",
        email: "john@example.com",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (i) => i.message === "Password must include an uppercase letter"
          )
        ).toBe(true);
      }
    });

    it("rejects password missing number", () => {
      const result = signupSchema.safeParse({
        username: "johndoe",
        email: "john@example.com",
        password: "PasswordNoNum",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (i) => i.message === "Password must include a number"
          )
        ).toBe(true);
      }
    });
  });
});
