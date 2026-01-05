import React, { useState } from "react";
import { useSelector } from "react-redux";
import SummaryApi from "../common";
import bkashImg from "../assest/bkash.png";
import nagadImg from "../assest/nagad.png";

const StudentEnrollCourse = ({ course, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [amount, setAmount] = useState(course.price || 0);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(""); // bkash or nagad

  const user = useSelector((state) => state?.user?.user);
  const userId = user?._id;

  const handleConfirmEnroll = () => setShowPayment(true);

  const handlePayment = async () => {
    if (amount < course.price) {
      setPaymentMessage(`Amount must be at least $${course.price}`);
      return;
    }

    if (!selectedMethod) {
      setPaymentMessage("Please select a payment method.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(SummaryApi.enrollInCourse(course._id).url, {
        method: SummaryApi.enrollInCourse(course._id).method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          studentId: userId,
          amount,
          method: selectedMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPaymentMessage(data.message || "Payment/Enrollment failed.");
        setLoading(false);
        return;
      }

      setPaymentMessage("Enrollment successful!");
      setLoading(false);

      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error(err);
      setPaymentMessage("Error processing payment. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg relative">
        {!showPayment ? (
          <>
            <h2 className="text-xl font-bold mb-4">Enroll in Course</h2>

            <p className="mb-2"><strong>Course:</strong> {course.Course_Name}</p>
            <p className="mb-2"><strong>Department:</strong> {course.Department}</p>
            <p className="mb-2"><strong>Credit:</strong> {course.Credit}</p>
            <p className="mb-2"><strong>Schedule:</strong> {course.Schedule || "Not scheduled"}</p>
            <p className="mb-2"><strong>Price:</strong> ${course.price}</p>

            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500" onClick={onClose}>
                Cancel
              </button>

              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick={handleConfirmEnroll}>
                Enroll Now
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">Payment</h2>

            <p className="mb-2">Course: {course.Course_Name}</p>
            <p className="mb-2">Amount to pay: ${course.price}</p>

            <input
              type="number"
              className="w-full p-2 border mb-2"
              value={amount}
              min={course.price}
              onChange={(e) => setAmount(Number(e.target.value))}
            />

            <div className="flex gap-4 mb-2">
              <div
                className={`cursor-pointer border rounded p-1 ${selectedMethod === "bkash" ? "border-green-600" : ""}`}
                onClick={() => setSelectedMethod("bkash")}
              >
                <img src={bkashImg} alt="Bkash" className="w-16 h-16" />
              </div>

              <div
                className={`cursor-pointer border rounded p-1 ${selectedMethod === "nagad" ? "border-green-600" : ""}`}
                onClick={() => setSelectedMethod("nagad")}
              >
                <img src={nagadImg} alt="Nagad" className="w-16 h-16" />
              </div>
            </div>

            {paymentMessage && (
              <p className={`mt-2 mb-2 text-sm ${paymentMessage.includes("successful") ? "text-green-600" : "text-red-600"}`}>
                {paymentMessage}
              </p>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
                onClick={() => setShowPayment(false)}
                disabled={loading}
              >
                Back
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? "Processing..." : "Pay & Enroll"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentEnrollCourse;
