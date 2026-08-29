import { describe, it, expect } from "vitest";
const nextConfig = require("../../next.config.js");

describe("next.config.js security headers", () => {
  it("defines headers configuration function", () => {
    expect(typeof nextConfig.headers).toBe("function");
  });

  it("returns expected security headers on all routes", async () => {
    const headerConfigs = await nextConfig.headers();
    expect(Array.isArray(headerConfigs)).toBe(true);
    expect(headerConfigs.length).toBeGreaterThan(0);

    const rootConfig = headerConfigs[0];
    expect(rootConfig.source).toBe("/:path*");

    const headerMap = Object.fromEntries(
      rootConfig.headers.map((h: { key: string; value: string }) => [h.key, h.value])
    );

    expect(headerMap["X-Frame-Options"]).toBe("DENY");
    expect(headerMap["X-Content-Type-Options"]).toBe("nosniff");
    expect(headerMap["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headerMap["Permissions-Policy"]).toContain("camera=()");
    expect(headerMap["Content-Security-Policy"]).toContain("default-src 'self'");
    expect(headerMap["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
  });
});
