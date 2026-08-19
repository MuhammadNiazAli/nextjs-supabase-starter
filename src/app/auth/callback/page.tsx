"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finishLogin = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );
      if (error) {
        setError(error.message);
        return;
      }
      window.location.href = "/dashboard";
    };
    finishLogin();
  }, []);

  return (
    <div className="flex items-center justify-center px-4 py-16 min-h-[80vh]">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 p-8 text-center">
        {error ? (
          <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
            {error}
          </p>
        ) : (
          <p className="text-sm text-gray-500">Signing you in...</p>
        )}
      </div>
    </div>
  );
}
