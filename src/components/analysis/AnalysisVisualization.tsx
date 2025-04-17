"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

type VisualizationType = "bar" | "line" | "pie" | "table";

interface AnalysisVisualizationProps {
  visualizationType?: string;
  dataSourceId: string;
  analysisId: string;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFCC33",
  "#FF6666",
];

export default function AnalysisVisualization({
  visualizationType = "bar",
  dataSourceId,
  analysisId,
}: AnalysisVisualizationProps) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<VisualizationType>(
    determineChartType(visualizationType)
  );

  function determineChartType(suggestion: string): VisualizationType {
    const lowercased = suggestion.toLowerCase();
    if (lowercased.includes("bar")) return "bar";
    if (lowercased.includes("line") || lowercased.includes("trend"))
      return "line";
    if (lowercased.includes("pie") || lowercased.includes("distribution"))
      return "pie";
    return "bar";
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/data-sources/${dataSourceId}/sample?analysisId=${analysisId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch visualization data");
        }

        const result = await response.json();

        if (
          result.data &&
          Array.isArray(result.data) &&
          result.data.length > 0
        ) {
          const visualizationData = result.data.slice(0, 10);
          setData(visualizationData);
        } else {
          setData(generatePlaceholderData(chartType));
        }
      } catch (err) {
        console.error("Error fetching visualization data:", err);
        setError("Failed to load visualization data");
        setData(generatePlaceholderData(chartType));
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [dataSourceId, analysisId, chartType]);

  function generatePlaceholderData(type: VisualizationType): any[] {
    switch (type) {
      case "bar":
      case "line":
        return [
          { name: "Category A", value: 400 },
          { name: "Category B", value: 300 },
          { name: "Category C", value: 500 },
          { name: "Category D", value: 200 },
          { name: "Category E", value: 350 },
        ];
      case "pie":
        return [
          { name: "Segment 1", value: 35 },
          { name: "Segment 2", value: 25 },
          { name: "Segment 3", value: 20 },
          { name: "Segment 4", value: 20 },
        ];
      case "table":
        return [
          { id: 1, name: "Item 1", value: 100 },
          { id: 2, name: "Item 2", value: 200 },
          { id: 3, name: "Item 3", value: 300 },
        ];
      default:
        return [];
    }
  }

  function renderChart() {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <span className="ml-2 text-gray-600">Loading visualization...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64 bg-red-50 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      );
    }

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                textAnchor="end"
                height={70}
                angle={-45}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                textAnchor="end"
                height={70}
                angle={-45}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0088FE"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case "table":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  {Object.keys(data[0] || {}).map((key) => (
                    <th
                      key={key}
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.map((item, index) => (
                  <tr key={index}>
                    {Object.values(item).map((value: any, i) => (
                      <td
                        key={i}
                        className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-md">
            <p className="text-gray-600">No visualization available</p>
          </div>
        );
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Visualization</h3>
        <div className="flex space-x-2">
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as VisualizationType)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="table">Table</option>
          </select>
        </div>
      </div>
      {renderChart()}
    </div>
  );
}
