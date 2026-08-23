import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// createBrowserClient has the same auth/query API as the plain supabase-js
// client, so nothing else in the app needs to change. The difference is
// that it stores the session in cookies instead of localStorage, which is
// what lets src/middleware.ts read the session on the server and protect
// routes before a page ever renders.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
