import {
  defaultUserSettings,
  type IntegrationId,
  type UserSettings,
} from "@/lib/user-settings-types";

/**
 * Pure mapping from a persisted user-settings document (snake_case fields) to
 * the client/DTO shape (camelCase). Extracted so the exact round-trip that both
 * the Settings UI hydration and the recap orchestrator depend on is unit
 * testable without a DB connection. Behavior is identical to the prior inline
 * mapping in [user-settings.ts].
 */
export type UserSettingsDocument = {
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

export function mapUserSettingsDocToDto(
  doc: UserSettingsDocument | null,
): UserSettings {
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
