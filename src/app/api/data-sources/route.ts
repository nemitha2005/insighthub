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
    });

    if (!dbUser?.organizationId) {
      return new NextResponse(
        JSON.stringify({ message: "No organization found for user" }),
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const file = formData.get("file") as File | null;

    if (!name || !type) {
      return new NextResponse(
        JSON.stringify({ message: "Name and type are required" }),
        { status: 400 }
      );
    }

    if (type === "csv" && !file) {
      return new NextResponse(
        JSON.stringify({ message: "CSV file is required" }),
        { status: 400 }
      );
    }

    let schema = null;
    if (file) {
      const fileText = await file.text();
      const lines = fileText.split("\n");

      if (lines.length > 0) {
        const headers = lines[0].split(",").map((header) => header.trim());

        schema = {
          fields: headers.map((header) => ({
            name: header,
            type: "string",
          })),
          rowCount: lines.length - 1,
        };
      }
    }

    const dataSource = await prisma.dataSource.create({
      data: {
        name,
        type,
        configuration: {
          fileName: file ? file.name : null,
          fileSize: file ? file.size : null,
          fileType: file ? file.type : null,
        },
        schema: schema,
        organizationId: dbUser.organizationId,
      },
    });

    if (type === "csv" && file) {
      await prisma.dataset.create({
        data: {
          name: `${name} Dataset`,
          description: `Dataset created from ${file.name}`,
          dataSourceId: dataSource.id,
        },
      });
    }

    return new NextResponse(
      JSON.stringify({
        message: "Data source created successfully",
        dataSource,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating data source:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Error creating data source",
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

    const dataSources = await prisma.dataSource.findMany({
      where: { organizationId: dbUser.organizationId },
      orderBy: { createdAt: "desc" },
      include: { datasets: true },
    });

    return new NextResponse(JSON.stringify({ dataSources }), { status: 200 });
  } catch (error) {
    console.error("Error fetching data sources:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Error fetching data sources",
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 }
    );
  }
}
