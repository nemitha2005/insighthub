type LogLevel = "info" | "warn" | "error";
type LogMeta = Record<string, any>;

class Logger {
  private static instance: Logger;

  private constructor() {
    // to enforce singleton pattern
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string, meta: LogMeta = {}) {
    this.log("info", message, meta);
  }

  warn(message: string, meta: LogMeta = {}) {
    this.log("warn", message, meta);
  }

  error(message: string, error?: any, meta: LogMeta = {}) {
    const errorMeta = error
      ? {
          ...meta,
          error:
            error instanceof Error
              ? {
                  name: error.name,
                  message: error.message,
                  stack: error.stack,
                }
              : error,
        }
      : meta;

    this.log("error", message, errorMeta);
  }

  private log(level: LogLevel, message: string, meta: LogMeta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta,
      environment: process.env.NODE_ENV || "development",
    };

    if (process.env.NODE_ENV === "production") {
      console[level](JSON.stringify(logEntry));
    } else {
      const colorMap: Record<LogLevel, string> = {
        info: "\x1b[36m%s\x1b[0m", // Cyan
        warn: "\x1b[33m%s\x1b[0m", // Yellow
        error: "\x1b[31m%s\x1b[0m", // Red
      };

      console[level](
        colorMap[level],
        `[${timestamp}] [${level.toUpperCase()}]`,
        message,
        Object.keys(meta).length ? meta : ""
      );
    }
  }
}

export const logger = Logger.getInstance();
