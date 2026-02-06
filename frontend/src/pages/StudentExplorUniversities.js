import React, { useState, useMemo, useEffect } from 'react';
import { Search, Globe, Calendar, FileText, MapPin, ExternalLink, Loader2, TrendingUp, Bot, X } from 'lucide-react';
import UniversityChatbot from '../components/UniversityChatbot';

const StudentExploreUniversities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedDeadline, setSelectedDeadline] = useState('all');
  const [sortBy, setSortBy] = useState('ranking-asc');
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);

  // Fetch universities from API
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch from multiple countries to get diverse results
        const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Singapore', 'China', 'Switzerland', 'Japan'];
        const allUniversities = [];

        for (const country of countries) {
          try {
            const response = await fetch(`http://universities.hipolabs.com/search?country=${encodeURIComponent(country)}`);
            if (response.ok) {
              const data = await response.json();
              // Take top universities from each country
              const topUniversities = data.slice(0, 15).map((uni, idx) => ({
                id: `${country}-${idx}`,
                name: uni.name,
                country: uni.country,
                location: `${uni.name.split(' ').slice(-1)[0]}, ${uni.country}`,
                website: uni.web_pages?.[0] || '#',
                domains: uni.domains,
                // Generate realistic application data
                deadline: generateDeadline(country),
                deadlineType: getDeadlineType(country),
                requirements: generateRequirements(country),
                allowedCountries: "All countries",
                description: generateDescription(uni.name, country),
                ranking: Math.floor(Math.random() * 500) + 1 // Simulated ranking
              }));
              allUniversities.push(...topUniversities);
            }
          } catch (err) {
            console.error(`Error fetching universities for ${country}:`, err);
          }
        }

        // Sort by ranking
        allUniversities.sort((a, b) => a.ranking - b.ranking);
        setUniversities(allUniversities.slice(0, 50)); // Top 50 universities
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch universities. Please try again.');
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  // Helper functions
  const generateDeadline = (country) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June'];
    const month = months[Math.floor(Math.random() * months.length)];
    const day = Math.floor(Math.random() * 28) + 1;
    return `${month} ${day}, 2026`;
  };

  const getDeadlineType = (country) => {
    const types = {
      'United States': 'Regular Decision',
      'United Kingdom': 'UCAS Application',
      'Canada': 'International Applicants',
      'Australia': 'International Students',
      'Germany': 'Winter Semester',
      'France': 'Campus France',
      'Singapore': 'International Applicants',
      'China': 'International Students',
      'Switzerland': 'Fall Semester',
      'Japan': 'International Admissions'
    };
    return types[country] || 'International Applicants';
  };

  const generateRequirements = (country) => {
    const commonReqs = [
      "Online application form",
      "High school transcripts and certificates",
      "English proficiency test (TOEFL/IELTS)",
      "Personal statement or motivation letter",
      "Letters of recommendation (2-3)",
      "Passport copy",
      "Application fee"
    ];

    const specificReqs = {
      'United States': ["SAT/ACT scores (test-optional for many)", "Common Application"],
      'United Kingdom': ["UCAS application", "Academic reference"],
      'Germany': ["Proof of German language (TestDaF) or English", "Uni-Assist application"],
      'France': ["Campus France procedure", "French language proficiency (DELF/DALF)"],
      'China': ["Chinese language proficiency (HSK) for some programs"],
    };

    const reqs = [...commonReqs];
    if (specificReqs[country]) {
      reqs.push(...specificReqs[country]);
    }
    return reqs.slice(0, 6);
  };

  const generateDescription = (name, country) => {
    const templates = [
      `Leading institution in ${country} offering comprehensive programs across multiple disciplines.`,
      `Prestigious university known for academic excellence and research innovation.`,
      `World-class education with strong international reputation and diverse student community.`,
      `Top-ranked institution providing cutting-edge programs and global opportunities.`,
      `Renowned university with excellent faculty and state-of-the-art facilities.`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  };

  const countries = ['all', ...new Set(universities.map(u => u.country))];

  const filteredUniversities = useMemo(() => {
    if (loading || universities.length === 0) return [];
    
    let filtered = universities.filter(uni => {
      const matchesSearch = uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           uni.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           uni.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry = selectedCountry === 'all' || uni.country === selectedCountry;
      const matchesDeadline = selectedDeadline === 'all' || 
                             (selectedDeadline === 'before-march' && new Date(uni.deadline) < new Date('2026-03-01')) ||
                             (selectedDeadline === 'after-march' && new Date(uni.deadline) >= new Date('2026-03-01'));
      
      return matchesSearch && matchesCountry && matchesDeadline;
    });

    // Apply sorting
    if (sortBy === 'ranking-asc') {
      filtered.sort((a, b) => a.ranking - b.ranking);
    } else if (sortBy === 'ranking-desc') {
      filtered.sort((a, b) => b.ranking - a.ranking);
    } else if (sortBy === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    }

    return filtered;
  }, [searchTerm, selectedCountry, selectedDeadline, sortBy, universities, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading universities from around the world...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 relative transition-colors duration-300">
      {/* AI Chatbot Button - Floating */}
      {!showChatbot && (
        <button
          onClick={() => setShowChatbot(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-3xl flex items-center justify-center transition-all transform hover:scale-110 z-40 group"
          title="AI University Counselor"
        >
          <Bot className="w-7 h-7" />
          <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
        </button>
      )}

      {/* AI Chatbot Panel */}
      {showChatbot && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] glass-strong rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 z-[10000] flex flex-col overflow-hidden">
          <div className="relative h-full">
            <button
              onClick={() => setShowChatbot(false)}
              className="absolute top-2 right-2 z-10 p-1.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <UniversityChatbot />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl font-bold gradient-text dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400">
              Explore Top Universities
            </h1>
            <button
              onClick={() => setShowChatbot(!showChatbot)}
              className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
              title="AI University Counselor"
            >
              <Bot className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Find your dream university from around the world with AI-powered suggestions</p>
        </div>

        {/* Search and Filters */}
        <div className="glass-strong rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search universities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Country Filter */}
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                {countries.map(country => (
                  <option key={country} value={country}>
                    {country === 'all' ? 'All Countries' : country}
                  </option>
                ))}
              </select>
            </div>

            {/* Deadline Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedDeadline}
                onChange={(e) => setSelectedDeadline(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Deadlines</option>
                <option value="before-march">Before March 2026</option>
                <option value="after-march">After March 2026</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                <option value="ranking-asc">Ranking: Best First</option>
                <option value="ranking-desc">Ranking: Lowest First</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredUniversities.length} of {universities.length} universities
          </div>
        </div>

        {/* Universities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredUniversities.map(uni => (
            <div key={uni.id} className="glass-strong rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-slate-700">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{uni.name}</h2>
                    <div className="flex items-center text-blue-100 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{uni.location}</span>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center">
                    <TrendingUp className="w-4 h-4 text-white mr-1" />
                    <span className="text-white font-bold">#{uni.ranking}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-slate-800">
                <p className="text-gray-700 dark:text-gray-300 mb-4">{uni.description}</p>

                {/* Website Link */}
                <a
                  href={uni.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium mb-4"
                >
                  <Globe className="w-4 h-4 mr-1" />
                  Visit Official Website
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>

                {/* Deadline */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-3 mb-4">
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-800 dark:text-yellow-300">Application Deadline</p>
                      <p className="text-yellow-700 dark:text-yellow-400">{uni.deadline} ({uni.deadlineType})</p>
                    </div>
                  </div>
                </div>

                {/* Allowed Countries */}
                <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-600 p-3 mb-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-300">Eligible Countries</p>
                      <p className="text-green-700 dark:text-green-400">{uni.allowedCountries}</p>
                    </div>
                  </div>
                </div>

                {/* Application Requirements */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-600 p-3">
                  <div className="flex items-start">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Application Requirements</p>
                      <ul className="space-y-1">
                        {uni.requirements.map((req, idx) => (
                          <li key={idx} className="text-blue-700 dark:text-blue-400 text-sm flex items-start">
                            <span className="mr-2">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredUniversities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No universities found matching your criteria.</p>
            <div className="mt-4 space-x-3">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCountry('all');
                  setSelectedDeadline('all');
                  setSortBy('ranking-asc');
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setShowChatbot(true)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors flex items-center gap-2 mx-auto mt-2"
              >
                <Bot className="w-4 h-4" />
                Get AI Suggestions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExploreUniversities;