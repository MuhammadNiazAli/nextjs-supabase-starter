import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import type { User } from "@supabase/supabase-js";

import DashboardPage from "./page";
import { supabase } from "@/lib/supabaseClient";
import { ToastProvider } from "@/components/Toast";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

// The page talks to Supabase on mount (current user + subscription
// status), so the client is faked here and no network is touched.
vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      resend: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      getSession: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

function fakeUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    email: "test@example.com",
    email_confirmed_at: "2026-01-01T00:00:00.000Z",
    created_at: "2020-01-01T00:00:00.000Z",
    last_sign_in_at: "2026-11-07T00:00:00.000Z",
    app_metadata: { provider: "email" },
    user_metadata: { username: "testuser" },
    ...overrides,
  } as unknown as User;
}

function mockSignedIn(user: User) {
  (supabase.auth.getUser as Mock).mockResolvedValue({ data: { user } });
  (supabase.from as Mock).mockReturnValue({
    select: () => ({
      eq: () => ({
        single: () =>
          Promise.resolve({ data: { subscription_status: null } }),
      }),
    }),
  });
}

function renderPage() {
  return render(
    <ToastProvider>
      <LanguageProvider>
        <DashboardPage />
      </LanguageProvider>
    </ToastProvider>,
  );
}

describe("DashboardPage i18n", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders the dashboard in English by default", async () => {
    mockSignedIn(fakeUser());
    renderPage();

    expect(await screen.findByText("Username")).toBeInTheDocument();
    expect(screen.getByText("Account created")).toBeInTheDocument();
    expect(screen.getByText("Free plan")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Billing" })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Account Settings" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Create projects")).toBeInTheDocument();
    expect(screen.getByText("1 project")).toBeInTheDocument();
  });

  it("renders the dashboard in Urdu when the locale is ur", async () => {
    window.localStorage.setItem("locale", "ur");
    mockSignedIn(fakeUser());
    renderPage();

    expect(await screen.findByText("صارف نام")).toBeInTheDocument();
    expect(screen.getByText("مفت پلان")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "جائزہ" })).toBeInTheDocument();
    expect(screen.getByText("پروجیکٹس بنائیں")).toBeInTheDocument();
  });

  it("shows the translated welcome banner for a new user", async () => {
    mockSignedIn(fakeUser({ created_at: new Date().toISOString() }));
    renderPage();

    expect(await screen.findByText("Welcome aboard")).toBeInTheDocument();
    expect(screen.getByText("Let's get you set up")).toBeInTheDocument();
    expect(screen.getByText("Verify email")).toBeInTheDocument();
    expect(screen.getByText("Complete your profile")).toBeInTheDocument();
    expect(screen.getByText("Explore pricing")).toBeInTheDocument();
  });

  it("shows the translated unverified alert for an unverified user", async () => {
    mockSignedIn(fakeUser({ email_confirmed_at: undefined }));
    renderPage();

    expect(
      await screen.findByText(
        "Please verify your email address to unlock all features.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Resend verification email")).toBeInTheDocument();
    expect(screen.getByText("Unverified")).toBeInTheDocument();
  });
});
