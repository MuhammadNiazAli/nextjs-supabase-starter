import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// POST /api/checkout
// Header: Authorization: Bearer <access_token>
// Body: { priceId: string }
// Creates a Stripe Checkout Session for a subscription and returns the URL
// the client should redirect to.
//
// The caller is identified from their own verified access token, never
// from a userId in the request body — trusting the body would let anyone
// bind a checkout to another user's profile, because the Stripe webhook
// syncs subscription state from the session metadata's userId.
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success, resetAt } = rateLimit(`checkout:${ip}`, {
    limit: 10,
    windowMs: 60_000,
  });

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((resetAt - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json(
      { error: "Missing or invalid authorization header" },
      { status: 401 }
    );
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    // Read the body. A malformed body is the caller's mistake, not a
    // server error, so it gets a 400 instead of falling into the 500.
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const priceId = (body as { priceId?: unknown } | null)?.priceId;

    if (typeof priceId !== "string" || priceId === "") {
      return NextResponse.json(
        { error: "priceId is required" },
        { status: 400 }
      );
    }

    // Only the price the app is configured to sell can be checked out.
    // The body is client-supplied, so any other price is rejected here
    // instead of letting a caller start checkout with any price in the
    // Stripe account. Without a configured price there is nothing valid
    // to buy.
    const allowedPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
    if (!allowedPriceId || priceId !== allowedPriceId) {
      return NextResponse.json(
        { error: "priceId is not a valid plan price" },
        { status: 400 }
      );
    }

    // userId and email come from the verified session, never the body.
    const userId = user.id;
    const email = user.email ?? undefined;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const stripe = getStripe();

    // Reuse an existing Stripe customer for this user if we already have
    // one on file, otherwise let Checkout create one.
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: profile?.stripe_customer_id || undefined,
      customer_email: profile?.stripe_customer_id ? undefined : email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/dashboard?checkout=success`,
      cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
      client_reference_id: userId,
      metadata: { userId },
      subscription_data: { metadata: { userId } },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    // Log the real error server-side, but never send internal details
    // back to the caller.
    console.error("Checkout failed:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
