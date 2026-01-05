import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Play, Clock, Calendar, BookOpen, Video, ChevronDown, ChevronUp, AlertCircle, ExternalLink } from "lucide-react";
import SummaryApi from "../common";

const StudentSeeRecordedClasses = () => {
  const user = useSelector((state) => state?.user?.user);
  const studentId = user?._id || user?.id;

  const [courses, setCourses] = useState([]);
  const [recordedClasses, setRecordedClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedRecording, setExpandedRecording] = useState(null);
  const [videoErrors, setVideoErrors] = useState({});

  useEffect(() => {
    if (!studentId) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const courseRes = await fetch(
          SummaryApi.getStudentCourses(studentId).url,
          {
            method: SummaryApi.getStudentCourses(studentId).method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const courseData = await courseRes.json();
        if (!courseRes.ok) throw new Error(courseData.message || "Failed to fetch courses");

        setCourses(courseData);

        const recRes = await fetch(SummaryApi.getRecordedClasses.url, {
          method: SummaryApi.getRecordedClasses.method,
          credentials: "include",
        });
        const recData = await recRes.json();
        if (!recRes.ok) throw new Error(recData.message || "Failed to fetch recordings");

        setRecordedClasses(recData.data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const getVideoEmbedUrl = (url) => {
    if (!url) return null;

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('watch?v=')) {
        videoId = url.split('watch?v=')[1].split('&')[0];
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1].split('?')[0];
      }
      return { type: 'youtube', url: `https://www.youtube.com/embed/${videoId}` };
    }

    if (url.includes('drive.google.com')) {
      let fileId = '';
      if (url.includes('/file/d/')) {
        fileId = url.split('/file/d/')[1].split('/')[0];
      } else if (url.includes('id=')) {
        fileId = url.split('id=')[1].split('&')[0];
      }
      return { type: 'googledrive', url: `https://drive.google.com/file/d/${fileId}/preview` };
    }

    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1].split('?')[0];
      return { type: 'vimeo', url: `https://player.vimeo.com/video/${videoId}` };
    }

    return { type: 'direct', url: url };
  };

  const toggleRecording = (recordingId) => {
    if (expandedRecording === recordingId) {
      setExpandedRecording(null);
    } else {
      setExpandedRecording(recordingId);
      setVideoErrors(prev => ({ ...prev, [recordingId]: false }));
    }
  };

  const handleVideoError = (recordingId) => {
    setVideoErrors(prev => ({ ...prev, [recordingId]: true }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your classes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border border-red-100">
          <div className="text-red-500 text-5xl mb-4 text-center">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Oops! Something went wrong</h2>
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-indigo-600 rounded-xl shadow-lg">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">Recorded Classes</h1>
          </div>
          <p className="text-gray-600 ml-16">Access your course recordings anytime, anywhere</p>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Courses Yet</h2>
            <p className="text-gray-600">You are not enrolled in any courses. Start exploring to begin your learning journey!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {courses.map((course) => {
              const courseRecordings = recordedClasses.filter(
                (rec) => String(rec.courseId) === String(course._id)
              );

              return (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                          {course.Course_Name}
                        </h2>
                        <div className="flex items-center gap-4 text-indigo-100">
                          <span className="flex items-center gap-1.5 text-sm font-medium">
                            <BookOpen className="w-4 h-4" />
                            {course.Course_Initial}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm font-medium">
                            <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></span>
                            {course.Credit} Credit
                          </span>
                        </div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                        <p className="text-white text-sm font-semibold">
                          {courseRecordings.length} Recording{courseRecordings.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {courseRecordings.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Video className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No recorded classes available yet</p>
                        <p className="text-gray-400 text-sm mt-1">Check back later for new recordings</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {courseRecordings.map((rec) => {
                          const isExpanded = expandedRecording === rec._id;
                          const videoSource = getVideoEmbedUrl(rec.videoUrl);
                          const hasError = videoErrors[rec._id];

                          return (
                            <div
                              key={rec._id}
                              className="border border-gray-200 rounded-xl overflow-hidden hover:border-indigo-300 transition-colors"
                            >
                              <button
                                onClick={() => toggleRecording(rec._id)}
                                className="w-full bg-gradient-to-br from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-purple-50 p-5 transition-all duration-300 text-left"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-4 flex-1">
                                    <div className={`p-2.5 rounded-lg shadow-sm transition-colors duration-300 ${
                                      isExpanded ? 'bg-indigo-600' : 'bg-white'
                                    }`}>
                                      <Play className={`w-5 h-5 transition-colors duration-300 ${
                                        isExpanded ? 'text-white' : 'text-indigo-600'
                                      }`} />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <h3 className={`font-bold text-gray-800 mb-2 transition-colors ${
                                        isExpanded ? 'text-indigo-600' : ''
                                      }`}>
                                        {rec.title}
                                      </h3>
                                      
                                      {rec.description && (
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                          {rec.description}
                                        </p>
                                      )}
                                      
                                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                          <Clock className="w-3.5 h-3.5" />
                                          <span>{rec.duration} minutes</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <Calendar className="w-3.5 h-3.5" />
                                          <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className={`p-2 rounded-lg transition-colors ${
                                    isExpanded ? 'bg-indigo-100' : 'bg-gray-200'
                                  }`}>
                                    {isExpanded ? (
                                      <ChevronUp className="w-5 h-5 text-indigo-600" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-gray-600" />
                                    )}
                                  </div>
                                </div>
                              </button>

                              {isExpanded && (
                                <div className="border-t border-gray-200 bg-black">
                                  <div className="aspect-video w-full">
                                    {hasError ? (
                                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-gray-900">
                                        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                                        <h3 className="text-white text-xl font-bold mb-2">Unable to load video</h3>
                                        <p className="text-gray-400 mb-4">The video file could not be loaded. Please check the URL or try again later.</p>
                                        <a
                                          href={rec.videoUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                          Open in New Tab
                                          <ExternalLink className="w-4 h-4" />
                                        </a>
                                      </div>
                                    ) : videoSource?.type === 'direct' ? (
                                      <video
                                        src={videoSource.url}
                                        controls
                                        className="w-full h-full"
                                        onError={() => handleVideoError(rec._id)}
                                        controlsList="nodownload"
                                      >
                                        Your browser does not support the video tag.
                                      </video>
                                    ) : (
                                      <iframe
                                        src={videoSource?.url}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title={rec.title}
                                        onError={() => handleVideoError(rec._id)}
                                      ></iframe>
                                    )}
                                  </div>
                                  
                                  <div className="bg-gray-900 p-4">
                                    <a
                                      href={rec.videoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
                                    >
                                      Open Original Link
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
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

export default StudentSeeRecordedClasses;