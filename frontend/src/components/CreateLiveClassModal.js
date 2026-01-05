import React, { useEffect, useState } from "react";
import SummaryApi from "../common";
import { useSelector } from "react-redux";

const CreateLiveClassModal = ({ onClose, onSuccess }) => {
  const user = useSelector((state) => state?.user?.user);
  const teacherId = user?._id || user?.id;

  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    courseId: "",
    title: "",
    startTime: "",
    durationMinutes: "",
    platform: "google-meet",
    meetingLink: "",
  });

  useEffect(() => {
    const fetchCourses = async () => {
      const res = await fetch(SummaryApi.getAllCourses.url);
      const data = await res.json();
      setCourses(
        data.filter(c => c.instructorId === teacherId)
      );
    };
    fetchCourses();
  }, [teacherId]);

  const handleSubmit = async () => {
    console.log(form)
    try {
      await fetch(SummaryApi.createLiveClass.url, {
        method: SummaryApi.createLiveClass.method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Create failed", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Create Live Class</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Course <span className="text-red-500">*</span>
            </label>
            <select
              value={form.courseId}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
            >
              <option value="">Choose a course</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.Course_Name}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Title <span className="text-red-500">*</span>
            </label>
            <input 
              type="text"
              placeholder="Enter class title"
              value={form.title}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              onChange={e => setForm({ ...form, title: e.target.value })} 
            />
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date & Time <span className="text-red-500">*</span>
            </label>
            <input 
              type="datetime-local"
              value={form.startTime}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              onChange={e => setForm({ ...form, startTime: e.target.value })} 
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes) <span className="text-red-500">*</span>
            </label>
            <input 
              type="number"
              placeholder="e.g., 60"
              value={form.durationMinutes}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              onChange={e => setForm({ ...form, durationMinutes: e.target.value })} 
            />
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform
            </label>
            <select
              value={form.platform}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
            >
              <option value="google-meet">Google Meet</option>
              <option value="zoom">Zoom</option>
              <option value="teams">Microsoft Teams</option>
            </select>
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Link <span className="text-red-500">*</span>
            </label>
            <input 
              type="url"
              placeholder="https://meet.google.com/abc-defg-hij"
              value={form.meetingLink}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              onChange={e => setForm({ ...form, meetingLink: e.target.value })} 
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            Create Class
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateLiveClassModal;