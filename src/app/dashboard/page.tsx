"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import Spinner from "@/components/Spinner";
import { useToast } from "@/components/Toast";
import DashboardNav, { type DashboardTab } from "@/components/DashboardNav";

// Subscription statuses (mirrors Stripe's Subscription.status) that count
// as an active, paid plan. "trialing" is included so trial users also get
// full access while their trial is running.
const PAID_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);
const NEW_USER_WINDOW_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_SECONDS = 60;

type DashboardState = "unverified" | "free" | "pro";

const FEATURES = [
  { name: "Create projects", free: "1 project", pro: "Unlimited projects" },
  { name: "Support", free: "Community support", pro: "Priority support" },
  { name: "Advanced analytics", free: null, pro: "Included" },
];

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatProvider(value: string | undefined): string {
  if (!value) return "Email";
  if (value === "email") return "Email";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function isRecentlyCreated(createdAt: string | undefined): boolean {
  if (!createdAt) return false;

  const createdAtMs = new Date(createdAt).getTime();
  if (Number.isNaN(createdAtMs)) return false;

  const accountAgeMs = Date.now() - createdAtMs;
  return accountAgeMs >= 0 && accountAgeMs <= NEW_USER_WINDOW_MS;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  const [verificationLoading, setVerificationLoading] = useState(false);

  // Seconds left before the resend button works again. Zero means no
  // cooldown is running. One shared timer covers both resend buttons,
  // since they send the same email.
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stop the countdown if the page unmounts mid-cooldown.
  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, []);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_status")
          .eq("id", data.user.id)
          .single();
        setSubscriptionStatus(profile?.subscription_status ?? null);
      }

      setLoading(false);
    });
  }, []);

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setResetLoading(false);
    if (error) showToast(error.message, "error");
    else showToast("Password reset email sent — check your inbox.", "success");
  };

  const startResendCooldown = () => {
    setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
    cooldownTimer.current = setInterval(() => {
      setCooldownSeconds((remaining) => {
        if (remaining <= 1) {
          if (cooldownTimer.current) clearInterval(cooldownTimer.current);
          return 0;
        }
        return remaining - 1;
      });
    }, 1000);
  };

  const handleResendVerification = async () => {
    if (!user?.email || cooldownSeconds > 0) return;
    setVerificationLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
    });
    setVerificationLoading(false);
    if (error) showToast(error.message, "error");
    else {
      showToast("Verification email sent — check your inbox.", "success");
      // Only a sent email starts the cooldown. A failed send leaves the
      // button usable so the user can try again right away.
      startResendCooldown();
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setDeleteLoading(false);
      showToast("Your session has expired. Please log in again.", "error");
      return;
    }

    const response = await fetch("/api/account/delete", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    const result = await response.json().catch(() => ({}));
    setDeleteLoading(false);

    if (!response.ok) {
      showToast(result.error || "Failed to delete account.", "error");
      return;
    }

    await supabase.auth.signOut();
    showToast("Your account has been deleted.", "success");
    router.push("/");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-16">
        <Spinner className="h-6 w-6 text-primary" />
      </div>
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
  const isNewUser = isRecentlyCreated(user.created_at);
  const isPaid = Boolean(
    subscriptionStatus && PAID_SUBSCRIPTION_STATUSES.has(subscriptionStatus)
  );

  const dashboardState: DashboardState = !isEmailVerified
    ? "unverified"
    : isPaid
    ? "pro"
    : "free";

  const badgesByState: Record<DashboardState, { label: string; className: string }> = {
    unverified: {
      label: "Unverified",
      className:
        "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    },
    free: {
      label: "Free plan",
      className:
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    },
    pro: {
      label: "Pro",
      className:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    },
  };
  const badge = badgesByState[dashboardState];

  const accountCreated = formatDateTime(user.created_at);
  const lastSignIn = formatDateTime(user.last_sign_in_at);
  const authProvider = formatProvider(user.app_metadata?.provider as string | undefined);

  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 min-h-[80vh]">
      {isNewUser && (
        <section
          aria-labelledby="welcome-heading"
          className="w-full max-w-sm mb-6 rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 px-5 py-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Welcome aboard
          </p>
          <h1 id="welcome-heading" className="mt-1 text-xl font-bold">
            Let&apos;s get you set up
          </h1>
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-3 rounded-xl bg-white/80 dark:bg-gray-900/60 px-3 py-2.5 text-sm">
              <span aria-hidden="true" className="text-lg">{isEmailVerified ? "✓" : "○"}</span>
              <span className="font-medium">Verify email</span>
              {!isEmailVerified && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={verificationLoading || cooldownSeconds > 0}
                  className="ms-auto text-xs font-medium text-primary hover:underline disabled:opacity-60"
                >
                  {verificationLoading
                    ? "Sending..."
                    : cooldownSeconds > 0
                      ? `Resend in ${cooldownSeconds}s`
                      : "Resend"}
                </button>
              )}
            </div>
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-xl bg-white/80 dark:bg-gray-900/60 px-3 py-2.5 text-sm font-medium hover:bg-white dark:hover:bg-gray-900"
            >
              <span aria-hidden="true" className="text-lg">○</span>
              Complete your profile
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-3 rounded-xl bg-white/80 dark:bg-gray-900/60 px-3 py-2.5 text-sm font-medium hover:bg-white dark:hover:bg-gray-900"
            >
              <span aria-hidden="true" className="text-lg">○</span>
              Explore pricing
            </Link>
          </div>
        </section>
      )}

      {dashboardState === "unverified" && (
        <div
          role="alert"
          className="w-full max-w-sm mb-4 flex flex-col gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl px-4 py-3 text-sm"
        >
          <p className="text-amber-800 dark:text-amber-300">
            Please verify your email address to unlock all features.
          </p>
          <button
            onClick={handleResendVerification}
            disabled={verificationLoading || cooldownSeconds > 0}
            className="self-start flex items-center gap-2 text-amber-800 dark:text-amber-300 font-medium underline underline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {verificationLoading ? (
              <>
                <Spinner /> Sending...
              </>
            ) : cooldownSeconds > 0 ? (
              `Resend verification email in ${cooldownSeconds}s`
            ) : (
              "Resend verification email"
            )}
          </button>
        </div>
      )}

      <DashboardNav activeTab={activeTab} onChange={setActiveTab} />

      <div className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-semibold mb-4">
            {initial}
          </div>
          <h1 className="text-xl font-bold">{username}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
          <span
            className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>

        {activeTab === "overview" && (
          <>
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="text-gray-500">Username</span>
                <span className="font-medium">{username}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="text-gray-500">Email</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="text-gray-500">Account created</span>
                <span className="font-medium">{accountCreated}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="text-gray-500">Last sign-in</span>
                <span className="font-medium">{lastSignIn}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Signed in with</span>
                <span className="font-medium">{authProvider}</span>
              </div>
            </div>

            <div className="relative mb-2">
              <ul
                className={`flex flex-col gap-2 text-sm rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3 ${
                  dashboardState === "unverified" ? "blur-sm select-none pointer-events-none" : ""
                }`}
                aria-hidden={dashboardState === "unverified"}
              >
                {FEATURES.map((feature) => {
                  const unlocked = dashboardState === "pro" || feature.free;
                  return (
                    <li key={feature.name} className="flex items-center justify-between gap-2">
                      <span className={unlocked ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-600"}>
                        {feature.name}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          unlocked
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-gray-400 dark:text-gray-600"
                        }`}
                      >
                        {dashboardState === "pro"
                          ? feature.pro
                          : feature.free ?? "Pro only"}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {dashboardState === "unverified" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-4">
                  <svg
                    className="h-5 w-5 text-gray-500 dark:text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <rect x="4" y="10" width="16" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Verify your email to unlock features
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "billing" && (
          <div className="flex flex-col gap-3 mb-2">
            <div
              className={`rounded-xl border px-4 py-3 ${
                dashboardState === "pro"
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900"
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Current plan</span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {dashboardState === "pro"
                  ? "You have full access to all Pro features."
                  : "You're on the Free plan. Upgrade for unlimited projects and priority support."}
              </p>
              {dashboardState !== "pro" && (
                <Link
                  href="/pricing"
                  className="mt-3 flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-white rounded-lg px-3 py-2.5 text-sm font-medium transition shadow-sm shadow-primary/30"
                >
                  Upgrade
                </Link>
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="flex flex-col gap-6">
            <button
              onClick={handleResetPassword}
              disabled={resetLoading}
              className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg px-3 py-2.5 text-sm font-medium transition shadow-sm shadow-primary/30"
            >
              {resetLoading ? (
                <>
                  <Spinner /> Sending...
                </>
              ) : (
                "Reset Password"
              )}
            </button>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
              {!confirmingDelete ? (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="w-full text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 transition"
                >
                  Delete Account
                </button>
              ) : (
                <div
                  role="alertdialog"
                  aria-label="Confirm account deletion"
                  className="flex flex-col gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3"
                >
                  <p className="text-sm text-red-800 dark:text-red-300">
                    This will permanently delete your account and all of your
                    data. This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading}
                      className="flex items-center justify-center gap-2 flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg px-3 py-2 text-sm font-medium transition"
                    >
                      {deleteLoading ? (
                        <>
                          <Spinner /> Deleting...
                        </>
                      ) : (
                        "Yes, delete my account"
                      )}
                    </button>
                    <button
                      onClick={() => setConfirmingDelete(false)}
                      disabled={deleteLoading}
                      className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
