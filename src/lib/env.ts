function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
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
};
