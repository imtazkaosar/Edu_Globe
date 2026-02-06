import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import SummaryApi from '../common';
import NotificationBell from '../components/NotificationBell';
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-10 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <div className="relative glass-strong border-b border-gray-200 dark:border-slate-700 shadow-lg dark:shadow-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold gradient-text dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400">
                Welcome back, {user?.name || 'Student'}! 👋
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300 text-lg">Track your learning journey and excel</p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <div className="flex items-center space-x-3 glass px-4 py-2 rounded-xl border border-orange-200 dark:border-orange-800">
                <Flame className="w-6 h-6 text-orange-500 dark:text-orange-400 animate-pulse-slow" />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.completedAssignments}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">day streak</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 glass bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center shadow-lg">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-strong rounded-2xl shadow-xl p-6 border border-blue-200 dark:border-blue-800 hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Enrolled Courses</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{stats.enrolledCourses}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="glass-strong rounded-2xl shadow-xl p-6 border border-green-200 dark:border-green-800 hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Upcoming Classes</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{stats.upcomingClasses}</p>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Video className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="glass-strong rounded-2xl shadow-xl p-6 border border-orange-200 dark:border-orange-800 hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Pending Assignments</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{stats.pendingAssignments}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="glass-strong rounded-2xl shadow-xl p-6 border border-purple-200 dark:border-purple-800 hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Completed</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{stats.completedAssignments}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 glass rounded-xl p-2 border border-gray-200 dark:border-slate-700">
          <div className="flex space-x-2">
            {['overview', 'courses', 'assignments', 'live-classes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'
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
            <div className="glass-strong rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Video className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Upcoming Live Classes
                </h2>
              </div>
              
              {upcomingLiveClasses.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No upcoming classes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingLiveClasses.map((liveClass) => (
                    <div key={liveClass._id} className="glass rounded-xl p-4 border border-gray-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{liveClass.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{liveClass.description}</p>
                        <div className="flex items-center mt-3 space-x-4 text-sm text-gray-500 dark:text-gray-400">
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
            <div className="glass-strong rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
                  Pending Assignments
                </h2>
              </div>
              
              {pendingAssignments.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">All caught up! 🎉</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingAssignments.map((assignment) => (
                    <div key={assignment._id} className="glass rounded-xl p-4 border border-gray-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-600 hover:shadow-lg transition-all duration-300 group">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{assignment.assignmentName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{assignment.assignmentQuestion}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Created {new Date(assignment.createdAt).toLocaleDateString()}
                        </span>
                        <button className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform">
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
                <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No courses enrolled yet</p>
              </div>
            ) : (
              courses.map((course) => (
                <div key={course._id} className="glass-strong rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
                  <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-32 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-gradient"></div>
                  </div>
                  <div className="p-6 bg-white dark:bg-slate-800">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{course.Course_Name}</h3>
                      <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                        {course.Credit} Credits
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{course.Description || 'No description available'}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {course.studentsEnrolledIds?.length || 0} students
                      </span>
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">{course.Course_Initial}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="glass-strong rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">All Assignments</h2>
              
              {assignments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No assignments available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment) => {
                    const isSubmitted = submittedAssignments[assignment._id];
                    return (
                      <div key={assignment._id} className="glass rounded-xl p-5 border border-gray-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg transition-all duration-300 group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{assignment.assignmentName}</h3>
                              {isSubmitted ? (
                                <span className="bg-gradient-to-r from-green-400 to-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center shadow-md">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Submitted
                                </span>
                              ) : (
                                <span className="bg-gradient-to-r from-orange-400 to-orange-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                                  Pending
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{assignment.assignmentQuestion}</p>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Created on {new Date(assignment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {!isSubmitted && (
                            <button className="ml-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
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
          <div className="glass-strong rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">All Live Classes</h2>
              
              {liveClasses.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No live classes scheduled</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {liveClasses.map((liveClass) => (
                    <div key={liveClass._id} className="glass rounded-xl p-5 border border-gray-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{liveClass.title}</h3>
                              <span className={`text-xs font-semibold px-3 py-1 rounded-full shadow-md ${
                                liveClass.status === 'live' ? 'bg-gradient-to-r from-red-400 to-red-600 text-white' :
                                liveClass.status === 'scheduled' ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white' :
                                liveClass.status === 'ended' ? 'bg-gradient-to-r from-gray-400 to-gray-600 text-white' :
                                'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                              }`}>
                                {liveClass.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{liveClass.description}</p>
                            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
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
                          className="inline-flex items-center bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
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