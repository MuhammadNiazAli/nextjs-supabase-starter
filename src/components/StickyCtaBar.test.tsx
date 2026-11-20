import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StickyCtaBar from "./StickyCtaBar";

function renderBar(overrides: Partial<Parameters<typeof StickyCtaBar>[0]> = {}) {
  const props = {
    planName: "Pro",
    price: "$19",
    interval: "/month",
    visible: true,
    loading: false,
    onSubscribe: vi.fn(),
    ...overrides,
  };
  render(<StickyCtaBar {...props} />);
  return props;
}

describe("StickyCtaBar", () => {
  it("shows the plan and a Subscribe button", () => {
    renderBar();

    expect(screen.getByText(/Pro — \$19/)).toBeInTheDocument();
    expect(screen.getByText("/month")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Subscribe" })).toBeEnabled();
  });

  it("slides out of view and disables the button when hidden", () => {
    renderBar({ visible: false });

    // aria-hidden hides the whole bar from the accessibility tree, so
    // the button only answers a query that opts into hidden elements.
    const button = screen.getByRole("button", { name: "Subscribe", hidden: true });
    const bar = button.closest('[role="region"]');
    expect(bar).toHaveClass("translate-y-full");
    expect(bar).toHaveAttribute("aria-hidden", "true");
    expect(button).toBeDisabled();
  });

  it("slides into view when visible", () => {
    renderBar({ visible: true });

    const bar = screen.getByRole("region", { name: "Upgrade to Pro" });
    expect(bar).toHaveClass("translate-y-0");
    expect(bar).toHaveAttribute("aria-hidden", "false");
  });

  it("calls onSubscribe when the button is clicked", () => {
    const { onSubscribe } = renderBar();

    fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));

    expect(onSubscribe).toHaveBeenCalledTimes(1);
  });

  it("shows a redirecting state and disables the button while loading", () => {
    renderBar({ loading: true });

    expect(screen.getByText("Redirecting...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /redirecting/i })).toBeDisabled();
  });
});
