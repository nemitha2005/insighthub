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
        JSON.stringify({
          message: "No organization found for user",
          code: "NO_ORG",
        }),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error performing analysis:", error);
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

      return new NextResponse(JSON.stringify({ analysis }), {
        status: 200,
        headers: {
          "Cache-Control": "max-age=60, stale-while-revalidate=600",
        },
      });
    } else {
      const analyses = await prisma.aIAnalysis.findMany({
        where: { organizationId: dbUser.organizationId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      return new NextResponse(JSON.stringify({ analyses }), {
        status: 200,
        headers: {
          "Cache-Control": "max-age=30, stale-while-revalidate=300",
        },
      });
    }
  } catch (error) {
    console.error("Error fetching analysis:", error);
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
