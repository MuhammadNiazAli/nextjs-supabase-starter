import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import SignupPage from "./page";
import { supabase } from "@/lib/supabaseClient";
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

  afterEach(() => {
    vi.useRealTimers();
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

  it("shakes the card when the signup API returns an error", async () => {
    vi.useFakeTimers();
    (supabase.auth.signUp as Mock).mockResolvedValue({
      error: { message: "User already registered" },
    });
    renderPage();

    fireEvent.change(screen.getByPlaceholderText("Choose a username"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(
      screen.getByPlaceholderText("Create a strong password"),
      { target: { value: "Password123!" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));

    // Let the failed submit finish; the card shakes for 0.4s.
    await vi.advanceTimersByTimeAsync(100);
    expect(document.querySelector(".auth-card-shake")).not.toBeNull();

    // The shake class clears once the animation has finished, so a
    // second failed submit can shake the card again.
    await vi.advanceTimersByTimeAsync(400);
    expect(document.querySelector(".auth-card-shake")).toBeNull();
    vi.useRealTimers();
  });
});
