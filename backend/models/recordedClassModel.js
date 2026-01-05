const mongoose = require("mongoose");

const recordedClassSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: true,
    },

    teacherId: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    videoUrl: {
      type: String,
      required: true,
    },

    duration: {
      type: Number, // in minutes or seconds (pick one and stay consistent)
      required: true,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // creates createdAt & updatedAt automatically
  }
);

const recordedClassModel = mongoose.model(
  "RecordedClass",
  recordedClassSchema
);

module.exports = recordedClassModel;
