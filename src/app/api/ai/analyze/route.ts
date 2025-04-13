import { NextResponse } from "next/server";
import  getServerSession  from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function analyzeWithGemini(prompt: string, context: any = {}) {
  // Simulate API response
  return {
    analysis: `Analysis based on prompt: "${prompt}"`,
    insights: [
      "This is a simulated insight from the AI",
      "In the actual implementation, this would come from Gemini API",
      "You would see real insights based on your data here",
    ],
    visualizationSuggestions: [
      {
        type: "line",
        title: "Sample Trend Chart",
        description: "This would show relevant data based on your query",
      },
    ],
  };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { prompt, dataSourceId } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { message: "Prompt is required" },
        { status: 400 }
      );
    }

    const organizationId = session.user.organizationId;

    let dataSourceContext = {};
    if (dataSourceId) {
      const dataSource = await prisma.dataSource.findFirst({
        where: {
          id: dataSourceId,
          organizationId,
        },
      });

      if (!dataSource) {
        return NextResponse.json(
          { message: "Data source not found" },
          { status: 404 }
        );
      }

      dataSourceContext = {
        dataSourceId: dataSource.id,
        dataSourceType: dataSource.type,
        dataSourceName: dataSource.name,
      };
    }

    const aiResponse = await analyzeWithGemini(prompt, dataSourceContext);

    const analysis = await prisma.aIAnalysis.create({
      data: {
        prompt,
        response: aiResponse,
        organizationId,
      },
    });

    return NextResponse.json({
      id: analysis.id,
      prompt: analysis.prompt,
      response: analysis.response,
      createdAt: analysis.createdAt,
    });
  } catch (error: any) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      { message: "Analysis failed: " + error.message },
      { status: 500 }
    );
  }
}
