const mongoose = require("mongoose");

const liveClassSchema = new mongoose.Schema(
  {
    // Which course this live class belongs to
    courseId: {
      type: String,
      required: true,
      trim: true,
    },

    // Teacher who created the live class
    teacherId: {
      type: String,
      required: true,
      trim: true,
    },

    // Visible title for students
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional details
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // When the class starts
    startTime: {
      type: Date,
      required: true,
    },

    // Expected duration (minutes)
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },

    // Meeting platform
    platform: {
      type: String,
      enum: ["zoom", "google-meet", "teams", "custom"],
      required: true,
    },

    // Meeting link (or streaming URL)
    meetingLink: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional access code / passcode
    meetingPassword: {
      type: String,
      default: "",
      trim: true,
    },

    // Class lifecycle
    status: {
      type: String,
      enum: ["scheduled", "live", "ended", "cancelled"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
    collection: "LiveClasses",
  }
);

const liveClassModel = mongoose.model("LiveClass", liveClassSchema);

module.exports = liveClassModel;
