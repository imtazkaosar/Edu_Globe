import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Video, Plus, Edit2, Trash2, Clock, Calendar, Eye, X, Save } from "lucide-react";
import SummaryApi from "../common";

const TeacherPostRecordClass = () => {
  const user = useSelector((state) => state?.user?.user);
  const teacherId = user?._id || user?.id;

  const [courses, setCourses] = useState([]);
  const [recordedClasses, setRecordedClasses] = useState([]);

  const [form, setForm] = useState({
    courseId: "",
    title: "",
    description: "",
    videoUrl: "",
    duration: "",
    isPublished: true,
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---------------- FETCH COURSES + HISTORY ----------------
  useEffect(() => {
    if (!teacherId) return;

    const fetchData = async () => {
      try {
        // courses
        const courseRes = await fetch(SummaryApi.getAllCourses.url, {
          method: SummaryApi.getAllCourses.method,
          credentials: "include",
        });
        const courseData = await courseRes.json();

        const teacherCourses = courseData.filter(
          (c) => String(c.instructorId) === String(teacherId)
        );
        setCourses(teacherCourses);

        // recorded classes
        const recRes = await fetch(SummaryApi.getRecordedClasses.url, {
          method: SummaryApi.getRecordedClasses.method,
          credentials: "include",
        });
        const recData = await recRes.json();

        setRecordedClasses(
          recData.data.filter(
            (r) => String(r.teacherId) === String(teacherId)
          )
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teacherId]);

  // ---------------- CREATE / UPDATE ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const api = editingId
      ? SummaryApi.updateRecordedClass(editingId)
      : SummaryApi.createRecordedClass;

    try {
      const res = await fetch(api.url, {
        method: api.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setEditingId(null);
      setForm({
        courseId: "",
        title: "",
        description: "",
        videoUrl: "",
        duration: "",
        isPublished: true,
      });

      // refresh history
      const refresh = await fetch(SummaryApi.getRecordedClasses.url, {
        method: "get",
        credentials: "include",
      });
      const refreshed = await refresh.json();
      setRecordedClasses(
        refreshed.data.filter(
          (r) => String(r.teacherId) === String(teacherId)
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this recorded class?")) return;

    await fetch(SummaryApi.deleteRecordedClass(id).url, {
      method: "delete",
      credentials: "include",
    });

    setRecordedClasses((prev) => prev.filter((r) => r._id !== id));
  };

  // ---------------- EDIT ----------------
  const handleEdit = (rec) => {
    setEditingId(rec._id);
    setForm({
      courseId: rec.courseId,
      title: rec.title,
      description: rec.description,
      videoUrl: rec.videoUrl,
      duration: rec.duration,
      isPublished: rec.isPublished,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      courseId: "",
      title: "",
      description: "",
      videoUrl: "",
      duration: "",
      isPublished: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border border-red-100">
          <div className="text-red-500 text-5xl mb-4 text-center">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Oops! Something went wrong</h2>
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-xl shadow-lg">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">Recorded Classes</h1>
          </div>
          <p className="text-gray-600 ml-16">Manage and share your course recordings</p>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                {editingId ? <Edit2 className="w-5 h-5 text-purple-600" /> : <Plus className="w-5 h-5 text-purple-600" />}
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {editingId ? "Edit Recorded Class" : "Post New Recording"}
              </h2>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course *
              </label>
              <select
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white"
              >
                <option value="">Select a course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.Course_Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Introduction to React Hooks"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  placeholder="e.g., 45"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Video URL *
              </label>
              <input
                type="url"
                placeholder="https://example.com/video.mp4"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                placeholder="Add a brief description of this recording..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-fuchsia-700 transition-all shadow-lg hover:shadow-xl"
            >
              {editingId ? (
                <>
                  <Save className="w-5 h-5" />
                  Update Recording
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Post Recording
                </>
              )}
            </button>
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Recording History
            </h2>
            <span className="ml-auto bg-purple-100 text-purple-700 px-4 py-1 rounded-full text-sm font-semibold">
              {recordedClasses.length} Total
            </span>
          </div>

          {recordedClasses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-fuchsia-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Video className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Recordings Yet</h3>
              <p className="text-gray-600">Start by posting your first recorded class above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recordedClasses.map((rec) => {
                const course = courses.find(c => String(c._id) === String(rec.courseId));
                
                return (
                  <div
                    key={rec._id}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 hover:from-purple-50 hover:to-fuchsia-50 transition-all duration-300 border border-gray-200 hover:border-purple-300 hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                            <Video className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800 text-lg mb-1 break-words">
                              {rec.title}
                            </h3>
                            {course && (
                              <p className="text-sm text-purple-600 font-medium mb-2">
                                {course.Course_Name}
                              </p>
                            )}
                            {rec.description && (
                              <p className="text-sm text-gray-600 mb-3 break-words">
                                {rec.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{rec.duration} minutes</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                          </div>
                          <a
                            href={rec.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-purple-600 hover:text-purple-700 font-medium"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Watch Video
                          </a>
                        </div>
                      </div>

                      <div className="flex sm:flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(rec)}
                          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all font-medium"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(rec._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Delete</span>
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
    </div>
  );
};

export default TeacherPostRecordClass;