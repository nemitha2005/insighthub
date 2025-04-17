import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { logger } from "@/lib/logger";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

export async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    logger.info("Upload directory created/confirmed", { path: UPLOAD_DIR });
  } catch (error) {
    logger.error("Failed to create upload directory", error);
    throw new Error("Failed to initialize file storage system");
  }
}

ensureUploadDir().catch((err) => {
  logger.error("Critical error initializing file storage", err);
});

export async function storeFile(
  file: File,
  prefix = ""
): Promise<{ filename: string; storedPath: string }> {
  try {
    const id = uuidv4();
    const originalName = file.name;
    const extension = path.extname(originalName);
    const sanitizedPrefix = prefix.replace(/[^a-z0-9]/gi, "_");

    const filename = `${
      sanitizedPrefix ? sanitizedPrefix + "_" : ""
    }${id}${extension}`;
    const storedPath = path.join(UPLOAD_DIR, filename);

    logger.info("Storing file", {
      originalName,
      storedFilename: filename,
      size: file.size,
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(storedPath, buffer);

    return {
      filename,
      storedPath,
    };
  } catch (error) {
    logger.error("Error storing file", error);
    throw new Error("Failed to store file");
  }
}

export async function getFileContent(filename: string): Promise<string> {
  try {
    const filepath = path.join(UPLOAD_DIR, filename);

    try {
      await fs.access(filepath);
    } catch (error) {
      logger.error(`File not found: ${filename}`, error);
      throw new Error("File not found");
    }

    const content = await fs.readFile(filepath, "utf8");
    logger.info(`Successfully read file: ${filename}`, {
      size: content.length,
    });

    return content;
  } catch (error) {
    logger.error(`Error reading file: ${filename}`, error);
    if (error instanceof Error) {
      throw new Error(`Failed to read file: ${error.message}`);
    } else {
      throw new Error("Failed to read file: Unknown error");
    }
  }
}

export async function deleteFile(filename: string): Promise<boolean> {
  try {
    const filepath = path.join(UPLOAD_DIR, filename);

    try {
      await fs.access(filepath);
    } catch (error) {
      logger.warn(`File not found for deletion: ${filename}`);
      return false;
    }

    await fs.unlink(filepath);
    logger.info(`File deleted: ${filename}`);
    return true;
  } catch (error) {
    logger.error(`Error deleting file: ${filename}`, error);
    throw new Error("Failed to delete file");
  }
}
