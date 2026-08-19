import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ThemeToggle from "./ThemeToggle";

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
});
