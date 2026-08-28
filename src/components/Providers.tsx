"use client";

import type { ReactNode } from "react";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { ToastProvider } from "@/components/Toast";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <ToastProvider>{children}</ToastProvider>
    </LanguageProvider>
  );
}
