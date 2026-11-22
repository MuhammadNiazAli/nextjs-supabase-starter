import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import SignupPage from "./page";
import { supabase } from "@/lib/supabaseClient";
import { ToastProvider } from "@/components/Toast";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

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

function confirmInput() {
  return screen.getByPlaceholderText("Type your password again") as HTMLInputElement;
}

function fillForm(password: string, confirmPassword: string) {
  fireEvent.change(screen.getByPlaceholderText("Choose a username"), {
    target: { value: "testuser" },
  });
  fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("Create a strong password"), {
    target: { value: password },
  });
  fireEvent.change(confirmInput(), { target: { value: confirmPassword } });
}

describe("signup confirm-password field", () => {
  beforeEach(() => {
    window.localStorage.clear();
    (supabase.auth.signUp as Mock).mockReset();
    (supabase.auth.signUp as Mock).mockResolvedValue({ error: null });
  });

  it("renders a labelled confirm field with a neutral border", () => {
    renderPage();

    expect(screen.getByLabelText("Confirm password")).toBe(confirmInput());
    expect(confirmInput().className).toContain("confirm-password-input");
    expect(confirmInput().className).not.toContain("is-match");
    expect(confirmInput().className).not.toContain("is-mismatch");
  });

  it("turns the border red with a hint while the passwords differ", () => {
    renderPage();
    fillForm("Password123", "Password1");

    expect(confirmInput().className).toContain("is-mismatch");
    expect(confirmInput().getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Passwords do not match")).not.toBeNull();
  });

  it("turns the border green once the passwords match", () => {
    renderPage();
    fillForm("Password123", "Password123");

    expect(confirmInput().className).toContain("is-match");
    expect(confirmInput().getAttribute("aria-invalid")).toBe("false");
    expect(screen.getByText("Passwords match")).not.toBeNull();
  });

  it("blocks submit and shows an alert when the passwords differ", async () => {
    renderPage();
    fillForm("Password123", "Password124");
    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("Passwords do not match");
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  it("sends only the real fields to Supabase when the passwords match", async () => {
    renderPage();
    fillForm("Password123", "Password123");
    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));

    await waitFor(() => expect(supabase.auth.signUp).toHaveBeenCalledTimes(1));
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "Password123",
      options: { data: { username: "testuser" } },
    });
  });

  it("shows the Urdu confirm label when the locale is Urdu", () => {
    window.localStorage.setItem("locale", "ur");
    renderPage();

    expect(screen.getByText("پاس ورڈ کی تصدیق کریں")).not.toBeNull();
  });
});
