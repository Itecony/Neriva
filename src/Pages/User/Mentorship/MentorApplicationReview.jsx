import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check, X, ChevronDown, ChevronUp, User, Clock, Shield,
  AlertCircle, Edit2, Trash2, Save, ArrowLeft, CheckCircle, BookOpen, Briefcase
} from 'lucide-react';

export default function MentorApplicationReview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // --- ADMIN STATE ---
  const [applications, setApplications] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // --- USER STATE ---
  const [myApplication, setMyApplication] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // --- FORM STATE (Shared for Apply & Edit) ---
  const [step, setStep] = useState(1); // For wizard mode
  const [formData, setFormData] = useState({
    why_mentor: '',       // essay
    teaching_style: '',
    mentorship_goals: '',
    expertise_domains: '', // string input for simple comma separation in this merged view
    domains: [],          // array version for wizard
    newDomain: '',
    projects: [],
    newProject: ''
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(false);

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

      // ✅ Robust extraction matching MentorshipHub
      const user = profileData.data || profileData.user || profileData;

      console.log("Review Page - Current User:", user);
      setCurrentUser(user);

      const adminRole = user.role === 'admin';
      console.log("Is Admin?", adminRole);

      setIsAdmin(adminRole);

      // 2. Branch Logic
      if (adminRole) {
        await fetchAdminApplications(token);
      } else {
        const appId = user.mentor_application?.id || user.applicationId;
        if (appId) {
          setHasApplied(true);
          await fetchMyApplication(token, appId);
        } else {
          setHasApplied(false);
        }
      }
    } catch (error) {
      console.error("Init failed", error);
    } finally {
      setLoading(false);
    }
  };

  // ========================== ADMIN LOGIC ==========================
  const fetchAdminApplications = async (token) => {
    try {
      const response = await fetch('https://itecony-neriva-backend.onrender.com/api/admin/mentor-applications?status=pending&limit=50', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        let apps = data.applications || data.data || [];

        // ✅ Hydrate users & Normalize fields
        apps = await Promise.all(apps.map(async (app) => {
          // 1. Normalize fields (Backend sends essay, frontend expects why_mentor)
          const normalizedApp = {
            ...app,
            why_mentor: app.why_mentor || app.essay || '',
            teaching_style: app.teaching_style || app.learning_style || '',
            learning_style: app.teaching_style || app.learning_style || '', // Alias to satisfy "learning style" request
            // Ensure expertise is array
            expertise_domains: Array.isArray(app.expertise_domains)
              ? app.expertise_domains
              : (typeof app.expertise_domains === 'string' ? app.expertise_domains.split(',') : [])
          };

          // 2. Fetch User if missing
          if (!normalizedApp.user && normalizedApp.user_id) {
            try {
              const uRes = await fetch(`https://itecony-neriva-backend.onrender.com/api/users/${normalizedApp.user_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (uRes.ok) {
                const uData = await uRes.json();
                normalizedApp.user = uData.user || uData.data || uData;
              }
            } catch (e) {
              console.warn("User hydration failed for", normalizedApp.user_id);
            }
          }

          // 3. Fetch Full Details if teaching_style is missing (API List vs Detail mismatch)
          if (!normalizedApp.teaching_style) {
            try {
              // Try admin specific endpoint first, then generic
              let dRes = await fetch(`https://itecony-neriva-backend.onrender.com/api/admin/mentor-applications/${normalizedApp.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });

              if (!dRes.ok) {
                dRes = await fetch(`https://itecony-neriva-backend.onrender.com/api/mentors/application/${normalizedApp.id}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
              }

              if (dRes.ok) {
                const dData = await dRes.json();
                const fullApp = dData.application || dData.data || dData;
                normalizedApp.teaching_style = fullApp.teaching_style || fullApp.learning_style || '';
                normalizedApp.learning_style = fullApp.teaching_style || fullApp.learning_style || '';
                if (fullApp.why_mentor) normalizedApp.why_mentor = fullApp.why_mentor;
              }
            } catch (e) {
              console.warn("Detail hydration failed for", normalizedApp.id);
            }
          }

          return normalizedApp;
        }));

        setApplications(apps);
      }
    } catch (e) { console.error(e); }
  };

  const handleDecision = async (id, status) => {
    if (!confirm(`Are you sure you want to ${status} this application?`)) return;
    setProcessingId(id);
    try {
      const token = localStorage.getItem('authToken');
      const feedback = status === 'approved' ? "Welcome to the team!" : "Profile not suitable at this time.";
      const res = await fetch(`https://itecony-neriva-backend.onrender.com/api/admin/mentor-applications/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status, feedback })
      });
      if (res.ok) setApplications(prev => prev.filter(app => app.id !== id));
      else alert("Failed to process");
    } catch (e) { console.error(e); } finally { setProcessingId(null); }
  };

  // ========================== USER LOGIC ==========================
  const fetchMyApplication = async (token, appId) => {
    try {
      const res = await fetch(`https://itecony-neriva-backend.onrender.com/api/mentors/application/${appId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.application) {
        const app = data.application;
        setMyApplication(app);
        // Pre-fill form
        setFormData({
          why_mentor: app.why_mentor || '',
          teaching_style: app.teaching_style || '',
          mentorship_goals: app.mentorship_goals || '',
          expertise_domains: Array.isArray(app.expertise_domains) ? app.expertise_domains.join(', ') : app.expertise_domains || '',
          domains: Array.isArray(app.expertise_domains) ? app.expertise_domains : [],
          projects: app.selected_projects || [],
          newDomain: '', newProject: ''
        });
      }
    } catch (e) { console.error(e); }
  };

  // --- HANDLERS FOR WIZARD FORM ---
  const handleWizardChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleAddDomain = () => {
    if (formData.newDomain.trim() && !formData.domains.includes(formData.newDomain.trim())) {
      setFormData(prev => ({ ...prev, domains: [...prev.domains, formData.newDomain.trim()], newDomain: '' }));
    }
  };
  const handleRemoveDomain = (d) => setFormData(prev => ({ ...prev, domains: prev.domains.filter(x => x !== d) }));

  const handleAddProject = () => {
    if (formData.newProject.trim()) {
      setFormData(prev => ({ ...prev, projects: [...prev.projects, formData.newProject.trim()], newProject: '' }));
    }
  };
  const handleRemoveProject = (idx) => setFormData(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== idx) }));

  // --- SUBMIT (Apply & Update) ---
  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setProcessingId('submit');
    setFormError(null);

    try {
      const token = localStorage.getItem('authToken');
      // Prepare payload based on mode
      let payload = {};
      let url = '';
      let method = '';

      if (hasApplied && myApplication) {
        // UPDATE MODE
        url = `https://itecony-neriva-backend.onrender.com/api/mentors/application/${myApplication.id}`;
        method = 'PUT';
        // For simple edit view, we use the comma separated string
        const domainsArray = formData.expertise_domains.split(',').map(s => s.trim()).filter(Boolean);
        payload = {
          expertise_domains: domainsArray,
          teaching_style: formData.teaching_style,
          why_mentor: formData.why_mentor,
          mentorship_goals: formData.mentorship_goals
        };
      } else {
        // CREATE MODE (Wizard)
        url = 'https://itecony-neriva-backend.onrender.com/api/mentors/apply';
        method = 'POST';
        if (!formData.why_mentor.trim()) throw new Error('Motivation is required.');
        if (formData.domains.length === 0) throw new Error('Add at least one domain.');

        payload = {
          essay: formData.why_mentor,
          domains: formData.domains,
          selected_projects: formData.projects,
          teaching_style: formData.teaching_style,
          mentorship_goals: formData.mentorship_goals
        };
      }

      console.log('Submitting Wizard Application Payload:', payload);

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (response.ok) {
        setFormSuccess(true);
        if (hasApplied) {
          setIsEditing(false);
          setMyApplication(resData.application || resData);
          alert("Updated successfully!");
        } else {
          // ✅ Save ID to localStorage for immediate UI update in Dashboard
          const newAppId = resData.application?.id || resData.id;
          if (newAppId) localStorage.setItem('last_mentor_app_id', newAppId);

          // New application created -> switch view
          setTimeout(() => navigate('/dreamboard/mentorship'), 1500);
        }
      } else {
        throw new Error(resData.message || 'Submission failed');
      }
    } catch (err) { setFormError(err.message); }
    finally { setProcessingId(null); }
  };

  const handleWithdraw = async () => {
    if (!confirm("Withdraw application? This cannot be undone.")) return;
    setProcessingId('withdraw');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`https://itecony-neriva-backend.onrender.com/api/mentors/application/${myApplication.id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Withdrawn.");
        window.location.reload();
      }
    } catch (e) { alert("Error withdrawing"); }
    finally { setProcessingId(null); }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="w-12 h-12 border-4 border-gray-200 border-t-teal-600 rounded-full animate-spin"></div></div>;

  // ----------------------- RENDER -----------------------

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dreamboard/mentorship')} className="p-2 hover:bg-gray-200 rounded-full md:hidden"><ArrowLeft className="w-5 h-5" /></button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{isAdmin ? 'Mentor Applications' : (hasApplied ? 'My Application' : 'Become a Mentor')}</h1>
              <p className="text-gray-500 mt-1">{isAdmin ? 'Review pending requests.' : (hasApplied ? 'Track your status.' : 'Join our community of experts.')}</p>
            </div>
          </div>
          {!isAdmin && <button onClick={() => navigate('/dreamboard/mentorship')} className="hidden md:flex items-center gap-2 text-gray-500 hover:text-teal-600 text-sm font-medium"><ArrowLeft className="w-4 h-4" /> Back to Mentorship</button>}
        </div>

        {/* 1. ADMIN VIEW */}
        {isAdmin && (
          applications.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Shield className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
            </div>
          ) : (
            <div className="grid gap-6">
              {applications.map((app) => (
                <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xl uppercase">{app.user?.firstName?.[0] || 'U'}</div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{app.user?.firstName} {app.user?.lastName}</h3>
                        <div className="text-sm text-gray-500">{app.user?.email}</div>
                        <div className="flex flex-wrap gap-2 mt-2">{app.expertise_domains?.map((d, i) => <span key={i} className="px-2 py-0.5 bg-gray-100 text-xs rounded border">{d}</span>)}</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleDecision(app.id, 'rejected')} disabled={processingId === app.id} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-2 text-sm font-medium"><X className="w-4 h-4" /> Reject</button>
                      <button onClick={() => handleDecision(app.id, 'approved')} disabled={processingId === app.id} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 text-sm font-medium"><Check className="w-4 h-4" /> Approve</button>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 bg-gray-50/50">
                    <button onClick={() => setExpandedId(expandedId === app.id ? null : app.id)} className="w-full px-6 py-3 flex justify-between text-sm font-medium text-gray-600 hover:bg-gray-100">{expandedId === app.id ? 'Hide Details' : 'View Details'} <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === app.id ? 'rotate-180' : ''}`} /></button>
                    {expandedId === app.id && <div className="p-6 grid md:grid-cols-2 gap-6 pt-2"><div className="bg-white p-4 rounded border"><strong>Motivation:</strong><p className="text-sm mt-1">{app.why_mentor}</p></div><div className="bg-white p-4 rounded border"><strong>Teaching Style:</strong><p className="text-sm mt-1">{app.teaching_style}</p></div></div>}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* 2. USER: EXISTING APPLICATION (View/Edit) */}
        {!isAdmin && hasApplied && myApplication && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className={`p-4 border-b ${myApplication.status === 'approved' ? 'bg-green-50 border-green-100' : myApplication.status === 'rejected' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'}`}>
              <div className="flex items-center gap-2 font-bold uppercase text-sm tracking-wide">
                <AlertCircle className="w-4 h-4" /> Status: <span className={myApplication.status === 'approved' ? 'text-green-700' : myApplication.status === 'rejected' ? 'text-red-700' : 'text-yellow-700'}>{myApplication.status}</span>
              </div>
            </div>
            <div className="p-8">
              {isEditing ? (
                <div className="space-y-5">
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Expertise (comma separated)</label><input className="w-full p-2 border rounded" value={formData.expertise_domains} name="expertise_domains" onChange={handleWizardChange} /></div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Motivation</label><textarea className="w-full p-2 border rounded" rows="3" value={formData.why_mentor} name="why_mentor" onChange={handleWizardChange} /></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Teaching Style</label><textarea className="w-full p-2 border rounded" rows="3" value={formData.teaching_style} name="teaching_style" onChange={handleWizardChange} /></div>
                  </div>
                  <div className="flex gap-3 justify-end pt-4">
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSubmitApplication} disabled={processingId === 'submit'} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">{processingId === 'submit' ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />} Save</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div><h2 className="text-xl font-bold">{currentUser?.firstName} {currentUser?.lastName}</h2><p className="text-gray-500 text-sm">Applied on {new Date(myApplication.created_at).toLocaleDateString()}</p></div>
                    {myApplication.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => setIsEditing(true)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium text-gray-700"><Edit2 className="w-4 h-4" /> Edit</button>
                        <button onClick={handleWithdraw} disabled={processingId === 'withdraw'} className="px-4 py-2 border border-red-200 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-2 text-sm font-medium"><Trash2 className="w-4 h-4" /> Withdraw</button>
                      </div>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-6 border-t pt-6">
                    <div><h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Expertise</h4><div className="flex flex-wrap gap-2">{myApplication.expertise_domains?.map((d, i) => <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium">{d}</span>)}</div></div>
                    <div><h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Motivation</h4><p className="text-sm text-gray-700">{myApplication.why_mentor}</p></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. USER: NEW APPLICATION (Wizard) */}
        {!isAdmin && !hasApplied && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {formSuccess ? (
              <div className="p-10 text-center animate-in fade-in"><CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" /><h2 className="text-2xl font-bold text-gray-900">Application Submitted!</h2><p className="text-gray-600">Redirecting...</p></div>
            ) : (
              <>
                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between">
                  {[1, 2, 3].map(num => (
                    <div key={num} className={`flex flex-col items-center ${num <= step ? 'text-teal-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${num <= step ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-gray-300'}`}>{num}</div>
                      <span className="text-xs font-medium mt-1">{['Essay', 'Details', 'Projects'][num - 1]}</span>
                    </div>
                  ))}
                </div>
                <div className="p-8">
                  {formError && <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3"><AlertCircle className="w-5 h-5 text-red-600" /><p className="text-red-700 text-sm">{formError}</p></div>}

                  {step === 1 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-gray-900">Why do you want to mentor?</h2>
                      <textarea name="why_mentor" value={formData.why_mentor} onChange={handleWizardChange} placeholder="I want to mentor because..." className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" rows="8" />
                    </div>
                  )}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div><label className="block text-sm font-bold text-gray-900 mb-2">Teaching Style</label><textarea name="teaching_style" value={formData.teaching_style} onChange={handleWizardChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" rows="3" /></div>
                      <div><label className="block text-sm font-bold text-gray-900 mb-2">Mentorship Goals</label><textarea name="mentorship_goals" value={formData.mentorship_goals} onChange={handleWizardChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" rows="3" /></div>
                    </div>
                  )}
                  {step === 3 && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Expertise Domains</h2>
                        <div className="flex gap-2 mb-3"><input type="text" value={formData.newDomain} name="newDomain" onChange={handleWizardChange} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDomain())} placeholder="e.g. React" className="flex-1 px-4 py-2 border border-gray-300 rounded-xl outline-none" /><button onClick={handleAddDomain} className="px-4 py-2 bg-gray-900 text-white rounded-xl">Add</button></div>
                        <div className="flex flex-wrap gap-2">{formData.domains.map(d => <span key={d} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-sm border border-teal-100 flex items-center gap-2">{d} <button onClick={() => handleRemoveDomain(d)}><X className="w-3 h-3" /></button></span>)}</div>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Selected Projects</h2>
                        <div className="flex gap-2 mb-3"><input type="text" value={formData.newProject} name="newProject" onChange={handleWizardChange} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddProject())} placeholder="e.g. Project Name" className="flex-1 px-4 py-2 border border-gray-300 rounded-xl outline-none" /><button onClick={handleAddProject} className="px-4 py-2 bg-gray-900 text-white rounded-xl">Add</button></div>
                        <div className="space-y-2">{formData.projects.map((p, idx) => <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200"><span className="text-sm font-medium text-gray-700">{p}</span><button onClick={() => handleRemoveProject(idx)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button></div>)}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
                    <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium disabled:opacity-50">Back</button>
                    {step < 3 ? (
                      <button onClick={() => setStep(step + 1)} className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl font-medium">Continue</button>
                    ) : (
                      <button onClick={handleSubmitApplication} disabled={processingId === 'submit'} className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-70 flex justify-center">{processingId === 'submit' ? 'Submitting...' : 'Submit Application'}</button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}