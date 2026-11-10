import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import ThemeToggle from "./ThemeToggle";

beforeEach(() => {
  // Each test gets a clean slate: no stored preference and no leftover
  // "dark" class from a previous test's render.
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
});

describe("ThemeToggle", () => {
  it("renders in light mode by default", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle dark mode/i });
    expect(button).toHaveTextContent("Dark");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("switches to dark mode on click", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle dark mode/i });

    await user.click(button);

    expect(button).toHaveTextContent("Light");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("switches back to light mode on second click", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle dark mode/i });

    await user.click(button);
    await user.click(button);

    expect(button).toHaveTextContent("Dark");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("persists the chosen theme to localStorage when toggled", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle dark mode/i });

    expect(window.localStorage.getItem("theme")).toBe("light");

    await user.click(button);
    expect(window.localStorage.getItem("theme")).toBe("dark");

    await user.click(button);
    expect(window.localStorage.getItem("theme")).toBe("light");
  });

  it("restores dark mode from a previously stored preference", () => {
    window.localStorage.setItem("theme", "dark");

    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle dark mode/i });

    expect(button).toHaveTextContent("Light");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("restores light mode from a previously stored preference", () => {
    window.localStorage.setItem("theme", "light");

    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle dark mode/i });

    expect(button).toHaveTextContent("Dark");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("follows a theme change made in another tab", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle dark mode/i });

    expect(button).toHaveTextContent("Dark");

    // A storage event is how one tab learns another tab changed the theme.
    // fireEvent wraps the dispatch in act() so React flushes the update
    // before the assertions run.
    fireEvent(
      window,
      new StorageEvent("storage", { key: "theme", newValue: "dark" }),
    );

    expect(button).toHaveTextContent("Light");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    fireEvent(
      window,
      new StorageEvent("storage", { key: "theme", newValue: "light" }),
    );

    expect(button).toHaveTextContent("Dark");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("ignores storage events for other keys", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle dark mode/i });

    fireEvent(
      window,
      new StorageEvent("storage", { key: "locale", newValue: "dark" }),
    );

    expect(button).toHaveTextContent("Dark");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
