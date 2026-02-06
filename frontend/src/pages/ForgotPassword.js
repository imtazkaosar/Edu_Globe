// src/pages/ForgotPassword.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import SummaryApi from "../common";
import forgotIcon from "../assest/forgotpasswnedSend.gif";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(SummaryApi.forgotPassword.url, {
        method: SummaryApi.forgotPassword.method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || "Reset link sent to your email!");
        setEmail("");
      } else {
        toast.error(result.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("Error sending reset link");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50/30 to-gray-50 px-4">
      <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-8 w-full max-w-md">
        
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-4">
          <img
            src={forgotIcon}
            alt="forgot password"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Forgot Password?
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your registered email and we’ll send you a reset link.
        </p>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
              required
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-full transition-transform transform hover:scale-105 shadow-md"
          >
            Send Reset Link
          </button>
        </form>

        {/* Back to login */}
        <p className="text-center text-gray-600 mt-6">
          Remembered your password?{" "}
          <Link to="/login" className="text-amber-600 hover:underline font-medium">
            Back to Login
          </Link>
        </p>
      </div>
    </section>
  );
};

export default ForgotPassword;
