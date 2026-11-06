import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach } from "vitest";
import { ToastProvider, useToast } from "./Toast";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

function TestComponent({
  message,
  type,
}: {
  message: string;
  type?: "success" | "error" | "info";
}) {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast(message, type)}>Trigger Toast</button>
  );
}

describe("ToastProvider i18n integration", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders toast message directly when in English locale", async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <ToastProvider>
          <TestComponent
            message="Invalid login credentials"
            type="error"
          />
        </ToastProvider>
      </LanguageProvider>
    );

    await user.click(screen.getByRole("button", { name: "Trigger Toast" }));

    expect(
      screen.getByText("Invalid login credentials")
    ).toBeInTheDocument();
  });

  it("automatically localizes known Supabase errors when active locale is Urdu", async () => {
    window.localStorage.setItem("locale", "ur");
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <ToastProvider>
          <TestComponent
            message="Invalid login credentials"
            type="error"
          />
        </ToastProvider>
      </LanguageProvider>
    );

    await user.click(screen.getByRole("button", { name: "Trigger Toast" }));

    expect(
      screen.getByText("لاگ ان کی تفصیلات غلط ہیں")
    ).toBeInTheDocument();
  });

  it("automatically localizes success toasts when active locale is Urdu", async () => {
    window.localStorage.setItem("locale", "ur");
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <ToastProvider>
          <TestComponent
            message="Check your email to confirm your account."
            type="success"
          />
        </ToastProvider>
      </LanguageProvider>
    );

    await user.click(screen.getByRole("button", { name: "Trigger Toast" }));

    expect(
      screen.getByText("اپنے اکاؤنٹ کی تصدیق کے لیے اپنی ای میل چیک کریں")
    ).toBeInTheDocument();
  });

  it("falls back to original unmapped string cleanly", async () => {
    window.localStorage.setItem("locale", "ur");
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <ToastProvider>
          <TestComponent
            message="Custom unique error message"
            type="info"
          />
        </ToastProvider>
      </LanguageProvider>
    );

    await user.click(screen.getByRole("button", { name: "Trigger Toast" }));

    expect(
      screen.getByText("Custom unique error message")
    ).toBeInTheDocument();
  });

  it("allows dismissing the toast manually", async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <ToastProvider>
          <TestComponent
            message="Dismissable message"
            type="info"
          />
        </ToastProvider>
      </LanguageProvider>
    );

    await user.click(screen.getByRole("button", { name: "Trigger Toast" }));
    expect(screen.getByText("Dismissable message")).toBeInTheDocument();

    const dismissBtn = screen.getByRole("button", {
      name: "Dismiss notification",
    });
    await user.click(dismissBtn);

    expect(screen.queryByText("Dismissable message")).not.toBeInTheDocument();
  });
});
