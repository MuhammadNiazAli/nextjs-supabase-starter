import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-24 min-h-[80vh]">
      <svg
        width="120"
        height="120"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
        className="mb-6 text-primary"
      >
        <circle cx="100" cy="100" r="90" className="fill-gray-100 dark:fill-gray-900" />
        <path
          d="M65 75c0-19 15-34 34-34s35 15 35 34"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="78" cy="95" r="6" fill="currentColor" />
        <circle cx="122" cy="95" r="6" fill="currentColor" />
        <path
          d="M75 130c8-8 15-11 25-11s17 3 25 11"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>

      <p className="text-sm font-semibold tracking-widest text-primary mb-2">
        ERROR 404
      </p>
      <h1 className="text-5xl sm:text-6xl font-bold mb-4">
        Page not found
      </h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist, was renamed, or
        moved somewhere else. Let&apos;s get you back on track.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition shadow-sm shadow-primary/30"
        >
          Back to Home
        </Link>
        <Link
          href="/pricing"
          className="border border-gray-300 dark:border-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          View Pricing
        </Link>
      </div>
    </div>
  );
}
