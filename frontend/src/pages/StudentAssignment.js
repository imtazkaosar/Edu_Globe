import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import SummaryApi from "../common";

const StudentAssignment = () => {
  const user = useSelector((state) => state?.user?.user);
  const studentId = user?._id || user?.id;
  const [unsubmittedAssignments, setUnsubmittedAssignments] = useState([]);
  const [submittedAssignments, setSubmittedAssignments] = useState({});
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [assignmentsLoaded, setAssignmentsLoaded] = useState(false);
  const [submittedLoaded, setSubmittedLoaded] = useState(false);

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  // Check if assignment is past deadline
  const isPastDeadline = (deadline) => {
    return new Date() > new Date(deadline);
  };

  // Get time remaining until deadline
  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;

    if (diff <= 0) return "Deadline passed";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  };

  // Check if deadline is approaching (within 24 hours)
  const isDeadlineApproaching = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    const hoursRemaining = diff / (1000 * 60 * 60);
    return hoursRemaining > 0 && hoursRemaining <= 24;
  };

  useEffect(() => {
    const fetchStudentCourses = async () => {
      if (!studentId) return;
      setLoading(true);
      setMessage("");

      try {
        const res = await fetch(SummaryApi.getStudentCourses(studentId).url, {
          method: SummaryApi.getStudentCourses(studentId).method,
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage(data.message || "Failed to fetch courses");
          setLoading(false);
          return;
        }
        setCourses(data);
      } catch (err) {
        console.error(err);
        setMessage("Error fetching courses");
        setLoading(false);
      }
    };

    fetchStudentCourses();
  }, [studentId]);

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
        setAssignmentsLoaded(true);
      } catch (err) {
        console.error(err);
        setMessage("Failed to fetch assignments");
        setAssignmentsLoaded(true);
      }
    };

    fetchAssignments();
  }, [courses]);

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
        setSubmittedLoaded(true);
      } catch (err) {
        console.error(err);
        setSubmittedLoaded(true);
      }
    };

    fetchSubmitted();
  }, [studentId]);

  useEffect(() => {
    if (!assignmentsLoaded || !submittedLoaded) return;

    // Filter out submitted assignments and sort by deadline
    const filtered = assignments
      .filter((a) => !submittedAssignments[a._id])
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    
    setUnsubmittedAssignments(filtered);
    setLoading(false);
  }, [assignments, submittedAssignments, assignmentsLoaded, submittedLoaded]);

  const handleFileChange = (assignmentId) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      setSelectedFiles((prev) => ({
        ...prev,
        [assignmentId]: { base64, fileName: file.name },
      }));
      setMessage(""); // Clear any previous messages
    } catch (err) {
      console.error(err);
      setMessage("Failed to read file");
    }
  };

  const handleSubmit = (assignmentId, deadline) => async () => {
    // Check if deadline has passed
    if (isPastDeadline(deadline)) {
      setMessage("Cannot submit - the deadline for this assignment has passed.");
      return;
    }

    if (!selectedFiles[assignmentId]) {
      setMessage("Please select a file to submit.");
      return;
    }

    const payload = {
      assignmentQuestionId: assignmentId,
      studentId,
      answers: [
        {
          image: selectedFiles[assignmentId].base64,
          fileName: selectedFiles[assignmentId].fileName,
        },
      ],
    };

    try {
      const res = await fetch(SummaryApi.submitAssignmentAnswer.url, {
        method: SummaryApi.submitAssignmentAnswer.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Submission successful!");
        setSelectedFiles((prev) => {
          const { [assignmentId]: _, ...rest } = prev;
          return rest;
        });
        setSubmittedAssignments((prev) => ({ ...prev, [assignmentId]: true }));
        
        // Auto-clear success message after 5 seconds
        setTimeout(() => setMessage(""), 5000);
      } else {
        setMessage(data.message || "Submission failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error while submitting assignment");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Assignments
          </h1>
          <p className="text-gray-600">
            Submit your assignments and track your progress
          </p>
        </div>

        {/* Alert Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              message.includes("successful")
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            {message.includes("successful") ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <p
              className={
                message.includes("successful")
                  ? "text-green-800"
                  : "text-red-800"
              }
            >
              {message}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading assignments...</p>
          </div>
        ) : unsubmittedAssignments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              All caught up!
            </h3>
            <p className="text-gray-600">
              You have no pending assignments to submit.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {unsubmittedAssignments.map((assignment) => {
              const pastDeadline = isPastDeadline(assignment.deadline);
              const deadlineApproaching = isDeadlineApproaching(assignment.deadline);
              
              return (
                <div
                  key={assignment._id}
                  className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
                    pastDeadline ? 'border-red-300 opacity-75' : deadlineApproaching ? 'border-orange-300' : 'border-gray-200'
                  }`}
                >
                  <div className="p-6">
                    {/* Assignment Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {assignment.assignmentName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            Course ID: {assignment.courseId}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Created: {new Date(assignment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Deadline Warning */}
                    {pastDeadline ? (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-red-800">Deadline Passed</p>
                          <p className="text-xs text-red-600">
                            Due: {new Date(assignment.deadline).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ) : deadlineApproaching ? (
                      <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-orange-800">Deadline Approaching</p>
                          <p className="text-xs text-orange-600">
                            Due: {new Date(assignment.deadline).toLocaleString()} ({getTimeRemaining(assignment.deadline)})
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                        <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">Deadline</p>
                          <p className="text-xs text-blue-600">
                            Due: {new Date(assignment.deadline).toLocaleString()} ({getTimeRemaining(assignment.deadline)})
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Question */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">Question:</p>
                      <p className="text-gray-700 leading-relaxed">
                        {assignment.assignmentQuestion}
                      </p>
                    </div>

                    {/* File Upload Section */}
                    <div className="space-y-4">
                      <label className="block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange(assignment._id)}
                          className="hidden"
                          id={`file-${assignment._id}`}
                          disabled={pastDeadline}
                        />
                        <div 
                          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            pastDeadline 
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                              : 'border-gray-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50'
                          }`}
                          onClick={() => !pastDeadline && document.getElementById(`file-${assignment._id}`).click()}
                        >
                          <Upload className={`w-8 h-8 mx-auto mb-2 ${pastDeadline ? 'text-gray-300' : 'text-gray-400'}`} />
                          <p className={`text-sm mb-1 ${pastDeadline ? 'text-gray-400' : 'text-gray-600'}`}>
                            {pastDeadline ? 'Upload disabled - deadline passed' : 'Click to upload your answer'}
                          </p>
                          {!pastDeadline && (
                            <p className="text-xs text-gray-500">
                              Supported formats: Images only
                            </p>
                          )}
                        </div>
                      </label>

                      {/* File Preview */}
                      {selectedFiles[assignment._id] && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-700 mb-3">
                            Selected File: {selectedFiles[assignment._id].fileName}
                          </p>
                          <div className="flex justify-center">
                            <img
                              src={selectedFiles[assignment._id].base64}
                              alt="preview"
                              className="max-w-full h-auto rounded-lg border-2 border-gray-200 shadow-sm"
                              style={{ maxHeight: "300px" }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        onClick={handleSubmit(assignment._id, assignment.deadline)}
                        disabled={pastDeadline}
                        className={`w-full font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                          pastDeadline
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                        {pastDeadline ? 'Submission Closed' : 'Submit Assignment'}
                      </button>
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

export default StudentAssignment;