import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { deleteMeeting, getMeetingById } from "@/lib/meeting-repository";
import Meeting from "@/models/Meeting";
import MeetingTranscript from "@/models/MeetingTranscript";
import { getRecallBot } from "@/lib/recall";

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
  const meeting = await getMeetingById(id, userId);

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  const meetingDoc = await Meeting.findById(id).lean();
  if (!meetingDoc) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  let videoUrl: string | null = null;
  if (meetingDoc.bot_id) {
    try {
      const botDetails = await getRecallBot(meetingDoc.bot_id);
      const recording = botDetails.recordings?.[0];
      videoUrl =
        recording?.media_shortcuts?.video_mixed?.data?.download_url ??
        recording?.media_shortcuts?.video_mixed_mp4?.data?.download_url ??
        recording?.media_shortcuts?.video_mixed?.download_url ??
        null;
    } catch (err) {
      console.error(
        `[GET Meeting API] Failed to fetch Recall video URL for bot ${meetingDoc.bot_id}:`,
        err,
      );
    }
  }

  let segments: any[] = [];
  try {
    const transcriptDoc = await MeetingTranscript.findOne({
      meeting_id: meetingDoc._id,
    }).lean();
    if (transcriptDoc) {
      segments = transcriptDoc.segments || [];
    }
  } catch (err) {
    console.error("[GET Meeting API] Failed to fetch transcript segments from DB:", err);
  }

  return NextResponse.json({
    success: true,
    meeting,
    video_url: videoUrl,
    transcript: {
      segments,
    },
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
