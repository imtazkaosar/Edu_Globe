import App from "../App";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Home from "../pages/Home";
import Login from "../pages/Login";
import SignUP from "../pages/SignUP";
import Adminpanel from "../pages/Adminpanel";
import AllUsers from "../pages/AllUsers";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import { useSelector } from "react-redux";
import { createBrowserRouter, Navigate } from "react-router-dom";
import StudentDashboard from "../pages/StudentDashboard";
import TeacherDashboard from "../pages/TeacherDashboard";
import ROLE from "../common/role";
import TeacherCreateCourse from "../pages/TeacherCreateCourse";
import StudentAllCourses from "../pages/StudentAllCourses";
import StudentEnrolledCourses from "../pages/StudentEnrolledCourses";
import TeacherCreateLiveClass from "../pages/TeacherCreateLiveClass";
import StudentLiveClass from "../pages/StudentLiveClass";
import TeacherPostAssignment from "../pages/TeacherPostAssignment";
import StudentAssignment from "../pages/StudentAssignment";
import TeacherAssignmentFeedback from "../pages/TeacherAssignmentFeedbacke";
import StudentAssignmentFeedback from "../pages/StudentAssignmentFeedback";
import TeacherCreateQuiz from "../pages/TeacherCreateQuiz";
import TakeQuiz from "../components/TakeQuiz";
import StudentQuizMarks from "../pages/StudentQuizMarks";
import StudentExploreUniversities from "../pages/StudentExplorUniversities";
import TeacherSeeReview from "../pages/TeacherSeeReview";
import TeacherPostRecordClass from "../pages/TeacherPostRecordClass";
import StudentSeeRecordedClasses from "../pages/StudentSeeRecordedClasses";

// Redirect root
const RootRedirect = () => {
  const user = useSelector((state) => state?.user?.user);

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case ROLE.ADMIN:
      return <Navigate to="/admin-panel/all-users" replace />;
    case ROLE.TEACHER:
      return <Navigate to="/teacher-dashboard" replace />;
    case ROLE.STUDENT:
      return <Navigate to="/student-dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <RootRedirect /> },

      { path: "login", element: <GuestRoute><Login /></GuestRoute> },
      { path: "forgot-password", element: <GuestRoute><ForgotPassword /></GuestRoute> },
      { path: "reset-password/:token", element: <GuestRoute><ResetPassword /></GuestRoute> },
      { path: "sign-up", element: <GuestRoute><SignUP /></GuestRoute> },

      { path: "home", element: <ProtectedRoute><Home /></ProtectedRoute> },

      // STUDENT ROUTE
      {
        path: "student-dashboard",
        element: (
          <ProtectedRoute role={ROLE.STUDENT}>
            <StudentDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/student/all-courses",
        element: (
          <ProtectedRoute role={ROLE.STUDENT}>
            <StudentAllCourses />
          </ProtectedRoute>
        ),
      },
      {
        path: "/student/my-courses",
        element: (
          <ProtectedRoute role={ROLE.STUDENT}>
            <StudentEnrolledCourses />
          </ProtectedRoute>
        ),
      },
      {
        path: "/student/live-class",
        element: (
          <ProtectedRoute role={ROLE.STUDENT}>
            <StudentLiveClass />
          </ProtectedRoute>
        ),
      },
      {
        path: "/student/assignments",
        element: (
          <ProtectedRoute role={ROLE.STUDENT}>
            <StudentAssignment />
          </ProtectedRoute>
        ),
      },
      {
        path: "/student/assignments-feedback",
        element: (
          <ProtectedRoute role={ROLE.STUDENT}>
            <StudentAssignmentFeedback />
          </ProtectedRoute>
        ),
      },
      {
        path: "/student/take-quiz",
        element: (
          <ProtectedRoute role={ROLE.STUDENT}>
            <TakeQuiz />
          </ProtectedRoute>
        ),
      },
      {
        path: "/student/quiz-marks",
        element: (
          <ProtectedRoute role={ROLE.STUDENT}>
            <StudentQuizMarks />
          </ProtectedRoute>
        ),
      },
      {
        path: "/student/uni",
        element: (
          <ProtectedRoute role={ROLE.STUDENT}>
            <StudentExploreUniversities />
          </ProtectedRoute>
        ),
      },
      {
        path: "/student/record-class",
        element: (
          <ProtectedRoute role={ROLE.STUDENT}>
            <StudentSeeRecordedClasses />
          </ProtectedRoute>
        ),
      },

      // TEACHER ROUTE
      {
        path: "teacher-dashboard",
        element: (
          <ProtectedRoute role={ROLE.TEACHER}>
            <TeacherDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/teacher/my-courses",
        element: (
          <ProtectedRoute role={ROLE.TEACHER}>
            <TeacherCreateCourse />
          </ProtectedRoute>
        ),
      },
      {
        path: "/teacher/live-classes",
        element: (
          <ProtectedRoute role={ROLE.TEACHER}>
            <TeacherCreateLiveClass />
          </ProtectedRoute>
        ),
      },
      {
        path: "/teacher/create-assignment",
        element: (
          <ProtectedRoute role={ROLE.TEACHER}>
            <TeacherPostAssignment />
          </ProtectedRoute>
        ),
      },
      {
        path: "/teacher/course-review",
        element: (
          <ProtectedRoute role={ROLE.TEACHER}>
            <TeacherSeeReview />
          </ProtectedRoute>
        ),
      },
      {
        path: "/teacher/recorded-class",
        element: (
          <ProtectedRoute role={ROLE.TEACHER}>
            <TeacherPostRecordClass />
          </ProtectedRoute>
        ),
      },
      {
        path: "/teacher/create-quiz",
        element: (
          <ProtectedRoute role={ROLE.TEACHER}>
            <TeacherCreateQuiz />
          </ProtectedRoute>
        ),
      },
      {
        path: "/teacher/submissions",
        element: (
          <ProtectedRoute role={ROLE.TEACHER}>
            <TeacherAssignmentFeedback />
          </ProtectedRoute>
        ),
      },

      // ADMIN ROUTES
      {
        path: "admin-panel",
        element: (
          <ProtectedRoute role={ROLE.ADMIN}>
            <Adminpanel />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "all-users",
            element: (
              <ProtectedRoute role={ROLE.ADMIN}>
                <AllUsers />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
]);

export default router;
