"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ErrorBoundary from "@/components/ErrorBoundary";
import AccountSetup from "@/components/AccountSetup";
import { logger } from "@/lib/logger";

interface Analysis {
  id: string;
  prompt: string;
  createdAt: string;
}

interface DataSource {
  id: string;
  name: string;
  type: string;
}

export default function Dashboard() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const results = await Promise.allSettled([
        fetch("/api/analysis"),
        fetch("/api/data-sources"),
      ]);

      if (results[0].status === "fulfilled") {
        if (results[0].value.ok) {
          const data = await results[0].value.json();
          setRecentAnalyses(data.analyses?.slice(0, 5) || []);
        } else {
          try {
            const errorData = await results[0].value.json();
            if (errorData.code === "NO_ORG") {
              logger.warn("User needs organization setup", {
                userId: user?.id,
              });
              setNeedsSetup(true);
            }
            console.error("Failed to fetch analyses:", errorData.message);
          } catch (e) {
            console.error("Failed to parse error response:", e);
          }
        }
      } else if (results[0].status === "rejected") {
        console.error("Failed to fetch analyses:", results[0].reason);
      }

      if (results[1].status === "fulfilled") {
        if (results[1].value.ok) {
          const data = await results[1].value.json();
          setDataSources(data.dataSources || []);
        } else {
          try {
            const errorData = await results[1].value.json();
            if (errorData.code === "NO_ORG") {
              setNeedsSetup(true);
            }
            console.error("Failed to fetch data sources:", errorData.message);
          } catch (e) {
            console.error("Failed to parse error response:", e);
          }
        }
      } else if (results[1].status === "rejected") {
        console.error("Failed to fetch data sources:", results[1].reason);
      }
    } catch (error) {
      logger.error("Error fetching dashboard data", error);
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchDashboardData();
    }
  }, [isSignedIn]);

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
          <ErrorBoundary>
            {/* Welcome card */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900">
                Welcome to InsightHub, {user?.firstName || "User"}!
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                This is your AI-powered business intelligence dashboard. Get
                started by uploading your data or connecting to your data
                sources.
              </p>
              <div className="mt-4 flex space-x-3">
                <Link href="/data-sources/new">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-100"
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
                <Link href="/analysis/new">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                    aria-label="Start analyzing"
                  >
                    <svg
                      className="-ml-0.5 mr-1.5 h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    Start Analyzing
                  </button>
                </Link>
              </div>
            </div>

            {/* Add Account Setup if needed */}
            {needsSetup && (
              <div className="mt-8">
                <AccountSetup
                  onSetupComplete={() => {
                    setNeedsSetup(false);
                    fetchDashboardData();
                  }}
                />
              </div>
            )}

            {/* Only show dashboard content if setup is not needed */}
            {!needsSetup && (
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Data Sources */}
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Your Data Sources
                    </h3>
                    <Link
                      href="/data-sources"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      View all
                    </Link>
                  </div>
                  {isLoading ? (
                    <div className="space-y-3">
                      <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : dataSources.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {dataSources.slice(0, 5).map((source) => (
                        <li key={source.id} className="py-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {source.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Type: {source.type}
                              </p>
                            </div>
                            <Link
                              href={`/data-sources/${source.id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                              View
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="h-32 flex flex-col items-center justify-center text-gray-500">
                      <p className="mb-2">No data sources yet</p>
                      <Link href="/data-sources/new">
                        <button
                          type="button"
                          className="inline-flex items-center rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-100"
                        >
                          Add Data Source
                        </button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Recent Analyses */}
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Recent Analyses
                    </h3>
                    <Link
                      href="/analysis"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      View all
                    </Link>
                  </div>
                  {isLoading ? (
                    <div className="space-y-3">
                      <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : recentAnalyses.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {recentAnalyses.map((analysis) => (
                        <li key={analysis.id} className="py-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {analysis.prompt.length > 40
                                  ? `${analysis.prompt.substring(0, 40)}...`
                                  : analysis.prompt}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(analysis.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <Link
                              href={`/analysis/${analysis.id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                              View
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="h-32 flex flex-col items-center justify-center text-gray-500">
                      <p className="mb-2">No analyses yet</p>
                      <Link href="/analysis/new">
                        <button
                          type="button"
                          className="inline-flex items-center rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-100"
                        >
                          Create Analysis
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Only show Getting Started section if setup is not needed */}
            {!needsSetup && (
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
                      Use natural language to ask questions about your data and
                      get insights.
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
            )}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
