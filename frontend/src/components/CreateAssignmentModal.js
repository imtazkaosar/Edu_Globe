import React, { useState, useEffect } from "react";
import SummaryApi from "../common";

const CreateAssignmentModal = ({ onClose, onSuccess, teacherId }) => {
  const [courseId, setCourseId] = useState("");
  const [assignmentName, setAssignmentName] = useState("");
  const [assignmentQuestion, setAssignmentQuestion] = useState("");
  const [deadline, setDeadline] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch teacher courses to populate dropdown
  const fetchCourses = async () => {
    try {
      const res = await fetch(SummaryApi.getAllCourses.url, {
        method: SummaryApi.getAllCourses.method,
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        // filter courses for this teacher
        const teacherCourses = data.filter(
          (c) => c.instructorId === teacherId
        );
        setCourses(teacherCourses);
        if (teacherCourses.length > 0) setCourseId(teacherCourses[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (teacherId) fetchCourses();
  }, [teacherId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId || !assignmentName || !assignmentQuestion || !deadline) {
      setError("All fields including deadline are required.");
      return;
    }

    // Validate deadline is in the future
    const selectedDeadline = new Date(deadline);
    const now = new Date();
    if (selectedDeadline <= now) {
      setError("Deadline must be in the future.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(SummaryApi.createAssignment.url, {
        method: SummaryApi.createAssignment.method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId,
          courseId,
          assignmentName,
          assignmentQuestion,
          deadline,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess(); // refresh list
        onClose(); // close modal
      } else {
        setError(data.message || "Failed to create assignment");
      }
    } catch (err) {
      console.error(err);
      setError("Server error while creating assignment");
    } finally {
      setLoading(false);
    }
  };

  // Get minimum datetime (current time)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                Create New Assignment
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Add a new assignment for your students
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-5">
            {/* Course Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Course
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full appearance-none px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-800 font-medium transition-all cursor-pointer"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.Course_Name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              {courses.length === 0 && (
                <p className="text-xs text-slate-500 mt-2">
                  No courses available. Please create a course first.
                </p>
              )}
            </div>

            {/* Assignment Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Assignment Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={assignmentName}
                  onChange={(e) => setAssignmentName(e.target.value)}
                  placeholder="e.g., Week 5 Programming Challenge"
                  className="w-full px-4 py-3 pl-11 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Deadline
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={getMinDateTime()}
                  className="w-full px-4 py-3 pl-11 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Set the date and time when students can no longer submit
              </p>
            </div>

            {/* Assignment Question */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Assignment Question
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={assignmentQuestion}
                onChange={(e) => setAssignmentQuestion(e.target.value)}
                placeholder="Describe the assignment requirements, objectives, and any specific instructions..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none placeholder:text-slate-400"
                rows={6}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-slate-500">
                  Provide clear instructions for your students
                </p>
                <p className="text-xs text-slate-400">
                  {assignmentQuestion.length} characters
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={loading || courses.length === 0}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Create Assignment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAssignmentModal;