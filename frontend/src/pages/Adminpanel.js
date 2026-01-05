import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  FaUserCircle,
  FaUsers,
} from "react-icons/fa";

import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import ROLE from "../common/role";

const Adminpanel = () => {
  const user = useSelector((state) => state?.user?.user);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user?.role !== ROLE.ADMIN) {
      navigate("/");
    }
  }, [user, navigate]);

  const navItems = [{ name: "All Users", icon: <FaUsers />, path: "all-users" }];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="bg-white w-72 shadow-lg flex flex-col fixed h-full">
        {/* Profile */}
        <div className="p-6 flex flex-col items-center border-b">
          {user?.profilePic ? (
            <img
              src={user.profilePic}
              alt={user.name}
              className="w-20 h-20 rounded-full mb-3"
            />
          ) : (
            <FaUserCircle className="text-5xl mb-3" />
          )}
          <h2 className="text-lg font-bold capitalize">{user?.name}</h2>
          <span className="text-sm px-2 py-1 mt-1 rounded-full bg-blue-100 text-blue-700">
            {user?.role}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all ${
                location.pathname.includes(item.path)
                  ? "bg-blue-100 font-semibold"
                  : ""
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-6 overflow-auto">
        <div className="bg-white shadow rounded-lg p-4 min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Adminpanel;
