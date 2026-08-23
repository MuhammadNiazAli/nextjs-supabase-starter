import { NextResponse } from "next/server";

// Refresh once per hour — keeps us comfortably inside GitHub's 60
// requests/hour unauthenticated rate limit no matter how many visitors
// hit the homepage in between.
export const revalidate = 3600;

const REPO = "MuhammadNiazAli/nextjs-supabase-starter";
const ADMIN_LOGIN = "MuhammadNiazAli";

type GitHubContributor = {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
};

type GitHubUser = {
  name: string | null;
};

export type Contributor = {
  login: string;
  avatarUrl: string;
  htmlUrl: string;
  contributions: number;
  name: string | null;
};

const githubHeaders = {
  Accept: "application/vnd.github+json",
  "User-Agent": "nextjs-supabase-starter-contributors-section",
};

export async function GET() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contributors?per_page=100`,
      {
        headers: githubHeaders,
        next: { revalidate },
      },
    );

    if (!res.ok) {
      return NextResponse.json(
        { contributors: [], error: "GitHub API request failed" },
        { status: 502 },
      );
    }

    const raw = (await res.json()) as GitHubContributor[];
    const filtered = raw.filter((c) => c.type === "User");

    // Best-effort: look up display names for a small contributor list.
    // Skipped once the list grows so one homepage load can never burn
    // through the unauthenticated rate limit by itself.
    const names = new Map<string, string | null>();
    if (filtered.length > 0 && filtered.length <= 12) {
      await Promise.all(
        filtered.map(async (c) => {
          try {
            const userRes = await fetch(`https://api.github.com/users/${c.login}`, {
              headers: githubHeaders,
              next: { revalidate },
            });
            if (userRes.ok) {
              const user = (await userRes.json()) as GitHubUser;
              names.set(c.login, user.name ?? null);
            }
          } catch {
            // Ignore — that contributor just falls back to their username.
          }
        }),
      );
    }

    const contributors: Contributor[] = filtered
      .map((c) => ({
        login: c.login,
        avatarUrl: c.avatar_url,
        htmlUrl: c.html_url,
        contributions: c.contributions,
        name: names.get(c.login) ?? null,
      }))
      .sort((a, b) => {
        if (a.login === ADMIN_LOGIN) return -1;
        if (b.login === ADMIN_LOGIN) return 1;
        return b.contributions - a.contributions;
      });

    return NextResponse.json({ contributors });
  } catch {
    return NextResponse.json(
      { contributors: [], error: "Unable to reach GitHub" },
      { status: 502 },
    );
  }
}
