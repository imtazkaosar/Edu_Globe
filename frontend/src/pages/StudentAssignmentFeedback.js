import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FileText, MessageSquare, Clock, CheckCircle2 } from "lucide-react";
import SummaryApi from "../common";

const StudentAssignmentFeedback = () => {
  const user = useSelector((state) => state?.user?.user);
  const studentId = user?._id || user?.id;

  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const [feedbackByAnswer, setFeedbackByAnswer] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // 1️⃣ Fetch all submissions by this student
  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    const fetchSubmissions = async () => {
      setLoading(true);
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
          setSubmittedAnswers(data);
        } else {
          setMessage(data.message || "Failed to fetch submissions.");
        }
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setMessage("Server error while fetching submissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [studentId]);

  // 2️⃣ Fetch feedback for each submission
  useEffect(() => {
    if (!submittedAnswers.length) return;

    const fetchAllFeedback = async () => {
      setFeedbackLoading(true);
      const feedbackPromises = submittedAnswers.map(async (sub) => {
        try {
          const res = await fetch(
            `${SummaryApi.getAssignmentFeedbackByAnswer.url}?assignmentAnswerId=${sub._id}`,
            {
              method: SummaryApi.getAssignmentFeedbackByAnswer.method,
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            }
          );
          const data = await res.json();
          const fbText = Array.isArray(data) && data.length ? data[0].feedback : null;
          return { id: sub._id, feedback: fbText };
        } catch (err) {
          console.error(`Error fetching feedback for ${sub._id}:`, err);
          return { id: sub._id, feedback: null };
        }
      });

      const results = await Promise.all(feedbackPromises);
      const feedbackMap = {};
      results.forEach((result) => {
        feedbackMap[result.id] = result.feedback;
      });
      setFeedbackByAnswer(feedbackMap);
      setFeedbackLoading(false);
    };

    fetchAllFeedback();
  }, [submittedAnswers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            My Submissions
          </h1>
          <p className="text-slate-600">
            Track your assignment submissions and instructor feedback
          </p>
        </div>

        {/* Error Message */}
        {message && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{message}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Loading submissions...</p>
          </div>
        ) : submittedAnswers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No submissions yet
            </h3>
            <p className="text-slate-600">
              Your assignment submissions will appear here once you submit them.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {submittedAnswers.map((sub, index) => {
              const hasFeedback = feedbackByAnswer[sub._id] != null;
              
              return (
                <div
                  key={sub._id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold">
                            #{submittedAnswers.length - index}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            Submission {submittedAnswers.length - index}
                          </h3>
                          <p className="text-slate-300 text-sm">
                            Assignment Response
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {feedbackLoading ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-500/20 text-slate-300 rounded-full text-sm font-medium">
                            <div className="w-3 h-3 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                            Loading
                          </span>
                        ) : hasFeedback ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            Reviewed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-300 rounded-full text-sm font-medium">
                            <Clock className="w-4 h-4" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Submission Image */}
                    {sub.answers?.[0]?.image && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Your Submission
                        </h4>
                        <div className="rounded-lg overflow-hidden border-2 border-slate-200 inline-block">
                          <img
                            src={sub.answers[0].image}
                            alt="Your submission"
                            className="max-w-md w-full h-auto"
                          />
                        </div>
                      </div>
                    )}

                    {/* Feedback Section */}
                    <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                      <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-slate-700" />
                        Instructor Feedback
                      </h4>
                      {feedbackLoading ? (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                          <p className="text-slate-600 italic">
                            Loading feedback...
                          </p>
                        </div>
                      ) : feedbackByAnswer[sub._id] == null ? (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Clock className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="text-slate-600 italic">
                              Your instructor hasn't provided feedback yet.
                            </p>
                            <p className="text-slate-500 text-sm mt-1">
                              Check back later for updates.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="prose prose-slate max-w-none">
                          <p className="text-slate-700 leading-relaxed">
                            {feedbackByAnswer[sub._id]}
                          </p>
                        </div>
                      )}
                    </div>
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

export default StudentAssignmentFeedback;