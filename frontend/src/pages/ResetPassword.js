// src/pages/ResetPassword.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import SummaryApi from "../common";
import resetIcon from "../assest/forgotpasswnedSend.gif"; // reuse your forgot icon

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await fetch(`${SummaryApi.verifyResetToken.url}/${token}`);
        const result = await res.json();

        if (!result.success) {
          toast.error(result.message || "Invalid or expired token");
          navigate("/login");
        } else {
          setLoading(false);
        }
      } catch {
        toast.error("Something went wrong");
        navigate("/login");
      }
    };

    verifyToken();
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    const response = await fetch(SummaryApi.resetPassword.url, {
      method: SummaryApi.resetPassword.method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const result = await response.json();

    if (result.success) {
      toast.success(result.message);
      navigate("/login");
    } else {
      toast.error(result.message);
    }
  };

  if (loading) return <p className="text-center mt-20">Verifying token...</p>;

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-amber-50/30 to-orange-50/30 px-4">
      <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-8 w-full max-w-md">
        
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-4">
          <img
            src={resetIcon}
            alt="reset password"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Reset Password
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your new password to reset it.
        </p>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-medium text-gray-700">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
              required
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-full transition-transform transform hover:scale-105 shadow-md"
          >
            Reset Password
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

export default ResetPassword;
