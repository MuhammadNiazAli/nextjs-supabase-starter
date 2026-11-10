import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import UpdatePasswordPage from "./page";
import { ToastProvider } from "@/components/Toast";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

// The page talks to Supabase only on submit, but the client is faked
// here anyway so no network is touched.
vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
    },
  },
}));

function renderPage() {
  return render(
    <ToastProvider>
      <LanguageProvider>
        <UpdatePasswordPage />
      </LanguageProvider>
    </ToastProvider>,
  );
}

describe("update-password page translations", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the English label, placeholder and button", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Set a new password" }),
    ).not.toBeNull();
    expect(screen.getByText("New Password")).not.toBeNull();
    expect(
      screen.getByPlaceholderText("Enter your new password"),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Update Password" }),
    ).not.toBeNull();
  });

  it("renders the Urdu heading when the locale is Urdu", () => {
    window.localStorage.setItem("locale", "ur");
    renderPage();

    expect(
      screen.getByRole("heading", { name: "نیا پاس ورڈ سیٹ کریں" }),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "پاس ورڈ اپ ڈیٹ کریں" }),
    ).not.toBeNull();
  });
});
