import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SummaryApi from "../common";

const TeacherSeeReview = () => {
  const user = useSelector((state) => state?.user?.user);
  const teacherId = user?._id || user?.id;

  const [courses, setCourses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!teacherId) return;

    const fetchData = async () => {
      try {
        // Fetch courses
        const courseRes = await fetch(SummaryApi.getAllCourses.url, {
          method: SummaryApi.getAllCourses.method,
          credentials: "include",
        });
        const courseData = await courseRes.json();

        if (!courseRes.ok) {
          setError(courseData.message || "Failed to load courses");
          return;
        }

        // Filter teacher courses
        const teacherCourses = courseData.filter(
          (c) => String(c.instructorId) === String(teacherId)
        );
        setCourses(teacherCourses);

        // Fetch reviews
        const reviewRes = await fetch(SummaryApi.getAllReviews.url, {
          method: SummaryApi.getAllReviews.method,
          credentials: "include",
        });
        const reviewData = await reviewRes.json();

        if (!reviewRes.ok) {
          setError(reviewData.message || "Failed to load reviews");
          return;
        }

        setReviews(reviewData);
      } catch (err) {
        console.error(err);
        setError("Server error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teacherId]);

  if (loading) return <div className="p-6">Loading reviews…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Course Reviews</h1>

      {courses.length === 0 ? (
        <p>No courses found.</p>
      ) : (
        courses.map((course) => {
          const courseReviews = reviews.filter(
            (r) => String(r.courseId) === String(course._id)
          );

          return (
            <div
              key={course._id}
              className="mb-8 border rounded-lg shadow-sm p-5"
            >
              {/* Course Info */}
              <div className="mb-4">
                <h2 className="text-xl font-semibold">
                  {course.Course_Name}
                </h2>
                <p className="text-sm text-gray-600">
                  {course.Course_Initial} • {course.Credit} Credit
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {course.Description}
                </p>
              </div>

              {/* Reviews */}
              <div>
                <h3 className="font-semibold mb-2">Student Reviews</h3>

                {courseReviews.length === 0 ? (
                  <p className="text-gray-500">No reviews yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {courseReviews.map((review) => (
                      <li
                        key={review._id}
                        className="bg-gray-100 p-3 rounded"
                      >
                        <p className="text-gray-800">
                          {review.comment}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(review.createdAt).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default TeacherSeeReview;
