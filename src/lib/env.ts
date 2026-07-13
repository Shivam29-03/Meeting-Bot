function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string): string {
  return process.env[name]?.trim() ?? "";
}

export const env = {
  nextAuthUrl: requireEnv("NEXTAUTH_URL"),
  nextAuthSecret: requireEnv("NEXTAUTH_SECRET"),
  googleClientId: requireEnv("GOOGLE_CLIENT_ID"),
  googleClientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
  mongodbUri: requireEnv("MONGODB_URI"),
  recallApiKey: requireEnv("RECALL_API"),
  recallRegion: requireEnv("RECALL_REGION"),
  recallWebhookSecret: requireEnv("RECALL_WEBHOOK_SECRET"),
  openaiApiKey: requireEnv("OPENAI_API_KEY"),

  // --- Recap email (Resend). Optional: when unset, the recap feature is simply
  // disabled and the rest of the app is unaffected. Never required at import. ---
  resendApiKey: optionalEnv("RESEND_API_KEY"),
  emailFrom: optionalEnv("EMAIL_FROM"),
  emailReplyTo: optionalEnv("EMAIL_REPLY_TO"),
  // Global kill switch. Defaults to enabled when Resend is configured; set to
  // "false" to hard-disable recap emails regardless of other settings.
  recapEmailEnabled: optionalEnv("RECAP_EMAIL_ENABLED").toLowerCase() !== "false",
};

/**
 * True only when the minimum Resend configuration is present. Used to fail the
 * recap feature safely (skip, never throw) when it is not configured.
 */
export function isRecapEmailConfigured(): boolean {
  return Boolean(env.resendApiKey && env.emailFrom);
}
