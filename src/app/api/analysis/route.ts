import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { processDataSourceForAnalysis } from "@/lib/ai/data-processor";

export async function POST(request: NextRequest) {
  try {
    logger.info("Analysis request started", {
      method: "POST",
      url: request.url,
    });

    const user = await currentUser();
    if (!user) {
      logger.warn("Unauthorized analysis request", {
        ip: request.headers.get("x-forwarded-for") || "unknown",
      });
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id },
      include: { organization: true },
    });

    if (!dbUser?.organizationId) {
      logger.warn("No organization found for user", {
        userId: user.id,
        clerkUserId: user.id,
      });
      return new NextResponse(
        JSON.stringify({
          message: "No organization found for user",
          code: "NO_ORG",
        }),
        { status: 400 }
      );
    }

    const body = await request.json();
    const { dataSourceId, prompt } = body;

    if (!dataSourceId || !prompt) {
      logger.warn("Missing required fields", {
        userId: user.id,
        hasDataSourceId: !!dataSourceId,
        hasPrompt: !!prompt,
      });
      return new NextResponse(
        JSON.stringify({
          message: "Data source and prompt are required",
          code: "MISSING_FIELDS",
        }),
        { status: 400 }
      );
    }

    logger.info("Finding data source", {
      userId: user.id,
      dataSourceId,
      orgId: dbUser.organizationId,
    });

    const dataSource = await prisma.dataSource.findUnique({
      where: {
        id: dataSourceId,
        organizationId: dbUser.organizationId,
      },
    });

    if (!dataSource) {
      logger.warn("Data source not found", {
        userId: user.id,
        dataSourceId,
        orgId: dbUser.organizationId,
      });
      return new NextResponse(
        JSON.stringify({
          message: "Data source not found",
          code: "NOT_FOUND",
        }),
        { status: 404 }
      );
    }

    logger.info("Performing analysis", {
      userId: user.id,
      dataSourceId,
      dataSourceType: dataSource.type,
      promptLength: prompt.length,
    });

    let analysisResult;
    try {
      analysisResult = await processDataSourceForAnalysis(dataSourceId, prompt);
    } catch (error) {
      logger.error("Error in data processing", error);

      analysisResult = {
        summary: `We attempted to analyze "${dataSource.name}" based on your question: "${prompt}" but encountered an error.`,
        insights: [
          "Our analysis engine encountered an issue processing your data.",
          "Please verify that your data source is correctly formatted.",
          "You might try a different or more specific question.",
        ],
        visualizationSuggestion: "table",
      };
    }

    const analysis = await prisma.aIAnalysis.create({
      data: {
        prompt,
        response: analysisResult,
        organizationId: dbUser.organizationId,
      },
    });

    logger.info("Analysis completed successfully", {
      userId: user.id,
      analysisId: analysis.id,
      dataSourceId,
    });

    return new NextResponse(
      JSON.stringify({
        message: "Analysis completed successfully",
        analysis,
      }),
      { status: 201 }
    );
  } catch (error) {
    logger.error("Error performing analysis", error, {
      url: request.url,
      method: "POST",
    });

    return new NextResponse(
      JSON.stringify({
        message: "Error performing analysis",
        error: error instanceof Error ? error.message : String(error),
        code: "SERVER_ERROR",
      }),
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    logger.info("Analysis request started", {
      method: "GET",
      url: request.url,
    });

    const user = await currentUser();
    if (!user) {
      logger.warn("Unauthorized analysis request", {
        ip: request.headers.get("x-forwarded-for") || "unknown",
      });
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!dbUser?.organizationId) {
      logger.warn("No organization found for user", {
        userId: user.id,
        clerkUserId: user.id,
      });
      return new NextResponse(
        JSON.stringify({
          message: "No organization found for user",
          code: "NO_ORG",
        }),
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (id) {
      logger.info("Fetching single analysis", {
        userId: user.id,
        analysisId: id,
      });

      const analysis = await prisma.aIAnalysis.findUnique({
        where: {
          id,
          organizationId: dbUser.organizationId,
        },
      });

      if (!analysis) {
        logger.warn("Analysis not found", {
          userId: user.id,
          analysisId: id,
        });
        return new NextResponse(
          JSON.stringify({
            message: "Analysis not found",
            code: "NOT_FOUND",
          }),
          { status: 404 }
        );
      }

      logger.info("Successfully fetched analysis", {
        userId: user.id,
        analysisId: id,
      });

      return new NextResponse(JSON.stringify({ analysis }), {
        status: 200,
        headers: {
          "Cache-Control": "max-age=60, stale-while-revalidate=600",
        },
      });
    } else {
      logger.info("Fetching multiple analyses", {
        userId: user.id,
        orgId: dbUser.organizationId,
      });

      const analyses = await prisma.aIAnalysis.findMany({
        where: { organizationId: dbUser.organizationId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      logger.info("Successfully fetched analyses", {
        userId: user.id,
        count: analyses.length,
      });

      return new NextResponse(JSON.stringify({ analyses }), {
        status: 200,
        headers: {
          "Cache-Control": "max-age=30, stale-while-revalidate=300",
        },
      });
    }
  } catch (error) {
    logger.error("Error fetching analysis", error, {
      url: request.url,
      method: "GET",
    });

    return new NextResponse(
      JSON.stringify({
        message: "Error fetching analysis",
        error: error instanceof Error ? error.message : String(error),
        code: "SERVER_ERROR",
      }),
      { status: 500 }
    );
  }
}
