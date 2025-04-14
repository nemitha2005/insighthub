"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface DataSource {
  id: string;
  name: string;
  type: string;
}

export default function NewAnalysisPage() {
  const router = useRouter();
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [selectedSource, setSelectedSource] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDataSources() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/data-sources");
        if (!response.ok) {
          throw new Error("Failed to fetch data sources");
        }
        const data = await response.json();
        setDataSources(data.dataSources || []);
      } catch (err) {
        setError("Error loading data sources");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDataSources();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSource) {
      setError("Please select a data source");
      return;
    }

    if (!prompt.trim()) {
      setError("Please enter a question to analyze");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const response = await fetch("/api/analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataSourceId: selectedSource,
          prompt: prompt,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to analyze data");
      }

      const result = await response.json();
      router.push(`/analysis/${result.analysis.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm" aria-label="Main navigation">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link href="/" className="-m-1.5 p-1.5">
                  <span className="text-blue-600 font-bold text-xl">
                    InsightHub
                  </span>
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
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
              <div className="ml-4">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between md:space-x-5">
            <div className="flex items-center space-x-5">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  New AI Analysis
                </h1>
                <p className="text-sm font-medium text-gray-500">
                  Ask questions about your data in plain English
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {error}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-2 text-gray-500">Loading data sources...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="data-source"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Select Data Source
                      </label>
                      <div className="mt-2">
                        <select
                          id="data-source"
                          name="data-source"
                          value={selectedSource}
                          onChange={(e) => setSelectedSource(e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        >
                          <option value="">Select a data source</option>
                          {dataSources.map((source) => (
                            <option key={source.id} value={source.id}>
                              {source.name} ({source.type})
                            </option>
                          ))}
                        </select>
                        {dataSources.length === 0 && (
                          <p className="mt-2 text-sm text-gray-500">
                            No data sources available.{" "}
                            <Link
                              href="/data-sources/new"
                              className="text-blue-600 hover:text-blue-500"
                            >
                              Add a data source
                            </Link>{" "}
                            first.
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="prompt"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        What would you like to know?
                      </label>
                      <div className="mt-2">
                        <textarea
                          id="prompt"
                          name="prompt"
                          rows={4}
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                          placeholder="e.g., What were our top-selling products last month? Show me a trend of sales over time."
                        ></textarea>
                      </div>
                      <div className="mt-1">
                        <p className="text-xs text-gray-500">
                          Ask questions in plain English about your data. The AI
                          will analyze and provide insights.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Link href="/dashboard">
                        <button
                          type="button"
                          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </Link>
                      <button
                        type="submit"
                        disabled={isAnalyzing || dataSources.length === 0}
                        className="inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                      >
                        {isAnalyzing ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Analyzing...
                          </>
                        ) : (
                          "Analyze Data"
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="mt-6 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                Example Questions
              </h3>
              <div className="mt-4 text-sm">
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>
                    "What is the trend of sales over the past 6 months?"
                  </li>
                  <li>
                    "Show me the top 5 customers by revenue this quarter."
                  </li>
                  <li>
                    "Compare the performance of products A and B by region."
                  </li>
                  <li>
                    "What day of the week has the highest customer activity?"
                  </li>
                  <li>
                    "Identify unusual patterns in our transaction data."
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}