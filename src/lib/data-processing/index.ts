import { inferCSVSchema, parseCSVToObjects } from "./csv-parser";

export async function processFileUpload(file: File) {
  if (!file) throw new Error("No file provided");

  const fileText = await file.text();

  if (file.type === "text/csv" || file.name.endsWith(".csv")) {
    const schema = inferCSVSchema(fileText);
    const sampleData = parseCSVToObjects(fileText, 100);

    return {
      fileType: "csv",
      schema,
      sampleData,
      rawContent: fileText,
    };
  }

  throw new Error(`Unsupported file type: ${file.type}`);
}

export function generateDataInsights(data: Record<string, any>[]) {
  if (!data || data.length === 0) {
    return { insights: [] };
  }

  const columns = Object.keys(data[0]);
  const insights = [];

  for (const column of columns) {
    const values = data
      .map((row) => row[column])
      .filter((val) => val !== null && val !== undefined);

    if (values.length === 0) continue;

    const firstValue = values[0];
    const valueType = typeof firstValue;

    if (valueType === "number") {
      const numValues = values as number[];
      const sum = numValues.reduce((acc, val) => acc + val, 0);
      const avg = sum / numValues.length;
      const max = Math.max(...numValues);
      const min = Math.min(...numValues);

      insights.push({
        column,
        type: "number",
        stats: {
          count: numValues.length,
          min,
          max,
          avg,
          sum,
        },
        insight: `${column} ranges from ${min} to ${max} with an average of ${avg.toFixed(
          2
        )}.`,
      });
    } else if (valueType === "string") {
      const uniqueValues = new Set(values).size;
      const topValues = getTopValues(values as string[], 3);

      insights.push({
        column,
        type: "string",
        stats: {
          count: values.length,
          unique: uniqueValues,
          topValues,
        },
        insight:
          uniqueValues === values.length
            ? `${column} has all unique values.`
            : `${column} has ${uniqueValues} unique values out of ${values.length} total.`,
      });
    } else if (firstValue instanceof Date) {
      const dates = values as Date[];
      const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

      insights.push({
        column,
        type: "date",
        stats: {
          count: dates.length,
          minDate,
          maxDate,
        },
        insight: `${column} spans from ${minDate.toLocaleDateString()} to ${maxDate.toLocaleDateString()}.`,
      });
    }
  }

  return { insights };
}

function getTopValues(values: string[], limit = 3) {
  const counts: Record<string, number> = {};

  for (const value of values) {
    counts[value] = (counts[value] || 0) + 1;
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}
