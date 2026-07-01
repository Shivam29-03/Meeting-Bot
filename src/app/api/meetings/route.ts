import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { createMeeting, listMeetings } from "@/lib/meeting-store";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    meetings: listMeetings(),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const meetUrl = typeof body.meetUrl === "string" ? body.meetUrl.trim() : "";

  if (!meetUrl) {
    return NextResponse.json(
      { error: "Meeting URL is required" },
      { status: 400 },
    );
  }

  try {
    new URL(meetUrl);
  } catch {
    return NextResponse.json(
      { error: "Please provide a valid meeting URL" },
      { status: 400 },
    );
  }

  const meeting = createMeeting({
    meetUrl,
    title: typeof body.title === "string" ? body.title : undefined,
    createdBy: session.user?.email ?? undefined,
  });

  return NextResponse.json({
    success: true,
    meeting,
  });
}
