type DataType = "string" | "number" | "boolean" | "date" | "unknown";

interface ColumnSchema {
  name: string;
  type: DataType;
  nullable: boolean;
  uniqueValues?: number;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
}

interface CSVSchema {
  columns: ColumnSchema[];
  rowCount: number;
}

function detectType(value: string): DataType {
  if (value === null || value === undefined || value.trim() === "")
    return "unknown";

  if (["true", "false", "yes", "no", "0", "1"].includes(value.toLowerCase()))
    return "boolean";

  if (!isNaN(Number(value)) && value.trim() !== "") return "number";

  const datePattern =
    /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$|^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;
  if (datePattern.test(value)) return "date";

  return "string";
}

export function inferCSVSchema(
  csvContent: string,
  sampleSize = 100
): CSVSchema {
  const lines = csvContent.split("\n");
  if (lines.length === 0) {
    return { columns: [], rowCount: 0 };
  }

  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""));

  const columnSchemas: ColumnSchema[] = headers.map((name) => ({
    name,
    type: "unknown",
    nullable: false,
  }));

  const actualSampleSize = Math.min(sampleSize, lines.length - 1);
  const sampleRows = lines.slice(1, actualSampleSize + 1);

  const uniqueValues: Map<string, Set<string>>[] = columnSchemas.map(
    () => new Map()
  );
  const valueStats: { values: number[]; nullCount: number }[] =
    columnSchemas.map(() => ({
      values: [],
      nullCount: 0,
    }));

  sampleRows.forEach((row) => {
    if (!row.trim()) return;

    const values = parseCSVRow(row);

    values.forEach((value, colIndex) => {
      if (colIndex >= columnSchemas.length) return;

      const trimmedValue = value?.trim() || "";

      if (!trimmedValue) {
        valueStats[colIndex].nullCount++;
        columnSchemas[colIndex].nullable = true;
        return;
      }

      if (!uniqueValues[colIndex].has(trimmedValue)) {
        uniqueValues[colIndex].set(trimmedValue, new Set());
      }
      uniqueValues[colIndex].get(trimmedValue)?.add(trimmedValue);

      const detectedType = detectType(trimmedValue);
      if (detectedType === "number") {
        valueStats[colIndex].values.push(Number(trimmedValue));
      }

      if (columnSchemas[colIndex].type === "unknown") {
        columnSchemas[colIndex].type = detectedType;
      } else if (columnSchemas[colIndex].type !== detectedType) {
        if (columnSchemas[colIndex].type !== "string") {
          columnSchemas[colIndex].type = "string";
        }
      }
    });
  });

  columnSchemas.forEach((schema, idx) => {
    schema.uniqueValues = uniqueValues[idx].size;

    if (schema.type === "number" && valueStats[idx].values.length > 0) {
      const numValues = valueStats[idx].values;
      schema.min = Math.min(...numValues);
      schema.max = Math.max(...numValues);
      schema.mean =
        numValues.reduce((sum, val) => sum + val, 0) / numValues.length;

      const sorted = [...numValues].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      schema.median =
        sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];
    }
  });

  return {
    columns: columnSchemas,
    rowCount: lines.length - 1,
  };
}

function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let currentValue = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = i < row.length - 1 ? row[i + 1] : null;

    if (char === '"' && !inQuotes) {
      inQuotes = true;
      continue;
    }

    if (char === '"' && inQuotes) {
      if (nextChar === '"') {
        currentValue += '"';
        i++;
      } else {
        inQuotes = false;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(currentValue);
      currentValue = "";
      continue;
    }

    currentValue += char;
  }

  result.push(currentValue);

  return result;
}

export function parseCSVToObjects(
  csvContent: string,
  limit?: number
): Record<string, string | number | boolean | Date | null>[] {
  const lines = csvContent.split("\n").filter((line) => line.trim() !== "");
  if (lines.length <= 1) return [];

  const headers = parseCSVRow(lines[0]);

  const rowCount = limit ? Math.min(lines.length - 1, limit) : lines.length - 1;
  const results: Record<string, string | number | boolean | Date | null>[] = [];

  for (let i = 1; i <= rowCount; i++) {
    if (!lines[i]?.trim()) continue;

    const values = parseCSVRow(lines[i]);
    const row: Record<string, string | number | boolean | Date | null> = {};

    headers.forEach((header, idx) => {
      const value = values[idx]?.trim() || null;

      if (value === null) {
        row[header] = null;
      } else {
        if (!isNaN(Number(value))) {
          row[header] = Number(value);
        } else if (["true", "yes"].includes(value.toLowerCase())) {
          row[header] = true;
        } else if (["false", "no"].includes(value.toLowerCase())) {
          row[header] = false;
        } else {
          const dateValue = new Date(value);
          if (!isNaN(dateValue.getTime()) && value.includes("-")) {
            row[header] = dateValue;
          } else {
            row[header] = value;
          }
        }
      }
    });

    results.push(row);
  }

  return results;
}
