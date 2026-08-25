"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import ContributorsSection from "./ContributorsSection";

// On every other route this renders nothing but <Footer />, unchanged.
// On the homepage it also renders the Contributors section right after
// the footer in document order — a plain static stack, no scroll-linked
// opacity/scale tricks on either piece.
export default function SiteFooter() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (!isHome) {
    return <Footer />;
  }

  return (
    <>
      <Footer />
      <ContributorsSection />
    </>
  );
}
