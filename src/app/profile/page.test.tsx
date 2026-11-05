import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import type { User } from "@supabase/supabase-js";
import ProfilePage from "./page";
import { ToastProvider } from "@/components/Toast";
import { supabase } from "@/lib/supabaseClient";

// The profile page reads its user from Supabase, so the tests stand in a
// fake user instead of a real session. Only the fields the page reads
// are filled in.
function makeUser(username: string): User {
  return {
    app_metadata: { provider: "email" },
    aud: "authenticated",
    created_at: "2026-11-05T00:00:00Z",
    email: "test@example.com",
    email_confirmed_at: "2026-11-05T00:00:00Z",
    id: "user-1",
    last_sign_in_at: "2026-11-05T00:00:00Z",
    user_metadata: { username },
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
    update: () => ({
      eq: async () => ({ data: null, error: null }),
    }),
  });
}

vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      updateUser: vi.fn(),
      resend: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
    from: vi.fn(),
    storage: { from: vi.fn() },
  },
}));

async function renderProfile() {
  render(
    <ToastProvider>
      <ProfilePage />
    </ToastProvider>,
  );
  // Wait for the page itself so "absent" means loaded, not loading.
  return screen.findByRole("heading", { name: "Profile" });
}

describe("editable username", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the current username and keeps Save disabled while unchanged", async () => {
    mockSignedInUser(makeUser("oldname"));
    (supabase.auth.updateUser as Mock).mockResolvedValue({ data: {}, error: null });
    await renderProfile();

    const input = screen.getByLabelText("Username");
    expect(input).toHaveValue("oldname");
    expect(
      screen.getByRole("button", { name: "Save username" }),
    ).toBeDisabled();
  });

  it("saves a new username and shows a success toast", async () => {
    mockSignedInUser(makeUser("oldname"));
    (supabase.auth.updateUser as Mock).mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();
    await renderProfile();

    await user.clear(screen.getByLabelText("Username"));
    await user.type(screen.getByLabelText("Username"), "newname");
    await user.click(screen.getByRole("button", { name: "Save username" }));

    expect(supabase.auth.updateUser as Mock).toHaveBeenCalledWith({
      data: { username: "newname" },
    });
    expect(await screen.findByText("Username updated.")).not.toBeNull();
  });

  it("rejects a username shorter than 3 characters", async () => {
    mockSignedInUser(makeUser("oldname"));
    (supabase.auth.updateUser as Mock).mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();
    await renderProfile();

    await user.clear(screen.getByLabelText("Username"));
    await user.type(screen.getByLabelText("Username"), "ab");
    await user.click(screen.getByRole("button", { name: "Save username" }));

    expect(
      await screen.findByText("Username must be at least 3 characters"),
    ).not.toBeNull();
    expect(supabase.auth.updateUser as Mock).not.toHaveBeenCalled();
  });

  it("shows an error toast when saving fails", async () => {
    mockSignedInUser(makeUser("oldname"));
    (supabase.auth.updateUser as Mock).mockResolvedValue({
      data: {},
      error: { message: "Could not update username" },
    });
    const user = userEvent.setup();
    await renderProfile();

    await user.clear(screen.getByLabelText("Username"));
    await user.type(screen.getByLabelText("Username"), "newname");
    await user.click(screen.getByRole("button", { name: "Save username" }));

    expect(
      await screen.findByText("Could not update username"),
    ).not.toBeNull();
  });
});
