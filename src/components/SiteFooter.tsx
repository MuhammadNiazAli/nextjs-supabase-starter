"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Footer from "./Footer";
import ContributorsSection from "./ContributorsSection";

// On every other route this renders nothing but <Footer />, unchanged.
// On the homepage it also renders the Contributors reveal section right
// after the footer in document order, which is what lets the section's
// `position: sticky` rise up and cover the footer as the user scrolls
// past it. A small IntersectionObserver adds a matching fade/lift on the
// footer itself as the section comes into view.
export default function SiteFooter() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const footerWrapRef = useRef<HTMLDivElement>(null);
  const sectionWrapRef = useRef<HTMLDivElement>(null);
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const el = sectionWrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setCovered(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isHome]);

  if (!isHome) {
    return <Footer />;
  }

  return (
    <>
      <div
        ref={footerWrapRef}
        className="relative z-0 transition-all duration-700 ease-out"
        style={{
          opacity: covered ? 0.35 : 1,
          transform: covered ? "translateY(-6px) scale(0.985)" : "translateY(0) scale(1)",
        }}
      >
        <Footer />
      </div>
      <div ref={sectionWrapRef}>
        <ContributorsSection />
      </div>
    </>
  );
}
