import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReducedMotionToggle from "./ReducedMotionToggle";

beforeEach(() => {
  // Each test gets a clean slate: no stored preference and no leftover
  // "reduce-motion" class from a previous test's render.
  window.localStorage.clear();
  document.documentElement.classList.remove("reduce-motion");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// The state label ("Motion on" / "Motion reduced") sits next to the
// switch, not inside it, so it is found by its text, not by role.
function stateLabelText(): string {
  const reduced = screen.queryByText(/motion reduced/i);
  if (reduced) return "reduced";
  const on = screen.queryByText(/motion on/i);
  if (on) return "on";
  throw new Error("No motion state label found");
}

describe("ReducedMotionToggle", () => {
  it("renders with full motion by default", () => {
    render(<ReducedMotionToggle />);
    const toggle = screen.getByRole("switch", { name: /toggle reduce motion/i });
    expect(stateLabelText()).toBe("on");
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(false);
  });

  it("switches to reduced motion on click", async () => {
    const user = userEvent.setup();
    render(<ReducedMotionToggle />);
    const toggle = screen.getByRole("switch", { name: /toggle reduce motion/i });

    await user.click(toggle);

    expect(stateLabelText()).toBe("reduced");
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(true);
  });

  it("switches back to full motion on second click", async () => {
    const user = userEvent.setup();
    render(<ReducedMotionToggle />);
    const toggle = screen.getByRole("switch", { name: /toggle reduce motion/i });

    await user.click(toggle);
    await user.click(toggle);

    expect(stateLabelText()).toBe("on");
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(false);
  });

  it("persists the chosen setting to localStorage when toggled", async () => {
    const user = userEvent.setup();
    render(<ReducedMotionToggle />);
    const toggle = screen.getByRole("switch", { name: /toggle reduce motion/i });

    expect(window.localStorage.getItem("reduce-motion")).toBe("off");

    await user.click(toggle);
    expect(window.localStorage.getItem("reduce-motion")).toBe("on");

    await user.click(toggle);
    expect(window.localStorage.getItem("reduce-motion")).toBe("off");
  });

  it("restores reduced motion from a previously stored preference", () => {
    window.localStorage.setItem("reduce-motion", "on");

    render(<ReducedMotionToggle />);
    const toggle = screen.getByRole("switch", { name: /toggle reduce motion/i });

    expect(stateLabelText()).toBe("reduced");
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(true);
  });

  it("restores full motion from a previously stored preference", () => {
    window.localStorage.setItem("reduce-motion", "off");

    render(<ReducedMotionToggle />);
    const toggle = screen.getByRole("switch", { name: /toggle reduce motion/i });

    expect(stateLabelText()).toBe("on");
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(false);
  });

  it("follows the operating system setting when nothing is stored", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));

    render(<ReducedMotionToggle />);
    const toggle = screen.getByRole("switch", { name: /toggle reduce motion/i });

    expect(stateLabelText()).toBe("reduced");
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(true);
  });

  it("follows a setting change made in another tab", () => {
    render(<ReducedMotionToggle />);
    const toggle = screen.getByRole("switch", { name: /toggle reduce motion/i });

    expect(stateLabelText()).toBe("on");

    // A storage event is how one tab learns another tab changed the setting.
    // fireEvent wraps the dispatch in act() so React flushes the update
    // before the assertions run.
    fireEvent(
      window,
      new StorageEvent("storage", { key: "reduce-motion", newValue: "on" }),
    );

    expect(stateLabelText()).toBe("reduced");
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(true);

    fireEvent(
      window,
      new StorageEvent("storage", { key: "reduce-motion", newValue: "off" }),
    );

    expect(stateLabelText()).toBe("on");
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(false);
  });

  it("ignores storage events for other keys", () => {
    render(<ReducedMotionToggle />);
    const toggle = screen.getByRole("switch", { name: /toggle reduce motion/i });

    fireEvent(
      window,
      new StorageEvent("storage", { key: "theme", newValue: "on" }),
    );

    expect(stateLabelText()).toBe("on");
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(false);
  });
});
