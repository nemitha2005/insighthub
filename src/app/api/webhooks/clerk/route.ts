import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const WEBHOOK_SECRET =
    process.env.CLERK_WEBHOOK_SECRET || "whsec_placeholder";

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }

  const eventType = evt.type;
  console.log(`Webhook received: ${eventType}`);

  try {
    if (eventType === "organization.created") {
      const { id, name, slug } = evt.data;

      await prisma.organization.create({
        data: {
          clerkOrgId: id,
          name: name,
          slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        },
      });

      console.log(`Created organization: ${name}`);
    }

    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name } = evt.data;

      const primaryEmail = email_addresses.find(
        (email) => email.id === evt.data.primary_email_address_id
      );

      if (primaryEmail) {
        await prisma.user.create({
          data: {
            clerkUserId: id,
            email: primaryEmail.email_address,
            name: `${first_name || ""} ${last_name || ""}`.trim(),
          },
        });

        console.log(`Created user: ${primaryEmail.email_address}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Error processing webhook", { status: 500 });
  }
}
