import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CheckCircle2, Clock, Send, FileText, User, Image as ImageIcon } from "lucide-react";
import SummaryApi from "../common";

const TeacherAssignmentFeedback = () => {
  const user = useSelector((state) => state?.user?.user);
  const teacherId = user?._id || user?.id;

  const [questions, setQuestions] = useState([]);
  const [answersByQuestion, setAnswersByQuestion] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [feedbacksGiven, setFeedbacksGiven] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // 1️⃣ Fetch teacher's assignment questions
  useEffect(() => {
    if (!teacherId) return;

    const fetchQuestions = async () => {
      try {
        const res = await fetch(
          `${SummaryApi.getAssignmentsByTeacher.url}?teacherId=${teacherId}`,
          {
            method: SummaryApi.getAssignmentsByTeacher.method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const data = await res.json();
        if (res.ok) {
          setQuestions(data);

          // For each question, fetch its answers
          data.forEach(async (question) => {
            try {
              const resAns = await fetch(
                `${SummaryApi.getAssignmentAnswersByQuestion.url}?assignmentQuestionId=${question._id}`,
                {
                  method: SummaryApi.getAssignmentAnswersByQuestion.method,
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                }
              );
              const ansData = await resAns.json();
              if (resAns.ok) {
                setAnswersByQuestion((prev) => ({
                  ...prev,
                  [question._id]: ansData,
                }));
              }
            } catch (err) {
              console.error("Error fetching answers:", err);
            }
          });
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching assignment questions:", err);
        setMessage("Failed to load assignment questions.");
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [teacherId]);

  // 2️⃣ Fetch already given feedbacks
  useEffect(() => {
    if (!teacherId) return;

    const fetchFeedbacks = async () => {
      try {
        const res = await fetch(
          `${SummaryApi.getAssignmentFeedbackByTeacher.url}?teacherId=${teacherId}`,
          {
            method: SummaryApi.getAssignmentFeedbackByTeacher.method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const data = await res.json();
        if (res.ok) {
          const map = {};
          data.forEach((fb) => {
            map[fb.assignmentAnswerId] = true;
          });
          setFeedbacksGiven(map);
        }
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
      }
    };

    fetchFeedbacks();
  }, [teacherId]);

  const handleFeedbackChange = (answerId, value) => {
    setFeedbacks((prev) => ({ ...prev, [answerId]: value }));
  };

  const submitFeedback = async (answerId) => {
    const text = feedbacks[answerId];
    if (!text) {
      alert("Feedback cannot be empty.");
      return;
    }

    try {
      const res = await fetch(SummaryApi.submitAssignmentFeedback.url, {
        method: SummaryApi.submitAssignmentFeedback.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          assignmentAnswerId: answerId,
          teacherId,
          feedback: text,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbacksGiven((prev) => ({ ...prev, [answerId]: true }));
        setFeedbacks((prev) => ({ ...prev, [answerId]: "" }));
        alert("Feedback submitted successfully!");
      } else {
        alert(data.message || "Failed to submit feedback.");
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Server error while submitting feedback.");
    }
  };

  const totalPending = questions.reduce((acc, q) => {
    const pending = (answersByQuestion[q._id] || []).filter(
      (ans) => !feedbacksGiven[ans._id]
    ).length;
    return acc + pending;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Assignment Feedback</h1>
              <p className="text-slate-600 mt-1">Review and provide feedback on student submissions</p>
            </div>
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 rounded-xl border border-blue-100">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-blue-600">{totalPending}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {message && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {message}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Assignments Found</h3>
            <p className="text-slate-500">You haven't created any assignment questions yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q) => {
              const pendingAnswers = (answersByQuestion[q._id] || []).filter(
                (ans) => !feedbacksGiven[ans._id]
              );

              return (
                <div key={q._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  {/* Assignment Header */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-5 border-b border-slate-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-5 h-5 text-slate-600" />
                          <h3 className="text-lg font-semibold text-slate-900">{q.assignmentName}</h3>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{q.assignmentQuestion}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        pendingAnswers.length > 0 
                          ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                          : 'bg-green-100 text-green-700 border border-green-200'
                      }`}>
                        {pendingAnswers.length > 0 
                          ? `${pendingAnswers.length} Pending` 
                          : 'Complete'}
                      </div>
                    </div>
                  </div>

                  {/* Submissions */}
                  <div className="p-6">
                    {pendingAnswers.length > 0 ? (
                      <div className="space-y-4">
                        {pendingAnswers.map((ans) => (
                          <div key={ans._id} className="border border-slate-200 rounded-lg p-5 bg-slate-50 hover:bg-slate-100 transition-colors">
                            {/* Student Info */}
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="font-medium text-slate-900">Student: {ans.studentId}</span>
                            </div>

                            {/* Submission Image */}
                            {ans.answers?.[0]?.image && (
                              <div className="mb-4 rounded-lg overflow-hidden border border-slate-200 bg-white p-3">
                                <div className="flex items-center gap-2 mb-2 text-sm text-slate-600">
                                  <ImageIcon className="w-4 h-4" />
                                  <span>Submitted Work</span>
                                </div>
                                <img
                                  src={ans.answers[0].image}
                                  alt={`Submission by ${ans.studentId}`}
                                  className="w-full max-w-md rounded-lg shadow-sm"
                                />
                              </div>
                            )}

                            {/* Feedback Input */}
                            <div className="space-y-3">
                              <label className="block text-sm font-medium text-slate-700">
                                Your Feedback
                              </label>
                              <textarea
                                placeholder="Provide constructive feedback for the student..."
                                value={feedbacks[ans._id] || ""}
                                onChange={(e) => handleFeedbackChange(ans._id, e.target.value)}
                                rows="4"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-white"
                              />
                              <button
                                onClick={() => submitFeedback(ans._id)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
                              >
                                <Send className="w-4 h-4" />
                                Submit Feedback
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-green-700 bg-green-50 px-4 py-3 rounded-lg border border-green-200">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">All submissions reviewed for this assignment</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAssignmentFeedback;