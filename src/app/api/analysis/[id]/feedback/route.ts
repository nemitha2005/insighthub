import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

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

    const body = await request.json();
    const { feedback } = body;

    if (!feedback) {
      return new NextResponse(
        JSON.stringify({ message: "Feedback is required" }),
        { status: 400 }
      );
    }

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

    const updatedAnalysis = await prisma.aIAnalysis.update({
      where: { id },
      data: { feedback },
    });

    return new NextResponse(
      JSON.stringify({
        message: "Feedback saved successfully",
        analysis: updatedAnalysis,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving feedback:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Error saving feedback",
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 }
    );
  }
}
