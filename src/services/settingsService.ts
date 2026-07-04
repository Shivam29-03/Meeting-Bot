import api from "@/lib/axios";
import type { SaveUserSettingsPayload, UserSettings } from "@/lib/user-settings-types";

export async function getSettings() {
  const response = await api.get<{ success: boolean; settings: UserSettings }>("/api/settings");
  return response.data;
}

export async function saveSettings(payload: SaveUserSettingsPayload) {
  const response = await api.put<{ success: boolean; settings: UserSettings }>(
    "/api/settings",
    payload,
  );
  return response.data;
}
