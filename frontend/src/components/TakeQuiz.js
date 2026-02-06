import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import SummaryApi from "../common";
import { toast } from "react-toastify";

const TakeQuiz = () => {
  const { state } = useLocation();
  const { quizId, quizName } = state || {};

  const user = useSelector((state) => state?.user?.user);
  const studentId = user?._id || user?.id;

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  /* ================= FETCH QUIZ ================= */
  useEffect(() => {
    if (!quizId) return;

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/quiz/${quizId}`)
      .then((res) => res.json())
      .then((data) => setQuiz(data))
      .catch(console.error);
  }, [quizId]);

  const handleSelect = (qi, oi) => {
    const arr = [...answers];
    arr[qi] = oi;
    setAnswers(arr);
  };

  /* ================= SUBMIT QUIZ ================= */
  const submitQuiz = async () => {
    let count = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) count++;
    });

    setScore(count);
    setSubmitted(true);

    try {
      const res = await fetch(SummaryApi.saveQuizAttempt.url, {
        method: SummaryApi.saveQuizAttempt.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          quiz: quizId,
          student: studentId,
          answers,
          obtainedMarks: count,
          totalMarks: quiz.questions.length,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Quiz submitted");
    } catch (err) {
      toast.error(err.message || "Submission failed");
    }
  };

  if (!quiz) return <p>Loading quiz...</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">
        {quizName || quiz.quizName}
      </h2>

      {quiz.questions.map((q, qi) => (
        <div key={qi} className="border p-3 mb-4 rounded">
          <p className="mb-2 font-medium">
            {qi + 1}. {q.text}
          </p>

          {q.options.map((opt, oi) => (
            <label key={oi} className="block mb-1">
              <input
                type="radio"
                disabled={submitted}
                checked={answers[qi] === oi}
                onChange={() => handleSelect(qi, oi)}
              />{" "}
              {opt}
            </label>
          ))}
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={submitQuiz}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Submit Quiz
        </button>
      ) : (
        <div className="mt-4 text-lg font-semibold">
          Score: {score} / {quiz.questions.length}
        </div>
      )}
    </div>
  );
};

export default TakeQuiz;
