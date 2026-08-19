"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import PasswordInput from "@/components/PasswordInput";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSuccess(true);
  };

  const handleGoogleSignup = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="flex items-center justify-center px-4 py-16 min-h-[80vh]">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 p-8">
        <h1 className="text-2xl font-bold mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-6">
          Join in a few seconds — it&apos;s free.
        </p>
        {success ? (
          <p className="text-green-600 text-sm bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-lg px-3 py-3">
            Check your email to confirm your account.
          </p>
        ) : (
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Username
              </label>
              <input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                minLength={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Password
              </label>
              <PasswordInput
                value={password}
                onChange={setPassword}
                placeholder="Create a strong password"
                autoComplete="new-password"
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg px-3 py-2.5 text-sm font-medium transition shadow-sm shadow-primary/30"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>
        )}
        {!success && (
          <>
            <div className="flex items-center gap-3 my-5">
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
              <span className="text-xs text-gray-400">or</span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            </div>
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.61z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 0 0 9 18z" />
                <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 3.03l3.05-2.33z" />
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.97l3.05 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
              </svg>
              Continue with Google
            </button>
          </>
        )}
        <p className="text-sm text-gray-500 mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
