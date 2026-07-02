import Meeting from "@/models/Meeting";
import recallService from "@/services/recall.service";
import { isValidGoogleMeetUrl } from "@/utils/validator";

class MeetingService {
  /**
   * Create a Meeting
   */
  async createMeeting({ meetingUrl, userId }: { meetingUrl: string; userId: string }) {
    // Validate Google Meet URL
    if (!isValidGoogleMeetUrl(meetingUrl)) {
      throw new Error("Invalid Google Meet URL");
    }

    // Create Recall Bot
    const bot = await recallService.createBot(meetingUrl, userId);

    // Save Meeting
    const meeting = await Meeting.create({
      user_id: userId,

      bot_id: bot.id,

      meeting_url: meetingUrl,

      status: bot.status_changes?.[0]?.code ?? "requested",

      recording_id: null,

      title: null,

      sub_code: null,

      video_gcs_path: null,

      transcript_gcs_path: null,

      has_transcript: false,
    });

    return {
      id: meeting._id,
      bot_id: meeting.bot_id,
      status: meeting.status,
    };
  }

  /**
   * Get all meetings for a user
   */
  async getMeetings(userId: string) {
    return await Meeting.find({
      user_id: userId,
    }).sort({
      created_at: -1,
    });
  }

  /**
   * Get a meeting by id
   */
  async getMeetingById(meetingId: string, userId: string) {
    const meeting = await Meeting.findOne({
      _id: meetingId,
      user_id: userId,
    });

    if (!meeting) {
      throw new Error("Meeting not found");
    }

    return meeting;
  }
}

const meetingService = new MeetingService();

export default meetingService;
