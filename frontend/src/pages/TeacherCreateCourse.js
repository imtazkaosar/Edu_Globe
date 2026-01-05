import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import SummaryApi from "../common";

const TeacherCreateCourse = () => {
  const [showModal, setShowModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Logged-in teacher from Redux
  const user = useSelector((state) => state?.user?.user);
  const teacherId = user?._id || user?.id;

  // Form data
  const [formData, setFormData] = useState({
    Course_Name: "",
    Course_Initial: "",
    Credit: "",
    Department: "",
    Prerequisites: "",
    Description: "",
    Schedule: "",
    price: "",
    advanced: false,
    studentsEnrolledIds: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
        setLoading(false);
        return;
      }

      // Filter: Keep only teacher's courses
      const filtered = data.filter(
        (course) =>
          course.instructorId?.toString() === teacherId?.toString()
      );

      setCourses(filtered);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Error loading courses. Please try again later.");
      setLoading(false);
    }
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(SummaryApi.deleteCourse(courseId).url, {
        method: SummaryApi.deleteCourse(courseId).method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete course");
        return;
      }

      alert("Course deleted successfully!");
      fetchCourses(); // Refresh the course list
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Error deleting course. Please try again.");
    }
  };

  useEffect(() => {
    if (teacherId) fetchCourses();
  }, [teacherId]);

  const handleCreateCourse = async () => {
    if (!teacherId) {
      alert("Teacher ID missing. Login again.");
      return;
    }

    try {
      const response = await fetch(SummaryApi.createCourse(teacherId).url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to create course");
        return;
      }

      alert("Course created successfully!");
      setShowModal(false);

      // Reset form
      setFormData({
        Course_Name: "",
        Course_Initial: "",
        Credit: "",
        Department: "",
        Prerequisites: "",
        Description: "",
        Schedule: "",
        price: "",
        advanced: false,
        studentsEnrolledIds: [],
      });

      // Refresh course list
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert("Error creating course");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
            <p className="mt-1 text-sm text-gray-500">Manage and create your courses</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Course
          </button>
        </div>

        {/* Course List Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {loading && (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-3 text-sm text-gray-500">Loading courses...</p>
            </div>
          )}

          {error && (
            <div className="p-6 m-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!loading && courses.length === 0 && !error && (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="mt-4 text-sm font-medium text-gray-900">No courses yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first course.</p>
            </div>
          )}

          {!loading && courses.length > 0 && (
            <div className="divide-y divide-gray-200">
              {courses.map((course) => (
                <div key={course._id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{course.Course_Name}</h3>
                        {course.advanced && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-gray-900 text-white rounded">
                            Advanced
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium mr-2">Code:</span>
                          <span>{course.Course_Initial}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium mr-2">Credits:</span>
                          <span>{course.Credit}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium mr-2">Department:</span>
                          <span>{course.Department}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium mr-2">Schedule:</span>
                          <span>{course.Schedule}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteCourse(course._id)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                      title="Delete course"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900">Create New Course</h2>
              <p className="mt-1 text-sm text-gray-500">Fill in the course details below</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Course Name
                  </label>
                  <input
                    type="text"
                    name="Course_Name"
                    placeholder="Introduction to Computer Science"
                    value={formData.Course_Name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Course Code
                  </label>
                  <input
                    type="text"
                    name="Course_Initial"
                    placeholder="CS101"
                    value={formData.Course_Initial}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Credits
                  </label>
                  <input
                    type="number"
                    name="Credit"
                    placeholder="3"
                    value={formData.Credit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    name="Department"
                    placeholder="Computer Science"
                    value={formData.Department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    placeholder="5000"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-shadow"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Prerequisites
                  </label>
                  <input
                    type="text"
                    name="Prerequisites"
                    placeholder="Basic Mathematics, CS100"
                    value={formData.Prerequisites}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-shadow"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Schedule
                  </label>
                  <input
                    type="text"
                    name="Schedule"
                    placeholder="Sun-Tue 10:00 AM - 12:00 PM"
                    value={formData.Schedule}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-shadow"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="Description"
                    placeholder="Provide a detailed description of the course content and objectives..."
                    value={formData.Description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none transition-shadow"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="advanced"
                      checked={formData.advanced}
                      onChange={handleChange}
                      className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Mark as Advanced Course
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCourse}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-sm"
              >
                Create Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherCreateCourse;