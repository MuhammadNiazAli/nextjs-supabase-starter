import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DashboardNav, { type DashboardTab } from "./DashboardNav";

afterEach(() => {
  vi.useRealTimers();
});

function renderNav(
  onChange: (tab: DashboardTab) => void = () => {},
  activeTab: DashboardTab = "overview",
) {
  return render(<DashboardNav activeTab={activeTab} onChange={onChange} />);
}

function badges() {
  // The badges are aria-hidden, so they are found by text, not by role.
  return ["1", "2", "3"].map((digit) => screen.getByText(digit));
}

describe("DashboardNav keyboard shortcuts", () => {
  it("shows a key-cap badge with 1, 2 and 3 on the three tabs", () => {
    renderNav();
    expect(screen.getByRole("tab", { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /billing/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /account settings/i })).toBeInTheDocument();
    expect(badges()).toHaveLength(3);
  });

  it("switches to Billing when 2 is pressed", () => {
    const onChange = vi.fn();
    renderNav(onChange);

    fireEvent.keyDown(window, { key: "2" });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("billing");
  });

  it("switches to Overview on 1 and to Account Settings on 3", () => {
    const onChange = vi.fn();
    renderNav(onChange, "billing");

    fireEvent.keyDown(window, { key: "1" });
    expect(onChange).toHaveBeenCalledWith("overview");

    fireEvent.keyDown(window, { key: "3" });
    expect(onChange).toHaveBeenCalledWith("settings");
  });

  it("ignores keypresses while the user is typing in a field", () => {
    const onChange = vi.fn();
    render(
      <>
        <input aria-label="Search" />
        <DashboardNav activeTab="overview" onChange={onChange} />
      </>,
    );
    const input = screen.getByLabelText("Search");

    fireEvent.keyDown(input, { key: "2" });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("ignores keys that are not tab shortcuts", () => {
    const onChange = vi.fn();
    renderNav(onChange);

    fireEvent.keyDown(window, { key: "4" });
    fireEvent.keyDown(window, { key: "a" });
    fireEvent.keyDown(window, { key: "Escape" });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("ignores shortcuts held with a modifier key", () => {
    const onChange = vi.fn();
    renderNav(onChange);

    fireEvent.keyDown(window, { key: "2", ctrlKey: true });
    fireEvent.keyDown(window, { key: "2", metaKey: true });
    fireEvent.keyDown(window, { key: "2", altKey: true });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("animates the pressed badge and returns it to rest", () => {
    vi.useFakeTimers();
    renderNav();
    const [, billingBadge] = badges();

    fireEvent.keyDown(window, { key: "2" });
    expect(billingBadge.className).toContain("keycap-pressed");

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(billingBadge.className).not.toContain("keycap-pressed");
  });
});
