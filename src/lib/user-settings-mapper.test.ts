import assert from "node:assert/strict";
import test from "node:test";

import { mapUserSettingsDocToDto } from "@/lib/user-settings-mapper";

const baseDoc = {
  user_id: "organizer@example.com",
  bot_name: "MyBot",
  auto_record: true,
  auto_join: true,
  transcription: true,
  ai_summary: true,
  meeting_reminders: true,
  bot_status_alerts: true,
  integrations: { calendar: true, meet: false, zoom: true, teams: false },
};

test("emailRecap: true survives doc -> DTO mapping", () => {
  const dto = mapUserSettingsDocToDto({ ...baseDoc, email_recap: true });
  assert.equal(dto.emailRecap, true);
});

test("emailRecap: false survives doc -> DTO mapping", () => {
  const dto = mapUserSettingsDocToDto({ ...baseDoc, email_recap: false });
  assert.equal(dto.emailRecap, false);
});

test("legacy document missing email_recap defaults to false (safe opt-in)", () => {
  const dto = mapUserSettingsDocToDto({ user_id: "u@example.com" });
  assert.equal(dto.emailRecap, false);
});

test("mapping emailRecap does not overwrite unrelated settings", () => {
  const dto = mapUserSettingsDocToDto({ ...baseDoc, email_recap: true });
  assert.equal(dto.botName, "MyBot");
  assert.equal(dto.autoRecord, true);
  assert.equal(dto.aiSummary, true);
  assert.equal(dto.botStatusAlerts, true);
  assert.deepEqual(dto.integrations, {
    calendar: true,
    meet: false,
    zoom: true,
    teams: false,
  });
});

test("null document yields safe defaults with emailRecap false", () => {
  const dto = mapUserSettingsDocToDto(null);
  assert.equal(dto.emailRecap, false);
});
