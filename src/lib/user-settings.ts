import { connectDB } from "@/lib/mongodb";
import {
  DEFAULT_BOT_NAME,
  defaultUserSettings,
  type IntegrationId,
  type SaveUserSettingsPayload,
  type UserSettings,
} from "@/lib/user-settings-types";
import UserSettingsModel from "@/models/UserSettings";

type UserSettingsDocument = {
  user_id: string;
  bot_name?: string;
  auto_record?: boolean;
  auto_join?: boolean;
  transcription?: boolean;
  ai_summary?: boolean;
  email_recap?: boolean;
  meeting_reminders?: boolean;
  bot_status_alerts?: boolean;
  integrations?: Partial<Record<IntegrationId, boolean>>;
};

function toUserSettingsDto(doc: UserSettingsDocument | null): UserSettings {
  if (!doc) {
    return defaultUserSettings;
  }

  return {
    botName: doc.bot_name?.trim() ?? "",
    autoRecord: doc.auto_record ?? false,
    autoJoin: doc.auto_join ?? false,
    transcription: doc.transcription ?? false,
    aiSummary: doc.ai_summary ?? false,
    emailRecap: doc.email_recap ?? false,
    meetingReminders: doc.meeting_reminders ?? false,
    botStatusAlerts: doc.bot_status_alerts ?? false,
    integrations: {
      calendar: doc.integrations?.calendar ?? false,
      meet: doc.integrations?.meet ?? false,
      zoom: doc.integrations?.zoom ?? false,
      teams: doc.integrations?.teams ?? false,
    },
  };
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
