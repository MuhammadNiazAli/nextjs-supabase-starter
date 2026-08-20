"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [savingEmail, setSavingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setEmail(data.user?.email ?? "");
      setAvatarUrl((data.user?.user_metadata?.avatar_url as string) ?? null);
      setLoading(false);
    });
  }, []);

  const handleEmailSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setEmailError(null);
    setEmailMessage(null);
    setSavingEmail(true);

    const { error } = await supabase.auth.updateUser({ email });
    setSavingEmail(false);

    if (error) {
      setEmailError(error.message);
      return;
    }

    await supabase.from("profiles").update({ email }).eq("id", user.id);
    setEmailMessage("Check your inbox to confirm the new email address.");
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setAvatarError(null);

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Image must be smaller than 2MB.");
      return;
    }

    setUploading(true);

    const ext = file.name.split(".").pop() || "png";
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (uploadError) {
      setUploading(false);
      setAvatarError(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);

    // Bust the cache so the new avatar shows immediately even though the
    // path is the same as before.
    const freshUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: freshUrl },
    });

    if (updateError) {
      setUploading(false);
      setAvatarError(updateError.message);
      return;
    }

    await supabase
      .from("profiles")
      .update({ avatar_url: freshUrl })
      .eq("id", user.id);

    setAvatarUrl(freshUrl);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (loading) return <p className="text-center py-16">Loading...</p>;

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

  return (
    <div className="flex items-center justify-center px-4 py-16 min-h-[80vh]">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 p-8">
        <h1 className="text-2xl font-bold mb-1">Profile</h1>
        <p className="text-sm text-gray-500 mb-6">
          Manage your account details.
        </p>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative w-20 h-20 mb-3">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Profile avatar"
                className="w-20 h-20 rounded-full object-cover border border-gray-200 dark:border-gray-800"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-semibold">
                {initial}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white text-xs">
                ...
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-xs font-medium text-primary hover:underline disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Change photo"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          {avatarError && (
            <p className="text-red-500 text-xs mt-2">{avatarError}</p>
          )}
        </div>

        <form onSubmit={handleEmailSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
              required
            />
          </div>

          {emailMessage && (
            <p className="text-green-600 text-sm bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-lg px-3 py-2">
              {emailMessage}
            </p>
          )}
          {emailError && (
            <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
              {emailError}
            </p>
          )}

          <button
            type="submit"
            disabled={savingEmail || email === user.email}
            className="bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg px-3 py-2.5 text-sm font-medium transition shadow-sm shadow-primary/30"
          >
            {savingEmail ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
