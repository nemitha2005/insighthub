import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    logger.info("Starting account setup", { userId: user.id });

    // Check if user already exists in the database
    let dbUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!dbUser) {
      // Create user if not exists
      const primaryEmail = user.emailAddresses.find(
        (email) => email.id === user.primaryEmailAddressId
      );

      if (!primaryEmail) {
        logger.error("No primary email found for user", null, { userId: user.id });
        return new NextResponse(
          JSON.stringify({ message: "No primary email found for user" }),
          { status: 400 }
        );
      }

      // Create a default organization
      const organization = await prisma.organization.create({
        data: {
          name: `${user.firstName || "Default"}'s Organization`,
          slug: `${user.firstName || "default"}-org-${Date.now()}`.toLowerCase().replace(/\s+/g, "-"),
          clerkOrgId: user.id, // Using user.id as org ID for simplicity
          plan: "free",
        },
      });

      logger.info("Created organization", { 
        organizationId: organization.id, 
        userId: user.id 
      });

      // Create the user and associate with organization
      dbUser = await prisma.user.create({
        data: {
          clerkUserId: user.id,
          email: primaryEmail.emailAddress,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          role: "ADMIN",
          organizationId: organization.id,
        },
      });

      logger.info("Created user account", { userId: user.id, dbUserId: dbUser.id });

      return new NextResponse(
        JSON.stringify({
          message: "User and organization created successfully",
          user: dbUser,
          organization,
        }),
        { status: 201 }
      );
    }

    // If user exists but has no organization
    if (!dbUser.organizationId) {
      // Create a default organization
      const organization = await prisma.organization.create({
        data: {
          name: `${user.firstName || "Default"}'s Organization`,
          slug: `${user.firstName || "default"}-org-${Date.now()}`.toLowerCase().replace(/\s+/g, "-"),
          clerkOrgId: user.id, // Using user.id as org ID for simplicity
          plan: "free",
        },
      });

      logger.info("Created organization for existing user", { 
        organizationId: organization.id, 
        userId: user.id 
      });

      // Update user with organization ID
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { organizationId: organization.id },
      });

      return new NextResponse(
        JSON.stringify({
          message: "Organization created and user updated successfully",
          user: dbUser,
          organization,
        }),
        { status: 201 }
      );
    }

    logger.info("User and organization already exist", { 
      userId: user.id,
      organizationId: dbUser.organizationId
    });

    return new NextResponse(
      JSON.stringify({
        message: "User and organization already exist",
        user: dbUser,
      }),
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error setting up user and organization", error);
    
    return new NextResponse(
      JSON.stringify({
        message: "Error setting up user and organization",
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 }
    );
  }
}