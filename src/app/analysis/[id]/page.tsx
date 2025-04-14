"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useParams } from "next/navigation";

interface Analysis {
  id: string;
  prompt: string;
  response: {
    summary: string;
    insights: string[];
    visualizationSuggestion: string;
  };
  feedback?: string;
  createdAt: string;
}

export default function AnalysisDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/analysis?id=${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch analysis");
        }
        const data = await response.json();
        setAnalysis(data.analysis);
      } catch (err) {
        setError("Error loading analysis");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchAnalysis();
    }
  }, [id]);

  const handleSaveFeedback = async () => {
    try {
      const response = await fetch(`/api/analysis/${id}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedback }),
      });

      if (!response.ok) {
        throw new Error("Failed to save feedback");
      }

      if (analysis) {
        setAnalysis({ ...analysis, feedback });
      }

      setFeedback("");

      alert("Feedback saved successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to save feedback");
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
              <div className="flex-shrink-0">
                <Link href="/analysis/new">
                  <button
                    type="button"
                    className="relative inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
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
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-gray-500">Loading analysis...</p>
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4">
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
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          ) : analysis ? (
            <div>
              <div className="md:flex md:items-center md:justify-between md:space-x-5">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Analysis Results
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Created at {new Date(analysis.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="mt-4 flex md:mt-0">
                  <Link href="/analysis/new">
                    <button
                      type="button"
                      className="ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      New Analysis
                    </button>
                  </Link>
                  <Link href={`/analysis/${id}/export`}>
                    <button
                      type="button"
                      className="ml-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                    >
                      <svg
                        className="-ml-0.5 mr-1.5 h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      </svg>
                      Export to Report
                    </button>
                  </Link>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Your Question
                      </h3>
                      <p className="mt-2 text-sm text-gray-600">
                        {analysis.prompt}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Analysis
                      </h3>
                      <p className="mt-2 text-sm text-gray-600">
                        {analysis.response.summary}
                      </p>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Key Insights
                      </h3>
                      <ul className="mt-2 list-disc pl-5 space-y-1">
                        {analysis.response.insights.map((insight, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Placeholder for Visualization */}
                  <div className="mt-6 bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Visualization
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Suggested visualization:{" "}
                        {analysis.response.visualizationSuggestion}
                      </p>
                      <div className="mt-4 bg-gray-100 border border-gray-300 rounded-lg h-64 flex items-center justify-center">
                        <p className="text-gray-500">
                          {/* In a real app, this would be a chart */}
                          Visualization placeholder
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Actions
                      </h3>
                      <div className="mt-4 space-y-4">
                        <Link href={`/analysis/${id}/visualize`}>
                          <button
                            type="button"
                            className="w-full inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <svg
                              className="-ml-0.5 mr-2 h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm6 0c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 019 19.875v-6.75zm6 0c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 0115 19.875v-6.75z"
                              />
                            </svg>
                            Create Visualizations
                          </button>
                        </Link>
                        <Link href={`/reports/new?analysisId=${id}`}>
                          <button
                            type="button"
                            className="w-full inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <svg
                              className="-ml-0.5 mr-2 h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                              />
                            </svg>
                            Create Report
                          </button>
                        </Link>
                        <Link href={`/analysis/${id}/share`}>
                          <button
                            type="button"
                            className="w-full inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <svg
                              className="-ml-0.5 mr-2 h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                              />
                            </svg>
                            Share Analysis
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Provide Feedback
                      </h3>
                      <div className="mt-4">
                        <textarea
                          id="feedback"
                          name="feedback"
                          rows={3}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                          placeholder="What did you think of this analysis? Your feedback helps improve our AI."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                        ></textarea>
                        <div className="mt-2 flex justify-end">
                          <button
                            type="button"
                            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                            onClick={handleSaveFeedback}
                            disabled={!feedback.trim()}
                          >
                            Save Feedback
                          </button>
                        </div>
                      </div>
                      {analysis.feedback && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                          <h4 className="text-sm font-medium text-gray-900">
                            Your Previous Feedback:
                          </h4>
                          <p className="mt-1 text-sm text-gray-600">
                            {analysis.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Analysis not found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
