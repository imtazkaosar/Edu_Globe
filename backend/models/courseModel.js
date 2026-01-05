const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    Course_Name: {
      type: String,
      required: true,
      trim: true,
    },
    Course_Initial: {
      type: String,
      required: true,
      trim: true,
    },
    Credit: {
      type: Number,
      required: true,
      min: 0,
    },
    Department: {
      type: String,
      required: true,
      trim: true,
    },

    // You send instructorId as string → we keep it as string.
    instructorId: {
      type: String,
      required: true,
      trim: true,
    },

    // Same for students
    studentsEnrolledIds: [
      {
        type: String,
        trim: true,
      },
    ],

    Prerequisites: {
      type: String,
      default: "",
    },

    Description: {
      type: String,
      default: "",
    },

    Schedule: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    advanced: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "Courses",
    timestamps: true,
  }
);
const courseModel = mongoose.model("Course", courseSchema);

module.exports = courseModel;

