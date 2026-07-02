import { NextRequest } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { success, failure } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";

import meetingService from "@/services/meeting.service";

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUser();

    await connectDB();

    const { meeting_url } = await request.json();

    if (!meeting_url) {
      return failure("meeting_url is required", 400);
    }

    const meeting = await meetingService.createMeeting(meeting_url, userId);

    return success(meeting, 201);
  } catch (error) {
    console.error("POST /meetings:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return failure("Unauthorized", 401);
    }

    return failure(
      error instanceof Error ? error.message : "Internal Server Error",
    );
  }
}

export async function GET() {
  try {
    const userId = await requireUser();

    await connectDB();

    const meetings = await meetingService.getMeetings(userId);

    return success(meetings);
  } catch (error) {
    console.error("GET /meetings:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return failure("Unauthorized", 401);
    }

    return failure(
      error instanceof Error ? error.message : "Internal Server Error",
    );
  }
}
