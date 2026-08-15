export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-24">
      <h1 className="text-4xl font-bold mb-4">
        Welcome to <span className="text-primary">Next.js Supabase Starter</span>
      </h1>
      <p className="text-gray-500 max-w-xl mb-8">
        A production-ready Next.js + Supabase + Tailwind starter kit — open
        source and built for the community. Fork it, star it, contribute to
        it.
      </p>
      <div className="flex gap-4">
        <a
          href="/signup"
          className="bg-primary text-white px-5 py-2 rounded-md"
        >
          Get Started
        </a>
        <a
          href="https://github.com/MuhammadNiazAli/nextjs-supabase-starter"
          className="border border-gray-300 dark:border-gray-700 px-5 py-2 rounded-md"
        >
          View on GitHub
        </a>
      </div>
    </div>
  );
}
