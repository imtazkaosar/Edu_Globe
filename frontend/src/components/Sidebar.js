import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  BarChart3,
  Menu,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Logo from "./Logo";
import SummaryApi from "../common";
import { setUserDetails } from "../store/userSlice";
import { toast } from "react-toastify";
import { FaUserLarge } from "react-icons/fa6";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.user);

  // -----------------------------
  // ROLE-BASED MENU ITEMS
  // -----------------------------

  const teacherMenu = [
    { name: "Dashboard", path: "/teacher-dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "My Courses", path: "/teacher/my-courses", icon: <BarChart3 size={20} /> },
    { name: "Course Review", path: "/teacher/course-review", icon: <BarChart3 size={20} /> },
    { name: "Recorded Classes", path: "/teacher/recorded-class", icon: <BarChart3 size={20} /> },
    { name: "Live Classes", path: "/teacher/live-classes", icon: <BarChart3 size={20} /> },
    { name: "Create Quiz", path: "/teacher/create-quiz", icon: <BarChart3 size={20} /> },
    { name: "Create Assignment", path: "/teacher/create-assignment", icon: <BarChart3 size={20} /> },
    { name: "Assignment Submissions", path: "/teacher/submissions", icon: <BarChart3 size={20} /> },
  ];

  const studentMenu = [
    { name: "Dashboard", path: "/student-dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "My Courses", path: "/student/my-courses", icon: <Wallet size={20} /> },
    { name: "Live Classes", path: "/student/live-class", icon: <Wallet size={20} /> },
    { name: "Recorded Classes", path: "/student/record-class", icon: <Wallet size={20} /> },
    { name: "All Courses", path: "/student/all-courses", icon: <Wallet size={20} /> },
    { name: "Quiz Results", path: "/student/quiz-marks", icon: <BarChart3 size={20} /> },
    { name: "Assignments", path: "/student/assignments", icon: <BarChart3 size={20} /> },
    { name: "Assignment Review", path: "/student/assignments-feedback", icon: <BarChart3 size={20} /> },  
    { name: "Explore Universities", path: "/student/uni", icon: <ArrowLeftRight size={20} /> },
  ];


  let menuItems = [];

  if (user?.role === "TEACHER") menuItems = teacherMenu;
  if (user?.role === "STUDENT") menuItems = studentMenu;
 

  // -----------------------------
  // LOGOUT HANDLER
  // -----------------------------
  const handelLogout = async () => {
    try {
      const fetchData = await fetch(SummaryApi.logout_user.url, {
        method: SummaryApi.logout_user.method,
        credentials: "include",
      });
      const data = await fetchData.json();
      if (data.success) {
        toast.success(data.message);
        dispatch(setUserDetails(null));
      } else {
        toast.error(data.message || "Logout failed");
      }
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <motion.div
      animate={{ width: isOpen ? 260 : 70 }}
      className="h-screen sticky top-0 bg-gradient-to-b from-slate-50 to-white shadow-xl border-r border-slate-200 flex flex-col transition-all duration-300"
    >
      {/* Top Section */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        {isOpen && (
          <Link to={"/"} className="flex items-center">
            <Logo w={170} h={60} />
          </Link>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 border border-transparent hover:border-slate-200"
        >
          <Menu size={20} className="text-slate-600" />
        </button>
      </div>

      {/* Sidebar Menu */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
        {menuItems.map((item, index) => (
          <NavLink
            to={item.path}
            key={index}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800 hover:shadow-md"
              }`
            }
          >
            <div className={`${isOpen ? "" : "flex justify-center w-full"}`}>
              {item.icon}
            </div>

            {isOpen && (
              <div className="flex items-center justify-between flex-1">
                <span className="font-medium">{item.name}</span>
                <ChevronRight
                  size={16}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            )}

            {!isOpen && (
              <span className="absolute left-14 z-50 hidden group-hover:flex whitespace-nowrap bg-gray-800 text-white text-xs px-2 py-1 rounded-md shadow-lg">
                {item.name}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile + Logout Section */}
      {user && (
        <div className="mt-auto border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="p-4 flex items-center justify-between gap-3 relative group">
            {/* Profile Image */}
            <div className="relative flex items-center gap-2">
              {user?.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-300 group-hover:ring-blue-400 transition-all duration-300 shadow-lg"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ring-2 ring-slate-300 group-hover:ring-blue-400 transition-all duration-300 shadow-lg">
                  <FaUserLarge className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm">
                <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Logout Button */}
            {isOpen && (
              <button
                onClick={handelLogout}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                title="Sign Out"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Sidebar;
