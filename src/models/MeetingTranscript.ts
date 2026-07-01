import mongoose, { Schema } from "mongoose";

const SegmentSchema = new Schema(
  {
    speaker: {
      type: String,
      required: true,
    },

    speaker_id: {
      type: Number,
      required: true,
    },

    start: {
      type: Number,
      required: true,
    },

    end: {
      type: Number,
      required: true,
    },

    text: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const MeetingTranscriptSchema = new Schema(
  {
    meeting_id: {
      type: Schema.Types.ObjectId,
      ref: "Meeting",
      required: true
    },

    user_id: {
      type: String,
      required: true,
      index: true,
    },

    bot_id: {
      type: String,
      required: true,
    },

    recording_id: {
      type: String,
      required: true,
    },

    transcript_id: {
      type: String,
      required: true,
    },

    segments: {
      type: [SegmentSchema],
      default: [],
    },
  },
  {
    collection: "meeting_transcripts",
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
    versionKey: false,
  },
);

MeetingTranscriptSchema.index({
  meeting_id: 1,
});

export default mongoose.models.MeetingTranscript ||
  mongoose.model("MeetingTranscript", MeetingTranscriptSchema);
