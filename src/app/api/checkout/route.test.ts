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

// Sends a raw body string, so the test can send malformed JSON.
function rawCheckoutRequest(rawBody: string, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return new Request("http://localhost:3000/api/checkout", {
    method: "POST",
    headers,
    body: rawBody,
  });
}

describe("POST /api/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // The route only allows the price the app is configured to sell.
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID = "price_123";
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

  it("returns 400 when priceId is not the configured plan price", async () => {
    const { admin } = makeAdmin({
      data: { user: sessionUser },
      error: null,
    });
    vi.mocked(getSupabaseAdmin).mockReturnValue(admin as never);
    const { create, client } = makeStripe();
    vi.mocked(getStripe).mockReturnValue(client as never);

    const res = await POST(
      checkoutRequest({ priceId: "price_someone_elses_plan" }, "good-token")
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
    // No Stripe session is created for a price we do not sell.
    expect(create).not.toHaveBeenCalled();
  });

  it("returns 400 when the body is not valid JSON", async () => {
    const { admin } = makeAdmin({
      data: { user: sessionUser },
      error: null,
    });
    vi.mocked(getSupabaseAdmin).mockReturnValue(admin as never);

    const res = await POST(rawCheckoutRequest("{not json", "good-token"));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual(
      expect.objectContaining({ error: "Invalid JSON body" })
    );
    expect(getStripe).not.toHaveBeenCalled();
  });

  it("returns a generic 500 without leaking internals when Stripe fails", async () => {
    const { admin } = makeAdmin({
      data: { user: sessionUser },
      error: null,
    });
    vi.mocked(getSupabaseAdmin).mockReturnValue(admin as never);
    const create = vi.fn(async () => {
      throw new Error("Stripe secret key is wrong");
    });
    const client = { checkout: { sessions: { create } } };
    vi.mocked(getStripe).mockReturnValue(client as never);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await POST(
      checkoutRequest({ priceId: "price_123" }, "good-token")
    );

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Checkout failed" });
    errorSpy.mockRestore();
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
