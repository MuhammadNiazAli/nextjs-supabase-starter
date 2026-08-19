import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Supabase Starter",
  description: "Next.js + Supabase + Tailwind SaaS starter kit",
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
          <Navbar />
          <main className="min-h-[80vh]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
