"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { TOAST_SOUND_STORAGE_KEY } from "@/lib/sound";

function readStoredToastSound(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    // Sounds stay off unless the user explicitly turned them on.
    return window.localStorage.getItem(TOAST_SOUND_STORAGE_KEY) === "on";
  } catch {
    // localStorage can be unavailable (privacy mode, SSR, etc.) - ignore.
  }

  return false;
}

export default function ToastSoundToggle() {
  const { t } = useLanguage();
  // Starts off so the first client render matches what the server
  // rendered. The stored setting is read after mount (below) — reading
  // it during render would hydrate "on" over the server's "off" and
  // make React throw the server HTML away.
  const [soundOn, setSoundOn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSoundOn(readStoredToastSound());
    setMounted(true);
  }, []);

  useEffect(() => {
    // Don't write before mount: the stored value was just read, and
    // writing the initial "off" here would erase a stored "on".
    if (!mounted) return;

    try {
      window.localStorage.setItem(
        TOAST_SOUND_STORAGE_KEY,
        soundOn ? "on" : "off"
      );
    } catch {
      // Ignore write errors (e.g. storage disabled/full).
    }
  }, [soundOn, mounted]);

  // Keep tabs in sync: the storage event fires in every OTHER tab when
  // one tab changes the setting, so this tab follows along live. It never
  // fires in the tab that made the change, so there is no feedback loop.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== TOAST_SOUND_STORAGE_KEY) return;
      if (event.newValue === "on") setSoundOn(true);
      if (event.newValue === "off") setSoundOn(false);
      // Any other value (for example the key being cleared) is ignored.
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <button
      onClick={() => setSoundOn((prev) => !prev)}
      className="text-sm px-3 py-1 rounded border border-gray-300 dark:border-gray-700"
      aria-label={t("sound.toggleLabel")}
      aria-pressed={soundOn}
    >
      {soundOn ? t("sound.on") : t("sound.off")}
    </button>
  );
}
