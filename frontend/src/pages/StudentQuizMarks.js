import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import SummaryApi from "../common";
import { toast } from "react-toastify";
import {
  BookOpen,
  Trophy,
  CheckCircle,
  BarChart3,
  Clock,
  ArrowLeft,
  Send,
  TrendingUp,
  Award,
  Target,
  Eye,
  Download,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import Certificate from "../components/Certificate";

const StudentQuizMarks = () => {
  const user = useSelector((state) => state?.user?.user);
  const studentId = user?._id || user?.id;
  const studentName = user?.name || user?.username || "Student";

  const [courses, setCourses] = useState([]);
  const [quizzesByCourse, setQuizzesByCourse] = useState({});
  const [attemptedMap, setAttemptedMap] = useState({});
  const [loading, setLoading] = useState(false);

  // Quiz taking state
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // View state
  const [viewMode, setViewMode] = useState("overview");
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const [previewCourseName, setPreviewCourseName] = useState("");
  
  const certificateRef = useRef(null);

  /* ================= FETCH COURSES ================= */
  useEffect(() => {
    if (!studentId) return;

    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          SummaryApi.getStudentCourses(studentId).url,
          {
            method: SummaryApi.getStudentCourses(studentId).method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setCourses(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [studentId]);

  /* ================= FETCH QUIZZES ================= */
  useEffect(() => {
    if (!courses.length) return;

    courses.forEach(async (course) => {
      try {
        const res = await fetch(
          SummaryApi.getQuizzesByCourse(course._id).url,
          {
            method: SummaryApi.getQuizzesByCourse(course._id).method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const data = await res.json();
        if (res.ok) {
          setQuizzesByCourse((prev) => ({
            ...prev,
            [course._id]: data,
          }));
        }
      } catch (err) {
        console.error(err);
      }
    });
  }, [courses]);

  /* ================= FETCH ATTEMPTS ================= */
  useEffect(() => {
    if (!studentId) return;

    const fetchAttempts = async () => {
      try {
        const res = await fetch(
          SummaryApi.getQuizAttemptsByStudent(studentId).url,
          {
            method: SummaryApi.getQuizAttemptsByStudent(studentId).method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        const map = {};
        data.forEach((a) => {
          map[a.quiz] = {
            obtained: a.obtainedMarks,
            total: a.totalMarks,
            percent: Math.round((a.obtainedMarks / a.totalMarks) * 100),
          };
        });
        setAttemptedMap(map);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAttempts();
  }, [studentId]);

  /* ================= QUIZ LOGIC ================= */
  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setAnswers([]);
    setSubmitted(false);
    setScore(0);
    setViewMode("take-quiz");
  };

  const selectAnswer = (qi, oi) => {
    const copy = [...answers];
    copy[qi] = oi;
    setAnswers(copy);
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;

    const totalMarks = activeQuiz.questions.length;
    let obtained = 0;

    activeQuiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) obtained++;
    });

    setScore(obtained);
    setSubmitted(true);

    try {
      const res = await fetch(SummaryApi.saveQuizAttempt.url, {
        method: SummaryApi.saveQuizAttempt.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          quiz: activeQuiz._id,
          student: studentId,
          answers,
          obtainedMarks: obtained,
          totalMarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Quiz submitted successfully!");
      setAttemptedMap((prev) => ({
        ...prev,
        [activeQuiz._id]: {
          obtained: obtained,
          total: totalMarks,
          percent: Math.round((obtained / totalMarks) * 100),
        },
      }));
    } catch (err) {
      console.error(err);
      toast.error("Submission failed");
    }
  };

  const backToOverview = () => {
    setActiveQuiz(null);
    setViewMode("overview");
  };

  /* ================= CERTIFICATE FUNCTIONS ================= */
  const handlePreviewCertificate = (courseName) => {
    setPreviewCourseName(courseName);
    setShowCertificatePreview(true);
  };

  const handleDownloadCertificate = async () => {
    try {
      // Get the SVG element
      const svgElement = certificateRef.current?.querySelector('svg');
      if (!svgElement) {
        toast.error("Certificate not found");
        return;
      }

      // Serialize SVG to string
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      
      // Create download link
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${previewCourseName.replace(/\s+/g, '_')}_certificate.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download certificate");
    }
  };

  const isCourseComplete = (courseId) => {
    const quizzes = quizzesByCourse[courseId] || [];
    if (quizzes.length === 0) return false;
    
    const completedCount = quizzes.filter((q) => attemptedMap[q._id]).length;
    return completedCount === quizzes.length;
  };

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading your quizzes...</p>
        </div>
      </div>
    );
  }

  /* ================= QUIZ TAKING VIEW ================= */
  if (viewMode === "take-quiz" && activeQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Quiz Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white bg-opacity-10 rounded-lg backdrop-blur">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{activeQuiz.quizName}</h2>
                    <p className="text-gray-300 text-sm mt-1">
                      {activeQuiz.questions.length} questions • {submitted ? "Completed" : "In Progress"}
                    </p>
                  </div>
                </div>
                {submitted && (
                  <div className="bg-white bg-opacity-10 px-6 py-4 rounded-xl backdrop-blur">
                    <div className="text-white text-center">
                      <p className="text-xs opacity-90 uppercase tracking-wide">Your Score</p>
                      <p className="text-4xl font-bold mt-1">
                        {score}/{activeQuiz.questions.length}
                      </p>
                      <p className="text-sm mt-1 opacity-90">
                        {Math.round((score / activeQuiz.questions.length) * 100)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quiz Content */}
            <div className="p-8">
              <div className="space-y-6">
                {activeQuiz.questions.map((q, qi) => (
                  <div
                    key={qi}
                    className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow">
                        {qi + 1}
                      </div>
                      <p className="text-lg font-semibold text-gray-900 flex-1 pt-1">
                        {q.text}
                      </p>
                    </div>

                    <div className="space-y-3 ml-14">
                      {q.options.map((opt, oi) => (
                        <label
                          key={oi}
                          className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
                            answers[qi] === oi
                              ? "bg-blue-50 border-2 border-blue-500 shadow-sm"
                              : "bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-sm"
                          } ${submitted ? "cursor-not-allowed opacity-75" : ""}`}
                        >
                          <input
                            type="radio"
                            name={`q-${qi}`}
                            disabled={submitted}
                            checked={answers[qi] === oi}
                            onChange={() => selectAnswer(qi, oi)}
                            className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-gray-800 font-medium">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8 pt-6 border-t-2 border-gray-200">
                <button
                  onClick={backToOverview}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Overview
                </button>

                {!submitted && (
                  <button
                    onClick={submitQuiz}
                    disabled={answers.length !== activeQuiz.questions.length}
                    className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all shadow-md ${
                      answers.length === activeQuiz.questions.length
                        ? "bg-green-600 hover:bg-green-700 text-white hover:shadow-lg"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <Send className="w-5 h-5" />
                    Submit Quiz
                  </button>
                )}
              </div>

              {/* Results Message */}
              {submitted && (
                <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-green-900">Quiz Completed!</h3>
                      <p className="text-green-800 mt-1">
                        You scored {score} out of {activeQuiz.questions.length} questions correctly
                        {score === activeQuiz.questions.length && " - Perfect score! 🎉"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================= CERTIFICATE PREVIEW MODAL ================= */
  if (showCertificatePreview) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Certificate Preview</h2>
            <button
              onClick={() => setShowCertificatePreview(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6">
            <div ref={certificateRef} className="w-full rounded-lg shadow-lg overflow-hidden bg-white">
              <Certificate 
                studentName={studentName}
                courseName={previewCourseName}
                date={new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              />
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              {isCourseComplete(courses.find(c => (c.Course_Name || c.courseName) === previewCourseName)?._id) && (
                <button
                  onClick={handleDownloadCertificate}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Certificate
                </button>
              )}
              <button
                onClick={() => setShowCertificatePreview(false)}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================= OVERVIEW WITH PERFORMANCE ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Quiz Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your performance and take new quizzes</p>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        {courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              icon={<BookOpen className="w-6 h-6" />}
              title="Total Courses"
              value={courses.length}
              color="blue"
            />
            <StatCard
              icon={<Target className="w-6 h-6" />}
              title="Total Quizzes"
              value={Object.values(quizzesByCourse).reduce((acc, quizzes) => acc + quizzes.length, 0)}
              color="indigo"
            />
            <StatCard
              icon={<CheckCircle className="w-6 h-6" />}
              title="Completed"
              value={Object.keys(attemptedMap).length}
              color="green"
            />
            <StatCard
              icon={<Award className="w-6 h-6" />}
              title="Avg Score"
              value={
                Object.keys(attemptedMap).length > 0
                  ? `${Math.round(
                      Object.values(attemptedMap).reduce((a, b) => a + b.percent, 0) /
                        Object.keys(attemptedMap).length
                    )}%`
                  : "N/A"
              }
              color="purple"
            />
          </div>
        )}

        {/* Course Cards */}
        {courses.length > 0 ? (
          <div className="space-y-6">
            {courses.map((course) => {
              const quizzes = quizzesByCourse[course._id] || [];
              const chartData = quizzes
                .filter((q) => attemptedMap[q._id])
                .map((q) => ({
                  name: q.quizName.length > 20 ? q.quizName.substring(0, 20) + "..." : q.quizName,
                  score: attemptedMap[q._id].percent,
                  marks: attemptedMap[q._id].obtained,
                  total: attemptedMap[q._id].total,
                }));

              const completed = chartData.length;
              const avg =
                completed === 0
                  ? 0
                  : Math.round(
                      chartData.reduce((a, b) => a + b.score, 0) / completed
                    );

              return (
                <div
                  key={course._id}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                >
                  {/* Course Header */}
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white bg-opacity-10 rounded-lg backdrop-blur">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            {course.Course_Name || course.courseName}
                          </h2>
                          <p className="text-gray-300 text-sm mt-1">
                            {completed} of {quizzes.length} quizzes completed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {completed > 0 && (
                          <div className="flex items-center gap-2 bg-white bg-opacity-10 px-4 py-2 rounded-lg backdrop-blur">
                            <TrendingUp className="w-5 h-5 text-white" />
                            <span className="text-white font-bold text-xl">{avg}%</span>
                          </div>
                        )}
                        
                        {/* Certificate Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePreviewCertificate(course.Course_Name || course.courseName)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Preview
                          </button>
                          
                          {isCourseComplete(course._id) && (
                            <button
                              onClick={() => {
                                setPreviewCourseName(course.Course_Name || course.courseName);
                                setShowCertificatePreview(true);
                              }}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                            >
                              <Award className="w-4 h-4" />
                              Certificate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6 space-y-6">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                      <MiniStat title="Total Quizzes" value={quizzes.length} />
                      <MiniStat title="Completed" value={completed} />
                      <MiniStat title="Average Score" value={completed > 0 ? `${avg}%` : "N/A"} />
                    </div>

                    {/* Performance Chart */}
                    {chartData.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                          Performance Overview
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer>
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                              <YAxis domain={[0, 100]} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "white",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "8px",
                                }}
                                formatter={(value, name, props) => [
                                  `${props.payload.marks}/${props.payload.total} (${value}%)`,
                                  "Score",
                                ]}
                              />
                              <Bar dataKey="score" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Quiz List */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Available Quizzes
                      </h3>
                      {quizzes.length > 0 ? (
                        <div className="space-y-3">
                          {quizzes.map((quiz) => {
                            const attempt = attemptedMap[quiz._id];
                            return (
                              <div
                                key={quiz._id}
                                className="flex justify-between items-center p-5 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow">
                                    <BookOpen className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900 text-lg">
                                      {quiz.quizName}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      {quiz.questions?.length || 0} questions
                                    </p>
                                  </div>
                                </div>

                                {attempt ? (
                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <p className="text-sm text-gray-500">Score</p>
                                      <p className="text-2xl font-bold text-green-600">
                                        {attempt.percent}%
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {attempt.obtained}/{attempt.total}
                                      </p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => startQuiz(quiz)}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                                  >
                                    <Trophy className="w-5 h-5" />
                                    Take Quiz
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No quizzes available yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center border border-gray-200">
            <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Courses Yet</h3>
            <p className="text-gray-500">You haven't enrolled in any courses</p>
          </div>
        )}
      </div>
    </div>
  );
};
/* ================= HELPER COMPONENTS ================= */
const StatCard = ({ icon, title, value, color }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    indigo: "from-indigo-500 to-indigo-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white mb-3 shadow`}>
        {icon}
      </div>
      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
};

const MiniStat = ({ title, value }) => (
  <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center">
    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{title}</p>
    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
  </div>
);

export default StudentQuizMarks;