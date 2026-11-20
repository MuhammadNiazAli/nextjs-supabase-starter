"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import Spinner from "@/components/Spinner";
import StickyCtaBar from "@/components/StickyCtaBar";

type Plan = {
  name: string;
  price: string;
  interval: string;
  priceId: string | undefined;
  features: string[];
  highlighted?: boolean;
};

// Which plan the sticky bottom bar sells. The bar reuses the card's
// Subscribe flow (handleSubscribe), so change this name to point the
// bar at a different plan — the price shown and the checkout target
// both follow from it. The button copy lives in the pricing.stickyCta
// i18n keys, not here.
const STICKY_BAR_PLAN_NAME = "Pro";

const plans: Plan[] = [
  {
    name: "Pro",
    price: "$19",
    interval: "/month",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
    features: [
      "Everything in Free",
      "Unlimited projects",
      "Priority support",
      "Cancel anytime",
    ],
    highlighted: true,
  },
];

export default function PricingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const cardsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // The sticky bar appears once the pricing cards have scrolled out of
  // view and slides away again when the user scrolls back up to them.
  // A scroll listener is enough here: the page is short and the check
  // is one getBoundingClientRect call per scroll.
  useEffect(() => {
    function updateBarVisibility() {
      const cards = cardsRef.current;
      if (!cards) return;
      setShowStickyBar(cards.getBoundingClientRect().bottom <= 0);
    }

    updateBarVisibility();
    window.addEventListener("scroll", updateBarVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateBarVisibility);
  }, []);

  const handleSubscribe = async (priceId: string | undefined) => {
    setError(null);

    if (!priceId) {
      setError("This plan is not configured yet. Set NEXT_PUBLIC_STRIPE_PRICE_ID.");
      return;
    }
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setLoadingPriceId(priceId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, userId: user.id, email: user.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoadingPriceId(null);
    }
  };

  const stickyPlan = plans.find((plan) => plan.name === STICKY_BAR_PLAN_NAME);

  return (
    <div className="px-4 py-16 min-h-[80vh]">
      <div className="max-w-md mx-auto text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Pricing</h1>
        <p className="text-sm text-gray-500">
          Simple, transparent pricing. Upgrade or cancel anytime.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="max-w-sm mx-auto mb-6 text-red-500 text-sm bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2 text-center"
        >
          {error}
        </p>
      )}

      <div ref={cardsRef} className="flex flex-wrap justify-center gap-6">
        <div className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg shadow-gray-200/40 dark:shadow-black/20 p-8">
          <h2 className="text-lg font-semibold mb-1">Free</h2>
          <p className="text-3xl font-bold mb-4">
            $0<span className="text-sm font-normal text-gray-500">/month</span>
          </p>
          <ul className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <li>1 project</li>
            <li>Community support</li>
          </ul>
          <Link
            href={user ? "/dashboard" : "/signup"}
            className="block text-center w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            {user ? "Current plan" : "Get started"}
          </Link>
        </div>

        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`w-full max-w-sm bg-white dark:bg-gray-900 border rounded-2xl shadow-lg p-8 ${
              plan.highlighted
                ? "border-primary shadow-primary/20"
                : "border-gray-200 dark:border-gray-800 shadow-gray-200/40 dark:shadow-black/20"
            }`}
          >
            <h2 className="text-lg font-semibold mb-1">{plan.name}</h2>
            <p className="text-3xl font-bold mb-4">
              {plan.price}
              <span className="text-sm font-normal text-gray-500">
                {plan.interval}
              </span>
            </p>
            <ul className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => handleSubscribe(plan.priceId)}
              disabled={loadingPriceId === plan.priceId}
              className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg px-3 py-2.5 text-sm font-medium transition shadow-sm shadow-primary/30"
            >
              {loadingPriceId === plan.priceId ? (
                <>
                  <Spinner /> Redirecting...
                </>
              ) : (
                "Subscribe"
              )}
            </button>
          </div>
        ))}
      </div>

      {stickyPlan && (
        <StickyCtaBar
          planName={stickyPlan.name}
          price={stickyPlan.price}
          interval={stickyPlan.interval}
          visible={showStickyBar}
          loading={loadingPriceId === stickyPlan.priceId}
          onSubscribe={() => handleSubscribe(stickyPlan.priceId)}
        />
      )}
    </div>
  );
}
