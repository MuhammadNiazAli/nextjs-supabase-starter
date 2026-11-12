import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import LoginPageWithSuspense from "./page";
import { supabase } from "@/lib/supabaseClient";
import { ToastProvider } from "@/components/Toast";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

// The page talks to Supabase only on submit, but the client is faked
// here anyway so no network is touched.
vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

function renderPage() {
  return render(
    <ToastProvider>
      <LanguageProvider>
        <LoginPageWithSuspense />
      </LanguageProvider>
    </ToastProvider>,
  );
}

describe("login page translations", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the English labels, placeholders and buttons", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Welcome back" }),
    ).not.toBeNull();
    expect(screen.getByText("Email")).not.toBeNull();
    expect(screen.getByText("Password")).not.toBeNull();
    expect(screen.getByPlaceholderText("you@example.com")).not.toBeNull();
    expect(
      screen.getByPlaceholderText("Enter your password"),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Login" }),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Continue with Google" }),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Continue with GitHub" }),
    ).not.toBeNull();
    expect(screen.getByText("Forgot password?")).not.toBeNull();
  });

  it("renders the Urdu heading when the locale is Urdu", () => {
    window.localStorage.setItem("locale", "ur");
    renderPage();

    expect(
      screen.getByRole("heading", { name: "واپس خوش آمدید" }),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "لاگ ان" }),
    ).not.toBeNull();
  });

  it("shakes the card when the login API returns an error", async () => {
    vi.useFakeTimers();
    (supabase.auth.signInWithPassword as Mock).mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });
    renderPage();

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "Password123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

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
