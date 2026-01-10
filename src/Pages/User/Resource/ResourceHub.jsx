import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Grid3x3, List, X, Star, Clock } from 'lucide-react';

export default function ResourceHub() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  
  const [showFilters, setShowFilters] = useState(false);
  
  // ⚠️ NOTE: Changed default to 'latest' so you can see new items immediately
  const [activeTab, setActiveTab] = useState('latest');

  // Filter states
  const [filters, setFilters] = useState({
    domain: '',
    difficulty: '',
    type: [],
    mentor: ''
  });

  // Initial Load
  useEffect(() => {
    fetchData(activeTab);
    fetchMentors();
  }, [activeTab]);

  // Apply filters client-side
  useEffect(() => {
    applyFilters();
  }, [resources, filters]);

  const fetchMentors = async () => {
    try {
      const response = await fetch('https://itecony-neriva-backend.onrender.com/api/mentors');
      if (response.ok) {
        const data = await response.json();
        setMentors(data.mentors || []);
      }
    } catch (err) {
      console.error("Failed to load mentors", err);
    }
  };

  const fetchData = async (tab) => {
    setLoading(true);
    setError(null);
    
    console.group(`🔄 [ResourceHub] Fetching Data for Tab: "${tab}"`);
    
    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      let endpoint = '';
      
      // ✅ API ENDPOINT MAPPING
      switch (tab) {
        case 'trending':
          endpoint = 'https://itecony-neriva-backend.onrender.com/api/resources/trending?limit=10';
          break;
        case 'latest':
          // General list is usually where new stuff appears
          endpoint = 'https://itecony-neriva-backend.onrender.com/api/resources';
          break;
        case 'featured':
        default:
          endpoint = 'https://itecony-neriva-backend.onrender.com/api/resources/featured';
          break;
      }

      console.log(`📡 Hitting Endpoint: ${endpoint}`);

      const response = await fetch(endpoint, { headers });
      console.log(`🔌 Status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log("📦 Raw API Response:", data);

        // Check for 'resources' array or just 'data' if structure differs
        const list = data.resources || data.data || [];
        
        console.log(`✅ Items Found: ${list.length}`);
        if (list.length > 0) {
          console.log("🔍 First Item Sample:", list[0]);
        }

        setResources(list);
        // We don't setFilteredResources here directly, the useEffect handles it
      } else {
        const errText = await response.text();
        console.error("❌ API Error Body:", errText);
        throw new Error(`Failed to fetch resources (${response.status})`);
      }
    } catch (err) {
      setError(err.message);
      console.error('❌ Error fetching data:', err);
    } finally {
      console.groupEnd();
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Console log to debug filtering logic
    // console.log("Applying Filters...", { total: resources.length, filters });

    let filtered = resources;

    if (filters.domain) {
      filtered = filtered.filter(r => r.domain === filters.domain);
    }
    
    if (filters.difficulty) {
      // Ensure case-insensitive comparison
      filtered = filtered.filter(r => r.difficulty_level?.toLowerCase() === filters.difficulty.toLowerCase());
    }
    
    if (filters.type.length > 0) {
      filtered = filtered.filter(r => filters.type.includes(r.resource_type));
    }
    
    if (filters.mentor.trim()) {
      filtered = filtered.filter(r => r.mentor_id === filters.mentor);
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'text-green-700 bg-green-50 border-green-200';
      case 'intermediate': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'advanced': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const renderRatingStars = (rating) => (
    <div className="flex items-center gap-1">
      <span className="text-sm font-bold text-gray-900">{rating ? Number(rating).toFixed(1) : '0.0'}</span>
      <Star className="w-4 h-4 text-yellow-400 fill-current" />
    </div>
  );

  const ResourceCard = ({ resource }) => (
    <div
      onClick={() => navigate(`/resource/${resource.id}`)}
      className="group bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer h-full"
    >
      <div className="flex justify-between items-start">
        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-gray-100 text-gray-600 tracking-wide">
          {resource.resource_type || 'Resource'}
        </span>
        {renderRatingStars(resource.rating)}
      </div>

      <h4 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
        {resource.title}
      </h4>

      <p className="text-sm text-gray-500 line-clamp-2 flex-1">
        {resource.description}
      </p>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
              {(resource.mentor?.firstName?.[0] || 'M').toUpperCase()}
           </div>
           <span className="text-xs text-gray-600 truncate max-w-[100px]">
             {resource.mentor ? `${resource.mentor.firstName} ${resource.mentor.lastName}` : 'Mentor'}
           </span>
        </div>

        <div className="flex items-center gap-2">
           <span className={`text-[10px] px-2 py-0.5 rounded border ${getDifficultyColor(resource.difficulty_level)} font-medium uppercase`}>
             {resource.difficulty_level || 'Beginner'}
           </span>
           <span className="text-[10px] text-gray-400 flex items-center gap-1">
             <Clock className="w-3 h-3" /> {formatTime(resource.estimated_time_minutes)}
           </span>
        </div>
      </div>
    </div>
  );

  if (loading && resources.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-wrap justify-between gap-4 items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Resource Hub</h1>
            <p className="text-gray-500 mt-1">Curated learning materials to accelerate your growth.</p>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium transition-all shadow-sm ${
              showFilters 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* SIDEBAR FILTER */}
          {showFilters && (
            <aside className="w-full lg:w-72 flex-shrink-0 animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm sticky top-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600 lg:hidden">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Domain */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Domain</label>
                    <select
                      value={filters.domain}
                      onChange={(e) => handleFilterChange('domain', e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-gray-300 bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">All Domains</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile Development">Mobile Development</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Design">Design</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Difficulty</label>
                    <div className="space-y-2">
                      {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                        <label key={level} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="radio"
                            name="difficulty"
                            value={level.toLowerCase()}
                            checked={filters.difficulty === level.toLowerCase()}
                            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Type</label>
                    <div className="space-y-2">
                      {['article', 'video', 'course', 'tool'].map((type) => (
                        <label key={type} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={filters.type.includes(type)}
                            onChange={() => handleTypeChange(type)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Mentor */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mentor</label>
                    <select
                      value={filters.mentor}
                      onChange={(e) => handleFilterChange('mentor', e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-gray-300 bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">All Mentors</option>
                      {mentors.map(m => (
                        <option key={m.id || m._id} value={m.id || m._id}>
                          {m.firstName} {m.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reset */}
                  <button
                    onClick={resetFilters}
                    className="w-full py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </aside>
          )}

          {/* MAIN GRID */}
          <div className="flex-1 min-w-0 w-full">
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto hide-scrollbar">
              {['latest', 'featured', 'trending'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'latest' ? 'All Resources' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
              <div className="flex-1 flex justify-end items-center gap-2 pb-2 pl-4">
                 <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-200 text-gray-900' : 'text-gray-400'}`}><Grid3x3 className="w-4 h-4"/></button>
                 <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-200 text-gray-900' : 'text-gray-400'}`}><List className="w-4 h-4"/></button>
              </div>
            </div>

            {/* Grid */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredResources.length > 0 ? (
                filteredResources.map((resource) => (
                  <ResourceCard key={resource.id || resource._id} resource={resource} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500">No resources found matching your criteria.</p>
                  <button onClick={resetFilters} className="mt-2 text-blue-600 hover:underline text-sm font-medium">Clear filters</button>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}