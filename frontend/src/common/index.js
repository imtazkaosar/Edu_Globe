const backendDomain = process.env.REACT_APP_BACKEND_URL;

const SummaryApi = {
  // ------------------- USER APIS -------------------
  signUP: { url: `${backendDomain}/api/signup`, method: "post" },
  signIn: { url: `${backendDomain}/api/signin`, method: "post" },
  current_user: { url: `${backendDomain}/api/user-details`, method: "get" },
  forgotPassword: { url: `${backendDomain}/api/forgot-password`, method: "post" },
  verifyResetToken: { url: `${backendDomain}/api/verify-reset-token`, method: "get" },
  resetPassword: { url: `${backendDomain}/api/reset-password`, method: "post" },
  logout_user: { url: `${backendDomain}/api/userLogout`, method: "get" },
  allUser: { url: `${backendDomain}/api/all-user`, method: "get" },
  userSearch: { url: `${backendDomain}/api/user-search`, method: "post" },
  updateUser: { url: `${backendDomain}/api/update-user`, method: "post" },
  updateProfile: { url: `${backendDomain}/api/update-profile`, method: "post" },
  deleteUser: { url: `${backendDomain}/api/delete-user`, method: "post" },

  // ------------------- COURSE APIS -------------------
  createCourse: (teacherId) => ({
    url: `${backendDomain}/api/course/create/${teacherId}`,
    method: "post",
  }),
  getAllCourses: { url: `${backendDomain}/api/courses`, method: "get" },
  getCourseByName: (courseName) => ({
    url: `${backendDomain}/api/course/name/${courseName}`,
    method: "get",
  }),


  deleteCourse: (courseId) => ({
    url: `${backendDomain}/api/course/${courseId}`,
    method: "delete",
  }),

  // ------------------- STUDENT COURSE APIS -------------------
  enrollInCourse: (courseId) => ({
    url: `${backendDomain}/api/course/enroll/${courseId}`,
    method: "post",
  }),
  getStudentCourses: (studentId) => ({
    url: `${backendDomain}/api/courses/student/${studentId}`,
    method: "get",
  }),

  // ------------------- LIVE CLASS APIS -------------------
  createLiveClass: { url: `${backendDomain}/api/live-class/create`, method: "post" },
  updateLiveClass: (liveClassId) => ({
    url: `${backendDomain}/api/live-class/update/${liveClassId}`,
    method: "put",
  }),
  cancelLiveClass: (liveClassId) => ({
    url: `${backendDomain}/api/live-class/cancel/${liveClassId}`,
    method: "put",
  }),
  teacherLiveClassHistory: {
    url: `${backendDomain}/api/live-class/teacher/history`,
    method: "get",
  },
  studentAllLiveClasses: {
    url: `${backendDomain}/api/live-class/student/all`,
    method: "get",
  },

  // ------------------- ASSIGNMENT APIS -------------------
  createAssignment: { url: `${backendDomain}/api/assignments`, method: "post" },
  getAssignmentsByCourse: { url: `${backendDomain}/api/assignments`, method: "get" },
  getAssignmentsByTeacher: {
    url: `${backendDomain}/api/assignments-questions`,
    method: "get",
  },
  submitAssignmentAnswer: {
    url: `${backendDomain}/api/assignment-answers`,
    method: "post",
  },
  getAssignmentAnswersByStudent: {
    url: `${backendDomain}/api/assignment-answers`,
    method: "get",
  },
  getAssignmentAnswersByQuestion: {
    url: `${backendDomain}/api/assignment-answers-questions`,
    method: "get",
  },
  submitAssignmentFeedback: {
    url: `${backendDomain}/api/assignment-feedback`,
    method: "post",
  },
  getAssignmentFeedbackByTeacher: {
    url: `${backendDomain}/api/assignment-feedback`,
    method: "get",
  },
  getAssignmentFeedbackByAnswer: {
    url: `${backendDomain}/api/assignment-feedback/by-answer`,
    method: "get",
  },

  // ------------------- QUIZ APIS -------------------
  createQuiz: (teacherId, courseId) => ({
    url: `${backendDomain}/api/teacher/${teacherId}/courses/${courseId}/quizzes`,
    method: "post",
  }),
  getQuizzesByCourse: (courseId) => ({
    url: `${backendDomain}/api/course/${courseId}/quizzes`,
    method: "get",
  }),
  saveQuizAttempt: { url: `${backendDomain}/api/quizAttempt`, method: "post" },
  getQuizAttemptsByStudent: (studentId) => ({
    url: `${backendDomain}/api/student/${studentId}/quizAttempts`,
    method: "get",
  }),

  // ------------------- REVIEW APIS -------------------
  createReview: { url: `${backendDomain}/api/reviews`, method: "post" },
  getAllReviews: { url: `${backendDomain}/api/reviews`, method: "get" },
  updateReview: (reviewId) => ({
    url: `${backendDomain}/api/reviews/${reviewId}`,
    method: "put",
  }),
  deleteReview: (reviewId) => ({
    url: `${backendDomain}/api/reviews/${reviewId}`,
    method: "delete",
  }),

  // ------------------- RECORDED CLASS APIS -------------------
  createRecordedClass: {
    url: `${backendDomain}/api/recorded-class`,
    method: "post",
  },
  getRecordedClasses: {
    url: `${backendDomain}/api/recorded-classes`,
    method: "get",
  },
  getRecordedClassById: (recordedClassId) => ({
    url: `${backendDomain}/api/recorded-class/${recordedClassId}`,
    method: "get",
  }),
  updateRecordedClass: (recordedClassId) => ({
    url: `${backendDomain}/api/recorded-class/${recordedClassId}`,
    method: "put",
  }),
  deleteRecordedClass: (recordedClassId) => ({
    url: `${backendDomain}/api/recorded-class/${recordedClassId}`,
    method: "delete",
  }),
};

export default SummaryApi;
