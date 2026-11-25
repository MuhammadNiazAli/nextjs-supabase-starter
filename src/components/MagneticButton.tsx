"use client";

import { useRef, useState, type MouseEvent, type ReactNode } from "react";

// How far the button may drift from its resting spot, in pixels.
// Kept small on purpose: the effect should feel like a nudge toward
// the cursor, not a chase after it.
const MAX_OFFSET = 6;

// How much of the cursor's distance from the button's centre becomes
// movement. 0.3 means the button covers 30% of the gap — it leans
// toward the cursor without ever catching it.
const PULL = 0.3;

function reducedMotionOn(): boolean {
  if (typeof window === "undefined") return false;

  // The in-app toggle puts .reduce-motion on <html> (see
  // ReducedMotionToggle.tsx); the media query covers visitors who
  // never touch the toggle but asked their OS for less motion.
  if (document.documentElement.classList.contains("reduce-motion")) {
    return true;
  }
  if (typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return false;
}

type Offset = { x: number; y: number };

// Wraps a primary call-to-action so it leans a few pixels toward the
// cursor while hovered, then springs back when the cursor leaves.
// The wrapper is a plain span so the link or button inside keeps its
// own hover styles — the magnetic shift never fights them.
export default function MagneticButton({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });

  function handleMouseMove(event: MouseEvent<HTMLSpanElement>) {
    if (reducedMotionOn()) return;

    const el = wrapperRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const fromCenterX = event.clientX - (rect.left + rect.width / 2);
    const fromCenterY = event.clientY - (rect.top + rect.height / 2);

    // Each axis is capped so the button never drifts past MAX_OFFSET,
    // even when the cursor is far from the centre.
    setOffset({
      x: Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, fromCenterX * PULL)),
      y: Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, fromCenterY * PULL)),
    });
  }

  function handleMouseLeave() {
    setOffset({ x: 0, y: 0 });
  }

  return (
    <span
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="magnetic-button"
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
    >
      {children}
    </span>
  );
}
