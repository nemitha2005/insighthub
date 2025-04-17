import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { analyzeData } from "./gemini";
import {
  inferCSVSchema,
  parseCSVToObjects,
} from "../data-processing/csv-parser";
import { getFileContent } from "../storage/file-storage";

export async function processDataSourceForAnalysis(
  dataSourceId: string,
  prompt: string
) {
  try {
    logger.info("Processing data source for analysis", {
      dataSourceId,
      promptLength: prompt.length,
    });

    const dataSource = await prisma.dataSource.findUnique({
      where: { id: dataSourceId },
      include: { datasets: true },
    });

    if (!dataSource) {
      throw new Error(`Data source with ID ${dataSourceId} not found`);
    }

    logger.info("Found data source", {
      name: dataSource.name,
      type: dataSource.type,
    });

    let dataContent = "";
    let schema = dataSource.schema;

    if (dataSource.type === "csv") {
      const configuration = dataSource.configuration as any;
      if (!configuration.fileName) {
        throw new Error("No file name found in data source configuration");
      }

      logger.info("Reading CSV file", { fileName: configuration.fileName });

      try {
        dataContent = await getFileContent(configuration.fileName);
      } catch (error) {
        logger.error("Error reading CSV file", error);
        dataContent = "No data available. This is a fallback response.";
      }
    } else {
      logger.warn("Unsupported data source type", { type: dataSource.type });
      throw new Error(
        `Data source type '${dataSource.type}' is not supported yet`
      );
    }

    if (!dataContent) {
      throw new Error("No data content found for analysis");
    }

    if (!schema && dataSource.type === "csv") {
      logger.info("Inferring schema from CSV data");
      const inferredSchema = inferCSVSchema(dataContent);
      schema = inferredSchema as any;
    }

    logger.info("Sending data to Gemini for analysis", {
      schemaAvailable: !!schema,
      dataLength: dataContent.length,
    });

    const result = await analyzeData(prompt, dataContent, schema);

    logger.info("Analysis completed successfully", {
      resultSize: JSON.stringify(result).length,
    });

    return result;
  } catch (error) {
    logger.error("Error processing data for analysis", error);
    throw error;
  }
}

export async function extractSampleData(dataSourceId: string, limit = 100) {
  try {
    logger.info("Extracting sample data", { dataSourceId, limit });

    const dataSource = await prisma.dataSource.findUnique({
      where: { id: dataSourceId },
    });

    if (!dataSource) {
      throw new Error(`Data source with ID ${dataSourceId} not found`);
    }

    if (dataSource.type === "csv") {
      const configuration = dataSource.configuration as any;
      if (!configuration.fileName) {
        throw new Error("No file name found in data source configuration");
      }

      const fileContent = await getFileContent(configuration.fileName);
      const parsedData = parseCSVToObjects(fileContent, limit);

      return {
        sourceType: "csv",
        data: parsedData,
        schema: dataSource.schema || inferCSVSchema(fileContent),
      };
    }

    throw new Error(
      `Data source type '${dataSource.type}' is not supported yet`
    );
  } catch (error) {
    logger.error("Error extracting sample data", error);
    throw error;
  }
}
