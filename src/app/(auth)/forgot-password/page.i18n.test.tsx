import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import ForgotPasswordPage from "./page";
import { ToastProvider } from "@/components/Toast";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

// The page talks to Supabase only on submit, but the client is faked
// here anyway so no network is touched.
vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(),
    },
  },
}));

function renderPage() {
  return render(
    <ToastProvider>
      <LanguageProvider>
        <ForgotPasswordPage />
      </LanguageProvider>
    </ToastProvider>,
  );
}

describe("forgot-password page translations", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the English labels, placeholder and button", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Forgot password?" }),
    ).not.toBeNull();
    expect(screen.getByText("Email")).not.toBeNull();
    expect(screen.getByPlaceholderText("you@example.com")).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Send reset link" }),
    ).not.toBeNull();
    expect(screen.getByText("Remembered your password?")).not.toBeNull();
    expect(screen.getByText("Back to login")).not.toBeNull();
  });

  it("renders the Urdu heading when the locale is Urdu", () => {
    window.localStorage.setItem("locale", "ur");
    renderPage();

    expect(
      screen.getByRole("heading", { name: "پاس ورڈ بھول گئے؟" }),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "ری سیٹ لنک بھیجیں" }),
    ).not.toBeNull();
  });
});
