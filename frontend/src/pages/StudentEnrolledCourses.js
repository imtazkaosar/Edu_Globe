import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SummaryApi from "../common";

const StudentEnrolledCourses = () => {
  const user = useSelector((state) => state?.user?.user);
  const studentId = user?._id;
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    const fetchStudentCourses = async () => {
      if (!studentId) return;
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          SummaryApi.getStudentCourses(studentId).url,
          {
            method: SummaryApi.getStudentCourses(studentId).method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const data = await response.json();
        if (!response.ok) {
          setError(data.message || "Failed to fetch courses");
          setLoading(false);
          return;
        }
        setCourses(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Error fetching courses");
        setLoading(false);
      }
    };
    fetchStudentCourses();
  }, [studentId]);

  const openModal = async (course) => {
    setSelectedCourse(course);
    await fetchReviews(course._id);
  };

  const fetchReviews = async (courseId) => {
    setLoadingReviews(true);
    try {
      const res = await fetch(SummaryApi.getAllReviews.url, {
        method: SummaryApi.getAllReviews.method,
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setReviews(
          data.filter((r) => String(r.courseId) === String(courseId))
        );
      }
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleCreateReview = async () => {
    if (!newComment.trim()) {
      alert("Please enter a comment");
      return;
    }
    const alreadyReviewed = reviews.some(
      (r) => String(r.studentId) === String(studentId)
    );
    if (alreadyReviewed) {
      alert("You already reviewed this course");
      return;
    }
    try {
      const res = await fetch(SummaryApi.createReview.url, {
        method: SummaryApi.createReview.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          studentId,
          courseId: selectedCourse._id,
          comment: newComment,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewComment("");
        alert("Review posted successfully!");
        // Refresh reviews after posting
        await fetchReviews(selectedCourse._id);
      } else {
        alert(data.message || "Failed to post review");
      }
    } catch (err) {
      console.error("Error posting review:", err);
      alert("Error posting review");
    }
  };

  const handleUpdateReview = async (reviewId) => {
    if (!editingText.trim()) {
      alert("Please enter a comment");
      return;
    }
    try {
      const res = await fetch(SummaryApi.updateReview(reviewId).url, {
        method: SummaryApi.updateReview(reviewId).method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ comment: editingText }),
      });
      if (res.ok) {
        setEditingReviewId(null);
        setEditingText("");
        alert("Review updated successfully!");
        // Refresh reviews after updating
        await fetchReviews(selectedCourse._id);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update review");
      }
    } catch (err) {
      console.error("Error updating review:", err);
      alert("Error updating review");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(SummaryApi.deleteReview(reviewId).url, {
        method: SummaryApi.deleteReview(reviewId).method,
        credentials: "include",
      });
      if (res.ok) {
        alert("Review deleted successfully!");
        // Refresh reviews after deleting
        await fetchReviews(selectedCourse._id);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete review");
      }
    } catch (err) {
      console.error("Error deleting review:", err);
      alert("Error deleting review");
    }
  };

  const closeModal = () => {
    setSelectedCourse(null);
    setReviews([]);
    setNewComment("");
    setEditingReviewId(null);
    setEditingText("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Courses
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Courses Yet
          </h2>
          <p className="text-gray-600 mb-6">
            You haven't enrolled in any courses. Start your learning journey
            today!
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
        <p className="text-gray-600">
          Track your enrolled courses and learning progress
        </p>
        <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {courses.length} {courses.length === 1 ? "Course" : "Courses"}{" "}
          Enrolled
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course._id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200"
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              {/* Course Title */}
              <h3 className="text-xl font-bold text-white mb-2">
                {course.Course_Name}
              </h3>
              {/* Course Details */}
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 bg-white/20 text-white rounded-full">
                  {course.Department}
                </span>
                <span className="px-3 py-1 bg-white/20 text-white rounded-full">
                  {course.Credit} Credits
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-600 text-sm">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {course.Schedule || "Not scheduled"}
                </div>
                <div className="flex items-center text-gray-900 font-semibold text-lg">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  ${course.price}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => openModal(course)}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
              >
                View Course Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedCourse && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-white">Course Details</h2>
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg
                  className="w-6 h-6"
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

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-3">
                  {selectedCourse.Department}
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedCourse.Course_Name}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Department Section */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Department</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCourse.Department}
                    </p>
                  </div>

                  {/* Credits Section */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Credit Hours</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCourse.Credit} Credits
                    </p>
                  </div>

                  {/* Schedule Section */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Schedule</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCourse.Schedule || "Not scheduled"}
                    </p>
                  </div>

                  {/* Price Section */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Course Fee</p>
                    <p className="font-semibold text-gray-900">
                      ${selectedCourse.price}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  Student Reviews
                </h4>

                {loadingReviews ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600 text-sm">
                      Loading reviews...
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Add Review */}
                    <div className="mb-6">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write your review..."
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                      />
                      <button
                        onClick={handleCreateReview}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Post Review
                      </button>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {reviews.length === 0 && (
                        <p className="text-gray-500 text-sm text-center py-4">
                          No reviews yet. Be the first to review!
                        </p>
                      )}
                      {reviews.map((review) => (
                        <div
                          key={review._id}
                          className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                        >
                          {editingReviewId === review._id ? (
                            <>
                              <textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="3"
                              />
                              <div className="mt-2 flex gap-2">
                                <button
                                  onClick={() => handleUpdateReview(review._id)}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingReviewId(null);
                                    setEditingText("");
                                  }}
                                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-400"
                                >
                                  Cancel
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-gray-800 text-sm">
                                {review.comment}
                              </p>
                              {String(review.studentId) === String(studentId) && (
                                <div className="mt-3 flex gap-3 text-sm">
                                  <button
                                    onClick={() => {
                                      setEditingReviewId(review._id);
                                      setEditingText(review.comment);
                                    }}
                                    className="text-blue-600 font-medium hover:text-blue-700"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReview(review._id)}
                                    className="text-red-600 font-medium hover:text-red-700"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <button
                onClick={closeModal}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentEnrolledCourses;