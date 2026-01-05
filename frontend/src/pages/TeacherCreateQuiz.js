import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SummaryApi from "../common";
import { toast } from "react-toastify";
import { Plus, Trash2, BookOpen, FileText, CheckCircle } from "lucide-react";

const TeacherCreateQuiz = () => {
  const user = useSelector((state) => state?.user?.user);
  const teacherId = user?._id || user?.id;

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [quizName, setQuizName] = useState("");
  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState([
    {
      text: "",
      options: ["", "", "", ""],
      correctIndex: 0,
    },
  ]);

  /* ================= FETCH TEACHER COURSES ================= */
  const fetchCourses = async () => {
    try {
      const res = await fetch(SummaryApi.getAllCourses.url, {
        method: SummaryApi.getAllCourses.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (!res.ok) throw new Error(data.message);

      const teacherCourses = data.filter(
        (c) =>
          c.instructor?.toString() === teacherId?.toString() ||
          c.instructorId?.toString() === teacherId?.toString()
      );

      setCourses(teacherCourses);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load courses");
    }
  };

  useEffect(() => {
    if (teacherId) fetchCourses();
  }, [teacherId]);

  /* ================= QUESTION HANDLERS ================= */
  const handleQuestionText = (qi, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, text: value } : q))
    );
  };

  const handleOptionChange = (qi, oi, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q;
        const opts = [...q.options];
        opts[oi] = value;
        return { ...q, options: opts };
      })
    );
  };

  const handleCorrectChange = (qi, oi) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, correctIndex: oi } : q))
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { text: "", options: ["", "", "", ""], correctIndex: 0 },
    ]);
  };

  const removeQuestion = (qi) => {
    if (questions.length > 1) {
      setQuestions((prev) => prev.filter((_, i) => i !== qi));
    }
  };

  /* ================= CREATE QUIZ ================= */
  const createQuiz = async () => {
    if (!teacherId) {
      toast.error("Teacher not loaded");
      return;
    }

    if (!quizName.trim()) {
      toast.error("Quiz name is required");
      return;
    }

    if (!selectedCourse) {
      toast.error("Select a course");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim() || q.options.some((o) => !o.trim())) {
        toast.error(`Complete all fields in question ${i + 1}`);
        return;
      }
    }

    try {
      setLoading(true);

      const api = SummaryApi.createQuiz(teacherId, selectedCourse);

      const res = await fetch(api.url, {
        method: api.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: quizName,
          questions,
        }),
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (!res.ok) throw new Error(data.message);

      toast.success("Quiz created successfully");

      setQuizName("");
      setSelectedCourse("");
      setQuestions([
        { text: "", options: ["", "", "", ""], correctIndex: 0 },
      ]);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-700" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Create New Quiz</h1>
          </div>

          {/* Quiz Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiz Title
            </label>
            <input
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all"
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              placeholder="Enter quiz title"
            />
          </div>

          {/* Course Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Course
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">-- Select a course --</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.Course_Name || c.courseName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4 mb-6">
          {questions.map((q, qi) => (
            <div
              key={qi}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-semibold text-slate-700">
                    {qi + 1}
                  </div>
                  <h3 className="text-base font-medium text-gray-900">
                    Question {qi + 1}
                  </h3>
                </div>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(qi)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <input
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all mb-4"
                placeholder="Enter your question"
                value={q.text}
                onChange={(e) => handleQuestionText(qi, e.target.value)}
              />

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-3">Options</p>
                {q.options.map((opt, oi) => (
                  <div
                    key={oi}
                    className="flex items-center gap-3 group"
                  >
                    <div className="flex-shrink-0">
                      <input
                        type="radio"
                        name={`correct-${qi}`}
                        checked={q.correctIndex === oi}
                        onChange={() => handleCorrectChange(qi, oi)}
                        className="w-4 h-4 text-slate-600 focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                    <div className="flex-1 relative">
                      <input
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all"
                        placeholder={`Option ${oi + 1}`}
                        value={opt}
                        onChange={(e) =>
                          handleOptionChange(qi, oi, e.target.value)
                        }
                      />
                      {q.correctIndex === oi && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={addQuestion}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Question
            </button>

            <button
              onClick={createQuiz}
              disabled={loading || !teacherId}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? "Creating..." : "Create Quiz"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherCreateQuiz;