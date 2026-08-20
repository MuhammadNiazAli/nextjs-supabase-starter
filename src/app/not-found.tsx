import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-24">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-xl mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-primary text-white px-5 py-2 rounded-md hover:opacity-90 transition"
      >
        Back to Home
      </Link>
    </div>
  );
}
