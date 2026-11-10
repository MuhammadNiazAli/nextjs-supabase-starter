import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import type { User } from "@supabase/supabase-js";
import DashboardPage from "./page";
import { ToastProvider } from "@/components/Toast";
import { supabase } from "@/lib/supabaseClient";

// The dashboard reads its user from Supabase, so the tests stand in a
// fake user instead of a real session. Only the fields the page reads
// are filled in; the rest is not the banner's business.
function makeUser(overrides: {
  createdAt: string;
  emailConfirmedAt?: string | null;
}): User {
  return {
    app_metadata: { provider: "email" },
    aud: "authenticated",
    created_at: overrides.createdAt,
    email: "test@example.com",
    email_confirmed_at: overrides.emailConfirmedAt ?? null,
    id: "user-1",
    last_sign_in_at: overrides.createdAt,
    user_metadata: { username: "testuser" },
  } as unknown as User;
}

function mockSignedInUser(user: User) {
  (supabase.auth.getUser as Mock).mockResolvedValue({ data: { user } });
  (supabase.from as Mock).mockReturnValue({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: { subscription_status: null } }),
      }),
    }),
  });
}

vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      resend: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

function renderDashboard() {
  return render(
    <ToastProvider>
      <DashboardPage />
    </ToastProvider>,
  );
}

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

describe("resend cooldown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function renderUnverifiedDashboard() {
    mockSignedInUser(
      makeUser({ createdAt: minutesAgo(1), emailConfirmedAt: null }),
    );
    renderDashboard();
    // The page loads with real timers; only the countdown itself runs
    // on fake ones, so the async load is not affected.
    return screen.findByRole("button", {
      name: "Resend verification email",
    });
  }

  it("disables both resend buttons for 60 seconds with a visible countdown", async () => {
    (supabase.auth.resend as Mock).mockResolvedValue({ data: {}, error: null });
    const alertButton = await renderUnverifiedDashboard();
    const bannerButton = screen.getByRole("button", { name: "Resend" });
    vi.useFakeTimers();

    fireEvent.click(alertButton);
    await vi.advanceTimersByTimeAsync(0);

    expect(supabase.auth.resend).toHaveBeenCalledTimes(1);
    expect(alertButton).toBeDisabled();
    expect(alertButton).toHaveTextContent(
      "Resend verification email in 60s",
    );
    expect(bannerButton).toBeDisabled();
    expect(bannerButton).toHaveTextContent("Resend in 60s");
  });

  it("counts down and re-enables the button after 60 seconds", async () => {
    (supabase.auth.resend as Mock).mockResolvedValue({ data: {}, error: null });
    const alertButton = await renderUnverifiedDashboard();
    vi.useFakeTimers();

    fireEvent.click(alertButton);
    await vi.advanceTimersByTimeAsync(0);
    expect(alertButton).toHaveTextContent(
      "Resend verification email in 60s",
    );

    await vi.advanceTimersByTimeAsync(10_000);
    expect(alertButton).toHaveTextContent(
      "Resend verification email in 50s",
    );

    await vi.advanceTimersByTimeAsync(50_000);
    expect(alertButton).toBeEnabled();
    expect(alertButton).toHaveTextContent("Resend verification email");
  });

  it("does not start the cooldown when resending fails", async () => {
    (supabase.auth.resend as Mock).mockResolvedValue({
      data: {},
      error: { message: "Too many requests" },
    });
    const alertButton = await renderUnverifiedDashboard();
    vi.useFakeTimers();

    fireEvent.click(alertButton);
    await vi.advanceTimersByTimeAsync(0);

    expect(alertButton).toBeEnabled();
    expect(alertButton).toHaveTextContent("Resend verification email");
    expect(screen.getByText("Too many requests")).not.toBeNull();
  });
});
