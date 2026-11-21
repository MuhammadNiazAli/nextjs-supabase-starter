import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ContributorsSection from "./ContributorsSection";

// The section reads its labels from the language context; in tests we
// only care about the timeline, so every key just echoes back.
vi.mock("@/lib/i18n/LanguageContext", () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

type FakeContributor = {
  login: string;
  name: string | null;
  avatarUrl: string;
  htmlUrl: string;
  contributions: number;
};

const fakeContributors: FakeContributor[] = [
  {
    login: "MuhammadNiazAli",
    name: "Niaz",
    avatarUrl: "https://example.com/niaz.png",
    htmlUrl: "https://github.com/MuhammadNiazAli",
    contributions: 40,
  },
  {
    login: "alice",
    name: "Alice",
    avatarUrl: "https://example.com/alice.png",
    htmlUrl: "https://github.com/alice",
    contributions: 5,
  },
  {
    login: "bob",
    name: null,
    avatarUrl: "https://example.com/bob.png",
    htmlUrl: "https://github.com/bob",
    contributions: 12,
  },
];

// jsdom has no IntersectionObserver. useReveal treats a missing
// observer as "show everything", which is exactly what these tests
// want — but make that explicit so a future setup change cannot
// silently change what is being tested.
beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", undefined);
  // The swiper above the timeline measures itself with a
  // ResizeObserver, which jsdom also lacks — a no-op stand-in is
  // enough, since these tests never resize anything.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      json: async () => ({ contributors: fakeContributors }),
    }))
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ContributorsSection timeline", () => {
  it("renders one timeline entry per contributor, ranked by commits", async () => {
    render(<ContributorsSection />);

    const entries = await screen.findAllByTestId("timeline-entry");
    expect(entries).toHaveLength(3);

    // Ranked: maintainer (40) first, then bob (12), then alice (5).
    expect(entries[0]).toHaveTextContent("#1");
    expect(entries[0]).toHaveTextContent("@MuhammadNiazAli");
    expect(entries[1]).toHaveTextContent("#2");
    expect(entries[1]).toHaveTextContent("@bob");
    expect(entries[2]).toHaveTextContent("#3");
    expect(entries[2]).toHaveTextContent("@alice");
  });

  it("shows each contributor's commit count", async () => {
    render(<ContributorsSection />);

    const timeline = await screen.findByTestId("contributors-timeline");
    expect(timeline).toHaveTextContent("40 commits");
    expect(timeline).toHaveTextContent("12 commits");
    expect(timeline).toHaveTextContent("5 commits");
  });

  it("draws the timeline line when it scrolls into view", async () => {
    render(<ContributorsSection />);

    const line = await screen.findByTestId("timeline-line");
    // With no IntersectionObserver the hook reveals immediately, so
    // the line is fully drawn (scale-y-100) rather than collapsed.
    await waitFor(() => expect(line).toHaveClass("scale-y-100"));
  });

  it("reveals entries immediately when reduced motion has no observer", async () => {
    render(<ContributorsSection />);

    const entries = await screen.findAllByTestId("timeline-entry");
    for (const entry of entries) {
      await waitFor(() => expect(entry).toHaveClass("reveal-visible"));
    }
  });
});
