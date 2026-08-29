import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Only public, indexable routes belong here — auth pages (login/signup/etc.)
// and the user-only dashboard/profile pages are intentionally left out.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/pricing"];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
