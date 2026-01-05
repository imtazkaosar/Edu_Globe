import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Search, Filter, X, DollarSign, BookOpen, Clock, Award, ChevronDown } from "lucide-react";
import SummaryApi from "../common";


const StudentAllCourses = () => {
  const user = useSelector((state) => state?.user?.user);
  const studentId = user?._id;
  
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [creditFilter, setCreditFilter] = useState("");
  const [advancedOnly, setAdvancedOnly] = useState(false);
  const [enrolledOnly, setEnrolledOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
      
      setCourses(data);
      setFilteredCourses(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Error loading courses. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...courses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.Course_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.Course_Initial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.Description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (selectedDepartment) {
      filtered = filtered.filter(course => course.Department === selectedDepartment);
    }

    // Instructor filter
    if (selectedInstructor) {
      filtered = filtered.filter(course => course.instructorId === selectedInstructor);
    }

    // Price range filter
    if (priceRange.min !== "") {
      filtered = filtered.filter(course => course.price >= Number(priceRange.min));
    }
    if (priceRange.max !== "") {
      filtered = filtered.filter(course => course.price <= Number(priceRange.max));
    }

    // Credit filter
    if (creditFilter) {
      filtered = filtered.filter(course => course.Credit === Number(creditFilter));
    }

    // Advanced courses filter
    if (advancedOnly) {
      filtered = filtered.filter(course => course.advanced);
    }

    // Enrolled courses filter
    if (enrolledOnly) {
      filtered = filtered.filter(course => course.studentsEnrolledIds.includes(studentId));
    }

    setFilteredCourses(filtered);
  }, [searchTerm, selectedDepartment, selectedInstructor, priceRange, creditFilter, advancedOnly, enrolledOnly, courses, studentId]);

  // Get unique values for filters
  const departments = [...new Set(courses.map(c => c.Department))];
  const instructors = [...new Set(courses.map(c => c.instructorId))];
  const credits = [...new Set(courses.map(c => c.Credit))].sort((a, b) => a - b);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDepartment("");
    setSelectedInstructor("");
    setPriceRange({ min: "", max: "" });
    setCreditFilter("");
    setAdvancedOnly(false);
    setEnrolledOnly(false);
  };

  const activeFiltersCount = [
    searchTerm,
    selectedDepartment,
    selectedInstructor,
    priceRange.min,
    priceRange.max,
    creditFilter,
    advancedOnly,
    enrolledOnly
  ].filter(Boolean).length;

  const handleEnrollClick = (course) => {
    setSelectedCourse(course);
    setShowEnrollModal(true);
  };

  const handleViewDetailsClick = (course) => {
    setSelectedCourse(course);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-lg max-w-md">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Courses</h1>
          <p className="text-gray-600">Browse and enroll in courses</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses by name, code, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Instructor Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
                  <select
                    value={selectedInstructor}
                    onChange={(e) => setSelectedInstructor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Instructors</option>
                    {instructors.map(instructor => (
                      <option key={instructor} value={instructor}>
                        Instructor {instructor.slice(-4)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Credit Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Credits</label>
                  <select
                    value={creditFilter}
                    onChange={(e) => setCreditFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Credits</option>
                    {credits.map(credit => (
                      <option key={credit} value={credit}>{credit} Credits</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Checkbox Filters */}
              <div className="flex flex-wrap gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={advancedOnly}
                    onChange={(e) => setAdvancedOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Advanced Courses Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enrolledOnly}
                    onChange={(e) => setEnrolledOnly(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">My Enrolled Courses</span>
                </label>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredCourses.length}</span> of{" "}
          <span className="font-semibold text-gray-900">{courses.length}</span> courses
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center border border-gray-200">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses found</h3>
            <p className="text-gray-500">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isEnrolled = course.studentsEnrolledIds.includes(studentId);
              
              return (
                <div
                  key={course._id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200"
                >
                  {/* Course Header */}
                  <div className="bg-gray-900 p-5 text-white">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{course.Course_Name}</h3>
                      {course.advanced && (
                        <span className="bg-yellow-500 text-gray-900 px-2 py-1 rounded text-xs font-semibold">
                          Advanced
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm">{course.Course_Initial}</p>
                  </div>

                  {/* Course Body */}
                  <div className="p-5">
                    <div className="space-y-2.5 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Department:</span>
                        <span>{course.Department}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Award className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Credits:</span>
                        <span>{course.Credit}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Schedule:</span>
                        <span className="truncate">{course.Schedule || "TBA"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Price:</span>
                        <span className="text-gray-900 font-semibold">${course.price || 0}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {course.Description || "No description available"}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {isEnrolled ? (
                        <>
                          <span className="flex-1 bg-green-50 text-green-700 px-4 py-2 rounded-md text-center font-medium text-sm border border-green-200">
                            ✓ Enrolled
                          </span>
                          <button
                            onClick={() => handleViewDetailsClick(course)}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
                          >
                            View Details
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEnrollClick(course)}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
                          >
                            Enroll Now
                          </button>
                          <button
                            onClick={() => handleViewDetailsClick(course)}
                            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium text-sm"
                          >
                            Details
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Enroll Modal - Replace with your StudentEnrollCourse component */}
        {showEnrollModal && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Enroll in Course</h3>
              <p className="text-gray-600 mb-6">
                You are enrolling in <span className="font-semibold">{selectedCourse.Course_Name}</span>
              </p>
              {/* Replace this with: <StudentEnrollCourse course={selectedCourse} onClose={() => setShowEnrollModal(false)} /> */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Your enrollment logic here
                    setShowEnrollModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Confirm Enrollment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-900 text-white p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedCourse.Course_Name}</h2>
                    <p className="text-gray-300">{selectedCourse.Course_Initial}</p>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-white hover:bg-gray-800 rounded-lg p-2 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Department</p>
                    <p className="font-semibold text-gray-900">{selectedCourse.Department}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Credits</p>
                    <p className="font-semibold text-gray-900">{selectedCourse.Credit}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <p className="font-semibold text-gray-900">${selectedCourse.price || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Level</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCourse.advanced ? "Advanced" : "Regular"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Prerequisites</h3>
                  <p className="text-gray-600">{selectedCourse.Prerequisites || "None"}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedCourse.Description || "No description available"}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Schedule</h3>
                  <p className="text-gray-600">{selectedCourse.Schedule || "Not scheduled"}</p>
                </div>

                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAllCourses;