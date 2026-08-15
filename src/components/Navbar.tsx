"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
      <Link href="/" className="font-bold text-lg text-primary">
        FullStack Starter
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/login" className="text-sm hover:underline">
          Login
        </Link>
        <Link href="/signup" className="text-sm hover:underline">
          Sign up
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}
