import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SummaryApi from "../common";
import { Video, Clock, Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react";

const StudentLiveClass = () => {
  const user = useSelector((state) => state?.user?.user);
  const studentId = user?._id || user?.id;

  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const getValidMeetingLink = (link) => {
    if (!link) return null;
    if (link.startsWith("http://") || link.startsWith("https://")) {
      return link;
    }
    return `https://${link}`;
  };

  const fetchLiveClasses = async () => {
    try {
      const res = await fetch(
        SummaryApi.studentAllLiveClasses.url,
        {
          method: SummaryApi.studentAllLiveClasses.method,
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

  useEffect(() => {
    if (studentId) fetchLiveClasses();
  }, [studentId]);

  const getStatusBadge = (status) => {
    const styles = {
      live: "bg-green-100 text-green-700 border-green-200",
      scheduled: "bg-blue-100 text-blue-700 border-blue-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
      completed: "bg-gray-100 text-gray-700 border-gray-200"
    };

    const icons = {
      live: <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />,
      scheduled: <Clock className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.completed}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-lg">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              My Live Classes
            </h1>
          </div>
          <p className="text-slate-600 ml-14">Join your scheduled classes and never miss a session</p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Loading your classes...</p>
          </div>
        ) : liveClasses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Classes Available</h3>
            <p className="text-slate-600">There are no live classes scheduled at the moment. Check back later!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {liveClasses.map((cls) => {
              const isLive = cls.status === "live";
              const isUpcoming = cls.status === "scheduled";
              const canJoin =
                (isLive || isUpcoming) &&
                cls.status !== "cancelled" &&
                cls.meetingLink;

              return (
                <div
                  key={cls._id}
                  className={`bg-white rounded-xl shadow-sm border transition-all duration-300 hover:shadow-lg ${
                    isLive 
                      ? 'border-green-200 ring-2 ring-green-100' 
                      : 'border-slate-200 hover:border-blue-200'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left Section */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${
                            isLive 
                              ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                              : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                          } shadow-md`}>
                            <Video className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">{cls.title}</h3>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span>{new Date(cls.startTime).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}</span>
                              </div>
                              
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span>{new Date(cls.startTime).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit'
                                })}</span>
                              </div>
                              
                              <div className="flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                <span className="font-medium">{cls.durationMinutes} minutes</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Section */}
                      <div className="flex items-center gap-3 lg:flex-shrink-0">
                        {getStatusBadge(cls.status)}
                        
                        {canJoin ? (
                          <a
                            href={getValidMeetingLink(cls.meetingLink)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                              isLive
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                            }`}
                          >
                            <Video className="w-4 h-4" />
                            {isLive ? 'Join Now' : 'Join Class'}
                          </a>
                        ) : (
                          <span className="px-6 py-2.5 bg-slate-100 text-slate-400 rounded-lg font-medium cursor-not-allowed">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLiveClass;