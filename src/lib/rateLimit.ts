type Entry = { count: number; resetAt: number };

// In-memory store. This is per server process/instance — fine for a single
// long-running Node server, but on serverless platforms with multiple
// instances each instance keeps its own counters. For production on
// serverless, swap this for a shared store like Upstash Redis.
const store = new Map<string, Entry>();

function cleanup(now: number) {
  store.forEach((entry, key) => {
    if (entry.resetAt <= now) store.delete(key);
  });
}

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

/**
 * Basic fixed-window rate limiter keyed by an arbitrary identifier
 * (e.g. `checkout:<ip>`). Returns whether the request is allowed.
 */
export function rateLimit(
  identifier: string,
  { limit = 10, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}
): RateLimitResult {
  const now = Date.now();
  if (store.size > 5000) cleanup(now);

  const entry = store.get(identifier);

  if (!entry || entry.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(identifier, { count: 1, resetAt });
    return { success: true, limit, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    return { success: false, limit, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/** Best-effort client IP extraction from standard proxy headers. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
