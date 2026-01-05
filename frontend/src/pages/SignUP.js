import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import loginIcons from "../assest/hello.gif";
import SummaryApi from "../common";
import imageTobase64 from "../helpers/imageTobase64";

const SignUP = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [data, setData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
    profilePic: "",
  });

  const navigate = useNavigate();

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadPic = async (e) => {
    const file = e.target.files[0];
    if (!file) return; // no file selected
    try {
      const imagePic = await imageTobase64(file);
      setData((prev) => ({ ...prev, profilePic: imagePic }));
    } catch (err) {
      console.error("Error converting image to base64:", err);
      toast.error("Failed to upload image. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (data.password !== data.confirmPassword) {
      toast.error("Please check password and confirm password");
      return;
    }

    try {
      const response = await fetch(SummaryApi.signUP.url, {
        method: SummaryApi.signUP.method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        navigate("/login");
      }

      if (result.error) {
        toast.error(result.message);
      }
    } catch (err) {
      console.error("Error submitting signup form:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <section
      id="signup"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-amber-50/30 to-orange-50/30 px-4"
    >
      <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-8 w-full max-w-md">
        {/* Profile Picture */}
        <div className="w-24 h-24 mx-auto relative overflow-hidden rounded-full shadow-md border-4 border-white cursor-pointer group">
          <label className="absolute inset-0 cursor-pointer">
            <img
              src={data.profilePic || loginIcons}
              alt="profile"
              className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
            />
            <input type="file" className="hidden" onChange={handleUploadPic} />
          </label>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mt-4 mb-6">
          Create Your Account
        </h2>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              name="name"
              value={data.name}
              onChange={handleOnChange}
              required
              className="w-full px-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Enter email"
              name="email"
              value={data.email}
              onChange={handleOnChange}
              required
              className="w-full px-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <div className="flex items-center bg-gray-100 rounded-xl pr-3 focus-within:ring-2 focus-within:ring-amber-400">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                name="password"
                value={data.password}
                onChange={handleOnChange}
                required
                className="flex-1 px-4 py-3 bg-transparent outline-none"
              />
              <div
                className="cursor-pointer text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="flex items-center bg-gray-100 rounded-xl pr-3 focus-within:ring-2 focus-within:ring-amber-400">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                name="confirmPassword"
                value={data.confirmPassword}
                onChange={handleOnChange}
                required
                className="flex-1 px-4 py-3 bg-transparent outline-none"
              />
              <div
                className="cursor-pointer text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-full transition-transform transform hover:scale-105 shadow-md"
          >
            Sign Up
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-amber-600 hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
};

export default SignUP;
