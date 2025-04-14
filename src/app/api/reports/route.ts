import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

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

    const reports = await prisma.report.findMany({
      where: { organizationId: dbUser.organizationId },
      orderBy: { createdAt: "desc" },
    });

    return new NextResponse(JSON.stringify({ reports }), { status: 200 });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Error fetching reports",
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 }
    );
  }
}

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
    });

    if (!dbUser?.organizationId) {
      return new NextResponse(
        JSON.stringify({ message: "No organization found for user" }),
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, content, isPublic = false } = body;

    if (!name) {
      return new NextResponse(
        JSON.stringify({ message: "Report name is required" }),
        { status: 400 }
      );
    }

    const report = await prisma.report.create({
      data: {
        name,
        description,
        content: content || {},
        isPublic,
        organizationId: dbUser.organizationId,
        creatorId: dbUser.id,
      },
    });

    return new NextResponse(
      JSON.stringify({
        message: "Report created successfully",
        report,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating report:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Error creating report",
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 }
    );
  }
}
