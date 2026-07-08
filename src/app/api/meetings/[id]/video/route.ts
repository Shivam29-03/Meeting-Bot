import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getMeetingDetail } from "@/lib/meeting-detail";
import { sanitizeMeetingFileName } from "@/lib/meeting-file-name";

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

  if (!detail.videoUrl) {
    return NextResponse.json({ error: "Video not available" }, { status: 404 });
  }

  try {
    const videoResponse = await fetch(detail.videoUrl);

    if (!videoResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch video" }, { status: 502 });
    }

    if (!videoResponse.body) {
      return NextResponse.json({ error: "Failed to fetch video" }, { status: 502 });
    }

    const fileName = `${sanitizeMeetingFileName(detail.meeting.title)}-recording.mp4`;
    const responseHeaders: Record<string, string> = {
      "Content-Type": videoResponse.headers.get("content-type") ?? "video/mp4",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    };
    const contentLength = videoResponse.headers.get("content-length");
    if (contentLength) {
      responseHeaders["Content-Length"] = contentLength;
    }

    return new NextResponse(videoResponse.body, {
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[GET Meeting Video API] Failed to proxy video download:", error);
    return NextResponse.json({ error: "Failed to download video" }, { status: 502 });
  }
}
