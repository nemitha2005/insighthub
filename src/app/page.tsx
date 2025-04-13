import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="bg-white min-h-screen">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="text-blue-600 font-bold text-xl">
                InsightHub
              </span>
            </Link>
          </div>
          <div className="flex gap-4">
            <SignedIn>
              <Link
                href="/dashboard"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-semibold leading-6 text-gray-900">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </nav>
      </header>

      <main className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Make Better Business Decisions with AI
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              InsightHub uses artificial intelligence to analyze your business
              data, provide actionable insights, and help you stay ahead of the
              competition.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                    Get started
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  Go to Dashboard
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
