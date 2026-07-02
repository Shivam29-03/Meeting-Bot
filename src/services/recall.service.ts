import { AxiosError } from "axios";
import recallClient from "@/lib/recall-client";

class RecallService {
  /**
   * Create a Recall Bot
   */
  async createBot(meetingUrl: string, userId: string) {
    try {
      const payload = {
        meeting_url: meetingUrl,

        bot_name: "Meeting Bot",

        recording_config: {
          transcript: {},
          meeting_metadata: {},
          participant_events: {},
        },

        metadata: {
          user_id: userId,
        },
      };

      const { data } = await recallClient.post("/bot/", payload);

      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Recall Create Bot Error:", error.response?.data);

        throw new Error(
          error.response?.data?.detail ||
            "Failed to create Recall bot."
        );
      }

      throw error;
    }
  }

  /**
   * Get Recall Bot Details
   */
  async getBot(botId: string) {
    try {
      const { data } = await recallClient.get(`/bot/${botId}/`);

      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Recall Get Bot Error:", error.response?.data);

        throw new Error(
          error.response?.data?.detail ||
            "Failed to fetch Recall bot."
        );
      }

      throw error;
    }
  }
}

const recallService = new RecallService();

export default recallService;