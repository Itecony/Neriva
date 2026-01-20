import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3, Users, FileText, Plus, ExternalLink, CheckCircle,
  Bookmark, Globe, Award, ShieldCheck, X, Clock, User, AlertTriangle, ArrowRight,
  Layout, BookOpen, Star, Activity, FileSearch, Loader2, Trash2, Save, ChevronDown
} from 'lucide-react';

import ResourceDetail from '../Resource/ResourceDetail.jsx';

const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>?/gm, '').trim();
};

// -----------------------------------------------------------------------------
// ✅ 1. MENTOR APPLICATION MODAL
// -----------------------------------------------------------------------------
function MentorApplicationModal({ isOpen, onClose, applicationId, onSuccess, onWithdraw }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [mode, setMode] = useState('create');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    expertise_domains: '',
    teaching_style: '',
    why_mentor: '',
    mentorship_goals: ''
  });

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (applicationId) {
        setMode('edit');
        fetchApplicationData(applicationId);
      } else {
        setMode('create');
        setFormData({ expertise_domains: '', teaching_style: '', why_mentor: '', mentorship_goals: '' });
      }
    }
  }, [isOpen, applicationId]);

  const fetchApplicationData = async (id) => {
    setFetching(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://itecony-neriva-backend.onrender.com/api/mentors/application/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok && data.application) {
        const app = data.application;
        setFormData({
          expertise_domains: Array.isArray(app.expertise_domains) ? app.expertise_domains.join(', ') : app.expertise_domains || '',
          teaching_style: app.teaching_style || '',
          why_mentor: app.why_mentor || '',
          mentorship_goals: app.mentorship_goals || ''
        });
      } else {
        throw new Error(data.message || 'Failed to load application');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const domainsArray = formData.expertise_domains.split(',').map(s => s.trim()).filter(Boolean);

      const payload = { ...formData, expertise_domains: domainsArray };

      console.log('Submitting Application Payload:', payload);

      let url = 'https://itecony-neriva-backend.onrender.com/api/mentors/apply';
      let method = 'POST';

      if (mode === 'edit') {
        url = `https://itecony-neriva-backend.onrender.com/api/mentors/application/${applicationId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        alert(mode === 'create' ? "Application submitted!" : "Application updated!");
        onSuccess(data.application);
        onClose();
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm("Are you sure you want to withdraw your application? This cannot be undone.")) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://itecony-neriva-backend.onrender.com/api/mentors/application/${applicationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert("Application withdrawn successfully.");
        onWithdraw();
        onClose();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to withdraw');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">{mode === 'edit' ? 'Review Application' : 'Apply to be a Mentor'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-500" /></button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {fetching ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <form id="appForm" onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100"><AlertTriangle className="w-4 h-4" /> {error}</div>}
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Expertise Domains</label><input className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Web Development, React" value={formData.expertise_domains} onChange={e => setFormData({ ...formData, expertise_domains: e.target.value })} required /><p className="text-xs text-gray-500 mt-1">Comma separated</p></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Teaching Style</label><textarea rows="3" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Project-based, 1-on-1..." value={formData.teaching_style} onChange={e => setFormData({ ...formData, teaching_style: e.target.value })} required /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Why do you want to mentor?</label><textarea rows="3" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.why_mentor} onChange={e => setFormData({ ...formData, why_mentor: e.target.value })} required /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Mentorship Goals</label><textarea rows="3" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.mentorship_goals} onChange={e => setFormData({ ...formData, mentorship_goals: e.target.value })} /></div>
            </form>
          )}
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-2xl">
          {mode === 'edit' ? (<button type="button" onClick={handleWithdraw} disabled={loading} className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium text-sm flex items-center gap-2"><Trash2 className="w-4 h-4" /> Withdraw</button>) : (<div></div>)}
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
            <button type="submit" form="appForm" disabled={loading || fetching} className="px-6 py-2 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (mode === 'edit' ? 'Update' : 'Submit')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// ✅ 2. CREATE RESOURCE MODAL
// -----------------------------------------------------------------------------
function CreateResourceModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({ title: '', url: '', resource_type: 'article', domain: 'Web Development', description: '', difficulty_level: 'beginner', estimated_time_minutes: 60, prerequisites: '', learning_outcomes: '', tags: [] });
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
    e.preventDefault(); setError('');
    const cleanTitle = sanitizeInput(formData.title); const cleanDesc = sanitizeInput(formData.description); const cleanUrl = formData.url.trim();
    if (formData.tags.length < 3) return setError("Please add at least 3 tags.");
    if (cleanDesc.length < 100) return setError(`Description too short (${cleanDesc.length}/100).`);
    setLoading(true);
    try {
      const payload = { title: cleanTitle, url: cleanUrl, description: cleanDesc, resource_type: formData.resource_type, domain: formData.domain, difficulty_level: formData.difficulty_level, estimated_time_minutes: parseInt(formData.estimated_time_minutes, 10) || 60, tags: formData.tags, learning_outcomes: sanitizeInput(formData.learning_outcomes) || "General Knowledge", prerequisites: sanitizeInput(formData.prerequisites) || "None", file_path: null, file_size: 0 };
      await onSave(payload); setLoading(false);
    } catch (err) { setError(err.message); setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100"><h3 className="text-xl font-bold text-gray-900">Share New Resource</h3><button onClick={onClose}><X className="w-6 h-6 text-gray-500" /></button></div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="resourceForm" onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100"><AlertTriangle className="w-4 h-4" /> {error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input required minLength={5} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">URL *</label><input required type="url" className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} /></div></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select className="w-full p-2 border rounded-lg bg-white" value={formData.resource_type} onChange={e => setFormData({ ...formData, resource_type: e.target.value })}>{['article', 'video', 'pdf', 'code_repo', 'documentation', 'tool'].map(t => <option key={t} value={t}>{t}</option>)}</select></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Domain</label><select className="w-full p-2 border rounded-lg bg-white" value={formData.domain} onChange={e => setFormData({ ...formData, domain: e.target.value })}>{['Web Development', 'Mobile Development', 'Data Science', 'Design', 'Cybersecurity', 'DevOps'].map(d => <option key={d} value={d}>{d}</option>)}</select></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label><select className="w-full p-2 border rounded-lg bg-white" value={formData.difficulty_level} onChange={e => setFormData({ ...formData, difficulty_level: e.target.value })}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time (Minutes)</label><input type="number" min="1" className="w-full p-2 border rounded-lg" value={formData.estimated_time_minutes} onChange={e => setFormData({ ...formData, estimated_time_minutes: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Description (Min 100 chars) *</label><textarea rows="4" required minLength={100} className="w-full p-2 border rounded-lg outline-none focus:border-blue-500" placeholder="Describe what this resource covers..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /><p className={`text-xs text-right ${formData.description.length < 100 ? 'text-red-500' : 'text-gray-400'}`}>{formData.description.length}/100</p></div>
            <div className="grid grid-cols-1 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Learning Outcomes</label><textarea rows="3" className="w-full p-2 border rounded-lg outline-none focus:border-blue-500" placeholder="1. Understand React Hooks..." value={formData.learning_outcomes} onChange={e => setFormData({ ...formData, learning_outcomes: e.target.value })} /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Prerequisites</label><input type="text" className="w-full p-2 border rounded-lg" placeholder="Basic JS, HTML, CSS" value={formData.prerequisites} onChange={e => setFormData({ ...formData, prerequisites: e.target.value })} /></div></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Tags (Min 3) *</label><div className="flex gap-2 mb-2"><input className="flex-1 p-2 border rounded-lg" placeholder="Type tag and press Enter" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag(e))} /><button type="button" onClick={handleAddTag} className="px-4 py-2 bg-gray-100 rounded-lg font-medium">Add</button></div><div className="flex flex-wrap gap-2">{formData.tags.map((t, i) => (<span key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-sm flex items-center gap-1">#{t} <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-blue-900 font-bold">×</button></span>))}</div></div>
          </form>
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl"><button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button><button type="submit" form="resourceForm" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">{loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Publish Resource'}</button></div>
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

  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [myApplication, setMyApplication] = useState(null);
  const [appStatus, setAppStatus] = useState('none');

  // ✅ Admin State
  const [pendingApps, setPendingApps] = useState([]);
  const [pendingCount, setPendingCount] = useState(0); // ✅ Added pending count state
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);

  const [mentorResources, setMentorResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [isVerifiedAdminOrMentor, setIsVerifiedAdminOrMentor] = useState(false);

  const [mentorStats, setMentorStats] = useState({});
  const [learnerStats, setLearnerStats] = useState({});
  const [recommended, setRecommended] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [completed, setCompleted] = useState([]);

  const [activeTab, setActiveTab] = useState('recommended');

  const location = useLocation(); // ✅ Add useLocation hook

  useEffect(() => {
    initializeDashboard();
  }, [location]); // ✅ Re-run when location changes (e.g. returning from application)

  const initializeDashboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error("No token found");
      const headers = { 'Authorization': `Bearer ${token}` };

      const profileRes = await fetch('https://itecony-neriva-backend.onrender.com/api/profile', { headers });
      const profileData = await profileRes.json();
      const user = profileData.data || profileData.user || profileData;
      console.log('User Profile Data:', user);

      setUserProfile(user);
      const currentUserId = user.id || user._id;

      let isVerified = false;
      if (user.role === 'admin' || user.role === 'mentor') {
        isVerified = true;
      } else {
        console.log('Checking application status...', {
          mentor_app: user.mentor_application,
          appId: user.applicationId
        });

        if (user.mentor_application) {
          console.log('Found full application object:', user.mentor_application);
          setMyApplication(user.mentor_application);
          setAppStatus(user.mentor_application.status);
        } else if (user.applicationId) {
          console.log('Found application ID, fetching details:', user.applicationId);
          fetchMyApplication(user.applicationId, headers);
        } else {
          // ✅ FALLBACK: Check localStorage for recent application
          const localAppId = localStorage.getItem('last_mentor_app_id');
          if (localAppId) {
            console.log('Found cached application ID:', localAppId);
            fetchMyApplication(localAppId, headers);
          } else {
            console.log('No application found on profile or cache.');
          }
        }
      }
      setIsVerifiedAdminOrMentor(isVerified);

      if (isVerified) {
        // --- MENTOR FLOW ---
        const resourcesRes = await fetch(`https://itecony-neriva-backend.onrender.com/api/mentors/${currentUserId}/resources`, { headers });
        if (resourcesRes.ok) {
          const rData = await resourcesRes.json();
          setMentorResources(rData.resources || rData.data || []);
        }

        // ✅ ADMIN ONLY: Fetch Pending Applications
        if (user.role === 'admin') {
          try {
            const appsRes = await fetch('https://itecony-neriva-backend.onrender.com/api/admin/mentor-applications?status=pending&limit=10', { headers });
            const appsData = await appsRes.json();
            if (appsRes.ok) {
              console.log('Pending Apps Data:', appsData);
              // Handle potential data structure variations
              let appsList = appsData.applications || appsData.data || [];

              // ✅ CLIENT-SIDE HYDRATION: Fetch user details if missing
              appsList = await Promise.all(appsList.map(async (app) => {
                if (app.user) return app; // User already present
                if (!app.user_id) return app; // No ID to fetch

                try {
                  // Try fetching user profile via admin or standard endpoint
                  const uRes = await fetch(`https://itecony-neriva-backend.onrender.com/api/users/${app.user_id}`, { headers });
                  if (uRes.ok) {
                    const uData = await uRes.json();
                    const userObj = uData.user || uData.data || uData;
                    return { ...app, user: userObj };
                  }
                } catch (e) {
                  console.warn(`Failed to hydrate user ${app.user_id}`, e);
                }
                return app;
              }));

              setPendingApps(appsList);
              // ✅ Check pagination total for correct badge count
              const totalCount = appsData.pagination?.total || appsList.length || 0;
              setPendingCount(totalCount);
            }
          } catch (e) { console.error("Admin fetch error", e); }
        }

        const analyticsRes = await fetch('https://itecony-neriva-backend.onrender.com/api/mentors/analytics', { headers });
        if (analyticsRes.ok) {
          const aData = await analyticsRes.json();
          if (aData.data?.overview) setMentorStats({
            totalResources: aData.data.overview.total_resources || 0,
            totalViews: aData.data.overview.total_views || 0,
            totalBookmarks: aData.data.overview.total_bookmarks || 0,
            totalCompletions: aData.data.overview.total_completions || 0
          });
        }
      } else {
        // ... (Learner Logic) ...
        const dashboardRes = await fetch('https://itecony-neriva-backend.onrender.com/api/users/learning-dashboard', { headers });
        if (dashboardRes.ok) {
          const dashData = await dashboardRes.json();
          setLearnerStats(dashData.dashboard.learning_stats || {});
          setRecommended(dashData.dashboard.recommended_resources || []);
        }
        const bookmarksRes = await fetch('https://itecony-neriva-backend.onrender.com/api/users/bookmarks', { headers });
        if (bookmarksRes.ok) {
          const bData = await bookmarksRes.json();
          setBookmarks(bData.bookmarks?.map(b => ({ ...b.resource, bookmark_id: b.id })) || []);
        }
        const completedRes = await fetch('https://itecony-neriva-backend.onrender.com/api/users/completed', { headers });
        if (completedRes.ok) {
          const cData = await completedRes.json();
          setCompleted(cData.completed_resources?.map(c => ({ ...c.resource, completed_at: c.completed_at })) || []);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplication = async (appId, headers) => {
    try {
      const res = await fetch(`https://itecony-neriva-backend.onrender.com/api/mentors/application/${appId}`, { headers });
      const data = await res.json();
      if (res.ok) {
        setMyApplication(data.application);
        setAppStatus(data.application.status);
      }
    } catch (e) { console.error("Failed to load application details"); }
  };

  const handleAppSuccess = (updatedApp) => {
    setMyApplication(updatedApp);
    setAppStatus(updatedApp.status);
  };

  const handleAppWithdraw = () => {
    setMyApplication(null);
    setAppStatus('none');
    localStorage.removeItem('last_mentor_app_id'); // ✅ Clear cache
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
    } catch (error) { alert(`Error: ${error.message}`); }
  };

  const getDisplayResources = () => {
    switch (activeTab) {
      case 'bookmarks': return bookmarks;
      case 'completed': return completed;
      case 'recommended': default: return recommended;
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div></div>;

  return (
    <div className="min-h-screen p-4 lg:p-8 font-sans">

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{isVerifiedAdminOrMentor ? 'Mentor Dashboard' : 'Learning Dashboard'}</h1>
            {isVerifiedAdminOrMentor && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> {userProfile?.role === 'admin' ? 'ADMIN' : 'VERIFIED MENTOR'}</span>}
          </div>
          <p className="text-gray-500 mt-1">{isVerifiedAdminOrMentor ? 'Manage shared links and track student progress.' : 'Track your progress and find new learning materials.'}</p>
        </div>

        <div className="flex flex-wrap gap-3 relative">
          {isVerifiedAdminOrMentor ? (
            <>
              {/* ✅ ADMIN NOTIFICATION DROPDOWN */}
              {userProfile?.role === 'admin' && (
                <div className="relative">
                  <button
                    onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                    className="relative bg-white border border-purple-200 text-purple-700 p-2.5 rounded-lg hover:bg-purple-50 shadow-sm transition-colors"
                  >
                    <Users className="w-5 h-5" />
                    {pendingCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                        {pendingCount}
                      </span>
                    )}
                  </button>

                  {showAdminDropdown && (
                    <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="p-3 border-b border-gray-50 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase">Pending Applications</span>
                        <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>
                      </div>
                      <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {pendingApps.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-400">No pending apps</div>
                        ) : (
                          pendingApps.map(app => (
                            <button
                              key={app.id}
                              onClick={() => navigate(`/admin/mentor-applications`)} // Navigates to full review page
                              className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex items-center gap-3 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                                {app.user?.firstName?.[0] || 'A'}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {app.user?.firstName ? `${app.user.firstName} ${app.user.lastName}` : 'Unknown Applicant'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {Array.isArray(app.expertise_domains)
                                    ? (app.expertise_domains[0] || 'No expertise listed')
                                    : (typeof app.expertise_domains === 'string' && app.expertise_domains
                                      ? app.expertise_domains.split(',')[0]
                                      : 'No expertise listed')}
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                      <div className="p-2 border-t border-gray-50">
                        <button
                          onClick={() => navigate('/admin/mentor-applications')}
                          className="w-full py-2 text-xs font-bold text-center text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          View All Requests
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button onClick={() => navigate('/mentor/profile')} className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2 shadow-sm"><User className="w-4 h-4" /> My Mentor Profile</button>
              <button onClick={() => setShowCreateModal(true)} className="bg-blue-900 text-white px-5 py-2.5 rounded-lg hover:bg-blue-800 font-medium shadow-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Share New Link</button>
            </>
          ) : (
            <>
              {appStatus === 'pending' ? (
                <button onClick={() => setShowApplicationModal(true)} className="bg-yellow-100 text-yellow-700 border border-yellow-200 px-5 py-2.5 rounded-lg hover:bg-yellow-200 font-medium shadow-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Application Pending
                </button>
              ) : appStatus === 'rejected' ? (
                <button onClick={() => setShowApplicationModal(true)} className="bg-red-100 text-red-700 border border-red-200 px-5 py-2.5 rounded-lg hover:bg-red-200 font-medium shadow-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Application Rejected
                </button>
              ) : (
                <button onClick={() => navigate('/become-mentor')} className="bg-teal-600 text-white px-5 py-2.5 rounded-lg hover:bg-teal-700 font-medium shadow-sm flex items-center gap-2">
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
                        {item.rating && <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded text-yellow-700 font-bold"><Star className="w-3 h-3 fill-current" /> {Number(item.rating).toFixed(1)}</div>}
                        {item.mentor && <div className="text-xs flex items-center gap-1"><User className="w-3 h-3" /> {item.mentor.firstName}</div>}
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

      {/* ✅ RENDER APPLICATION MODAL (For existing applicants) */}
      <MentorApplicationModal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        applicationId={myApplication?.id}
        onSuccess={handleAppSuccess}
        onWithdraw={handleAppWithdraw}
      />

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