import { env, isRecapEmailConfigured } from "@/lib/env";

/**
 * Minimal Resend delivery abstraction over the Resend HTTP API.
 *
 * Deliberately uses `fetch` (mirroring [recall.ts]) instead of the Resend SDK
 * to avoid adding a dependency. Contains transport concerns only — no meeting
 * business logic. Secrets are never included in thrown error messages.
 */

const RESEND_EMAILS_URL = "https://api.resend.com/emails";

export type EmailAttachment = {
  filename: string;
  /** Raw (already-decoded) attachment content; encoded to base64 before send. */
  content: string;
};

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
  /** Stable key so provider-side retries after a crash do not double-send. */
  idempotencyKey?: string;
};

export type SendEmailResult = {
  id: string | null;
};

export { isRecapEmailConfigured };

function toBase64(content: string): string {
  return Buffer.from(content, "utf8").toString("base64");
}

/**
 * Sends a single email to a single recipient. Throws a sanitized error on
 * misconfiguration or provider failure (never leaking the API key).
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!isRecapEmailConfigured()) {
    throw new Error("Resend is not configured (missing RESEND_API_KEY/EMAIL_FROM)");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${env.resendApiKey}`,
    "Content-Type": "application/json",
  };
  if (input.idempotencyKey) {
    headers["Idempotency-Key"] = input.idempotencyKey;
  }

  const body: Record<string, unknown> = {
    from: env.emailFrom,
    to: [input.to],
    subject: input.subject,
    html: input.html,
  };
  if (input.text) {
    body.text = input.text;
  }
  if (env.emailReplyTo) {
    body.reply_to = env.emailReplyTo;
  }
  if (input.attachments && input.attachments.length > 0) {
    body.attachments = input.attachments.map((attachment) => ({
      filename: attachment.filename,
      content: toBase64(attachment.content),
    }));
  }

  let response: Response;
  try {
    response = await fetch(RESEND_EMAILS_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    // Network-level failure. Do not echo request details (may contain PII).
    throw new Error("Resend request failed (network error)");
  }

  if (!response.ok) {
    // Read a short, sanitized snippet for diagnostics; never include auth header.
    let detail = response.statusText;
    try {
      const errorBody = (await response.json()) as { message?: string };
      if (errorBody?.message) {
        detail = errorBody.message;
      }
    } catch {
      // ignore body parse errors
    }
    throw new Error(`Resend send failed (${response.status}): ${detail}`);
  }

  const data = (await response.json()) as { id?: string };
  return { id: data.id ?? null };
}
