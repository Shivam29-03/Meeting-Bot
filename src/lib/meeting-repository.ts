import mongoose from "mongoose";

import Meeting from "@/models/Meeting";
import { connectDB } from "@/lib/mongodb";
import { titleFromUrl, toMeetingDto } from "@/lib/meeting-mapper";
import type { Meeting as MeetingDto } from "@/lib/meeting-types";
import { mapRecallCodeToDbStatus, recallEventToDbStatus } from "@/lib/recall-status";
import type { MeetingStatus as DbMeetingStatus } from "@/types/meeting";
import {
  createRecallBot,
  deleteRecallBot,
  getLatestRecallStatusChange,
  getRecallBot,
} from "@/lib/recall";

type CreateMeetingInput = {
  userId: string;
  meetUrl: string;
  title?: string;
};

const ACTIVE_DB_STATUSES: DbMeetingStatus[] = [
  "requested",
  "joining",
  "in_call",
  "recording",
];

async function ensureDb() {
  await connectDB();
}

function extractWebhookUpdate(payload: {
  event: string;
  data?: {
    bot?: { id?: string };
    data?: { code?: string; sub_code?: string | null };
    bot_id?: string;
    status?: {
      code?: string;
      sub_code?: string | null;
      recording_id?: string;
    };
  };
}) {
  const botId = payload.data?.bot?.id ?? payload.data?.bot_id;
  if (!botId) {
    return null;
  }

  let statusCode: string | undefined;
  if (payload.event in recallEventToDbStatus) {
    statusCode = payload.event;
  } else if (payload.data?.status?.code) {
    statusCode = `bot.${payload.data.status.code}`;
  } else if (payload.data?.data?.code) {
    statusCode = `bot.${payload.data.data.code}`;
  }

  if (!statusCode) {
    return null;
  }

  const dbStatus = recallEventToDbStatus[statusCode];
  if (!dbStatus) {
    return null;
  }

  return {
    botId,
    dbStatus,
    recordingId: payload.data?.status?.recording_id,
    subCode: payload.data?.status?.sub_code ?? payload.data?.data?.sub_code ?? null,
  };
}

export async function syncMeetingStatusFromRecall(botId: string): Promise<MeetingDto | null> {
  await ensureDb();

  const recallBot = await getRecallBot(botId);
  const latestChange = getLatestRecallStatusChange(recallBot);
  if (!latestChange) {
    return null;
  }

  const dbStatus = mapRecallCodeToDbStatus(latestChange.code);
  if (!dbStatus) {
    return null;
  }

  const recordingId = recallBot.recordings?.find((recording) => recording.id)?.id;

  const meeting = await Meeting.findOneAndUpdate(
    { bot_id: botId },
    {
      status: dbStatus,
      ...(recordingId ? { recording_id: recordingId } : {}),
      ...(latestChange.sub_code ? { sub_code: latestChange.sub_code } : {}),
    },
    { returnDocument: "after" },
  ).lean();

  return meeting ? toMeetingDto(meeting) : null;
}

async function syncActiveMeetings(userId: string) {
  const activeMeetings = await Meeting.find({
    user_id: userId,
    status: { $in: ACTIVE_DB_STATUSES },
  }).lean();

  await Promise.allSettled(
    activeMeetings.map((meeting) => syncMeetingStatusFromRecall(meeting.bot_id)),
  );
}

export async function listMeetings(
  userId: string,
  options?: { syncStatus?: boolean },
): Promise<MeetingDto[]> {
  await ensureDb();

  if (options?.syncStatus) {
    try {
      await syncActiveMeetings(userId);
    } catch (error) {
      console.error("Failed to sync meeting statuses from Recall:", error);
    }
  }

  const meetings = await Meeting.find({ user_id: userId })
    .sort({ created_at: -1 })
    .lean();

  return meetings.map((meeting) => toMeetingDto(meeting));
}

export async function getMeetingById(
  id: string,
  userId: string,
): Promise<MeetingDto | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  await ensureDb();

  const existing = await Meeting.findOne({ _id: id, user_id: userId }).lean();
  if (!existing) {
    return null;
  }

  if (ACTIVE_DB_STATUSES.includes(existing.status)) {
    await syncMeetingStatusFromRecall(existing.bot_id);
  }

  const meeting = await Meeting.findOne({ _id: id, user_id: userId }).lean();
  return meeting ? toMeetingDto(meeting) : null;
}

export async function createMeeting({
  userId,
  meetUrl,
  title,
}: CreateMeetingInput): Promise<MeetingDto> {
  await ensureDb();

  const recallBot = await createRecallBot({
    meetingUrl: meetUrl,
    botName: "MeetingBot",
  });

  let initialStatus: DbMeetingStatus = "joining";

  try {
    const recallDetails = await getRecallBot(recallBot.id);
    const latestChange = getLatestRecallStatusChange(recallDetails);
    if (latestChange) {
      const mapped = mapRecallCodeToDbStatus(latestChange.code);
      if (mapped) {
        initialStatus = mapped;
      }
    }
  } catch (error) {
    console.error("Failed to fetch initial Recall bot status:", error);
  }

  const meeting = await Meeting.create({
    user_id: userId,
    bot_id: recallBot.id,
    meeting_url: meetUrl,
    title: title?.trim() || titleFromUrl(meetUrl),
    status: initialStatus,
  });

  return toMeetingDto(meeting);
}

export async function deleteMeeting(id: string, userId: string): Promise<boolean> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }

  await ensureDb();

  const meeting = await Meeting.findOne({ _id: id, user_id: userId });
  if (!meeting) {
    return false;
  }

  try {
    await deleteRecallBot(meeting.bot_id);
  } catch (error) {
    console.error("Failed to delete Recall bot:", error);
  }

  await meeting.deleteOne();
  return true;
}

export async function updateMeetingStatusFromRecallWebhook(payload: {
  event: string;
  data?: {
    bot?: { id?: string };
    data?: { code?: string; sub_code?: string | null };
    bot_id?: string;
    status?: {
      code?: string;
      sub_code?: string | null;
      recording_id?: string;
    };
  };
}) {
  await ensureDb();

  const update = extractWebhookUpdate(payload);
  if (!update) {
    return null;
  }

  const meeting = await Meeting.findOneAndUpdate(
    { bot_id: update.botId },
    {
      status: update.dbStatus,
      ...(update.recordingId ? { recording_id: update.recordingId } : {}),
      ...(update.subCode ? { sub_code: update.subCode } : {}),
    },
    { returnDocument: "after" },
  ).lean();

  return meeting ? toMeetingDto(meeting) : null;
}
