import React, { useState } from "react";
import { useSelector } from "react-redux";
import { X, CreditCard, Check, AlertCircle, ChevronLeft, Banknote } from "lucide-react";
import SummaryApi from "../common";
import bkashImg from "../assest/bkash.png";
import nagadImg from "../assest/nagad.png";

const StudentEnrollCourse = ({ course, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [amount, setAmount] = useState(course.price || 0);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");

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
    setPaymentMessage("");

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
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
        {!showPayment ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Enroll in Course</h2>
                  <p className="text-blue-100 text-sm mt-1">Review course details</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Course Info Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                <h3 className="font-bold text-gray-900 text-lg mb-4">{course.Course_Name}</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Department</span>
                    <span className="font-semibold text-gray-900">{course.Department}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Credits</span>
                    <span className="font-semibold text-gray-900">{course.Credit}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Schedule</span>
                    <span className="font-semibold text-gray-900 text-right max-w-[200px] truncate">
                      {course.Schedule || "Not scheduled"}
                    </span>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Total Price</span>
                      <span className="text-2xl font-bold text-blue-600">${course.price}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Alert */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Before you continue</p>
                  <p>Please ensure you have reviewed the course details. Enrollment is subject to availability.</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium transition-all shadow-lg shadow-green-500/30"
                onClick={handleConfirmEnroll}
              >
                Continue to Payment
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Payment Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <Banknote className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Payment Details</h2>
                  <p className="text-indigo-100 text-sm mt-1">Complete your enrollment</p>
                </div>
              </div>
            </div>

            {/* Payment Content */}
            <div className="p-6 space-y-5">
              {/* Course Summary */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Enrolling in</p>
                    <p className="font-bold text-gray-900">{course.Course_Name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                    <p className="text-2xl font-bold text-indigo-600">${course.price}</p>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-semibold transition-all"
                    value={amount}
                    min={course.price}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder={`Min: $${course.price}`}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Minimum amount: ${course.price}</p>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Bkash */}
                  <div
                    className={`relative cursor-pointer rounded-xl border-2 transition-all ${
                      selectedMethod === "bkash"
                        ? "border-green-500 bg-green-50 shadow-lg shadow-green-500/30"
                        : "border-gray-300 bg-white hover:border-gray-400 hover:shadow-md"
                    }`}
                    onClick={() => setSelectedMethod("bkash")}
                  >
                    <div className="p-4 flex flex-col items-center">
                      <img src={bkashImg} alt="Bkash" className="w-20 h-20 object-contain mb-2" />
                      <span className="font-semibold text-gray-900 text-sm">bKash</span>
                    </div>
                    {selectedMethod === "bkash" && (
                      <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Nagad */}
                  <div
                    className={`relative cursor-pointer rounded-xl border-2 transition-all ${
                      selectedMethod === "nagad"
                        ? "border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/30"
                        : "border-gray-300 bg-white hover:border-gray-400 hover:shadow-md"
                    }`}
                    onClick={() => setSelectedMethod("nagad")}
                  >
                    <div className="p-4 flex flex-col items-center">
                      <img src={nagadImg} alt="Nagad" className="w-20 h-20 object-contain mb-2" />
                      <span className="font-semibold text-gray-900 text-sm">Nagad</span>
                    </div>
                    {selectedMethod === "nagad" && (
                      <div className="absolute top-2 right-2 bg-orange-500 rounded-full p-1">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Message */}
              {paymentMessage && (
                <div
                  className={`rounded-lg p-4 flex items-center gap-3 ${
                    paymentMessage.includes("successful")
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  {paymentMessage.includes("successful") ? (
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <p
                    className={`text-sm font-medium ${
                      paymentMessage.includes("successful") ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {paymentMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Payment Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between gap-3 border-t border-gray-200">
              <button
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  setShowPayment(false);
                  setPaymentMessage("");
                }}
                disabled={loading}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </span>
                ) : (
                  "Pay & Enroll"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentEnrollCourse;