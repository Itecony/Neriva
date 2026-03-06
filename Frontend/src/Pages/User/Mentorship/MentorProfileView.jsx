import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ShieldCheck, Star, Bookmark } from 'lucide-react';
import { API_BASE_URL } from '../../../config';

// ✅ HELPER: Get Initials
const getInitials = (user) => {
  if (!user) return 'U';
  const first = user.firstName?.[0] || '';
  const last = user.lastName?.[0] || '';
  return (first + last).toUpperCase() || user.username?.[0]?.toUpperCase() || 'U';
};

export default function MentorProfileView({ mentorId }) {
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMentorProfile();
  }, [mentorId]);

  const fetchMentorProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      // 1. GET Mentor Profile
      const endpoint = `${API_BASE_URL}/api/mentors/${mentorId}`;
      const response = await fetch(endpoint, { headers });

      if (!response.ok) throw new Error(`Server Error (${response.status})`);
      const data = await response.json();

      // Handle the nested structure where data.data.mentorProfile exists
      let mentorData = data.mentor || data.data || data;

      if (mentorData && mentorData.mentorProfile) {
        mentorData = {
          ...mentorData.mentorProfile, // Base mentor stats/details
          ...mentorData,              // Override with User details (name, avatar, etc.)
          // Preserve specific mentor fields if they were overwritten by user fields of same name (e.g. bio)
          // But user bio is usually more general. Let's assume user details are primary identity.
          // Re-assert critical mentor stats just in case
          total_resources_created: mentorData.mentorProfile.total_resources_created,
          average_resource_rating: mentorData.mentorProfile.average_resource_rating,
          total_bookmarks_received: mentorData.mentorProfile.total_bookmarks_received,
          expertise_domains: mentorData.mentorProfile.expertise_domains,
          bio: mentorData.mentorProfile.bio || mentorData.bio // Prefer mentor bio if exists, fallback to user
        };
      }

      if (mentorData) {
        setMentor(mentorData);
        // 2. GET Mentor Resources - Use the ID from the combined object (likely User ID)
        await fetchResources(mentorData.id || mentorData._id, headers);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async (targetId, headers) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/mentors/${targetId}/resources`,
        { headers }
      );
      if (response.ok) {
        const data = await response.json();
        setResources(data.resources || []);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    }
  };

  const handleContactMentor = async () => {
    if (!mentor) return;
    const token = localStorage.getItem('authToken');
    if (!token) return navigate('/login');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/conversations/direct`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ recipientId: mentor.user_id }) // Use user_id from mentor object
        }
      );

      if (response.ok) {
        const data = await response.json();
        const conversation = data.conversation || data;
        navigate(`/networking/messages/${conversation.id}`);
      }
    } catch (err) {
      console.error('Error initiating conversation:', err);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent"></div></div>;
  if (error || !mentor) return <div className="text-center p-10 text-red-500">{error || 'Mentor not found'}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="h-40 bg-gradient-to-r from-teal-500 to-blue-700"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col items-center md:flex-row md:items-end gap-4 -mt-12 md:-mt-16 mb-6 text-center md:text-left">
              {mentor.avatar ? (
                <img
                  src={mentor.avatar.startsWith('http') ? mentor.avatar : `${API_BASE_URL}/${mentor.avatar}`}
                  alt={mentor.firstName}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-xl border-4 border-white shadow-lg bg-white object-cover"
                />
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl border-4 border-white shadow-lg bg-teal-600 flex items-center justify-center text-3xl md:text-4xl font-bold text-white">
                  {getInitials(mentor)}
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{mentor.firstName} {mentor.lastName}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-bold text-teal-700 uppercase">Verified Mentor</span>
                </div>
              </div>
              <button onClick={handleContactMentor} className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium shadow hover:bg-blue-700 flex items-center justify-center gap-2 mt-4 md:mt-0">
                <MessageCircle className="w-5 h-5" /> Contact
              </button>
            </div>

            <p className="text-gray-700 mb-6">{mentor.bio || 'No bio available.'}</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-blue-600">{mentor.total_resources_created}</div>
                <div className="text-xs font-bold text-blue-600 uppercase">Resources</div>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-amber-600">{Number(mentor.average_resource_rating).toFixed(1)}</div>
                <div className="text-xs font-bold text-amber-600 uppercase">Rating</div>
              </div>
              <div className="bg-teal-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-teal-600">{mentor.total_bookmarks_received}</div>
                <div className="text-xs font-bold text-teal-600 uppercase">Saves</div>
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {mentor.expertise_domains?.map((d, i) => (
                  <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium">{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Shared Resources</h2>
          {resources.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {resources.map(res => (
                <div key={res.id} className="py-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => window.open(res.url, '_blank')}>
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{res.title}</h3>
                      <p className="text-sm text-gray-500">{res.description}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span><Star className="w-3 h-3 inline" /> {res.rating}</span>
                      <span><Bookmark className="w-3 h-3 inline" /> {res.bookmarks_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500">No resources found.</p>}
        </div>
      </div>
    </div>
  );
}