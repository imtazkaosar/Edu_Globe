import React, { useContext, useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SummaryApi from '../common';
import Context from '../context';
import loginIcons from '../assest/signin.gif';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { fetchUserDetails } = useContext(Context);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataResponse = await fetch(SummaryApi.signIn.url, {
      method: SummaryApi.signIn.method,
      credentials: 'include',
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data)
    });

    const dataApi = await dataResponse.json();

    if (dataApi.success) {
      toast.success(dataApi.message);

      // Fetches full user (including role)
      const user = await fetchUserDetails();
      console.log(dataApi)

      // Navigate based on role
      if (user?.role === "TEACHER") {
        navigate("/teacher-dashboard");
      } else if (user?.role === "STUDENT") {
        navigate("/student-dashboard");
      } else {
        navigate("/"); // fallback
      }
    }

    if (dataApi.error) {
      toast.error(dataApi.message);
    }
  };

  return (
    <section id="login" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-amber-50/30 to-orange-50/30 px-4">
      <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-8 w-full max-w-md">

        <div className="w-20 h-20 mx-auto mb-4">
          <img src={loginIcons} alt="login icons" className="w-full h-full object-contain" />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Welcome Back
        </h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Enter email"
              name="email"
              value={data.email}
              onChange={handleOnChange}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <div className="flex items-center bg-gray-100 rounded-xl pr-3 focus-within:ring-2 focus-within:ring-amber-400">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                name="password"
                value={data.password}
                onChange={handleOnChange}
                className="flex-1 px-4 py-3 bg-transparent outline-none"
              />
              <div
                className="cursor-pointer text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>

            <Link to="/forgot-password" className="text-sm text-amber-600 hover:underline mt-1 block text-right">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-full transition-transform transform hover:scale-105 shadow-md"
          >
            Login
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link to="/sign-up" className="text-amber-600 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
