import { NextRequest } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { success, failure } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";

import meetingService from "@/services/meeting.service";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUser();

    await connectDB();

    const { id } = await params;

    const meeting = await meetingService.getMeetingById(id, userId);

    return success(meeting);
  } catch (error) {
    console.error("GET /meetings/[id]:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return failure("Unauthorized", 401);
    }

    if (error instanceof Error && error.message === "Meeting not found") {
      return failure("Meeting not found", 404);
    }

    return failure(
      error instanceof Error ? error.message : "Internal Server Error",
    );
  }
}
