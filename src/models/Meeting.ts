import mongoose, { Schema } from "mongoose";

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
