import { NextResponse } from "next/server";

import { updateMeetingStatusFromRecallWebhook } from "@/lib/meeting-repository";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const meeting = await updateMeetingStatusFromRecallWebhook(payload);

    return NextResponse.json({
      success: true,
      updated: !!meeting,
      meeting,
    });
  } catch (error) {
    console.error("Recall webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
