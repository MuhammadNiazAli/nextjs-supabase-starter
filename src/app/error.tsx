"use client";

import Link from "next/link";
import { useEffect } from "react";

// Next.js renders this page when a route throws an unhandled error, so
// crashes show a styled page instead of the framework's blank screen.
// It must be a client component: the Try again button calls reset(),
// which re-renders the failed segment.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error in the logs instead of silently swallowing it.
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-24 min-h-[80vh]">
      {/* Same beacon scene as the 404 page, so the two error states look
          like they belong to the same app. */}
      <div className="not-found-scene mb-8" aria-hidden="true">
        <span className="not-found-orbit not-found-orbit--one" />
        <span className="not-found-orbit not-found-orbit--two" />
        <span className="not-found-fragment not-found-fragment--top" />
        <span className="not-found-fragment not-found-fragment--side" />
        <div className="not-found-beacon">
          <span className="not-found-beacon__label">500</span>
          <span className="not-found-beacon__dot" />
        </div>
      </div>

      <p className="text-sm font-semibold tracking-widest text-primary mb-2">
        ERROR 500
      </p>
      <h1 className="text-5xl sm:text-6xl font-bold mb-4">
        Something went wrong
      </h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
        Something went wrong on our side. Try again — if the problem keeps
        happening, come back a little later.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition shadow-sm shadow-primary/30"
        >
          Try again
        </button>
        <Link
          href="/"
          className="border border-gray-300 dark:border-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
