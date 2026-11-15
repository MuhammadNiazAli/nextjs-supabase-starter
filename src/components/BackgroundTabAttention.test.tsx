import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import BackgroundTabAttention from "./BackgroundTabAttention";

const ORIGINAL_TITLE = "Next.js Supabase Starter";
const ORIGINAL_ICON = "/icon.svg";

// document.hidden is read-only, so the tests flip it directly.
function setHidden(hidden: boolean) {
  Object.defineProperty(document, "hidden", {
    value: hidden,
    configurable: true,
  });
  document.dispatchEvent(new Event("visibilitychange"));
}

function iconLink(): HTMLLinkElement | null {
  return document.querySelector<HTMLLinkElement>('link[rel="icon"]');
}

beforeEach(() => {
  document.title = ORIGINAL_TITLE;
  setHidden(false);
  const link = document.createElement("link");
  link.setAttribute("rel", "icon");
  link.setAttribute("href", ORIGINAL_ICON);
  document.head.appendChild(link);
});

afterEach(() => {
  document.querySelectorAll('link[rel="icon"]').forEach((link) => link.remove());
  setHidden(false);
});

describe("BackgroundTabAttention", () => {
  it("renders nothing visible", () => {
    const { container } = render(<BackgroundTabAttention />);
    expect(container).toBeEmptyDOMElement();
  });

  it("switches the title and favicon to the done state when the tab is hidden", () => {
    render(<BackgroundTabAttention />);

    setHidden(true);

    expect(document.title).toBe("✓ Done!");
    expect(iconLink()?.getAttribute("href")).toBe("/icon-done.svg");
  });

  it("restores the title and favicon when the tab is visible again", () => {
    render(<BackgroundTabAttention />);

    setHidden(true);
    setHidden(false);

    expect(document.title).toBe(ORIGINAL_TITLE);
    expect(iconLink()?.getAttribute("href")).toBe(ORIGINAL_ICON);
  });

  it("restores the title and favicon when it unmounts", () => {
    const { unmount } = render(<BackgroundTabAttention />);

    setHidden(true);
    unmount();

    expect(document.title).toBe(ORIGINAL_TITLE);
    expect(iconLink()?.getAttribute("href")).toBe(ORIGINAL_ICON);
  });

  it("creates a favicon link when the page has none", () => {
    document.querySelectorAll('link[rel="icon"]').forEach((link) => link.remove());
    render(<BackgroundTabAttention />);

    setHidden(true);

    expect(iconLink()?.getAttribute("href")).toBe("/icon-done.svg");

    setHidden(false);
    expect(iconLink()?.getAttribute("href")).toBeNull();
  });
});
