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

describe("ReducedMotionToggle", () => {
  it("renders with full motion by default", () => {
    render(<ReducedMotionToggle />);
    const button = screen.getByRole("button", { name: /toggle reduce motion/i });
    expect(button).toHaveTextContent("Motion on");
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(false);
  });

  it("switches to reduced motion on click", async () => {
    const user = userEvent.setup();
    render(<ReducedMotionToggle />);
    const button = screen.getByRole("button", { name: /toggle reduce motion/i });

    await user.click(button);

    expect(button).toHaveTextContent("Motion reduced");
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(true);
  });

  it("switches back to full motion on second click", async () => {
    const user = userEvent.setup();
    render(<ReducedMotionToggle />);
    const button = screen.getByRole("button", { name: /toggle reduce motion/i });

    await user.click(button);
    await user.click(button);

    expect(button).toHaveTextContent("Motion on");
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(false);
  });

  it("persists the chosen setting to localStorage when toggled", async () => {
    const user = userEvent.setup();
    render(<ReducedMotionToggle />);
    const button = screen.getByRole("button", { name: /toggle reduce motion/i });

    expect(window.localStorage.getItem("reduce-motion")).toBe("off");

    await user.click(button);
    expect(window.localStorage.getItem("reduce-motion")).toBe("on");

    await user.click(button);
    expect(window.localStorage.getItem("reduce-motion")).toBe("off");
  });

  it("restores reduced motion from a previously stored preference", () => {
    window.localStorage.setItem("reduce-motion", "on");

    render(<ReducedMotionToggle />);
    const button = screen.getByRole("button", { name: /toggle reduce motion/i });

    expect(button).toHaveTextContent("Motion reduced");
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(true);
  });

  it("restores full motion from a previously stored preference", () => {
    window.localStorage.setItem("reduce-motion", "off");

    render(<ReducedMotionToggle />);
    const button = screen.getByRole("button", { name: /toggle reduce motion/i });

    expect(button).toHaveTextContent("Motion on");
    expect(button).toHaveAttribute("aria-pressed", "false");
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
    const button = screen.getByRole("button", { name: /toggle reduce motion/i });

    expect(button).toHaveTextContent("Motion reduced");
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(true);
  });

  it("follows a setting change made in another tab", () => {
    render(<ReducedMotionToggle />);
    const button = screen.getByRole("button", { name: /toggle reduce motion/i });

    expect(button).toHaveTextContent("Motion on");

    // A storage event is how one tab learns another tab changed the setting.
    // fireEvent wraps the dispatch in act() so React flushes the update
    // before the assertions run.
    fireEvent(
      window,
      new StorageEvent("storage", { key: "reduce-motion", newValue: "on" }),
    );

    expect(button).toHaveTextContent("Motion reduced");
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(true);

    fireEvent(
      window,
      new StorageEvent("storage", { key: "reduce-motion", newValue: "off" }),
    );

    expect(button).toHaveTextContent("Motion on");
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(false);
  });

  it("ignores storage events for other keys", () => {
    render(<ReducedMotionToggle />);
    const button = screen.getByRole("button", { name: /toggle reduce motion/i });

    fireEvent(
      window,
      new StorageEvent("storage", { key: "theme", newValue: "on" }),
    );

    expect(button).toHaveTextContent("Motion on");
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(false);
  });
});
