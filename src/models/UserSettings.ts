import mongoose, { Schema } from "mongoose";

const UserSettingsSchema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    bot_name: {
      type: String,
      default: "",
    },
    auto_record: {
      type: Boolean,
      default: false,
    },
    auto_join: {
      type: Boolean,
      default: false,
    },
    transcription: {
      type: Boolean,
      default: false,
    },
    ai_summary: {
      type: Boolean,
      default: false,
    },
    email_recap: {
      type: Boolean,
      default: false,
    },
    meeting_reminders: {
      type: Boolean,
      default: false,
    },
    bot_status_alerts: {
      type: Boolean,
      default: false,
    },
    integrations: {
      calendar: { type: Boolean, default: false },
      meet: { type: Boolean, default: false },
      zoom: { type: Boolean, default: false },
      teams: { type: Boolean, default: false },
    },
  },
  {
    collection: "user_settings",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    versionKey: false,
  },
);

export default mongoose.models.UserSettings ||
  mongoose.model("UserSettings", UserSettingsSchema);
