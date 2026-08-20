import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only: never import this file from a "use client" component or
// expose SUPABASE_SERVICE_ROLE_KEY to the browser. This client bypasses
// Row Level Security, so it's used only for trusted server code such as
// the Stripe webhook handler.
//
// Created lazily (on first use) for the same reason as the Stripe client
// in ./stripe.ts — Next.js evaluates route modules during the build's
// "collect page data" step, and a missing service role key would otherwise
// crash the build itself instead of failing only when the route runs.
let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to use the Supabase admin client."
    );
  }

  adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminClient;
}
