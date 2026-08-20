import Stripe from "stripe";

// Server-only: never import this file from a "use client" component.
// STRIPE_SECRET_KEY must stay out of NEXT_PUBLIC_* env vars.
// apiVersion is intentionally omitted so Stripe uses the account's default
// (pinned) API version instead of a version this SDK release may not know.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});
