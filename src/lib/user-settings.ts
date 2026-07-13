import { connectDB } from "@/lib/mongodb";
import {
  DEFAULT_BOT_NAME,
  type SaveUserSettingsPayload,
  type UserSettings,
} from "@/lib/user-settings-types";
import {
  mapUserSettingsDocToDto,
  type UserSettingsDocument,
} from "@/lib/user-settings-mapper";
import UserSettingsModel from "@/models/UserSettings";

function toUserSettingsDto(doc: UserSettingsDocument | null): UserSettings {
  return mapUserSettingsDocToDto(doc);
}

export async function getUserSettings(userId: string): Promise<UserSettings> {
  await connectDB();

  const settings = await UserSettingsModel.findOne({ user_id: userId }).lean();
  return toUserSettingsDto(settings);
}

export async function saveUserSettings(
  userId: string,
  payload: SaveUserSettingsPayload,
): Promise<UserSettings> {
  await connectDB();

  const botName = payload.botName.trim();

  const settings = await UserSettingsModel.findOneAndUpdate(
    { user_id: userId },
    {
      user_id: userId,
      bot_name: botName,
      auto_record: payload.autoRecord,
      auto_join: payload.autoJoin,
      transcription: payload.transcription,
      ai_summary: payload.aiSummary,
      email_recap: payload.emailRecap,
      meeting_reminders: payload.meetingReminders,
      bot_status_alerts: payload.botStatusAlerts,
      integrations: payload.integrations,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  ).lean();

  return toUserSettingsDto(settings);
}

export async function getBotNameForUser(userId: string): Promise<string> {
  const settings = await getUserSettings(userId);
  return settings.botName.trim() || DEFAULT_BOT_NAME;
}
