const mongoose = require("mongoose");

// QuizDefinition schema
const quizDefSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    quizName: {
      type: String,
      required: true,
    },
    questions: [
      {
        text: {
          type: String,
          required: true,
        },
        options: {
          type: [String],
          validate: (opts) => opts.length === 4,
          required: true,
        },
        correctIndex: {
          type: Number,
          min: 0,
          max: 3,
          required: true,
        },
      },
    ],
  },
  {
    collection: "QuizDefinitions",
    timestamps: true,
  }
);

// QuizAttempt schema
const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizDefinition",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    answers: [
      {
        type: Number,
        min: 0,
        max: 3,
        required: true,
      },
    ],
    obtainedMarks: {
      type: Number,
      min: 0,
      required: true,
    },
    totalMarks: {
      type: Number,
      min: 0,
      required: true,
    },
    attemptedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "QuizAttempts",
    timestamps: true,
  }
);

// one attempt per student per quiz
quizAttemptSchema.index({ quiz: 1, student: 1 }, { unique: true });

const QuizDefinition = mongoose.model("QuizDefinition", quizDefSchema);
const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);

module.exports = { QuizDefinition, QuizAttempt };