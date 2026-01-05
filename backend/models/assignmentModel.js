const mongoose = require("mongoose");

// Assignment Question Schema
const assignmentQuestionSchema = new mongoose.Schema({
  teacherId: String,
  courseId: String,
  assignmentName: String,
  assignmentQuestion: String,
  deadline: {
    type: Date,
    required: true
  },
  createdAt: { type: Date, default: Date.now },
});

// Assignment Answer Schema
const assignmentAnswerSchema = new mongoose.Schema({
  assignmentQuestionId: String,
  studentId: String,
  answers: [
    {
      image: String,
      fileName: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  submittedAt: { type: Date, default: Date.now },
});

// Assignment Feedback Schema
const assignmentFeedbackSchema = new mongoose.Schema({
  assignmentAnswerId: String,
  teacherId: String,
  feedback: String,
  givenAt: { type: Date, default: Date.now },
});

const AssignmentQuestion = mongoose.model("AssignmentQuestion", assignmentQuestionSchema);
const AssignmentAnswer = mongoose.model("AssignmentAnswer", assignmentAnswerSchema);
const AssignmentFeedback = mongoose.model("AssignmentFeedback", assignmentFeedbackSchema);

module.exports = { AssignmentQuestion, AssignmentAnswer, AssignmentFeedback };