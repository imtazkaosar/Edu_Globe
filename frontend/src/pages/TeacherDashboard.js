import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  BookOpen,
  Users,
  ClipboardCheck,
  TrendingUp,
  Calendar,
  Clock,
  Award,
  FileText,
  Video,
  Bell,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Plus,
  ArrowUpRight,
  GraduationCap,
  Loader2,
} from "lucide-react";
import SummaryApi from "../common";

const TeacherDashboard = () => {
  // Logged-in teacher from Redux
  const user = useSelector((state) => state?.user?.user);
  const teacherId = user?._id || user?.id;
  const navigate = useNavigate();
  // State management
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Derived stats
  const stats = {
    totalCourses: courses.length,
    activeStudents: courses.reduce(
      (sum, course) => sum + (course.studentsEnrolledIds?.length || 0),
      0
    ),
    pendingAssignments: assignments.filter((a) => !a.isGraded).length,
    upcomingClasses: liveClasses.filter((lc) => lc.status === "scheduled")
      .length,
  };

  // Fetch teacher-specific courses
  const fetchCourses = async () => {
    try {
      const response = await fetch(SummaryApi.getAllCourses.url, {
        method: SummaryApi.getAllCourses.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load courses.");
        return;
      }

      // Filter: Keep only teacher's courses
      const filtered = data.filter(
        (course) => course.instructorId?.toString() === teacherId?.toString()
      );

      setCourses(filtered);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Error loading courses. Please try again later.");
    }
  };

  // Fetch teacher's assignments
  const fetchAssignments = async () => {
    try {
      const res = await fetch(
        `${SummaryApi.getAssignmentsByTeacher.url}?teacherId=${teacherId}`,
        {
          method: SummaryApi.getAssignmentsByTeacher.method,
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        setAssignments(data);
      } else {
        setError(data.message || "Failed to fetch assignments");
      }
    } catch (err) {
      console.error(err);
      setError("Server error while fetching assignments");
    }
  };

  // Fetch teacher live class history
  const fetchLiveClasses = async () => {
    try {
      const res = await fetch(SummaryApi.teacherLiveClassHistory.url, {
        method: SummaryApi.teacherLiveClassHistory.method,
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setLiveClasses(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load live classes", err);
    }
  };

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      if (!teacherId) return;

      setLoading(true);
      await Promise.all([
        fetchCourses(),
        fetchAssignments(),
        fetchLiveClasses(),
      ]);
      setLoading(false);
    };

    loadData();
  }, [teacherId]);

  // Get upcoming live classes
  const upcomingLiveClasses = liveClasses
    .filter(
      (lc) => lc.status === "scheduled" && new Date(lc.startTime) > new Date()
    )
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 3);

  // Get recent assignments
  const recentAssignments = assignments
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
            Error
          </h3>
          <p className="text-gray-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              Teacher Dashboard
            </h1>
          </div>
          <p className="text-gray-600">
            Welcome back, {user?.name || "Teacher"}!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.totalCourses}
                </p>
              </div>
              <BookOpen className="w-12 h-12 text-blue-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Active Students</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.activeStudents}
                </p>
              </div>
              <Users className="w-12 h-12 text-green-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Assignments</p>
                <p className="text-3xl font-bold text-gray-800">
                  {assignments.length}
                </p>
              </div>
              <ClipboardCheck className="w-12 h-12 text-orange-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Upcoming Classes</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.upcomingClasses}
                </p>
              </div>
              <Video className="w-12 h-12 text-purple-500 opacity-80" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Courses Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-600" />
                My Courses
              </h2>
              <button
                onClick={() => navigate("/teacher/my-courses")}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
              >
                View All <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>No courses found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.slice(0, 4).map((course) => (
                  <div
                    key={course._id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {course.Course_Name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {course.Course_Initial} • {course.Department}
                        </p>
                      </div>
                      {course.advanced && (
                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                          Advanced
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.studentsEnrolledIds?.length || 0} students
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        {course.Credit} credits
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Live Classes */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-6">
              <Video className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">
                Upcoming Classes
              </h2>
            </div>

            {upcomingLiveClasses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-sm">No upcoming classes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingLiveClasses.map((liveClass) => (
                  <div
                    key={liveClass._id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {liveClass.title}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(liveClass.startTime).toLocaleDateString()}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(liveClass.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        {liveClass.platform}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Assignments */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-6 h-6 text-orange-600" />
                Recent Assignments
              </h2>
              <button
                onClick={() => navigate("/teacher/create-assignment")}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
              >
                View All <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {recentAssignments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ClipboardCheck className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>No assignments found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Assignment Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Course
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Created
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAssignments.map((assignment) => {
                      const course = courses.find(
                        (c) => c._id === assignment.courseId
                      );
                      return (
                        <tr
                          key={assignment._id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4 text-sm text-gray-800 font-medium">
                            {assignment.assignmentName}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {course?.Course_Initial || "N/A"}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {new Date(
                              assignment.createdAt
                            ).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
