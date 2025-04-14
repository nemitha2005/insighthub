import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id },
      include: { organization: true },
    });

    if (!dbUser?.organizationId) {
      return new NextResponse(
        JSON.stringify({ message: "No organization found for user" }),
        { status: 400 }
      );
    }

    const body = await request.json();
    const { dataSourceId, prompt } = body;

    if (!dataSourceId || !prompt) {
      return new NextResponse(
        JSON.stringify({ message: "Data source and prompt are required" }),
        { status: 400 }
      );
    }

    const dataSource = await prisma.dataSource.findUnique({
      where: {
        id: dataSourceId,
        organizationId: dbUser.organizationId,
      },
      include: {
        datasets: true,
      },
    });

    if (!dataSource) {
      return new NextResponse(
        JSON.stringify({ message: "Data source not found" }),
        { status: 404 }
      );
    }

    const mockResponse = {
      summary: `Analysis of "${dataSource.name}" based on your question: "${prompt}"`,
      insights: [
        "Your data shows interesting patterns over time.",
        "There appears to be a correlation between X and Y variables.",
        "The top performing item in your dataset is Item A.",
      ],
      visualizationSuggestion: "bar chart comparing the key metrics",
    };

    const analysis = await prisma.aIAnalysis.create({
      data: {
        prompt,
        response: mockResponse,
        organizationId: dbUser.organizationId,
      },
    });

    return new NextResponse(
      JSON.stringify({
        message: "Analysis completed successfully",
        analysis,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error performing analysis:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Error performing analysis",
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!dbUser?.organizationId) {
      return new NextResponse(
        JSON.stringify({ message: "No organization found for user" }),
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (id) {
      const analysis = await prisma.aIAnalysis.findUnique({
        where: {
          id,
          organizationId: dbUser.organizationId,
        },
      });

      if (!analysis) {
        return new NextResponse(
          JSON.stringify({ message: "Analysis not found" }),
          { status: 404 }
        );
      }

      return new NextResponse(JSON.stringify({ analysis }), { status: 200 });
    } else {
      const analyses = await prisma.aIAnalysis.findMany({
        where: { organizationId: dbUser.organizationId },
        orderBy: { createdAt: "desc" },
      });

      return new NextResponse(JSON.stringify({ analyses }), { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Error fetching analysis",
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 }
    );
  }
}
