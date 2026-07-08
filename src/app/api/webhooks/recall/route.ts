import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { env } from "@/lib/env";
import { updateMeetingStatusFromRecallWebhook } from "@/lib/meeting-repository";

function extractBotIdFromPayload(payload: {
  data?: { bot?: { id?: string }; bot_id?: string };
}) {
  return payload.data?.bot?.id ?? payload.data?.bot_id ?? "unknown";
}

export async function POST(request: Request) {
  try {
    const payload = await request.text();

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
    const verifiedPayload = wh.verify(payload, headers) as {
      event?: string;
      data?: { bot?: { id?: string }; bot_id?: string };
    };

    try {
      await updateMeetingStatusFromRecallWebhook(verifiedPayload);
    } catch (err) {
      console.error(
        `[Webhook Processing Error] event=${verifiedPayload.event ?? "unknown"} botId=${extractBotIdFromPayload(verifiedPayload)}`,
        err,
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Webhook Verification Failed]", error);
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }
}

