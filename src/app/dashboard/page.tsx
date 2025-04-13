import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm" aria-label="Main navigation">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <span className="text-blue-600 font-bold text-xl">
                  InsightHub
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center border-b-2 border-blue-500 px-1 pt-1 text-sm font-medium text-gray-900"
                  aria-current="page"
                >
                  Dashboard
                </Link>
                <Link
                  href="/data-sources"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  Data Sources
                </Link>
                <Link
                  href="/reports"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  Reports
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/analysis/new">
                  <button
                    type="button"
                    className="relative inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                    aria-label="Create new analysis"
                  >
                    <svg
                      className="-ml-0.5 h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    New Analysis
                  </button>
                </Link>
              </div>
              <div className="ml-4">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Welcome card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900">
              Welcome to InsightHub, {user?.firstName || "User"}!
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              This is your AI-powered business intelligence dashboard. Get
              started by uploading your data or connecting to your data sources.
            </p>
            <Link href="/data-sources/new">
              <button
                type="button"
                className="mt-4 inline-flex items-center rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-100"
                aria-label="Add a data source"
              >
                <svg
                  className="-ml-0.5 mr-1.5 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                Add Data Source
              </button>
            </Link>
          </div>

          {/* Placeholder for charts */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">
                Quick Insights
              </h3>
              <div className="mt-2 h-64 bg-gray-100 rounded-md flex items-center justify-center">
                <p className="text-gray-500">No data available yet</p>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Activity
              </h3>
              <div className="mt-2 h-64 bg-gray-100 rounded-md flex items-center justify-center">
                <p className="text-gray-500">No recent activity</p>
              </div>
            </div>
          </div>

          {/* Getting started section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">
              Getting Started
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  1. Upload Data
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Connect your data sources or upload CSV files to start
                  analyzing.
                </p>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  2. Ask Questions
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Use natural language to ask questions about your data and get
                  insights.
                </p>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0018 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  3. Create Reports
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Build dashboards and reports to share insights across your
                  organization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
