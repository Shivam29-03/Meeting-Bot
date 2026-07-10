import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import {
  countActiveMeetings,
  createMeeting,
  listMeetings,
} from "@/lib/meeting-repository";

function getUserId(session: { user?: { id?: string; email?: string | null } }) {
  return session.user?.email ?? session.user?.id;
}

const ALLOWED_MEETING_HOSTS = new Set([
  "meet.google.com",
  "zoom.us",
  "teams.microsoft.com",
  "teams.live.com",
]);

function isAllowedMeetingHost(hostname: string) {
  const normalized = hostname.toLowerCase();
  if (ALLOWED_MEETING_HOSTS.has(normalized)) {
    return true;
  }

  return normalized.endsWith(".zoom.us");
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = getUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const cursor = searchParams.get("cursor") ?? undefined;

  let limit: number | undefined;
  if (limitParam !== null) {
    const parsed = Number.parseInt(limitParam, 10);
    limit = Number.isNaN(parsed) ? 50 : Math.min(Math.max(parsed, 1), 100);
  }

  const meetings = await listMeetings(userId, {
    syncStatus: true,
    limit,
    cursor,
  });

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

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(meetUrl);
  } catch {
    return NextResponse.json(
      { error: "Please provide a valid meeting URL" },
      { status: 400 },
    );
  }

  if (!isAllowedMeetingHost(parsedUrl.hostname)) {
    return NextResponse.json(
      {
        error:
          "Unsupported meeting platform. Only Google Meet, Zoom, and Microsoft Teams links are supported.",
      },
      { status: 400 },
    );
  }

  const activeCount = await countActiveMeetings(userId);
  if (activeCount >= 3) {
    return NextResponse.json(
      { error: "You already have active recordings in progress" },
      { status: 429 },
    );
  }

  try {
    const meeting = await createMeeting({
      userId,
      meetUrl,
      title: typeof body.title === "string" ? body.title : undefined,
      recipientEmails: body.recipientEmails,
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
