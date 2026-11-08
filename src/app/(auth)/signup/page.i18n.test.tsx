import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import SignupPage from "./page";
import { ToastProvider } from "@/components/Toast";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

// The page talks to Supabase only on submit, but the client is faked
// here anyway so no network is touched.
vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  },
}));

function renderPage() {
  return render(
    <ToastProvider>
      <LanguageProvider>
        <SignupPage />
      </LanguageProvider>
    </ToastProvider>,
  );
}

describe("signup page translations", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the English labels, placeholders and buttons", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Create your account" }),
    ).not.toBeNull();
    expect(screen.getByText("Username")).not.toBeNull();
    expect(screen.getByText("Email")).not.toBeNull();
    expect(screen.getByText("Password")).not.toBeNull();
    expect(screen.getByPlaceholderText("Choose a username")).not.toBeNull();
    expect(screen.getByPlaceholderText("you@example.com")).not.toBeNull();
    expect(
      screen.getByPlaceholderText("Create a strong password"),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Sign up" }),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Continue with Google" }),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Continue with GitHub" }),
    ).not.toBeNull();
    expect(screen.getByText("Already have an account?")).not.toBeNull();
  });

  it("renders the Urdu heading when the locale is Urdu", () => {
    window.localStorage.setItem("locale", "ur");
    renderPage();

    expect(
      screen.getByRole("heading", { name: "اپنا اکاؤنٹ بنائیں" }),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "سائن اپ" }),
    ).not.toBeNull();
  });
});
