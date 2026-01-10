import { useState, useEffect } from 'react';
import { ShieldCheck, Settings, Edit2, User, AlertCircle } from 'lucide-react';

export default function MentorProfilePersonal() {
  const [mentor, setMentor] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit States
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingTeaching, setIsEditingTeaching] = useState(false);
  
  // Form State
  const [bioText, setBioText] = useState('');
  const [teachingText, setTeachingText] = useState('');

  useEffect(() => {
    fetchMyMentorData();
  }, []);

  const fetchMyMentorData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

      // 1. Get User Profile
      const userRes = await fetch('https://itecony-neriva-backend.onrender.com/api/profile', { headers });
      if (!userRes.ok) throw new Error("Failed to load user profile");
      const userDataResponse = await userRes.json();
      const userData = userDataResponse.data || userDataResponse;
      const myId = userData.id || userData._id;
      const isAdmin = userData.role === 'admin';

      // 2. Get Mentor Profile
      const mentorRes = await fetch(`https://itecony-neriva-backend.onrender.com/api/mentors/${myId}`, { headers });
      
      let mentorData = null;

      if (mentorRes.ok) {
        const json = await mentorRes.json();
        mentorData = json.mentor || json.data;
      } else if (isAdmin) {
        // Admin Fallback
        mentorData = {
          ...userData,
          bio: userData.bio || "Admin Account",
          teaching_style: "Administrator",
          expertise_domains: ["Administration"],
          mentorship_description: "General support",
          open_to_mentorship: false,
          total_resources_created: 0,
          average_resource_rating: 0,
          total_bookmarks_received: 0
        };
      }

      if (mentorData) {
        setMentor(mentorData);
        setBioText(mentorData.bio || '');
        setTeachingText(mentorData.teaching_style || '');

        // 3. Get Resources
        try {
          const resRes = await fetch(`https://itecony-neriva-backend.onrender.com/api/mentors/${myId}/resources`, { headers });
          if (resRes.ok) {
            const resJson = await resRes.json();
            setResources(resJson.resources || []);
          }
        } catch (e) { console.warn("Resource fetch failed", e); }
      }

    } catch (err) {
      console.error("Profile Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper to prevent sending nulls
  const getSafePayload = (overrides = {}) => {
    return {
      bio: mentor.bio || "",
      expertise_domains: mentor.expertise_domains || [],
      teaching_style: mentor.teaching_style || "",
      open_to_mentorship: mentor.open_to_mentorship ?? false, // Handle boolean correctly
      mentorship_description: mentor.mentorship_description || "Not specified", // ✅ Was missing
      ...overrides
    };
  };

  const updateProfile = async (updates, successCallback) => {
    try {
      const token = localStorage.getItem('authToken');
      const payload = getSafePayload(updates);

      console.log("📤 Sending Update:", payload); // Debug log

      const response = await fetch('https://itecony-neriva-backend.onrender.com/api/mentors/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setMentor(prev => ({ ...prev, ...updates }));
        if (successCallback) successCallback();
      } else {
        console.error("Server Error:", data);
        alert(`Update Failed: ${data.message || "Missing required fields"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error while saving.");
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent"></div></div>;
  
  if (!mentor) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
      <div className="bg-gray-100 p-6 rounded-full mb-4"><User className="w-8 h-8" /></div>
      <p className="text-lg font-medium">Mentor profile not active.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="h-40 bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-700"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 mb-6">
              <img 
                src={mentor.avatar || mentor.profileImage || 'https://via.placeholder.com/120'} 
                alt="Profile" 
                className="w-32 h-32 rounded-xl border-4 border-white shadow-lg bg-white object-cover" 
              />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{mentor.firstName} {mentor.lastName}</h1>
                <div className="flex items-center gap-2 mt-1">
                   <ShieldCheck className="w-4 h-4 text-teal-600" />
                   <span className="text-sm font-bold text-teal-700 uppercase">
                     {mentor.role === 'admin' ? 'Administrator' : 'Verified Mentor'}
                   </span>
                </div>
              </div>
              <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2">
                <Settings className="w-4 h-4" /> Settings
              </button>
            </div>

            {/* Editable Bio */}
            <div className="mb-6">
              {isEditingBio ? (
                <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-200">
                  <label className="text-xs font-bold text-gray-500 uppercase">Edit Bio</label>
                  <textarea 
                    value={bioText} 
                    onChange={e => setBioText(e.target.value)} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" 
                    rows="3" 
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => updateProfile({ bio: bioText }, () => setIsEditingBio(false))} 
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                      Save
                    </button>
                    <button onClick={() => setIsEditingBio(false)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="group relative p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-200" onClick={() => setIsEditingBio(true)}>
                  <div className="flex justify-between items-start">
                    <p className="text-gray-700 leading-relaxed">{mentor.bio || 'Add a bio...'}</p>
                    <Edit2 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              )}
            </div>

            {/* Editable Teaching Style */}
            <div className="mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
               {isEditingTeaching ? (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-blue-800 uppercase">Edit Teaching Style</label>
                    <textarea value={teachingText} onChange={(e) => setTeachingText(e.target.value)} className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows="3" />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => updateProfile({ teaching_style: teachingText }, () => setIsEditingTeaching(false))}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button onClick={() => setIsEditingTeaching(false)} className="px-4 py-2 bg-white border border-blue-200 text-blue-900 rounded-lg hover:bg-blue-50">Cancel</button>
                    </div>
                  </div>
               ) : (
                  <div className="group relative cursor-pointer" onClick={() => setIsEditingTeaching(true)}>
                    <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                        Teaching Style 
                        <Edit2 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
                    </h3>
                    <p className="text-gray-700 text-sm">{mentor.teaching_style || 'Describe your style...'}</p>
                  </div>
               )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{mentor.total_resources_created || resources.length}</div>
                <div className="text-xs font-bold text-blue-600 uppercase">Resources</div>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl text-center border border-amber-100">
                <div className="text-2xl font-bold text-amber-600">{Number(mentor.average_resource_rating || 0).toFixed(1)}</div>
                <div className="text-xs font-bold text-amber-600 uppercase">Rating</div>
              </div>
              <div className="bg-teal-50 p-4 rounded-xl text-center border border-teal-100">
                <div className="text-2xl font-bold text-teal-600">{mentor.total_bookmarks_received || 0}</div>
                <div className="text-xs font-bold text-teal-600 uppercase">Saves</div>
              </div>
            </div>

          </div>
        </div>

        {/* Resources List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 px-2">My Resources</h2>
            {resources.length > 0 ? (
                <div className="divide-y divide-gray-100">
                    {resources.map(res => (
                        <div key={res.id} className="py-4 px-2 hover:bg-gray-50 rounded-lg transition-colors flex justify-between items-center group">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">{res.title}</h4>
                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase font-bold">{res.resource_type}</span>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-1">{res.description}</p>
                            </div>
                            <div className="text-right text-xs text-gray-400 font-medium flex gap-4">
                                <span>👁️ {res.views_count || 0}</span>
                                <span>🏷️ {res.bookmarks_count || 0}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No resources uploaded yet.
                </div>
            )}
        </div>

      </div>
    </div>
  );
}