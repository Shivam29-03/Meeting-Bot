export type FailureReasonContent = {
  title: string;
  message: string;
  short: string;
};

/**
 * Maps a persisted failure reason code (stored in Meeting.subCode / failureReason)
 * to human-readable copy for the UI. Handles both the new derived codes and the
 * older raw Recall sub_codes for backward compatibility.
 */
export function getFailureReasonContent(
  reason?: string | null,
): FailureReasonContent {
  switch (reason) {
    case "denied_entry":
      return {
        title: "The bot wasn't admitted to the meeting",
        message:
          "The host didn't let the bot in from the waiting room, so nothing was recorded.",
        short: "Not admitted by host",
      };
    case "recording_denied":
    case "recording_permission_denied":
      return {
        title: "Recording was declined",
        message:
          "The host declined the recording request, so this meeting wasn't recorded.",
        short: "Recording declined",
      };
    case "bot_blocked":
    case "google_meet_bot_blocked":
      return {
        title: "The bot was blocked",
        message: "Google Meet blocked the bot from joining this meeting.",
        short: "Bot blocked",
      };
    case "login_required":
    case "google_meet.login_required":
    case "google_meet_login_not_available":
      return {
        title: "Sign-in required",
        message:
          "This meeting only allows signed-in Google accounts, so the bot couldn't join.",
        short: "Sign-in required",
      };
    default:
      return {
        title: "Recording failed",
        message: "The bot couldn't record this meeting. Please try again.",
        short: "Recording failed",
      };
  }
}
