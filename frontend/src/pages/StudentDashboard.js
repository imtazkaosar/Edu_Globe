import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import SummaryApi from '../common';
import { 
  BookOpen, 
  TrendingUp,
  Clock,
  Award,
  Target,
  Calendar,
  Play,
  CheckCircle,
  Star,
  ArrowRight,
  Video,
  FileText,
  Users,
  Trophy,
  Zap,
  BookMarked,
  GraduationCap,
  BarChart3,
  Brain,
  Flame,
  AlertCircle,
  Upload,
  ExternalLink
} from 'lucide-react';

const StudentDashboard = () => {
  const user = useSelector((state) => state?.user?.user);
  const studentId = user?._id || user?.id;
  
  const [courses, setCourses] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submittedAssignments, setSubmittedAssignments] = useState({});
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch enrolled courses
  useEffect(() => {
    const fetchStudentCourses = async () => {
      if (!studentId) return;

      try {
        const response = await fetch(SummaryApi.getStudentCourses(studentId).url, {
          method: SummaryApi.getStudentCourses(studentId).method,
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        const data = await response.json();
        if (response.ok) {
          setCourses(data);
        } else {
          setError(data.message || "Failed to fetch courses");
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching courses");
      }
    };

    fetchStudentCourses();
  }, [studentId]);

  // Fetch live classes
  useEffect(() => {
    const fetchLiveClasses = async () => {
      if (!studentId) return;

      try {
        const res = await fetch(SummaryApi.studentAllLiveClasses.url, {
          method: SummaryApi.studentAllLiveClasses.method,
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

    fetchLiveClasses();
  }, [studentId]);

  // Fetch assignments
  useEffect(() => {
    if (!courses.length) return;

    const fetchAssignments = async () => {
      try {
        const allAssignments = [];
        for (const course of courses) {
          const res = await fetch(
            `${SummaryApi.getAssignmentsByCourse.url}?courseId=${course._id}`,
            {
              method: SummaryApi.getAssignmentsByCourse.method,
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            }
          );
          const data = await res.json();
          if (res.ok) allAssignments.push(...data);
        }
        setAssignments(allAssignments);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAssignments();
  }, [courses]);

  // Fetch submitted assignments
  useEffect(() => {
    if (!studentId) return;

    const fetchSubmitted = async () => {
      try {
        const res = await fetch(
          `${SummaryApi.getAssignmentAnswersByStudent.url}?studentId=${studentId}`,
          {
            method: SummaryApi.getAssignmentAnswersByStudent.method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const data = await res.json();
        if (res.ok) {
          const submittedMap = {};
          data.forEach((item) => {
            submittedMap[item.assignmentQuestionId] = true;
          });
          setSubmittedAssignments(submittedMap);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmitted();
  }, [studentId]);

  // Calculate stats
  const stats = {
    enrolledCourses: courses.length,
    upcomingClasses: liveClasses.filter(c => c.status === 'scheduled').length,
    pendingAssignments: assignments.filter(a => !submittedAssignments[a._id]).length,
    completedAssignments: assignments.filter(a => submittedAssignments[a._id]).length,
  };

  const upcomingLiveClasses = liveClasses
    .filter(c => c.status === 'scheduled' || c.status === 'live')
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 3);

  const pendingAssignments = assignments
    .filter(a => !submittedAssignments[a._id])
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name || 'Student'}!
              </h1>
              <p className="mt-1 text-gray-600">Track your learning journey</p>
            </div>
            <div className="flex items-center space-x-2">
              <Flame className="w-6 h-6 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900">
                {stats.completedAssignments}
              </span>
              <span className="text-gray-600">streak</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Enrolled Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.enrolledCourses}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Upcoming Classes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.upcomingClasses}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Video className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Assignments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingAssignments}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedAssignments}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            {['overview', 'courses', 'assignments', 'live-classes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Live Classes */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Video className="w-5 h-5 mr-2 text-indigo-600" />
                  Upcoming Live Classes
                </h2>
              </div>
              
              {upcomingLiveClasses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No upcoming classes</p>
              ) : (
                <div className="space-y-4">
                  {upcomingLiveClasses.map((liveClass) => (
                    <div key={liveClass._id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{liveClass.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{liveClass.description}</p>
                          <div className="flex items-center mt-3 space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(liveClass.startTime).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(liveClass.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        </div>
                        {liveClass.status === 'live' && (
                          <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center">
                            <span className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></span>
                            LIVE
                          </span>
                        )}
                      </div>
                      <a
                        href={liveClass.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        Join Class <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Assignments */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-orange-600" />
                  Pending Assignments
                </h2>
              </div>
              
              {pendingAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-500">All caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingAssignments.map((assignment) => (
                    <div key={assignment._id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                      <h3 className="font-semibold text-gray-900">{assignment.assignmentName}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{assignment.assignmentQuestion}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Created {new Date(assignment.createdAt).toLocaleDateString()}
                        </span>
                        <button className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center">
                          Submit <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No courses enrolled yet</p>
              </div>
            ) : (
              courses.map((course) => (
                <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-32"></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg text-gray-900">{course.Course_Name}</h3>
                      <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded">
                        {course.Credit} Credits
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{course.Description || 'No description available'}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {course.studentsEnrolledIds?.length || 0} students
                      </span>
                      <span className="font-medium text-indigo-600">{course.Course_Initial}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">All Assignments</h2>
              
              {assignments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No assignments available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment) => {
                    const isSubmitted = submittedAssignments[assignment._id];
                    return (
                      <div key={assignment._id} className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{assignment.assignmentName}</h3>
                              {isSubmitted ? (
                                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Submitted
                                </span>
                              ) : (
                                <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
                                  Pending
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{assignment.assignmentQuestion}</p>
                            <span className="text-xs text-gray-500">
                              Created on {new Date(assignment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {!isSubmitted && (
                            <button className="ml-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                              <Upload className="w-4 h-4 mr-2" />
                              Submit
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'live-classes' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">All Live Classes</h2>
              
              {liveClasses.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No live classes scheduled</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {liveClasses.map((liveClass) => (
                    <div key={liveClass._id} className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{liveClass.title}</h3>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              liveClass.status === 'live' ? 'bg-red-100 text-red-700' :
                              liveClass.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                              liveClass.status === 'ended' ? 'bg-gray-100 text-gray-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {liveClass.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{liveClass.description}</p>
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(liveClass.startTime).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(liveClass.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            <span className="flex items-center">
                              <Video className="w-4 h-4 mr-1" />
                              {liveClass.durationMinutes} min
                            </span>
                          </div>
                        </div>
                      </div>
                      {(liveClass.status === 'live' || liveClass.status === 'scheduled') && (
                        <a
                          href={liveClass.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Join on {liveClass.platform}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;