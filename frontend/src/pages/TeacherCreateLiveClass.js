import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SummaryApi from "../common";
import CreateLiveClassModal from "../components/CreateLiveClassModal";
import EditLiveClassModal from "../components/EditLiveClassModal";

const TeacherCreateLiveClass = () => {
  const user = useSelector((state) => state?.user?.user);
  const teacherId = user?._id || user?.id;

  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Fetch teacher live class history
  const fetchLiveClasses = async () => {
    try {
      const res = await fetch(
        SummaryApi.teacherLiveClassHistory.url,
        {
          method: SummaryApi.teacherLiveClassHistory.method,
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        setLiveClasses(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load live classes", err);
    } finally {
      setLoading(false);
    }
  };

  // Cancel live class
  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this live class?")) return;

    try {
      await fetch(
        SummaryApi.cancelLiveClass(id).url,
        {
          method: SummaryApi.cancelLiveClass(id).method,
          credentials: "include",
        }
      );
      fetchLiveClasses();
    } catch (err) {
      console.error("Cancel failed", err);
    }
  };

  useEffect(() => {
    if (teacherId) fetchLiveClasses();
  }, [teacherId]);

  const getStatusBadge = (status) => {
    const styles = {
      scheduled: "bg-blue-100 text-blue-700 border-blue-200",
      ongoing: "bg-green-100 text-green-700 border-green-200",
      completed: "bg-gray-100 text-gray-700 border-gray-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.scheduled}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Live Classes</h1>
                <p className="text-sm text-gray-500 mt-1">Manage and schedule your live sessions</p>
              </div>
              <button
                onClick={() => setOpenCreateModal(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Live Class
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
              </div>
            ) : liveClasses.length === 0 ? (
              <div className="text-center py-16">
                <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No live classes yet</h3>
                <p className="mt-2 text-sm text-gray-500">Get started by creating your first live class session</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {liveClasses.map((cls) => {
                      const isCancelled = cls.status === "cancelled";

                      return (
                        <tr key={cls._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{cls.title}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">
                              {new Date(cls.startTime).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(cls.startTime).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">{cls.durationMinutes} min</div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(cls.status)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {!isCancelled ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedClass(cls);
                                      setOpenEditModal(true);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                  >
                                    Edit
                                  </button>

                                  <button
                                    onClick={() => handleCancel(cls._id)}
                                    className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <span className="text-sm text-gray-400 italic">
                                  No actions available
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {openCreateModal && (
        <CreateLiveClassModal
          onClose={() => setOpenCreateModal(false)}
          onSuccess={fetchLiveClasses}
        />
      )}

      {openEditModal && selectedClass && (
        <EditLiveClassModal
          liveClass={selectedClass}
          onClose={() => setOpenEditModal(false)}
          onSuccess={fetchLiveClasses}
        />
      )}
    </>
  );
};

export default TeacherCreateLiveClass;