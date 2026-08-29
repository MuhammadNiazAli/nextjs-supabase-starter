import "./globals.css";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import Providers from "@/components/Providers";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const siteName = "Next.js Supabase Starter";
const siteDescription =
  "Production-ready Next.js + TypeScript + Tailwind + Supabase SaaS starter kit — beginner friendly, senior approved.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "Next.js starter",
    "Supabase auth",
    "SaaS boilerplate",
    "TypeScript",
    "Tailwind CSS",
  ],
  authors: [{ name: "MuhammadNiazAli" }],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: siteName,
    description: siteDescription,
    siteName,
    images: [
      {
        url: "/assets/home.png",
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/assets/home.png"],
  },
};

// Applied before hydration so the correct theme is set on first paint and
// there's no light -> dark (or dark -> light) flash for returning visitors.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var systemPrefersDark =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = stored ? stored === "dark" : systemPrefersDark;
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-md"
          >
            Skip to main content
          </a>
          <Navbar />
          <main id="main-content" className="min-h-[80vh]">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
