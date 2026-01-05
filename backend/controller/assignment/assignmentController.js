const {
  AssignmentQuestion,
  AssignmentAnswer,
  AssignmentFeedback,
} = require("../../models/assignmentModel");

/* =========================
   Create a new assignment
   ========================= */
exports.createAssignment = async (req, res) => {
  const {
    teacherId,
    courseId,
    assignmentName,
    assignmentQuestion,
    deadline,
  } = req.body;

  if (
    !teacherId ||
    !courseId ||
    !assignmentName ||
    !assignmentQuestion ||
    !deadline
  ) {
    return res.status(400).json({ message: "All fields including deadline are required" });
  }

  if (new Date(deadline) <= new Date()) {
    return res.status(400).json({ message: "Deadline must be a future date" });
  }

  try {
    const assignment = new AssignmentQuestion({
      teacherId,
      courseId,
      assignmentName,
      assignmentQuestion,
      deadline,
    });

    await assignment.save();
    res.status(201).json({ success: true, assignment });
  } catch (err) {
    console.error("Error saving assignment:", err);
    res.status(500).json({ message: "Server error creating assignment." });
  }
};

/* =========================
   Get assignments by course
   ========================= */
exports.getAssignmentsByCourse = async (req, res) => {
  const { courseId } = req.query;

  if (!courseId) {
    return res.status(400).json({ message: "courseId is required" });
  }

  try {
    const assignments = await AssignmentQuestion.find({ courseId });
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching assignments" });
  }
};

/* =========================
   Get assignments by teacher
   ========================= */
exports.getAssignmentsByTeacher = async (req, res) => {
  const { teacherId } = req.query;

  if (!teacherId) {
    return res.status(400).json({ message: "teacherId is required" });
  }

  try {
    const assignments = await AssignmentQuestion.find({ teacherId });
    res.json(assignments);
  } catch (err) {
    console.error("Error fetching assignments:", err);
    res.status(500).json({ message: "Server error while fetching assignments" });
  }
};

/* =========================
   Submit assignment answer
   ========================= */
exports.submitAssignmentAnswer = async (req, res) => {
  const { assignmentQuestionId, studentId, answers } = req.body;

  if (
    !assignmentQuestionId ||
    !studentId ||
    !Array.isArray(answers) ||
    answers.length === 0
  ) {
    return res.status(400).json({ message: "Missing or invalid fields" });
  }

  try {
    // Fetch assignment to check deadline
    const assignment = await AssignmentQuestion.findById(assignmentQuestionId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Deadline check
    if (new Date() > assignment.deadline) {
      return res.status(403).json({
        message: "Submission deadline has passed",
      });
    }

    // Prevent multiple submissions
    const alreadySubmitted = await AssignmentAnswer.findOne({
      assignmentQuestionId,
      studentId,
    });

    if (alreadySubmitted) {
      return res.status(409).json({
        message: "You have already submitted this assignment",
      });
    }

    const newSubmission = new AssignmentAnswer({
      assignmentQuestionId,
      studentId,
      answers,
    });

    await newSubmission.save();
    res.status(201).json({ message: "Submission successful" });
  } catch (err) {
    console.error("Error saving submission:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   Get assignment answers by student
   ========================= */
exports.getAssignmentAnswersByStudent = async (req, res) => {
  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({ error: "studentId is required" });
  }

  try {
    const answers = await AssignmentAnswer.find({ studentId });
    res.json(answers);
  } catch (err) {
    console.error("Error fetching assignment answers:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   Get assignment answers by question
   ========================= */
exports.getAssignmentAnswersByQuestion = async (req, res) => {
  const { assignmentQuestionId } = req.query;

  if (!assignmentQuestionId) {
    return res.status(400).json({ error: "assignmentQuestionId is required" });
  }

  try {
    const answers = await AssignmentAnswer.find({ assignmentQuestionId });
    res.json(answers);
  } catch (err) {
    console.error("Error fetching assignment answers:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   Submit assignment feedback
   ========================= */
exports.submitAssignmentFeedback = async (req, res) => {
  const { assignmentAnswerId, teacherId, feedback } = req.body;

  if (!assignmentAnswerId || !teacherId || !feedback) {
    return res.status(400).json({
      message: "assignmentAnswerId, teacherId, and feedback are required",
    });
  }

  try {
    const newFeedback = new AssignmentFeedback({
      assignmentAnswerId,
      teacherId,
      feedback,
    });

    await newFeedback.save();
    res.status(201).json({ message: "Feedback saved successfully" });
  } catch (err) {
    console.error("Error saving feedback:", err);
    res.status(500).json({ message: "Server error while saving feedback" });
  }
};

/* =========================
   Get assignment feedback by teacher
   ========================= */
exports.getAssignmentFeedbackByTeacher = async (req, res) => {
  const { teacherId } = req.query;

  if (!teacherId) {
    return res.status(400).json({ message: "teacherId is required" });
  }

  try {
    const feedbacks = await AssignmentFeedback.find({ teacherId });
    res.json(feedbacks);
  } catch (err) {
    console.error("Error fetching feedbacks:", err);
    res.status(500).json({ message: "Server error while fetching feedbacks" });
  }
};

/* =========================
   Get assignment feedback by answer
   ========================= */
exports.getAssignmentFeedbackByAnswer = async (req, res) => {
  const { assignmentAnswerId } = req.query;

  if (!assignmentAnswerId) {
    return res.status(400).json({ message: "assignmentAnswerId is required" });
  }

  try {
    const feedbacks = await AssignmentFeedback.find({ assignmentAnswerId });

    if (feedbacks.length === 0) {
      return res.status(404).json({
        message: "No feedback found for this answer",
      });
    }

    res.json(feedbacks);
  } catch (err) {
    console.error("Error fetching feedback by answer ID:", err);
    res.status(500).json({ message: "Server error while fetching feedback" });
  }
};
