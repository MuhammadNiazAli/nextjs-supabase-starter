"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PasswordInput from "@/components/PasswordInput";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) setError(error.message);
    else setSuccess(true);
  };

  return (
    <div className="flex items-center justify-center px-4 py-16 min-h-[80vh]">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 p-8">
        <h1 className="text-2xl font-bold mb-1">Set a new password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter a new password for your account.
        </p>
        {success ? (
          <p className="text-green-600 text-sm bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-lg px-3 py-3">
            Password updated. You can now log in with your new password.
          </p>
        ) : (
          <form onSubmit={handleUpdate} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                New Password
              </label>
              <PasswordInput
                value={password}
                onChange={setPassword}
                placeholder="Enter your new password"
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
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
