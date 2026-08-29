import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// POST /api/account/delete
// Header: Authorization: Bearer <access_token>
// Permanently deletes the currently authenticated user's account.
//
// This must run server-side with the service role key: deleting a user
// from Supabase Auth (and their profile row) requires elevated
// permissions that the browser client doesn't have. The caller's identity
// is verified from their own access token rather than trusting a userId
// from the request body, so a user can only ever delete their own account.
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success, resetAt } = rateLimit(`account-delete:${ip}`, {
    limit: 5,
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

    // Best-effort: remove the profile row up front. The schema also has
    // `profiles.id references auth.users on delete cascade`, so this is
    // a safety net rather than the only thing removing it.
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (profileError) {
      console.error("Failed to delete profile row:", profileError.message);
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete account";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
