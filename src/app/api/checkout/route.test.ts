import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/stripe", () => ({ getStripe: vi.fn() }));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin: vi.fn() }));
vi.mock("@/lib/rateLimit", () => ({
  rateLimit: vi.fn(() => ({
    success: true,
    limit: 10,
    remaining: 9,
    resetAt: Date.now() + 60_000,
  })),
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

import { POST } from "./route";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const sessionUser = { id: "session-user-id", email: "real@example.com" };

// The fakes only implement the methods the route actually calls, so they
// are cast to the real client types at the point they are handed over.
function makeStripe() {
  const create = vi.fn(async () => ({
    url: "https://checkout.stripe.test/session-url",
  }));
  return { create, client: { checkout: { sessions: { create } } } };
}

function makeAdmin(getUserResult: unknown) {
  const single = vi.fn(async () => ({ data: null, error: null }));
  const eq = vi.fn(() => ({ single }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  const getUser = vi.fn(async () => getUserResult);
  const admin = { auth: { getUser }, from };
  return { admin, getUser, eq };
}

function checkoutRequest(body: unknown, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return new Request("http://localhost:3000/api/checkout", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("POST /api/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no authorization header is sent", async () => {
    const res = await POST(checkoutRequest({ priceId: "price_123" }));

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
    // No work happens for an unauthenticated caller.
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
    expect(getStripe).not.toHaveBeenCalled();
  });

  it("returns 401 when the token is invalid", async () => {
    const { admin } = makeAdmin({
      data: { user: null },
      error: { message: "Invalid token" },
    });
    vi.mocked(getSupabaseAdmin).mockReturnValue(admin as never);

    const res = await POST(
      checkoutRequest({ priceId: "price_123" }, "bad-token")
    );

    expect(res.status).toBe(401);
    expect(getStripe).not.toHaveBeenCalled();
  });

  it("ignores a forged userId in the body and uses the session user", async () => {
    const { admin, eq } = makeAdmin({
      data: { user: sessionUser },
      error: null,
    });
    vi.mocked(getSupabaseAdmin).mockReturnValue(admin as never);
    const { create, client } = makeStripe();
    vi.mocked(getStripe).mockReturnValue(client as never);

    const res = await POST(
      checkoutRequest(
        {
          priceId: "price_123",
          userId: "victim-user-id",
          email: "victim@example.com",
        },
        "good-token"
      )
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      url: "https://checkout.stripe.test/session-url",
    });

    // The profile lookup used the session user, not the forged id.
    expect(eq).toHaveBeenCalledWith("id", "session-user-id");

    // The Stripe session is bound to the session user, not the body.
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        client_reference_id: "session-user-id",
        metadata: { userId: "session-user-id" },
        subscription_data: { metadata: { userId: "session-user-id" } },
        customer_email: "real@example.com",
        line_items: [{ price: "price_123", quantity: 1 }],
      })
    );
  });

  it("returns 400 when priceId is missing", async () => {
    const { admin } = makeAdmin({
      data: { user: sessionUser },
      error: null,
    });
    vi.mocked(getSupabaseAdmin).mockReturnValue(admin as never);

    const res = await POST(checkoutRequest({}, "good-token"));

    expect(res.status).toBe(400);
    expect(getStripe).not.toHaveBeenCalled();
  });

  it("creates a checkout session for the session user", async () => {
    const { admin } = makeAdmin({
      data: { user: sessionUser },
      error: null,
    });
    vi.mocked(getSupabaseAdmin).mockReturnValue(admin as never);
    const { create, client } = makeStripe();
    vi.mocked(getStripe).mockReturnValue(client as never);

    const res = await POST(
      checkoutRequest({ priceId: "price_123" }, "good-token")
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      url: "https://checkout.stripe.test/session-url",
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        client_reference_id: "session-user-id",
      })
    );
  });
});
