import { env } from "@/lib/env";

type RecallBotResponse = {
  id: string;
  status?: string;
};

export type RecallStatusChange = {
  code: string;
  created_at: string;
  sub_code?: string | null;
  message?: string | null;
};

export type RecallBotDetails = {
  id: string;
  status_changes?: RecallStatusChange[];
  recordings?: Array<{ id?: string }>;
};

type CreateRecallBotInput = {
  meetingUrl: string;
  botName?: string;
};

function recallBaseUrl() {
  return `https://${env.recallRegion}.recall.ai/api/v1`;
}

function recallHeaders() {
  return {
    Authorization: `Token ${env.recallApiKey}`,
    "Content-Type": "application/json",
  };
}

export async function createRecallBot({
  meetingUrl,
  botName = "MeetingBot",
}: CreateRecallBotInput): Promise<RecallBotResponse> {
  const response = await fetch(`${recallBaseUrl()}/bot/`, {
    method: "POST",
    headers: recallHeaders(),
    body: JSON.stringify({
      meeting_url: meetingUrl,
      bot_name: botName,
      recording_config: {
        transcript: {
          provider: {
            recallai_streaming: {},
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Recall bot creation failed (${response.status}): ${errorBody || response.statusText}`,
    );
  }

  return (await response.json()) as RecallBotResponse;
}

export async function getRecallBot(botId: string): Promise<RecallBotDetails> {
  const response = await fetch(`${recallBaseUrl()}/bot/${botId}/`, {
    headers: recallHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Recall bot fetch failed (${response.status}): ${errorBody || response.statusText}`,
    );
  }

  return (await response.json()) as RecallBotDetails;
}

export function getLatestRecallStatusChange(bot: RecallBotDetails) {
  const changes = bot.status_changes ?? [];
  if (changes.length === 0) {
    return null;
  }

  return [...changes].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0];
}

export async function deleteRecallBot(botId: string) {
  const response = await fetch(`${recallBaseUrl()}/bot/${botId}/`, {
    method: "DELETE",
    headers: recallHeaders(),
  });

  if (!response.ok && response.status !== 404) {
    const errorBody = await response.text();
    throw new Error(
      `Recall bot deletion failed (${response.status}): ${errorBody || response.statusText}`,
    );
  }
}
