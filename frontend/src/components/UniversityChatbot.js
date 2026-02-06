import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Send, Bot, User, Loader2, MessageSquare, BookOpen, MapPin, DollarSign, Award, ExternalLink, X } from 'lucide-react';
import { toast } from 'react-toastify';
import SummaryApi from '../common';
import StudentProfileForm from './StudentProfileForm';

const UniversityChatbot = () => {
  const user = useSelector((state) => state?.user?.user);
  const studentId = user?._id || user?.id;

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (studentId) {
      fetchProfile();
      // Initialize with welcome message
      setMessages([
        {
          type: 'bot',
          content: "Hello! I'm your AI university counselor. I can help you find the perfect universities based on your academic profile, test scores, budget, and preferences.",
        },
        {
          type: 'bot',
          content: "To get started, please complete your profile with your academic information, test scores, and preferences. You can also ask me questions about universities!",
        },
      ]);
    }
  }, [studentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, suggestions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchProfile = async () => {
    if (!studentId) return;
    try {
      const res = await fetch(SummaryApi.getStudentProfile(studentId).url, {
        method: SummaryApi.getStudentProfile(studentId).method,
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data && Object.keys(data).length > 1) {
        setProfileData(data);
        // Only add message on initial load
        if (messages.length <= 2) {
          setMessages((prev) => [
            ...prev,
            {
              type: 'bot',
              content: "Great! I can see your profile is already set up. You can ask me for university suggestions or click 'Edit Profile' to update your information anytime.",
            },
          ]);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      type: 'user',
      content: inputMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch(SummaryApi.getUniversitySuggestions.url, {
        method: SummaryApi.getUniversitySuggestions.method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          studentId,
          message: inputMessage,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuggestions(data.suggestions);
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            content: data.suggestions.summary || "Based on your profile, here are some university suggestions:",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            content: data.message || "I couldn't process your request. Please make sure your profile is complete.",
          },
        ]);
        if (data.message?.includes('profile')) {
          setShowProfileForm(true);
        }
      }
    } catch (err) {
      console.error('Error getting suggestions:', err);
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          content: "Sorry, I encountered an error. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = (profile) => {
    setProfileData(profile);
    setShowProfileForm(false);
    setMessages((prev) => [
      ...prev,
      {
        type: 'bot',
        content: "Excellent! Your profile has been saved and updated. Now I can provide personalized university suggestions based on your latest information. Try asking me: 'What universities match my profile?' or 'Suggest universities for me'",
      },
    ]);
    // Refresh profile data
    fetchProfile();
  };

  const quickActions = [
    { text: "What universities match my profile?", action: () => setInputMessage("What universities match my profile?") },
    { text: "Suggest universities for me", action: () => setInputMessage("Suggest universities for me") },
    { text: "Edit my profile", action: () => setShowProfileForm(true) },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="glass-strong border-b border-gray-200 dark:border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">AI University Counselor</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Get personalized university suggestions</p>
          </div>
        </div>
        <button
          onClick={() => setShowProfileForm(true)}
          className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          title="Edit Profile"
        >
          Edit Profile
        </button>
      </div>

      {/* Profile Form Modal */}
      {showProfileForm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-[9999] flex items-center justify-center p-4">
          <div className="glass-strong rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profileData && Object.keys(profileData).length > 1 ? 'Edit Your Profile' : 'Complete Your Profile'}
              </h2>
              <button
                onClick={() => setShowProfileForm(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <StudentProfileForm onSave={handleProfileSave} initialData={profileData} />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.type === 'bot' && (
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                  : 'glass border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white'
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
            {message.type === 'user' && (
              <div className="w-8 h-8 bg-gray-300 dark:bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="glass border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          </div>
        )}

        {/* University Suggestions */}
        {suggestions && suggestions.universities && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <Award className="w-5 h-5 text-yellow-500" />
              University Suggestions
            </div>
            {suggestions.universities.map((uni, index) => (
              <div
                key={index}
                className="glass-strong rounded-xl p-6 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{uni.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {uni.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        Rank: {uni.rank}
                      </span>
                      {uni.matchScore && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                          {uni.matchScore}% Match
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {uni.whyMatch && (
                  <p className="text-gray-700 dark:text-gray-300 mb-3">{uni.whyMatch}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {uni.tuitionFee && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700 dark:text-gray-300">
                        <strong>Tuition:</strong> {uni.tuitionFee}
                      </span>
                    </div>
                  )}
                  {uni.scholarshipAvailable && (
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-yellow-600" />
                      <span className="text-green-700 dark:text-green-400 font-semibold">Scholarships Available</span>
                    </div>
                  )}
                  {uni.applicationDeadline && (
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700 dark:text-gray-300">
                        <strong>Deadline:</strong> {uni.applicationDeadline}
                      </span>
                    </div>
                  )}
                </div>

                {uni.requirements && uni.requirements.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Requirements:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {uni.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {uni.website && (
                  <a
                    href={uni.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
                  >
                    Visit Website
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                {action.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="glass-strong border-t border-gray-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me about universities or request suggestions..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !inputMessage.trim()}
            className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UniversityChatbot;
