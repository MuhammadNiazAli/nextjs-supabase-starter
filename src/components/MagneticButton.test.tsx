import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MagneticButton from "./MagneticButton";

// The wrapper's position on the page, so the tests can work out where
// the cursor sits relative to its centre (160, 120). jsdom lays
// nothing out, so getBoundingClientRect is mocked per test.
const RECT = {
  left: 100,
  top: 100,
  width: 120,
  height: 40,
  right: 220,
  bottom: 140,
  x: 100,
  y: 100,
  toJSON: () => {},
} as DOMRect;

function renderButton() {
  const { container } = render(
    <MagneticButton>
      <button type="button">Press me</button>
    </MagneticButton>,
  );
  const wrapper = container.firstChild as HTMLElement;
  vi.spyOn(wrapper, "getBoundingClientRect").mockReturnValue(RECT);
  return wrapper;
}

beforeEach(() => {
  // No leftover reduced-motion state from a previous test.
  document.documentElement.classList.remove("reduce-motion");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("MagneticButton", () => {
  it("renders its children unchanged", () => {
    renderButton();
    expect(screen.getByRole("button", { name: "Press me" })).toBeInTheDocument();
  });

  it("shifts toward the cursor on hover, capped at the maximum offset", () => {
    const wrapper = renderButton();

    // Cursor 30px right of centre: 30 * 0.3 = 9px, capped at 6px.
    fireEvent.mouseMove(wrapper, { clientX: 190, clientY: 120 });

    expect(wrapper.style.transform).toBe("translate(6px, 0px)");
  });

  it("shifts a smaller amount for a cursor close to the centre", () => {
    const wrapper = renderButton();

    // Cursor 10px right and 10px below centre: 10 * 0.3 = 3px each way.
    fireEvent.mouseMove(wrapper, { clientX: 170, clientY: 130 });

    expect(wrapper.style.transform).toBe("translate(3px, 3px)");
  });

  it("shifts the other way when the cursor is left of centre", () => {
    const wrapper = renderButton();

    // Cursor 60px left of centre: -60 * 0.3 = -18px, capped at -6px.
    fireEvent.mouseMove(wrapper, { clientX: 100, clientY: 120 });

    expect(wrapper.style.transform).toBe("translate(-6px, 0px)");
  });

  it("springs back to its resting spot on mouse leave", () => {
    const wrapper = renderButton();

    fireEvent.mouseMove(wrapper, { clientX: 190, clientY: 120 });
    expect(wrapper.style.transform).toBe("translate(6px, 0px)");

    fireEvent.mouseLeave(wrapper);

    expect(wrapper.style.transform).toBe("translate(0px, 0px)");
  });

  it("does not move when the in-app reduce-motion toggle is on", () => {
    document.documentElement.classList.add("reduce-motion");
    const wrapper = renderButton();

    fireEvent.mouseMove(wrapper, { clientX: 190, clientY: 120 });

    expect(wrapper.style.transform).toBe("translate(0px, 0px)");
  });

  it("does not move when the operating system prefers reduced motion", () => {
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
    const wrapper = renderButton();

    fireEvent.mouseMove(wrapper, { clientX: 190, clientY: 120 });

    expect(wrapper.style.transform).toBe("translate(0px, 0px)");
  });
});
