"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import Spinner from "@/components/Spinner";

type StickyCtaBarProps = {
  planName: string;
  price: string;
  interval: string;
  // False while the bar is slid out of view. The bar stays mounted so
  // it can slide back in; the button is disabled while hidden so a
  // keyboard user can never tab to an off-screen button.
  visible: boolean;
  loading: boolean;
  onSubscribe: () => void;
};

// Slim bar pinned to the bottom of the viewport. The parent shows it
// once the pricing cards have scrolled out of view and hides it again
// when the user scrolls back up. The slide is a plain transform
// transition: the manual "reduce motion" toggle kills transitions
// globally (see globals.css), and motion-reduce covers the OS setting.
export default function StickyCtaBar({
  planName,
  price,
  interval,
  visible,
  loading,
  onSubscribe,
}: StickyCtaBarProps) {
  const { t } = useLanguage();

  return (
    <div
      role="region"
      aria-label={t("pricing.stickyCta.label")}
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ease-out motion-reduce:transition-none ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center justify-between gap-4 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm font-medium">
          {planName} — {price}
          <span className="font-normal text-gray-500">{interval}</span>
        </p>
        <button
          type="button"
          onClick={onSubscribe}
          disabled={!visible || loading}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm shadow-primary/30 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Spinner /> Redirecting...
            </>
          ) : (
            t("pricing.stickyCta.subscribe")
          )}
        </button>
      </div>
    </div>
  );
}
