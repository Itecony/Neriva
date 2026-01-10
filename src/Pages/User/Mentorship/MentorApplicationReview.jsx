import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { 
  Check, X, ChevronDown, ChevronUp, User, Clock, Shield, 
  AlertCircle, Edit2, Trash2, Save, ArrowLeft
} from 'lucide-react';

// ✅ Import the Registration Form Component
import MentorRegistrationForm from '../Mentor/MentorRegistrationForm'; // Adjust path if needed

export default function MentorApplicationReview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Admin State
  const [applications, setApplications] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // User State
  const [myApplication, setMyApplication] = useState(null);
  const [hasApplied, setHasApplied] = useState(false); // ✅ Track if application exists
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    expertise_domains: '',
    teaching_style: '',
    why_mentor: '',
    mentorship_goals: ''
  });

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return navigate('/login');

      // 1. Fetch Profile
      const profileRes = await fetch('https://itecony-neriva-backend.onrender.com/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      const user = profileData.data || profileData.user;
      
      setCurrentUser(user);
      const adminRole = user.role === 'admin';
      setIsAdmin(adminRole);

      // 2. Branch Logic
      if (adminRole) {
        await fetchAdminApplications(token);
      } else {
        // User: Check if they have an application
        const appId = user.mentor_application?.id || user.applicationId;
        
        if (appId) {
          setHasApplied(true);
          await fetchMyApplication(token, appId);
        } else {
          setHasApplied(false); // ✅ User has NOT applied
        }
      }
    } catch (error) {
      console.error("Initialization failed", error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // 👮 ADMIN LOGIC
  // ---------------------------------------------------------
  const fetchAdminApplications = async (token) => {
    try {
      const response = await fetch('https://itecony-neriva-backend.onrender.com/api/admin/mentor-applications?status=pending&limit=50', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) { console.error(error); }
  };

  const handleDecision = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this application?`)) return;
    setProcessingId(id);
    try {
      const token = localStorage.getItem('authToken');
      const feedback = status === 'approved' 
        ? "Your application has been approved! Welcome." 
        : "Profile does not meet current requirements.";

      const response = await fetch(`https://itecony-neriva-backend.onrender.com/api/admin/mentor-applications/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status, feedback }) 
      });

      if (response.ok) {
        setApplications(prev => prev.filter(app => app.id !== id));
      } else {
        alert("Failed to process request");
      }
    } catch (error) { console.error(error); } 
    finally { setProcessingId(null); }
  };

  // ---------------------------------------------------------
  // 👤 USER LOGIC
  // ---------------------------------------------------------
  const fetchMyApplication = async (token, appId) => {
    try {
      const response = await fetch(`https://itecony-neriva-backend.onrender.com/api/mentors/application/${appId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.application) {
        setMyApplication(data.application);
        setEditForm({
          expertise_domains: Array.isArray(data.application.expertise_domains) 
            ? data.application.expertise_domains.join(', ') 
            : data.application.expertise_domains || '',
          teaching_style: data.application.teaching_style || '',
          why_mentor: data.application.why_mentor || '',
          mentorship_goals: data.application.mentorship_goals || ''
        });
      }
    } catch (error) { console.error(error); }
  };

  const handleUserUpdate = async () => {
    setProcessingId('user-update');
    try {
      const token = localStorage.getItem('authToken');
      const domainsArray = editForm.expertise_domains.split(',').map(s => s.trim()).filter(Boolean);
      
      const response = await fetch(`https://itecony-neriva-backend.onrender.com/api/mentors/application/${myApplication.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...editForm, expertise_domains: domainsArray })
      });

      if (response.ok) {
        const data = await response.json();
        setMyApplication(data.application || data);
        setIsEditing(false);
        alert("Application updated successfully!");
      } else {
        throw new Error("Failed to update");
      }
    } catch (err) { alert(err.message); } 
    finally { setProcessingId(null); }
  };

  const handleUserWithdraw = async () => {
    if (!confirm("Are you sure? This will delete your application.")) return;
    setProcessingId('user-withdraw');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://itecony-neriva-backend.onrender.com/api/mentors/application/${myApplication.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert("Application withdrawn.");
        window.location.href = '/dreamboard/mentorship'; // Hard reload/redirect to clear state
      }
    } catch (err) { alert("Failed to withdraw"); } 
    finally { setProcessingId(null); }
  };

  // ---------------------------------------------------------
  // 🖼️ RENDER
  // ---------------------------------------------------------

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-teal-600 rounded-full animate-spin"></div>
    </div>
  );

  // ✅ LOGIC: If user is not admin AND has not applied, show the Registration Form
  if (!isAdmin && !hasApplied) {
    return <MentorRegistrationForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/dreamboard/mentorship')} className="p-2 hover:bg-gray-200 rounded-full transition-colors md:hidden"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <h1 className="text-3xl font-bold text-gray-900">{isAdmin ? 'Mentor Applications' : 'My Application'}</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-0 md:ml-0">{isAdmin ? 'Review pending requests from users.' : 'Track and manage your mentorship application status.'}</p>
          </div>
          {isAdmin && (<div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-semibold text-gray-700">Pending: {applications.length}</div>)}
          {!isAdmin && (<button onClick={() => navigate('/dreamboard/mentorship')} className="hidden md:flex items-center gap-2 text-gray-500 hover:text-teal-600 transition-colors text-sm font-medium"><ArrowLeft className="w-4 h-4" /> Back to Mentorship</button>)}
        </div>

        {/* --- VIEW: ADMIN --- */}
        {isAdmin ? (
          applications.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Shield className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
              <p className="text-gray-500">No pending applications.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {applications.map((app) => (
                <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 flex flex-col md:flex-row justify-between gap-4">
                    {/* Applicant Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 uppercase">{app.user?.firstName?.[0] || 'U'}</div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{app.user?.firstName} {app.user?.lastName}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1"><span>{app.user?.email}</span> • <span>{new Date(app.created_at).toLocaleDateString()}</span></div>
                        <div className="flex flex-wrap gap-2 mt-3">{app.expertise_domains?.map((d, i) => <span key={i} className="px-2 py-0.5 bg-gray-100 text-xs rounded border">{d}</span>)}</div>
                      </div>
                    </div>
                    {/* Admin Actions */}
                    <div className="flex gap-3">
                      <button onClick={() => handleDecision(app.id, 'rejected')} disabled={processingId === app.id} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-2 text-sm font-medium"><X className="w-4 h-4"/> Reject</button>
                      <button onClick={() => handleDecision(app.id, 'approved')} disabled={processingId === app.id} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 text-sm font-medium"><Check className="w-4 h-4"/> Approve</button>
                    </div>
                  </div>
                  {/* Expandable Content */}
                  <div className="border-t border-gray-100 bg-gray-50/50">
                    <button onClick={() => setExpandedId(expandedId === app.id ? null : app.id)} className="w-full px-6 py-3 flex justify-between text-sm font-medium text-gray-600 hover:bg-gray-100">{expandedId === app.id ? 'Hide Details' : 'View Details'} {expandedId === app.id ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}</button>
                    {expandedId === app.id && (
                      <div className="p-6 grid md:grid-cols-2 gap-6 pt-2">
                        <div className="bg-white p-4 rounded border"><strong>Motivation:</strong><p className="text-sm mt-1">{app.why_mentor}</p></div>
                        <div className="bg-white p-4 rounded border"><strong>Style:</strong><p className="text-sm mt-1">{app.teaching_style}</p></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* --- VIEW: USER (EXISTING APPLICATION) --- */
          myApplication && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className={`p-4 border-b ${myApplication.status === 'approved' ? 'bg-green-50 border-green-100' : myApplication.status === 'rejected' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'}`}>
                <div className="flex items-center gap-2 font-bold uppercase text-sm tracking-wide">
                  <AlertCircle className="w-4 h-4"/> Status: <span className={myApplication.status === 'approved' ? 'text-green-700' : myApplication.status === 'rejected' ? 'text-red-700' : 'text-yellow-700'}>{myApplication.status}</span>
                </div>
              </div>
              <div className="p-8">
                {isEditing ? (
                  <div className="space-y-5">
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Expertise (comma separated)</label><input className="w-full p-2 border rounded" value={editForm.expertise_domains} onChange={e => setEditForm({...editForm, expertise_domains: e.target.value})} /></div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div><label className="block text-sm font-bold text-gray-700 mb-1">Motivation</label><textarea className="w-full p-2 border rounded" rows="3" value={editForm.why_mentor} onChange={e => setEditForm({...editForm, why_mentor: e.target.value})} /></div>
                      <div><label className="block text-sm font-bold text-gray-700 mb-1">Teaching Style</label><textarea className="w-full p-2 border rounded" rows="3" value={editForm.teaching_style} onChange={e => setEditForm({...editForm, teaching_style: e.target.value})} /></div>
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                      <button onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                      <button onClick={handleUserUpdate} disabled={processingId === 'user-update'} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">{processingId === 'user-update' ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"/> : <Save className="w-4 h-4"/>} Save Changes</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600">{currentUser?.firstName?.[0]}</div>
                        <div><h2 className="text-xl font-bold">{currentUser?.firstName} {currentUser?.lastName}</h2><p className="text-gray-500 text-sm">Applied on {new Date(myApplication.created_at).toLocaleDateString()}</p></div>
                      </div>
                      {myApplication.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => setIsEditing(true)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium text-gray-700"><Edit2 className="w-4 h-4" /> Edit</button>
                          <button onClick={handleUserWithdraw} disabled={processingId === 'user-withdraw'} className="px-4 py-2 border border-red-200 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-2 text-sm font-medium"><Trash2 className="w-4 h-4" /> Withdraw</button>
                        </div>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 border-t pt-6">
                      <div><h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Expertise</h4><div className="flex flex-wrap gap-2">{myApplication.expertise_domains?.map((d, i) => <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium">{d}</span>)}</div></div>
                      <div><h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Goals</h4><p className="text-sm text-gray-700">{myApplication.mentorship_goals}</p></div>
                      <div><h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Motivation</h4><p className="text-sm text-gray-700">{myApplication.why_mentor}</p></div>
                      <div><h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Teaching Style</h4><p className="text-sm text-gray-700">{myApplication.teaching_style}</p></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}