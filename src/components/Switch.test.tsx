import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Switch from "./Switch";

function renderSwitch(
  checked = false,
  onChange: (checked: boolean) => void = () => {},
) {
  return render(
    <Switch checked={checked} onChange={onChange} label="Reduce motion" />,
  );
}

function knobOf(control: HTMLElement): HTMLElement {
  // The knob is the only span inside the switch button.
  const knob = control.querySelector("span");
  if (!knob) throw new Error("Switch has no knob element");
  return knob as HTMLElement;
}

describe("Switch", () => {
  it("renders as a switch with the off state", () => {
    renderSwitch(false);
    const control = screen.getByRole("switch", { name: "Reduce motion" });
    expect(control).toHaveAttribute("aria-checked", "false");
    expect(knobOf(control)).toHaveClass("translate-x-0");
  });

  it("renders the on state with the knob slid across", () => {
    renderSwitch(true);
    const control = screen.getByRole("switch", { name: "Reduce motion" });
    expect(control).toHaveAttribute("aria-checked", "true");
    expect(knobOf(control)).toHaveClass("translate-x-5");
  });

  it("calls onChange with the flipped value on click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSwitch(false, onChange);
    const control = screen.getByRole("switch", { name: "Reduce motion" });

    await user.click(control);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("toggles with the Space key", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSwitch(true, onChange);
    const control = screen.getByRole("switch", { name: "Reduce motion" });

    control.focus();
    await user.keyboard(" ");

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("toggles with the Enter key", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSwitch(false, onChange);
    const control = screen.getByRole("switch", { name: "Reduce motion" });

    control.focus();
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("is reachable by keyboard tabbing", async () => {
    const user = userEvent.setup();
    renderSwitch(false);
    const control = screen.getByRole("switch", { name: "Reduce motion" });

    await user.tab();

    expect(control).toHaveFocus();
  });

  it("carries the reduced-motion hook so the knob jumps instead of sliding", () => {
    // jsdom never runs a CSS transition, so what this checks is the
    // wiring: the knob and the track both carry the motion-reduce class
    // that turns the transition off for the OS setting, and the app's
    // .reduce-motion class does the same when the toggle is on.
    renderSwitch(false);
    const control = screen.getByRole("switch", { name: "Reduce motion" });
    expect(control).toHaveClass("motion-reduce:transition-none");
    expect(knobOf(control)).toHaveClass("motion-reduce:transition-none");
  });

  it("shows a visible focus ring", () => {
    renderSwitch(false);
    const control = screen.getByRole("switch", { name: "Reduce motion" });
    expect(control).toHaveClass("focus-visible:ring-2");
  });
});
