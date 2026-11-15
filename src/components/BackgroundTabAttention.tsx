"use client";

import { useEffect } from "react";

// The title shown while the tab sits in the background.
const DONE_TITLE = "✓ Done!";
// A green checkmark favicon, shown while the tab is in the background.
const DONE_ICON = "/icon-done.svg";

// Swaps the tab title and favicon to a "done" state while the user is
// looking at another tab, so the tab stands out when they glance back.
// Restores both as soon as the tab is visible again. Renders nothing.
export default function BackgroundTabAttention() {
  useEffect(() => {
    const originalTitle = document.title;
    const iconLink = findOrCreateIconLink();
    const originalIcon = iconLink.getAttribute("href");

    function showDone() {
      document.title = DONE_TITLE;
      iconLink.setAttribute("href", DONE_ICON);
    }

    function showOriginal() {
      document.title = originalTitle;
      if (originalIcon) {
        iconLink.setAttribute("href", originalIcon);
      } else {
        iconLink.removeAttribute("href");
      }
    }

    function onVisibilityChange() {
      if (document.hidden) {
        showDone();
      } else {
        showOriginal();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      showOriginal();
    };
  }, []);

  return null;
}

// Finds the page's favicon link, creating one if the page has none, so
// there is always a link to swap.
function findOrCreateIconLink(): HTMLLinkElement {
  const existing = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (existing) {
    return existing;
  }
  const link = document.createElement("link");
  link.setAttribute("rel", "icon");
  document.head.appendChild(link);
  return link;
}
