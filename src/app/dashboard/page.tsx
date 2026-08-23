"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setResetLoading(true);
    setResetError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setResetLoading(false);
    if (error) setResetError(error.message);
    else setResetSent(true);
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;
    setVerificationLoading(true);
    setVerificationError(null);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
    });
    setVerificationLoading(false);
    if (error) setVerificationError(error.message);
    else setVerificationSent(true);
  };

  if (loading)
    return (
      <p role="status" className="text-center py-16">
        Loading...
      </p>
    );

  if (!user)
    return (
      <p className="text-center py-16">
        You must be logged in to view this page.
      </p>
    );

  const username = (user.user_metadata?.username as string) || "—";
  const initial = (username !== "—" ? username : user.email || "?")
    .charAt(0)
    .toUpperCase();

  const isEmailVerified = Boolean(user.email_confirmed_at);

  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 min-h-[80vh]">
      {!isEmailVerified && (
        <div
          role="alert"
          className="w-full max-w-sm mb-4 flex flex-col gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl px-4 py-3 text-sm"
        >
          <p className="text-amber-800 dark:text-amber-300">
            {verificationSent
              ? "Verification email sent — check your inbox."
              : "Please verify your email address to unlock all features."}
          </p>
          {!verificationSent && (
            <button
              onClick={handleResendVerification}
              disabled={verificationLoading}
              className="self-start text-amber-800 dark:text-amber-300 font-medium underline underline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {verificationLoading ? "Sending..." : "Resend verification email"}
            </button>
          )}
          {verificationError && (
            <p role="alert" className="text-red-500">
              {verificationError}
            </p>
          )}
        </div>
      )}
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-semibold mb-4">
            {initial}
          </div>
          <h1 className="text-xl font-bold">{username}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          <div className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
            <span className="text-gray-500">Username</span>
            <span className="font-medium">{username}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
        </div>

        {resetSent ? (
          <p
            role="status"
            className="text-green-600 text-sm bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-lg px-3 py-2 text-center"
          >
            Password reset email sent — check your inbox.
          </p>
        ) : (
          <button
            onClick={handleResetPassword}
            disabled={resetLoading}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg px-3 py-2.5 text-sm font-medium transition shadow-sm shadow-primary/30"
          >
            {resetLoading ? "Sending..." : "Reset Password"}
          </button>
        )}
        {resetError && (
          <p role="alert" className="text-red-500 text-sm mt-3 text-center">
            {resetError}
          </p>
        )}
      </div>
    </div>
  );
}
