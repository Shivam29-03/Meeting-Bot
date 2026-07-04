import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { defaultUserSettings, type SaveUserSettingsPayload } from "@/lib/user-settings-types";
import { getUserSettings, saveUserSettings } from "@/lib/user-settings";

function getUserId(session: { user?: { id?: string; email?: string | null } }) {
  return session.user?.email ?? session.user?.id;
}

function isValidSettingsPayload(body: unknown): body is SaveUserSettingsPayload {
  if (!body || typeof body !== "object") {
    return false;
  }

  const payload = body as Partial<SaveUserSettingsPayload>;

  return (
    typeof payload.botName === "string" &&
    typeof payload.autoRecord === "boolean" &&
    typeof payload.autoJoin === "boolean" &&
    typeof payload.transcription === "boolean" &&
    typeof payload.aiSummary === "boolean" &&
    typeof payload.emailRecap === "boolean" &&
    typeof payload.meetingReminders === "boolean" &&
    typeof payload.botStatusAlerts === "boolean" &&
    typeof payload.integrations === "object" &&
    payload.integrations !== null &&
    typeof payload.integrations.calendar === "boolean" &&
    typeof payload.integrations.meet === "boolean" &&
    typeof payload.integrations.zoom === "boolean" &&
    typeof payload.integrations.teams === "boolean"
  );
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = getUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await getUserSettings(userId);

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Failed to load user settings:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = getUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isValidSettingsPayload(body)) {
    return NextResponse.json(
      { error: "Invalid settings payload", settings: defaultUserSettings },
      { status: 400 },
    );
  }

  try {
    const settings = await saveUserSettings(userId, body);

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Failed to save user settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
