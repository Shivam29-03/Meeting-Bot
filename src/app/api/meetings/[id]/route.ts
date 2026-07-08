import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getMeetingDetail } from "@/lib/meeting-detail";
import { deleteMeeting } from "@/lib/meeting-repository";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function getUserId(session: { user?: { id?: string; email?: string | null } }) {
  return session.user?.email ?? session.user?.id;
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = getUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const detail = await getMeetingDetail(id, userId);

  if (!detail) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    meeting: detail.meeting,
    video_url: detail.videoUrl,
    duration_seconds: detail.durationSeconds,
    participants: detail.participants,
    transcript: {
      segments: detail.transcriptSegments,
    },
    ai_summary: detail.aiSummary,
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = getUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteMeeting(id, userId);

  if (!deleted) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
