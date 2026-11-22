// Short, quiet blips that play alongside success/error toasts — only
// when the user has turned toast sounds on. Built on the Web Audio API
// so there are no audio files to ship, and every failure is swallowed:
// a toast must never break because sound is unavailable.

export const TOAST_SOUND_STORAGE_KEY = "toast-sound";

type ToastSoundType = "success" | "error";

const SOUND_FREQUENCY_HZ: Record<ToastSoundType, number> = {
  success: 880,
  error: 220,
};

const SOUND_DURATION_SECONDS = 0.12;
const SOUND_VOLUME = 0.05;

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const AudioContextClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioContext || audioContext.state === "closed") {
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

export function isToastSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;

  try {
    return (
      window.localStorage.getItem(TOAST_SOUND_STORAGE_KEY) === "on"
    );
  } catch {
    // localStorage can be unavailable (privacy mode, SSR, etc.).
    return false;
  }
}

export function playToastSound(type: "success" | "error" | "info"): void {
  // Only success and error toasts get a sound, and only when the user
  // opted in. Info toasts stay silent.
  if (type === "info") return;
  if (!isToastSoundEnabled()) return;

  try {
    const context = getAudioContext();
    if (!context) return;

    if (context.state === "suspended") {
      // resume() rejects if the page navigates away before it settles.
      // That rejection is harmless, but an unhandled one logs a console
      // error, so swallow it here instead of letting it surface.
      context.resume().catch(() => {});
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = SOUND_FREQUENCY_HZ[type];

    // Fade the note out so it ends softly instead of clicking off.
    gain.gain.setValueAtTime(SOUND_VOLUME, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + SOUND_DURATION_SECONDS
    );

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + SOUND_DURATION_SECONDS);
  } catch {
    // Sound is a nice-to-have: never let it break the toast.
  }
}
