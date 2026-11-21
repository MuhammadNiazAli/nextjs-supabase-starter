import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TOAST_SOUND_STORAGE_KEY } from "./sound";

type MockOscillator = {
  type: string;
  frequency: { value: number };
  connect: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
};

type MockGain = {
  gain: {
    setValueAtTime: ReturnType<typeof vi.fn>;
    exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
  };
  connect: ReturnType<typeof vi.fn>;
};

type MockContext = {
  state: string;
  currentTime: number;
  resume: ReturnType<typeof vi.fn>;
  createOscillator: ReturnType<typeof vi.fn>;
  createGain: ReturnType<typeof vi.fn>;
  destination: object;
};

// The sound module caches its AudioContext, so each test imports a fresh
// copy of the module after stubbing a fresh mock AudioContext.
async function loadSoundModule() {
  vi.resetModules();
  return import("./sound");
}

function stubAudioContext() {
  const oscillator: MockOscillator = {
    type: "",
    frequency: { value: 0 },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
  const gainNode: MockGain = {
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  };
  const context: MockContext = {
    state: "running",
    currentTime: 0,
    resume: vi.fn(),
    createOscillator: vi.fn(() => oscillator),
    createGain: vi.fn(() => gainNode),
    destination: {},
  };
  // A class constructor that returns an object replaces `this` with it.
  // (A vi.fn with an arrow-function implementation is not constructable,
  // so the mock must use a plain function here.)
  const AudioContextMock = vi.fn(function () {
    return context;
  });
  vi.stubGlobal("AudioContext", AudioContextMock);
  return { AudioContextMock, context, oscillator, gainNode };
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("isToastSoundEnabled", () => {
  it("is off when nothing is stored", async () => {
    const { isToastSoundEnabled } = await loadSoundModule();
    expect(isToastSoundEnabled()).toBe(false);
  });

  it("is on only when the stored value is 'on'", async () => {
    const { isToastSoundEnabled } = await loadSoundModule();

    window.localStorage.setItem(TOAST_SOUND_STORAGE_KEY, "on");
    expect(isToastSoundEnabled()).toBe(true);

    window.localStorage.setItem(TOAST_SOUND_STORAGE_KEY, "off");
    expect(isToastSoundEnabled()).toBe(false);
  });
});

describe("playToastSound", () => {
  it("plays nothing when the toggle is off", async () => {
    const { AudioContextMock } = stubAudioContext();
    const { playToastSound } = await loadSoundModule();

    playToastSound("success");
    playToastSound("error");

    expect(AudioContextMock).not.toHaveBeenCalled();
  });

  it("plays nothing when localStorage is empty", async () => {
    const { AudioContextMock } = stubAudioContext();
    const { playToastSound } = await loadSoundModule();

    playToastSound("success");

    expect(AudioContextMock).not.toHaveBeenCalled();
  });

  it("plays a high blip for success when the toggle is on", async () => {
    const { oscillator, gainNode } = stubAudioContext();
    window.localStorage.setItem(TOAST_SOUND_STORAGE_KEY, "on");
    const { playToastSound } = await loadSoundModule();

    playToastSound("success");

    expect(oscillator.type).toBe("sine");
    expect(oscillator.frequency.value).toBe(880);
    expect(oscillator.start).toHaveBeenCalled();
    expect(oscillator.stop).toHaveBeenCalled();
    expect(gainNode.connect).toHaveBeenCalled();
  });

  it("plays a low blip for error when the toggle is on", async () => {
    const { oscillator } = stubAudioContext();
    window.localStorage.setItem(TOAST_SOUND_STORAGE_KEY, "on");
    const { playToastSound } = await loadSoundModule();

    playToastSound("error");

    expect(oscillator.frequency.value).toBe(220);
    expect(oscillator.start).toHaveBeenCalled();
  });

  it("stays silent for info toasts even when the toggle is on", async () => {
    const { AudioContextMock } = stubAudioContext();
    window.localStorage.setItem(TOAST_SOUND_STORAGE_KEY, "on");
    const { playToastSound } = await loadSoundModule();

    playToastSound("info");

    expect(AudioContextMock).not.toHaveBeenCalled();
  });

  it("does not throw when the browser has no AudioContext", async () => {
    window.localStorage.setItem(TOAST_SOUND_STORAGE_KEY, "on");
    const { playToastSound } = await loadSoundModule();

    expect(() => playToastSound("success")).not.toThrow();
  });

  it("resumes a suspended audio context instead of failing", async () => {
    const { context } = stubAudioContext();
    context.state = "suspended";
    context.resume = vi.fn(() => Promise.resolve());
    window.localStorage.setItem(TOAST_SOUND_STORAGE_KEY, "on");
    const { playToastSound } = await loadSoundModule();

    playToastSound("success");

    expect(context.resume).toHaveBeenCalled();
  });

  it("does not surface an error when resume rejects (page navigated away)", async () => {
    const { context } = stubAudioContext();
    context.state = "suspended";
    context.resume = vi.fn(() => Promise.reject(new Error("navigated away")));
    window.localStorage.setItem(TOAST_SOUND_STORAGE_KEY, "on");
    const { playToastSound } = await loadSoundModule();

    expect(() => playToastSound("success")).not.toThrow();
    // Let the rejected promise settle: if the rejection were unhandled,
    // the test runner would report it.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(context.resume).toHaveBeenCalled();
  });
});
