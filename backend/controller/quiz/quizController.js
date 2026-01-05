const mongoose = require("mongoose");
const { QuizDefinition, QuizAttempt } = require("../../models/quizModel");
const Teacher = require("../../models/userModel");
const Course = require("../../models/courseModel");

// Create a new quiz
exports.createQuiz = async (req, res) => {
    console.log(req.body)
  const { teacherId, courseId } = req.params;
  console.log(teacherId,courseId)
  const { name: quizName, questions } = req.body;

  if (!quizName || !Array.isArray(questions) || questions.length === 0) {
    return res
      .status(400)
      .json({ message: "quizName and questions are required" });
  }

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    return res.status(404).json({ message: "Teacher not found" });
  }

  const course = await Course.findOne({ _id: courseId, instructorId: teacherId });
  if (!course) {
    return res
      .status(404)
      .json({ message: "Course not found or not owned by teacher" });
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (
      typeof q.text !== "string" ||
      !q.text.trim() ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      q.options.some((opt) => typeof opt !== "string" || !opt.trim()) ||
      typeof q.correctIndex !== "number" ||
      q.correctIndex < 0 ||
      q.correctIndex > 3
    ) {
      return res.status(400).json({
        message: `Invalid data in question ${i + 1}`,
      });
    }
  }

  try {
    const quizDef = new QuizDefinition({
      course: courseId,
      quizName,
      questions,
    });
    await quizDef.save();
    return res
      .status(201)
      .json({ message: "Quiz created", quizId: quizDef._id });
  } catch (err) {
    console.error("Error creating quiz:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all quizzes by course ID
exports.getQuizzesByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID format" });
    }

    const quizzes = await QuizDefinition.find({ course: courseId });

    const formattedQuizzes = quizzes.map((quiz) => ({
      _id: quiz._id,
      quizName: quiz.quizName,
      questionCount: quiz.questions.length,
      createdAt: quiz.createdAt,
    }));

    res.json(quizzes);
  } catch (err) {
    console.error("Error fetching quizzes:", err);
    res.status(500).json({ message: "Failed to fetch quizzes" });
  }
};

// Save quiz attempt
exports.saveQuizAttempt = async (req, res) => {
  const { quiz, answers, obtainedMarks, totalMarks } = req.body;
  const student = req.body.student;

  try {
    const attempt = new QuizAttempt({ quiz, student, answers, obtainedMarks, totalMarks });
    await attempt.save();
    res.status(201).json({ success: true, attempt });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "You have already attempted this quiz." });
    }
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Get quiz attempts by student
exports.getQuizAttemptsByStudent = async (req, res) => {
  const { studentId } = req.params;

  try {
    const attempts = await QuizAttempt.find({ student: studentId })
    res.json(attempts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};