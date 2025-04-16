import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  try {
    const client = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
      errorFormat: "pretty",
    });

    client
      .$connect()
      .then(() => console.log("Successfully connected to MongoDB Atlas"))
      .catch((e) => {
        console.error("MongoDB Atlas connection error:", e);
        console.log("Check if your IP is whitelisted in Atlas Network Access");
      });

    return client;
  } catch (error) {
    console.error("Failed to initialize Prisma client:", error);
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Using a dummy Prisma client - database operations will fail"
      );
      return new PrismaClient();
    }
    throw error;
  }
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
