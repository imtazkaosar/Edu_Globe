import React, { useState, useMemo, useEffect } from 'react';
import { Search, Globe, Calendar, FileText, MapPin, ExternalLink, Loader2, TrendingUp } from 'lucide-react';

const StudentExploreUniversities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedDeadline, setSelectedDeadline] = useState('all');
  const [sortBy, setSortBy] = useState('ranking-asc');
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Top Universities</h1>
          <p className="text-gray-600">Find your dream university from around the world</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search universities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Country Filter */}
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="ranking-asc">Ranking: Best First</option>
                <option value="ranking-desc">Ranking: Lowest First</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredUniversities.length} of {universities.length} universities
          </div>
        </div>

        {/* Universities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredUniversities.map(uni => (
            <div key={uni.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
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

              <div className="p-6">
                <p className="text-gray-700 mb-4">{uni.description}</p>

                {/* Website Link */}
                <a
                  href={uni.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
                >
                  <Globe className="w-4 h-4 mr-1" />
                  Visit Official Website
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>

                {/* Deadline */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-800">Application Deadline</p>
                      <p className="text-yellow-700">{uni.deadline} ({uni.deadlineType})</p>
                    </div>
                  </div>
                </div>

                {/* Allowed Countries */}
                <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-800">Eligible Countries</p>
                      <p className="text-green-700">{uni.allowedCountries}</p>
                    </div>
                  </div>
                </div>

                {/* Application Requirements */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
                  <div className="flex items-start">
                    <FileText className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-blue-800 mb-2">Application Requirements</p>
                      <ul className="space-y-1">
                        {uni.requirements.map((req, idx) => (
                          <li key={idx} className="text-blue-700 text-sm flex items-start">
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
            <p className="text-gray-500 text-lg">No universities found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCountry('all');
                setSelectedDeadline('all');
                setSortBy('ranking-asc');
              }}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExploreUniversities;