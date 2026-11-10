import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { User } from "@supabase/supabase-js";

import ProfilePage from "./page";
import { supabase } from "@/lib/supabaseClient";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { ToastProvider } from "@/components/Toast";

// The page talks to Supabase on mount (current user) and on save
// (updateUser + profiles update), so the client is faked here and no
// network is touched. The avatar upload path is not exercised.
vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      updateUser: vi.fn(),
    },
    from: vi.fn(),
    storage: {
      from: () => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
      }),
    },
  },
}));

function fakeUser(): User {
  return {
    id: "user-1",
    email: "test@example.com",
    user_metadata: { username: "testuser" },
  } as unknown as User;
}

function mockSignedIn() {
  (supabase.auth.getUser as Mock).mockResolvedValue({
    data: { user: fakeUser() },
  });
  (supabase.auth.updateUser as Mock).mockResolvedValue({ error: null });
  (supabase.from as Mock).mockReturnValue({
    update: () => ({
      eq: () => Promise.resolve({ error: null }),
    }),
  });
}

// The username form (merged from main) calls useToast, so the page
// needs a ToastProvider around it, like the dashboard tests do.
function renderPage() {
  return render(
    <ToastProvider>
      <LanguageProvider>
        <ProfilePage />
      </LanguageProvider>
    </ToastProvider>,
  );
}

describe("ProfilePage i18n", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders the profile form in English by default", async () => {
    mockSignedIn();
    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Profile" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Manage your account details.")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).toBeInTheDocument();
  });

  it("renders the profile form in Urdu when the locale is ur", async () => {
    window.localStorage.setItem("locale", "ur");
    mockSignedIn();
    renderPage();

    expect(
      await screen.findByRole("heading", { name: "پروفائل" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("اپنے اکاؤنٹ کی تفصیلات کا انتظام کریں۔"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "تبدیلیاں محفوظ کریں" }),
    ).toBeInTheDocument();
  });

  it("shows the translated confirmation after saving a new email", async () => {
    mockSignedIn();
    renderPage();

    const input = await screen.findByDisplayValue("test@example.com");
    fireEvent.change(input, { target: { value: "new@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(
      await screen.findByText(
        "Check your inbox to confirm the new email address.",
      ),
    ).toBeInTheDocument();
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      email: "new@example.com",
    });
  });
});
