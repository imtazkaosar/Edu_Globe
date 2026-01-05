import React, { useState } from "react";
import {  FaCog, FaSignOutAlt, FaUserCog, FaUser } from "react-icons/fa";
import { FaUserLarge } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import SummaryApi from "../common";
import { toast } from "react-toastify";
import { setUserDetails } from "../store/userSlice";
import ROLE from "../common/role";
import ProfileDisplay from "./ProfileDisplay";

const Header = () => {
  const user = useSelector((state) => state?.user?.user);
  const dispatch = useDispatch();
  const [menuDisplay, setMenuDisplay] = useState(false);
  const [profileDisplay, setProfileDisplay] = useState(false);

  const handelLogout = async () => {
    const fetchData = await fetch(SummaryApi.logout_user.url, {
      method: SummaryApi.logout_user.method,
      credentials: "include",
    });
    const data = await fetchData.json();
    if (data.success) {
      toast.success(data.message);
      dispatch(setUserDetails(null));
    }
    if (data.error) {
      toast.error(data.message);
    }
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 backdrop-blur-sm bg-white/95 sticky top-0 z-40">
        <div className="h-full container mx-auto flex items-center px-4 lg:px-6 justify-between max-w-7xl">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to={"/"} className="flex items-center">
              <Logo w={170} h={60} />
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {user?._id && (
              <>
                {/* User Menu */}
                <div className="relative">
                  <button
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all duration-200 group"
                    onClick={() => setMenuDisplay((prev) => !prev)}
                  >
                    <div className="relative">
                      {user?.profilePic ? (
                        <img
                          src={user?.profilePic}
                          alt={user?.name}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 group-hover:ring-blue-300 transition-all duration-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ring-2 ring-slate-200 group-hover:ring-blue-300 transition-all duration-200">
                          <FaUserLarge className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>

                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium text-slate-900 truncate max-w-24">
                        {user?.name}
                      </span>
                      <span className="text-xs text-slate-500 capitalize">
                        {user?.role}
                      </span>
                    </div>

                    <svg
                      className="w-4 h-4 text-slate-400 transition-transform duration-200 group-hover:text-slate-600"
                      style={{
                        transform: menuDisplay
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Enhanced Dropdown Menu */}
                  {menuDisplay && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setMenuDisplay(false)}
                      ></div>

                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                        {/* User Info Header */}
                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                          <div className="flex items-center gap-3">
                            {user?.profilePic ? (
                              <img
                                src={user?.profilePic}
                                alt={user?.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <FaUserLarge className="w-5 h-5 text-white" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {user?.name}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <button
                            className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                            onClick={() => {
                              setMenuDisplay(false);
                              setTimeout(() => setProfileDisplay(true), 100);
                            }}
                          >
                            <FaUserCog className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Profile Settings
                            </span>
                          </button>

                          {user?.role === ROLE.ADMIN && (
                            <Link
                              to={"/admin-panel/all-users"}
                              className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                              onClick={() => setMenuDisplay(false)}
                            >
                              <FaCog className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                Admin Panel
                              </span>
                            </Link>
                          )}

                          <div className="border-t border-slate-100 my-2"></div>

                          <button
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-150"
                            onClick={() => {
                              handelLogout();
                              setMenuDisplay(false);
                            }}
                          >
                            <FaSignOutAlt className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Sign Out
                            </span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Login Button for Non-authenticated Users */}
            {!user?._id && (
              <Link
                to={"/login"}
                className="px-6 py-2.5 rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Profile Modal - Moved outside header to prevent z-index conflicts */}
      {profileDisplay && (
        <ProfileDisplay
          onClose={() => setProfileDisplay(false)}
          name={user.name}
          email={user.email}
          role={user.role}
          userId={user._id}
          profilePic={user.profilePic}
          callFunc={handelLogout}
        />
      )}
    </>
  );
};

export default Header;
