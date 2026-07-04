export type IntegrationId = "calendar" | "meet" | "zoom" | "teams";

export type UserSettings = {
  botName: string;
  autoRecord: boolean;
  autoJoin: boolean;
  transcription: boolean;
  aiSummary: boolean;
  emailRecap: boolean;
  meetingReminders: boolean;
  botStatusAlerts: boolean;
  integrations: Record<IntegrationId, boolean>;
};

export const DEFAULT_BOT_NAME = "MeetingBot";

export const defaultUserSettings: UserSettings = {
  botName: "",
  autoRecord: false,
  autoJoin: false,
  transcription: false,
  aiSummary: false,
  emailRecap: false,
  meetingReminders: false,
  botStatusAlerts: false,
  integrations: {
    calendar: false,
    meet: false,
    zoom: false,
    teams: false,
  },
};

export type SaveUserSettingsPayload = UserSettings;
