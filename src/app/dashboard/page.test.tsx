import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, type Mock } from "vitest";
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

describe("welcome banner", () => {
  it("shows the welcome checklist for a recently created account", async () => {
    mockSignedInUser(
      makeUser({ createdAt: minutesAgo(1), emailConfirmedAt: minutesAgo(1) }),
    );
    renderDashboard();

    expect(await screen.findByText("Let's get you set up")).not.toBeNull();
    expect(screen.getByText("Welcome aboard")).not.toBeNull();
    expect(screen.getByText("Verify email")).not.toBeNull();
    expect(screen.getByText("Complete your profile")).not.toBeNull();
    expect(screen.getByText("Explore pricing")).not.toBeNull();
  });

  it("hides the banner for an older account", async () => {
    mockSignedInUser(
      makeUser({ createdAt: minutesAgo(60), emailConfirmedAt: minutesAgo(60) }),
    );
    renderDashboard();

    // Wait for the dashboard itself so "absent" means loaded, not loading.
    expect(await screen.findByRole("heading", { name: "testuser" })).not.toBeNull();
    expect(screen.queryByText("Let's get you set up")).toBeNull();
  });

  it("hides the banner once the account is older than five minutes", async () => {
    mockSignedInUser(
      makeUser({ createdAt: minutesAgo(6), emailConfirmedAt: minutesAgo(6) }),
    );
    renderDashboard();

    expect(await screen.findByRole("heading", { name: "testuser" })).not.toBeNull();
    expect(screen.queryByText("Let's get you set up")).toBeNull();
  });

  it("shows a checkmark for a verified email", async () => {
    mockSignedInUser(
      makeUser({ createdAt: minutesAgo(1), emailConfirmedAt: minutesAgo(1) }),
    );
    renderDashboard();

    expect(await screen.findByText("Let's get you set up")).not.toBeNull();
    expect(screen.getByText("✓")).not.toBeNull();
    expect(screen.queryByText("Resend")).toBeNull();
  });

  it("offers a resend button when the email is not verified", async () => {
    mockSignedInUser(
      makeUser({ createdAt: minutesAgo(1), emailConfirmedAt: null }),
    );
    renderDashboard();

    expect(await screen.findByText("Let's get you set up")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Resend" })).not.toBeNull();
  });
});
