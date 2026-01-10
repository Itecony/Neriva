import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ShieldCheck, Star, Bookmark } from 'lucide-react';

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
      const endpoint = `https://itecony-neriva-backend.onrender.com/api/mentors/${mentorId}`;
      const response = await fetch(endpoint, { headers });

      if (!response.ok) throw new Error(`Server Error (${response.status})`);
      const data = await response.json();
      
      if (data.success && data.mentor) {
        setMentor(data.mentor);
        // 2. GET Mentor Resources
        await fetchResources(data.mentor.id, headers);
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
        `https://itecony-neriva-backend.onrender.com/api/mentors/${targetId}/resources`,
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
        'https://itecony-neriva-backend.onrender.com/api/conversations/direct',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ recipientId: mentor.user_id }) // Use user_id from mentor object
        }
      );

      if (response.ok) {
        const data = await response.json();
        const conversation = data.conversation || data;
        navigate(`/dreamboard/networking/messages/${conversation.id}`);
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
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 mb-6">
              <img src={mentor.avatar || 'https://via.placeholder.com/120'} alt={mentor.firstName} className="w-32 h-32 rounded-xl border-4 border-white shadow-lg bg-white object-cover" />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{mentor.firstName} {mentor.lastName}</h1>
                <div className="flex items-center gap-2 mt-1">
                   <ShieldCheck className="w-4 h-4 text-teal-600" />
                   <span className="text-sm font-bold text-teal-700 uppercase">Verified Mentor</span>
                </div>
              </div>
              <button onClick={handleContactMentor} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium shadow hover:bg-blue-700 flex items-center gap-2">
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