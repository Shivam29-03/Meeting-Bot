import mongoose, { Schema } from "mongoose";

const RecapDeliverySchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["queued", "sent", "failed"],
      default: "queued",
    },
    attempts: {
      type: Number,
      default: 0,
    },
    provider_message_id: {
      type: String,
      default: null,
    },
    last_error: {
      type: String,
      default: null,
    },
    sent_at: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const MeetingSchema = new Schema(
  {
    user_id: {
      type: String,
      required: true
    },

    bot_id: {
      type: String,
      required: true
    },

    recording_id: {
      type: String,
      default: null,
    },

    meeting_url: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["requested", "joining", "in_call", "recording", "done", "failed"],
      default: "requested",
    },

    sub_code: {
      type: String,
      default: null,
    },

    video_gcs_path: {
      type: String,
      default: null,
    },

    transcript_gcs_path: {
      type: String,
      default: null,
    },

    has_transcript: {
      type: Boolean,
      default: false,
    },
    ai_summary: {
      type: String,
      default: null,
    },

    ai_summary_generated_at: {
      type: Date,
      default: null,
    },

    // --- Recap email delivery (feat/meeting-participant-email) ---
    // Organizer-supplied recap recipients for this exact meeting. The organizer
    // email is always included server-side. Validated/normalized before persist.
    recap_recipients: {
      type: [String],
      default: [],
    },

    recap_state: {
      type: String,
      enum: ["pending", "processing", "sent", "partial", "failed", "skipped"],
      default: "pending",
    },

    // Timestamp of the last claim, used to recover stale "processing" state.
    recap_claimed_at: {
      type: Date,
      default: null,
    },

    recap_processed_at: {
      type: Date,
      default: null,
    },

    // Per-recipient delivery state so failed recipients can be retried
    // independently without re-sending to those already delivered.
    recap_deliveries: {
      type: [RecapDeliverySchema],
      default: [],
    },
  },
  {
    collection: "meetings",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    versionKey: false,
  },
);

MeetingSchema.index({
  user_id: 1,
  created_at: -1,
});

MeetingSchema.index(
  { bot_id: 1 },
  { unique: true },
);

export default mongoose.models.Meeting ||
  mongoose.model("Meeting", MeetingSchema);
