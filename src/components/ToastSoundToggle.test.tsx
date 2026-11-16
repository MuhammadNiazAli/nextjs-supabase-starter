import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ToastSoundToggle from "./ToastSoundToggle";
import { TOAST_SOUND_STORAGE_KEY } from "@/lib/sound";

beforeEach(() => {
  // Each test gets a clean slate: no stored preference.
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ToastSoundToggle", () => {
  it("renders with sounds off by default", () => {
    render(<ToastSoundToggle />);
    const button = screen.getByRole("button", { name: /toggle toast sounds/i });
    expect(button).toHaveTextContent("Toast sounds off");
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("switches sounds on with a click", async () => {
    const user = userEvent.setup();
    render(<ToastSoundToggle />);
    const button = screen.getByRole("button", { name: /toggle toast sounds/i });

    await user.click(button);

    expect(button).toHaveTextContent("Toast sounds on");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("switches back to sounds off on a second click", async () => {
    const user = userEvent.setup();
    render(<ToastSoundToggle />);
    const button = screen.getByRole("button", { name: /toggle toast sounds/i });

    await user.click(button);
    await user.click(button);

    expect(button).toHaveTextContent("Toast sounds off");
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("persists the chosen setting to localStorage when toggled", async () => {
    const user = userEvent.setup();
    render(<ToastSoundToggle />);
    const button = screen.getByRole("button", { name: /toggle toast sounds/i });

    // Mount writes the current value (the default "off" here). A stored
    // "on" is read before that write, so the mount write can never
    // erase it — see "restores sounds on" below.
    expect(window.localStorage.getItem(TOAST_SOUND_STORAGE_KEY)).toBe("off");

    await user.click(button);
    expect(window.localStorage.getItem(TOAST_SOUND_STORAGE_KEY)).toBe("on");

    await user.click(button);
    expect(window.localStorage.getItem(TOAST_SOUND_STORAGE_KEY)).toBe("off");
  });

  it("restores sounds on from a previously stored preference", () => {
    window.localStorage.setItem(TOAST_SOUND_STORAGE_KEY, "on");

    render(<ToastSoundToggle />);
    const button = screen.getByRole("button", { name: /toggle toast sounds/i });

    expect(button).toHaveTextContent("Toast sounds on");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("restores sounds off from a previously stored preference", () => {
    window.localStorage.setItem(TOAST_SOUND_STORAGE_KEY, "off");

    render(<ToastSoundToggle />);
    const button = screen.getByRole("button", { name: /toggle toast sounds/i });

    expect(button).toHaveTextContent("Toast sounds off");
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("follows a setting change made in another tab", () => {
    render(<ToastSoundToggle />);
    const button = screen.getByRole("button", { name: /toggle toast sounds/i });

    expect(button).toHaveTextContent("Toast sounds off");

    // A storage event is how one tab learns another tab changed the setting.
    // fireEvent wraps the dispatch in act() so React flushes the update
    // before the assertions run.
    fireEvent(
      window,
      new StorageEvent("storage", {
        key: TOAST_SOUND_STORAGE_KEY,
        newValue: "on",
      }),
    );

    expect(button).toHaveTextContent("Toast sounds on");

    fireEvent(
      window,
      new StorageEvent("storage", {
        key: TOAST_SOUND_STORAGE_KEY,
        newValue: "off",
      }),
    );

    expect(button).toHaveTextContent("Toast sounds off");
  });

  it("ignores storage events for other keys", () => {
    render(<ToastSoundToggle />);
    const button = screen.getByRole("button", { name: /toggle toast sounds/i });

    fireEvent(
      window,
      new StorageEvent("storage", { key: "theme", newValue: "on" }),
    );

    expect(button).toHaveTextContent("Toast sounds off");
  });
});
