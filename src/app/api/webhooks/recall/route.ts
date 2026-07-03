import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { env } from "@/lib/env";
import { updateMeetingStatusFromRecallWebhook } from "@/lib/meeting-repository";

export async function POST(request: Request) {
  try {
    const payload = await request.text();

    // Developer-friendly check: bypass signature verification if secret is placeholder
    if (env.recallWebhookSecret === "whsec_placeholder") {
      console.warn(
        "[Webhook] RECALL_WEBHOOK_SECRET is set to placeholder. Skipping signature verification for local testing.",
      );
      try {
        const parsedPayload = JSON.parse(payload);
        queueMicrotask(async () => {
          try {
            await updateMeetingStatusFromRecallWebhook(parsedPayload);
          } catch (err) {
            console.error("[Webhook Async Error] Failed processing webhook payload:", err);
          }
        });
        return NextResponse.json({ ok: true });
      } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
      }
    }

    const headersList = request.headers;
    const headers = {
      "svix-id": headersList.get("webhook-id") ?? headersList.get("svix-id") ?? "",
      "svix-timestamp": headersList.get("webhook-timestamp") ?? headersList.get("svix-timestamp") ?? "",
      "svix-signature": headersList.get("webhook-signature") ?? headersList.get("svix-signature") ?? "",
    };

    if (!headers["svix-id"] || !headers["svix-timestamp"] || !headers["svix-signature"]) {
      console.error("[Webhook] Missing required Svix signature headers");
      return NextResponse.json({ error: "Missing webhook headers" }, { status: 400 });
    }

    const wh = new Webhook(env.recallWebhookSecret);
    const verifiedPayload = wh.verify(payload, headers) as any;

    // Process asynchronously so we can return 200 response immediately to Recall
    queueMicrotask(async () => {
      try {
        await updateMeetingStatusFromRecallWebhook(verifiedPayload);
      } catch (err) {
        console.error("[Webhook Async Error] Failed processing webhook payload:", err);
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Webhook Verification Failed]", error);
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }
}

