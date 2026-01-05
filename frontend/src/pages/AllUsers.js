import React, { useContext, useEffect, useState } from "react";
import SummaryApi from "../common";
import { toast } from "react-toastify";
import moment from "moment";
import { FiEdit } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { ImProfile } from "react-icons/im";
import { ThreeDots } from "react-loader-spinner";
import ChangeUserRole from "../components/ChangeUserRole";
import DisplayUserDetails from "../components/DisplayUserDetails";
import DeleteUserDetails from "../components/DeleteUserDetails";
import Context from "../context";

const AllUsers = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("desc"); // asc | desc
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [openUpdateRole, setOpenUpdateRole] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openUserDetails, setOpenUserDetails] = useState(false);
  const [updateUserDetails, setUpdateUserDetails] = useState({
    email: "",
    name: "",
    role: "",
    _id: "",
    profilePic: "",
  });

  const fetchAllUsers = async () => {
    setShowLoader(true);
    try {
      const res = await fetch(SummaryApi.allUser.url, {
        method: SummaryApi.allUser.method,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setAllUsers(data.data);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to fetch users.");
    } finally {
      setShowLoader(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const { fetchUserDetails } = useContext(Context);

  // Filter users
  const filteredUsers = allUsers
    .filter(
      (user) =>
        (roleFilter === "All" || user.role === roleFilter) &&
        (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter((user) => {
      if (!dateFilter.from && !dateFilter.to) return true;
      const created = moment(user.createdAt);
      if (dateFilter.from && dateFilter.to) {
        return (
          created.isSameOrAfter(moment(dateFilter.from)) &&
          created.isSameOrBefore(moment(dateFilter.to))
        );
      } else if (dateFilter.from) {
        return created.isSame(moment(dateFilter.from), "day");
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "asc") return new Date(a.createdAt) - new Date(b.createdAt);
      else return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const totalUsers = filteredUsers.length;
  const recentlyAdded = allUsers.filter((u) =>
    moment(u.createdAt).isAfter(moment().subtract(7, "days"))
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            User Management
          </h1>
          <p className="text-slate-600 text-lg">Manage your finance platform users</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Users Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Total Users</h3>
                  <p className="text-sm text-slate-500">Currently showing filtered results</p>
                </div>
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-800 mb-2">{totalUsers.toLocaleString()}</div>
            <div className="text-sm text-slate-500">
              Out of {allUsers.length.toLocaleString()} total users
            </div>
          </div>

          {/* New Users Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">New Users</h3>
                  <p className="text-sm text-slate-500">Joined in the last 7 days</p>
                </div>
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-800 mb-2">+{recentlyAdded.toLocaleString()}</div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                recentlyAdded > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {recentlyAdded > 0 ? (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Growing</span>
                  </>
                ) : (
                  <span>No new users</span>
                )}
              </div>
            </div>
          </div>

          {/* Admin Users Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Admin Users</h3>
                  <p className="text-sm text-slate-500">Users with admin privileges</p>
                </div>
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-800 mb-2">
              {allUsers.filter((u) => u.role === "ADMIN").length.toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">
              {((allUsers.filter((u) => u.role === "ADMIN").length / Math.max(allUsers.length, 1)) * 100).toFixed(1)}% of total users
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Filter & Search</h3>
            {(dateFilter.from || dateFilter.to || searchQuery || roleFilter !== "All" || sortOrder !== "desc") && (
              <button
                onClick={() => {
                  setDateFilter({ from: "", to: "" });
                  setSearchQuery("");
                  setRoleFilter("All");
                  setSortOrder("desc");
                }}
                className="px-4 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-slate-200 hover:border-red-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear All Filters</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-2">Search Users</label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 bg-slate-50 focus:bg-white"
              />
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 bg-slate-50 focus:bg-white"
              >
                <option value="All">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Sort By</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 bg-slate-50 focus:bg-white"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">From Date</label>
              <input
                type="date"
                value={dateFilter.from}
                onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 bg-slate-50 focus:bg-white"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">To Date</label>
              <input
                type="date"
                value={dateFilter.to}
                onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Sr.</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Joined</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {showLoader ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <div className="flex justify-center">
                        <ThreeDots color="#475569" height={50} width={50} />
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((el, index) => (
                    <tr key={el._id || index} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                            {el?.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{el?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{el?.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            el.role === "ADMIN"
                              ? "bg-purple-100 text-purple-700 border border-purple-200"
                              : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {el?.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {moment(el?.createdAt).format("MMM DD, YYYY")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            className="p-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-all duration-200 border border-amber-200 hover:border-amber-500"
                            onClick={() => {
                              setUpdateUserDetails(el);
                              setOpenUpdateRole(true);
                            }}
                            title="Edit Role"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all duration-200 border border-red-200 hover:border-red-500"
                            onClick={() => {
                              setUpdateUserDetails(el);
                              setOpenDelete(true);
                            }}
                            title="Delete User"
                          >
                            <MdDelete className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-200 border border-blue-200 hover:border-blue-500"
                            onClick={() => {
                              setUpdateUserDetails(el);
                              setOpenUserDetails(true);
                            }}
                            title="View Details"
                          >
                            <ImProfile className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                          <div className="w-8 h-8 bg-slate-300 rounded-lg"></div>
                        </div>
                        <p className="text-slate-500 font-medium">No users found</p>
                        <p className="text-slate-400 text-sm">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        {openDelete && (
          <DeleteUserDetails
            onClose={() => setOpenDelete(false)}
            {...updateUserDetails}
            callFunc={fetchAllUsers}
          />
        )}

        {openUserDetails && (
          <DisplayUserDetails
            onClose={() => setOpenUserDetails(false)}
            {...updateUserDetails}
            callFunc={fetchAllUsers}
          />
        )}

        {openUpdateRole && (
          <ChangeUserRole
            onClose={() => setOpenUpdateRole(false)}
            {...updateUserDetails}
            callFunc={fetchAllUsers}
          />
        )}
      </div>
    </div>
  );
};

export default AllUsers;