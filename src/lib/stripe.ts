import Stripe from "stripe";

// Server-only: never import this file from a "use client" component.
// STRIPE_SECRET_KEY must stay out of NEXT_PUBLIC_* env vars.
//
// The client is created lazily (on first use) instead of at module load
// time. Next.js executes route modules during the build's "collect page
// data" step, and constructing the Stripe SDK with a missing/empty key
// throws immediately — which would fail the build for anyone (including
// contributors and CI) who hasn't configured Stripe yet. Lazy init means
// the build always succeeds; the error only surfaces if a request actually
// reaches a route that calls getStripe() without the key configured.
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to your environment variables to use Stripe billing."
    );
  }

  // apiVersion is intentionally omitted so Stripe uses the account's default
  // (pinned) API version instead of a version this SDK release may not know.
  stripeClient = new Stripe(secretKey, { typescript: true });
  return stripeClient;
}
