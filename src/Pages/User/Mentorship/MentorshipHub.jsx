import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Users, FileText, Plus, ExternalLink, CheckCircle, 
  Bookmark, Globe, Award, ShieldCheck, X, Clock, User, AlertTriangle, ArrowRight,
  Layout, BookOpen, Star, Activity
} from 'lucide-react';

// ✅ IMPORT RESOURCE DETAIL COMPONENT
import ResourceDetail from '../Resource/ResourceDetail.jsx';

// -----------------------------------------------------------------------------
// 🛠️ UTILITY: Input Sanitizer
// -----------------------------------------------------------------------------
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>?/gm, '').trim();
};

// -----------------------------------------------------------------------------
// ✅ 1. CREATE RESOURCE MODAL
// -----------------------------------------------------------------------------
function CreateResourceModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '', 
    url: '', 
    resource_type: 'article', 
    domain: 'Web Development',
    description: '', 
    difficulty_level: 'beginner', 
    estimated_time_minutes: 60,
    prerequisites: '', 
    learning_outcomes: '', 
    tags: [] 
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddTag = (e) => {
    e.preventDefault();
    const cleanedTag = sanitizeInput(tagInput);
    if (cleanedTag && !formData.tags.includes(cleanedTag)) {
      if (formData.tags.length >= 10) return setError("Max 10 tags allowed");
      setFormData(prev => ({ ...prev, tags: [...prev.tags, cleanedTag] }));
      setTagInput(''); setError('');
    }
  };
  
  const handleRemoveTag = (t) => setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== t) }));
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // 1. Sanitize Basic Fields
    const cleanTitle = sanitizeInput(formData.title);
    const cleanDesc = sanitizeInput(formData.description);
    const cleanUrl = formData.url.trim();

    // 2. Client-side Validation
    if (formData.tags.length < 3) return setError("Please add at least 3 tags.");
    if (cleanDesc.length < 100) return setError(`Description too short (${cleanDesc.length}/100).`);

    setLoading(true);

    try {
      const payload = {
        title: cleanTitle,
        url: cleanUrl,
        description: cleanDesc,
        resource_type: formData.resource_type,
        domain: formData.domain,
        difficulty_level: formData.difficulty_level,
        estimated_time_minutes: parseInt(formData.estimated_time_minutes, 10) || 60,
        tags: formData.tags, 
        learning_outcomes: sanitizeInput(formData.learning_outcomes) || "General Knowledge",
        prerequisites: sanitizeInput(formData.prerequisites) || "None",
        file_path: null,
        file_size: 0
      };

      await onSave(payload);
      setLoading(false);
    } catch (err) {
      console.error("❌ Form Submission Logic Error:", err);
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Share New Resource</h3>
          <button onClick={onClose}><X className="w-6 h-6 text-gray-500" /></button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="resourceForm" onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                <AlertTriangle className="w-4 h-4"/> {error}
              </div>
            )}
            {/* Form Fields (Simplified for brevity, same as previous) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input required minLength={5} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">URL *</label><input required type="url" className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select className="w-full p-2 border rounded-lg bg-white" value={formData.resource_type} onChange={e => setFormData({...formData, resource_type: e.target.value})}>{['article', 'video', 'pdf', 'code_repo', 'documentation', 'tool'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Domain</label><select className="w-full p-2 border rounded-lg bg-white" value={formData.domain} onChange={e => setFormData({...formData, domain: e.target.value})}>{['Web Development', 'Mobile Development', 'Data Science', 'Design', 'Cybersecurity', 'DevOps'].map(d => <option key={d} value={d}>{d}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label><select className="w-full p-2 border rounded-lg bg-white" value={formData.difficulty_level} onChange={e => setFormData({...formData, difficulty_level: e.target.value})}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time (Minutes)</label><input type="number" min="1" className="w-full p-2 border rounded-lg" value={formData.estimated_time_minutes} onChange={e => setFormData({...formData, estimated_time_minutes: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Description (Min 100 chars) *</label><textarea rows="4" required minLength={100} className="w-full p-2 border rounded-lg outline-none focus:border-blue-500" placeholder="Describe what this resource covers..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /><p className={`text-xs text-right ${formData.description.length < 100 ? 'text-red-500' : 'text-gray-400'}`}>{formData.description.length}/100</p></div>
            <div className="grid grid-cols-1 gap-4">
               <div><label className="block text-sm font-medium text-gray-700 mb-1">Learning Outcomes (One per line)</label><textarea rows="3" className="w-full p-2 border rounded-lg outline-none focus:border-blue-500" placeholder="1. Understand React Hooks..." value={formData.learning_outcomes} onChange={e => setFormData({...formData, learning_outcomes: e.target.value})} /></div>
               <div><label className="block text-sm font-medium text-gray-700 mb-1">Prerequisites (Comma separated)</label><input type="text" className="w-full p-2 border rounded-lg" placeholder="Basic JS, HTML, CSS" value={formData.prerequisites} onChange={e => setFormData({...formData, prerequisites: e.target.value})} /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Min 3) *</label>
              <div className="flex gap-2 mb-2"><input className="flex-1 p-2 border rounded-lg" placeholder="Type tag and press Enter" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag(e))} /><button type="button" onClick={handleAddTag} className="px-4 py-2 bg-gray-100 rounded-lg font-medium">Add</button></div>
              <div className="flex flex-wrap gap-2">{formData.tags.map((t, i) => (<span key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-sm flex items-center gap-1">#{t} <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-blue-900 font-bold">×</button></span>))}</div>
            </div>
          </form>
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
          <button type="submit" form="resourceForm" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : 'Publish Resource'}
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// ✅ UPDATED MAIN COMPONENT
// -----------------------------------------------------------------------------
export default function MentorshipHub() {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState(null);

  // General State
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [isVerifiedAdminOrMentor, setIsVerifiedAdminOrMentor] = useState(false);

  // Mentor Data
  const [mentorResources, setMentorResources] = useState([]);
  const [mentorStats, setMentorStats] = useState({});

  // Learner Data
  const [learnerStats, setLearnerStats] = useState({});
  const [recommended, setRecommended] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [completed, setCompleted] = useState([]);
  
  // Tabs for Learner View
  const [activeTab, setActiveTab] = useState('recommended');

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    setLoading(true);
    console.group("🔄 [DEBUG] Initializing Dashboard");
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error("No token found");
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Fetch Profile
      const profileRes = await fetch('https://itecony-neriva-backend.onrender.com/api/profile', { headers });
      const profileData = await profileRes.json();
      const user = profileData.data || profileData.user || profileData;
      setUserProfile(user);
      
      const currentUserId = user.id || user._id;

      // 2. Check Role
      let isVerified = false;
      if (user.role === 'admin') {
        isVerified = true;
      } else {
        try {
          const mentorRes = await fetch(`https://itecony-neriva-backend.onrender.com/api/mentors/${currentUserId}`, { headers });
          if (mentorRes.ok) isVerified = true;
        } catch (e) { console.warn("User is not a mentor"); }
      }
      setIsVerifiedAdminOrMentor(isVerified);

      if (isVerified) {
        // --- MENTOR FLOW ---
        // A. Fetch Mentor Resources
        const resourcesRes = await fetch(`https://itecony-neriva-backend.onrender.com/api/mentors/${currentUserId}/resources`, { headers });
        const rData = await resourcesRes.json();
        if (resourcesRes.ok) setMentorResources(rData.resources || rData.data || []);

        // B. Fetch Mentor Analytics
        const analyticsRes = await fetch('https://itecony-neriva-backend.onrender.com/api/mentors/analytics', { headers });
        const aData = await analyticsRes.json();
        
        if (analyticsRes.ok && aData.data?.overview) {
          const statsObj = aData.data.overview;
          setMentorStats({
            totalResources: statsObj.total_resources || 0,
            totalViews: statsObj.total_views || 0,
            totalBookmarks: statsObj.total_bookmarks || 0,
            totalCompletions: statsObj.total_completions || 0
          });
        }
      } else {
        // --- LEARNER FLOW (New) ---
        // A. Fetch Learning Dashboard Stats & Recommendations
        const dashboardRes = await fetch('https://itecony-neriva-backend.onrender.com/api/users/learning-dashboard', { headers });
        const dashData = await dashboardRes.json();
        
        if (dashboardRes.ok && dashData.dashboard) {
          setLearnerStats(dashData.dashboard.learning_stats || {});
          setRecommended(dashData.dashboard.recommended_resources || []);
        }

        // B. Fetch Bookmarks
        const bookmarksRes = await fetch('https://itecony-neriva-backend.onrender.com/api/users/bookmarks', { headers });
        const bData = await bookmarksRes.json();
        if (bookmarksRes.ok) {
          // Normalize: bookmarks endpoint returns { resource: {...} }, we extract it
          setBookmarks(bData.bookmarks?.map(b => ({ ...b.resource, bookmark_id: b.id })) || []);
        }

        // C. Fetch Completed
        const completedRes = await fetch('https://itecony-neriva-backend.onrender.com/api/users/completed', { headers });
        const cData = await completedRes.json();
        if (completedRes.ok) {
          setCompleted(cData.completed_resources?.map(c => ({ ...c.resource, completed_at: c.completed_at })) || []);
        }
      }

    } catch (error) {
      console.error("❌ Init Error:", error);
    } finally {
      console.groupEnd();
      setLoading(false);
    }
  };

  const handleCreateResource = async (payload) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://itecony-neriva-backend.onrender.com/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Failed to create resource');
      
      setShowCreateModal(false);
      alert("✅ Resource published successfully!");
      await initializeDashboard(); 
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  // Helper to determine which list to show in Learner View
  const getDisplayResources = () => {
    switch (activeTab) {
      case 'bookmarks': return bookmarks;
      case 'completed': return completed;
      case 'recommended':
      default: return recommended;
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div></div>;

  return (
    <div className="min-h-screen p-4 lg:p-8 font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex flex-wrap gap-3">
          {isVerifiedAdminOrMentor ? (
            <>
              {/* ADMIN ACTIONS */}
              {userProfile?.role === 'admin' && (
                <button 
                  onClick={() => navigate('/admin/mentor-applications')} 
                  className="bg-purple-100 text-purple-700 px-5 py-2.5 rounded-lg hover:bg-purple-200 font-medium shadow-sm flex items-center gap-2"
                >
                  <FileSearch className="w-4 h-4" /> Review Applications
                </button>
              )}
              
              {/* MENTOR ACTIONS */}
              <button 
                onClick={() => navigate('/mentor/profile')} 
                className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2 shadow-sm"
              >
                <User className="w-4 h-4" /> My Mentor Profile
              </button>
              <button 
                onClick={() => setShowCreateModal(true)} 
                className="bg-blue-900 text-white px-5 py-2.5 rounded-lg hover:bg-blue-800 font-medium shadow-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Share New Link
              </button>
            </>
          ) : (
            // ✅ USER ACTIONS (APPLICANT vs NEW)
            <>
              {appStatus === 'pending' ? (
                // 1. Pending Application -> Review/Edit Status
                <button 
                  onClick={() => navigate('/admin/mentor-applications')} // Reuse the review component which handles user view too
                  className="bg-yellow-100 text-yellow-700 border border-yellow-200 px-5 py-2.5 rounded-lg hover:bg-yellow-200 font-medium shadow-sm flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" /> Application Pending
                </button>
              ) : appStatus === 'rejected' ? (
                // 2. Rejected Application -> Review/Withdraw to re-apply
                <button 
                  onClick={() => navigate('/admin/mentor-applications')} 
                  className="bg-red-100 text-red-700 border border-red-200 px-5 py-2.5 rounded-lg hover:bg-red-200 font-medium shadow-sm flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" /> Application Rejected
                </button>
              ) : (
                // 3. No Application -> Go to Registration Form
                <button 
                  onClick={() => navigate('/become-mentor')} 
                  className="bg-teal-600 text-white px-5 py-2.5 rounded-lg hover:bg-teal-700 font-medium shadow-sm flex items-center gap-2"
                >
                  <Award className="w-4 h-4" /> Apply to be a Mentor
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isVerifiedAdminOrMentor ? (
          <>
            <StatCard label="Total Resources" value={mentorStats.totalResources || 0} icon={FileText} color="text-blue-600" bg="bg-blue-50" />
            <StatCard label="Total Views" value={mentorStats.totalViews || 0} icon={Globe} color="text-teal-600" bg="bg-teal-50" />
            <StatCard label="Bookmarks" value={mentorStats.totalBookmarks || 0} icon={Bookmark} color="text-purple-600" bg="bg-purple-50" />
            <StatCard label="Completions" value={mentorStats.totalCompletions || 0} icon={CheckCircle} color="text-green-600" bg="bg-green-50" />
          </>
        ) : (
          <>
            <StatCard label="Resources Viewed" value={learnerStats.total_resources_viewed || 0} icon={Globe} color="text-blue-600" bg="bg-blue-50" />
            <StatCard label="Saved Items" value={learnerStats.total_bookmarks || 0} icon={Bookmark} color="text-purple-600" bg="bg-purple-50" />
            <StatCard label="Completed" value={learnerStats.total_completed || 0} icon={CheckCircle} color="text-green-600" bg="bg-green-50" />
            <StatCard label="Avg Rating Given" value={learnerStats.average_rating_given ? Number(learnerStats.average_rating_given).toFixed(1) : '-'} icon={Star} color="text-yellow-600" bg="bg-yellow-50" />
          </>
        )}
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
           
           {/* HEADER / TABS */}
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
              {isVerifiedAdminOrMentor ? (
                <h3 className="font-bold text-gray-800">My Shared Resources</h3>
              ) : (
                <div className="flex gap-4">
                  <button onClick={() => setActiveTab('recommended')} className={`pb-2 text-sm font-semibold transition-colors ${activeTab === 'recommended' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Recommended</button>
                  <button onClick={() => setActiveTab('bookmarks')} className={`pb-2 text-sm font-semibold transition-colors ${activeTab === 'bookmarks' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>My Bookmarks</button>
                  <button onClick={() => setActiveTab('completed')} className={`pb-2 text-sm font-semibold transition-colors ${activeTab === 'completed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Completed</button>
                </div>
              )}
              <div className="text-sm text-gray-500">
                {isVerifiedAdminOrMentor ? mentorResources.length : getDisplayResources().length} Items
              </div>
           </div>

           {/* RESOURCE LIST */}
           {(isVerifiedAdminOrMentor ? mentorResources : getDisplayResources()).length === 0 ? (
             <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
               <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
               <p className="text-gray-600 font-medium">No items found.</p>
               {isVerifiedAdminOrMentor && (
                 <button onClick={() => setShowCreateModal(true)} className="text-blue-600 font-semibold hover:underline mt-2">
                   Share your first link
                 </button>
               )}
               {!isVerifiedAdminOrMentor && activeTab === 'bookmarks' && <p className="text-sm text-gray-400">Save resources to see them here.</p>}
             </div>
           ) : (
             <div className="space-y-4">
               {(isVerifiedAdminOrMentor ? mentorResources : getDisplayResources()).map((item) => (
                 <div 
                    key={item.id} 
                    onClick={() => setSelectedResourceId(item.id)}
                    className="group cursor-pointer flex flex-col sm:flex-row gap-5 p-5 rounded-xl hover:bg-blue-50 border border-gray-100 hover:border-blue-200 transition-all items-start sm:items-center relative"
                  >
                   <div className="w-12 h-12 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center flex-shrink-0 text-blue-600 transition-colors">
                      <FileText className="w-6 h-6" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{item.resource_type}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{item.difficulty_level}</span>
                     </div>
                     <h4 className="font-bold text-gray-900 text-lg truncate group-hover:text-blue-700 transition-colors">{item.title}</h4>
                     <p className="text-sm text-gray-500 truncate">{item.description}</p>
                   </div>
                   
                   {/* Conditional Stats/Icons based on View */}
                   <div className="flex gap-4 text-sm text-gray-500 items-center">
                      {isVerifiedAdminOrMentor ? (
                        <>
                          <div className="text-center"><div className="font-bold text-gray-900">{item.view_count || 0}</div><div className="text-xs">Views</div></div>
                          <div className="text-center"><div className="font-bold text-gray-900">{item.bookmark_count || 0}</div><div className="text-xs">Saves</div></div>
                        </>
                      ) : (
                        <>
                          {item.rating && <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded text-yellow-700 font-bold"><Star className="w-3 h-3 fill-current"/> {Number(item.rating).toFixed(1)}</div>}
                          {item.mentor && <div className="text-xs flex items-center gap-1"><User className="w-3 h-3"/> {item.mentor.firstName}</div>}
                        </>
                      )}
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 ml-2 hidden sm:block" />
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      {/* ✅ RESOURCE DETAIL MODAL (Overlay) */}
      {selectedResourceId && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
              <button 
                onClick={() => setSelectedResourceId(null)}
                className="absolute top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur rounded-full shadow-md hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <ResourceDetail resourceId={selectedResourceId} />
            </div>
          </div>
        </div>
      )}

      <CreateResourceModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSave={handleCreateResource} />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${bg}`}><Icon className={`w-6 h-6 ${color}`} /></div>
    </div>
  );
}