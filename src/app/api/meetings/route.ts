import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { createMeeting, listMeetings } from "@/lib/meeting-repository";

function getUserId(session: { user?: { id?: string; email?: string | null } }) {
  return session.user?.email ?? session.user?.id;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = getUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const meetings = await listMeetings(userId, { syncStatus: true });

  return NextResponse.json({
    success: true,
    meetings,
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = getUserId(session);
  if (!userId) {
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

  try {
    const meeting = await createMeeting({
      userId,
      meetUrl,
      title: typeof body.title === "string" ? body.title : undefined,
    });

    return NextResponse.json({
      success: true,
      meeting,
    });
  } catch (error) {
    console.error("Failed to create meeting:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to start meeting recording",
      },
      { status: 502 },
    );
  }
}
