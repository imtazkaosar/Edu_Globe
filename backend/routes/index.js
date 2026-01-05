const express = require('express');
const router = express.Router();

// ---------------- USER CONTROLLERS ----------------
const userSignUpController = require("../controller/User/userSignUp");
const userSignInController = require("../controller/User/userSignIn");
const userDetailsController = require('../controller/User/userDetails');
const authToken = require('../middleware/authToken');
const userLogout = require('../controller/User/userLogout');
const allUsers = require('../controller/User/allUsers');
const updateUser = require('../controller/User/updateUser');
const userSearchController = require('../controller/User/userSearch');
const userDeleteController = require('../controller/User/userDelete');
const updateProfile = require('../controller/User/updateProfile');
const userForgotPass = require('../controller/User/userForgotPass');
const userResetPass = require('../controller/User/userResetPass');
const verifyResetToken = require('../controller/User/verifyResetToken');

// ---------------- COURSE CONTROLLERS ----------------
const {
  createCourse,
  getAllCourses,
  getCourseByName,
  enrollInCourse,
  getStudentCourses,
  deleteCourse        // ✅ NEW
} = require('../controller/course/courseController');

// ---------------- LIVE CLASS CONTROLLERS ----------------
const studentAllLiveClasses = require('../controller/liveclass/studentAllLiveClasses');
const teacherLiveClassHistory = require('../controller/liveclass/teacherLiveClassHistory');
const cancelLiveClass = require('../controller/liveclass/cancelLiveClass');
const updateLiveClass = require('../controller/liveclass/updateLiveClass');
const createLiveClass = require('../controller/liveclass/createLiveClass');

// ---------------- OTHER CONTROLLERS ----------------
const assignmentController = require("../controller/assignment/assignmentController");
const quizController = require("../controller/quiz/quizController");
const { deleteReview, updateReview, getAllReviews, createReview } = require('../controller/review/reviewController');
const {
  deleteRecordedClass,
  updateRecordedClass,
  getRecordedClassById,
  getRecordedClasses,
  createRecordedClass
} = require('../controller/recordedClasses/recordedClassesController');


// ================= USER ROUTES =================
router.post("/signup", userSignUpController);
router.post("/signin", userSignInController);
router.get("/user-details", authToken, userDetailsController);
router.get("/userLogout", userLogout);

router.post("/forgot-password", userForgotPass);
router.post("/reset-password", userResetPass);
router.get("/verify-reset-token/:token", verifyResetToken);

router.get("/all-user", authToken, allUsers);
router.post("/user-search", userSearchController);
router.post("/update-user", authToken, updateUser);
router.post("/update-profile", authToken, updateProfile);
router.post("/delete-user", authToken, userDeleteController);


// ================= COURSE ROUTES =================
router.post("/course/create/:teacherId", authToken, createCourse);
router.get("/courses", getAllCourses);
router.get("/course/name/:courseName", getCourseByName);

// ✅ DELETE COURSE (unenrolls all students)
router.delete(
  "/course/:courseId",
  authToken,
  deleteCourse
);


// ================= ENROLLMENT ROUTES =================
router.post(
  "/course/enroll/:courseId",
  authToken,
  enrollInCourse
);

router.get(
  "/courses/student/:studentId",
  authToken,
  getStudentCourses
);


// ================= LIVE CLASS ROUTES =================
router.post("/live-class/create", authToken, createLiveClass);
router.put("/live-class/update/:liveClassId", authToken, updateLiveClass);
router.put("/live-class/cancel/:liveClassId", authToken, cancelLiveClass);
router.get("/live-class/teacher/history", authToken, teacherLiveClassHistory);
router.get("/live-class/student/all", authToken, studentAllLiveClasses);


// ================= ASSIGNMENT ROUTES =================
router.post("/assignments", assignmentController.createAssignment);
router.get("/assignments", assignmentController.getAssignmentsByCourse);
router.get("/assignments-questions", assignmentController.getAssignmentsByTeacher);
router.post("/assignment-answers", assignmentController.submitAssignmentAnswer);
router.get("/assignment-answers", assignmentController.getAssignmentAnswersByStudent);
router.get("/assignment-answers-questions", assignmentController.getAssignmentAnswersByQuestion);
router.post("/assignment-feedback", assignmentController.submitAssignmentFeedback);
router.get("/assignment-feedback", assignmentController.getAssignmentFeedbackByTeacher);
router.get("/assignment-feedback/by-answer", assignmentController.getAssignmentFeedbackByAnswer);


// ================= QUIZ ROUTES =================
router.post("/teacher/:teacherId/courses/:courseId/quizzes", quizController.createQuiz);
router.get("/course/:courseId/quizzes", quizController.getQuizzesByCourse);
router.post("/quizAttempt", quizController.saveQuizAttempt);
router.get("/student/:studentId/quizAttempts", quizController.getQuizAttemptsByStudent);


// ================= REVIEW ROUTES =================
router.post("/reviews", authToken, createReview);
router.get("/reviews", getAllReviews);
router.put("/reviews/:id", authToken, updateReview);
router.delete("/reviews/:id", authToken, deleteReview);


// ================= RECORDED CLASS ROUTES =================
router.post("/recorded-class", authToken, createRecordedClass);
router.get("/recorded-classes", getRecordedClasses);
router.get("/recorded-class/:id", getRecordedClassById);
router.put("/recorded-class/:id", authToken, updateRecordedClass);
router.delete("/recorded-class/:id", authToken, deleteRecordedClass);


module.exports = router;
