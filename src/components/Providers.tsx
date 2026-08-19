"use client";

import type { ReactNode } from "react";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

export default function Providers({ children }: { children: ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
