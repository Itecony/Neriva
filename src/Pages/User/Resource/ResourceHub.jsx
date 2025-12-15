import { useState, useEffect } from 'react';
import { Filter, Grid3x3, List, X } from 'lucide-react';

export default function ResourceHub() {
  const [resources, setResources] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  
  // Default to false so filters are hidden initially
  const [showFilters, setShowFilters] = useState(false);
  
  const [activeTab, setActiveTab] = useState('featured');
  const [trendingResources, setTrendingResources] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    domain: '',
    difficulty: '',
    type: [],
    mentor: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [resources, filters]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error("No 'authToken' found in localStorage. Please log in again.");
      }

      // Fetch featured resources
      const featuredRes = await fetch(
        'https://itecony-neriva-backend.onrender.com/api/resources/featured',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      let featuredData = [];
      if (featuredRes.ok) {
        const data = await featuredRes.json();
        featuredData = Array.isArray(data) ? data : data.resources || [];
      }

      // Fetch trending resources
      const trendingRes = await fetch(
        'https://itecony-neriva-backend.onrender.com/api/resources/trending',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (trendingRes.ok) {
        const data = await trendingRes.json();
        const trendingData = Array.isArray(data) ? data : data.resources || [];
        setTrendingResources(trendingData);
      }

      // Fetch mentors
      const mentorRes = await fetch(
        'https://itecony-neriva-backend.onrender.com/api/mentors',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (mentorRes.ok) {
        const mentorData = await mentorRes.json();
        const allMentors = Array.isArray(mentorData) ? mentorData : mentorData.mentors || [];
        setMentors(allMentors);
      }

      setResources(featuredData);
      setFilteredResources(featuredData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = resources;

    if (filters.domain) filtered = filtered.filter(r => r.domain === filters.domain);
    if (filters.difficulty) filtered = filtered.filter(r => r.difficultyLevel === filters.difficulty);
    if (filters.type.length > 0) filtered = filtered.filter(r => filters.type.includes(r.resourceType));
    if (filters.mentor.trim()) {
      const mentorQuery = filters.mentor.toLowerCase();
      filtered = filtered.filter(r => {
        const mentorFullName = `${r.mentor?.firstName || ''} ${r.mentor?.lastName || ''}`.toLowerCase();
        const mentorId = r.mentor?._id || r.mentor?.id;
        return mentorFullName.includes(mentorQuery) || mentorId === filters.mentor;
      });
    }

    setFilteredResources(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleTypeChange = (type) => {
    setFilters(prev => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter(t => t !== type)
        : [...prev.type, type]
    }));
  };

  const resetFilters = () => {
    setFilters({ domain: '', difficulty: '', type: [], mentor: '' });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const token = localStorage.getItem('authToken');
    if (!token) return;

    let url = 'https://itecony-neriva-backend.onrender.com/api/resources/featured';
    if (tab === 'trending') url = 'https://itecony-neriva-backend.onrender.com/api/resources/trending';
    
    // Simple fetch logic for tab switching
    if (tab === 'trending' || tab === 'featured') {
      fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
            const list = Array.isArray(data) ? data : data.resources || [];
            setResources(list);
            setFilteredResources(list);
        })
        .catch(err => console.error(`Error fetching ${tab}:`, err));
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-900/50';
      case 'intermediate': return 'text-orange-800 bg-orange-100 dark:text-orange-200 dark:bg-orange-900/50';
      case 'advanced': return 'text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-900/50';
      default: return 'text-blue-800 bg-blue-100 dark:text-blue-200 dark:bg-blue-900/50';
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const renderRatingStars = (rating) => (
    <div className="flex items-center gap-1">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{rating?.toFixed(1) || 5.0}</span>
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-amber-400">
            {i < Math.floor(rating || 5) ? '★' : '☆'}
          </span>
        ))}
      </div>
    </div>
  );

  const ResourceCard = ({ resource }) => (
    <div
      onClick={() => window.location.href = `/resource/${resource._id || resource.id}`}
      className="bg-white rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-4 hover:shadow-lg hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
    >
      <h4 className="text-lg font-bold text-gray-900 dark:text-white">{resource.title}</h4>
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (resource.mentor?._id || resource.mentor?.id) {
              window.location.href = `/mentor/${resource.mentor._id || resource.mentor.id}`;
            }
          }}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          {resource.mentor?.firstName ? `${resource.mentor.firstName} ${resource.mentor.lastName || ''}` : 'Anonymous'}
        </button>
        {resource.mentor?.isVerified && <span className="text-blue-600 dark:text-blue-400 text-sm">✓</span>}
      </div>
      {renderRatingStars(resource.rating)}
      <div className="flex items-center gap-2 text-xs font-medium mt-auto pt-2">
        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
          {formatTime(resource.estimatedTimeMins || 120)}
        </span>
        <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full ${getDifficultyColor(resource.difficultyLevel)}`}>
          {resource.difficultyLevel || 'Beginner'}
        </span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header with Title and Filter Toggle */}
        <div className="flex flex-wrap justify-between gap-4 items-center mb-6">
          <div>
            <h1 className="text-gray-900 text-4xl font-black leading-tight tracking-tight">
              Resource Hub
            </h1>
            <p className="text-gray-600 text-base font-normal leading-normal mt-2">
              Browse resources to enhance your skills.
            </p>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors shadow-sm ${
              showFilters 
                ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span className="text-sm font-medium">
              {showFilters ? 'Hide Filters' : 'Filter Resources'}
            </span>
          </button>
        </div>

        {/* Main Content Layout Container */}
        <div className="flex gap-6 items-start relative">
          
          {/* SIDEBAR - Conditionally Rendered */}
          {showFilters && (
            <aside className="w-72 flex-shrink-0 z-20 sticky top-4">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
                
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-gray-900 text-lg font-bold">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Domain Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                    <select
                      value={filters.domain}
                      onChange={(e) => handleFilterChange('domain', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">All Domains</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Machine Learning">Machine Learning</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Mobile Development">Mobile Development</option>
                      <option value="DevOps">DevOps</option>
                    </select>
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                    <div className="space-y-2">
                      {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                        <div key={level} className="flex items-center">
                          <input
                            type="radio"
                            id={level.toLowerCase()}
                            name="difficulty"
                            value={level}
                            checked={filters.difficulty === level}
                            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <label htmlFor={level.toLowerCase()} className="ml-3 text-sm text-gray-700 cursor-pointer">{level}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <div className="space-y-2">
                      {['article', 'video', 'pdf', 'repository'].map((type) => (
                        <div key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            id={type}
                            checked={filters.type.includes(type)}
                            onChange={() => handleTypeChange(type)}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                          />
                          <label htmlFor={type} className="ml-3 text-sm text-gray-700 cursor-pointer capitalize">
                            {type === 'repository' ? 'Code Repos' : type.charAt(0).toUpperCase() + type.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mentor Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mentor</label>
                    <input
                      type="text"
                      value={filters.mentor}
                      onChange={(e) => handleFilterChange('mentor', e.target.value)}
                      placeholder="Search mentor..."
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    {filters.mentor && mentors.length > 0 && (
                      <div className="mt-2 bg-white border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                        {mentors
                          .filter(mentor =>
                            `${mentor.firstName} ${mentor.lastName}`.toLowerCase().includes(filters.mentor.toLowerCase())
                          )
                          .map((mentor) => (
                            <div
                              key={mentor._id || mentor.id}
                              className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => handleFilterChange('mentor', mentor._id || mentor.id)}
                            >
                              <p className="text-sm font-medium text-gray-900">
                                {mentor.firstName} {mentor.lastName}
                              </p>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={applyFilters}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                      Apply
                    </button>
                    <button
                      onClick={resetFilters}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* RIGHT SIDE: Resource Grid */}
          <div className="flex-1 w-full min-w-0">
            {/* Tabs and View Toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="w-full sm:w-auto border-b border-gray-200">
                <nav className="flex space-x-6">
                  {['featured', 'trending', 'latest'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleTabChange(tab)}
                      className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab
                          ? 'text-blue-600 border-blue-600'
                          : 'text-gray-500 border-transparent hover:text-gray-700'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'text-gray-900 bg-gray-100' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'text-gray-900 bg-gray-100' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Resources Grid */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {activeTab === 'featured' && 'Featured Resources'}
                {activeTab === 'trending' && 'Trending Resources'}
                {activeTab === 'latest' && 'Latest Resources'}
              </h2>
              
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }>
                {filteredResources.length > 0 ? (
                  filteredResources.map((resource) => (
                    <ResourceCard key={resource._id || resource.id} resource={resource} />
                  ))
                ) : (
                  <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <Filter className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No resources found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting your filters or search criteria.</p>
                    <button 
                      onClick={resetFilters}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <div className="text-red-500">⚠️</div>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}