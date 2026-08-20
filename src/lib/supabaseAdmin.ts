import { createClient } from "@supabase/supabase-js";

// Server-only: never import this file from a "use client" component or
// expose SUPABASE_SERVICE_ROLE_KEY to the browser. This client bypasses
// Row Level Security, so it's used only for trusted server code such as
// the Stripe webhook handler.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
