const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
 {
  studentId: { type: String, required: true },
  courseId: { type: String, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}
);

const reviewModel = mongoose.model("CourseReview", reviewSchema);

module.exports = reviewModel;
