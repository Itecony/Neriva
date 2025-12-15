import { useState, useEffect } from 'react';
import { MessageCircle, MapPin, Briefcase, Plus, ChevronLeft, ChevronRight, Calendar, Settings, Star, Bookmark } from 'lucide-react';

export default function MentorProfileView({ mentorId }) {
  const [mentor, setMentor] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');

  // Fetch mentor profile and resources
  useEffect(() => {
    fetchMentorProfile();
  }, [mentorId]);

  const fetchMentorProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error("No 'authToken' found in localStorage. Please log in again.");
      }

      const endpoint = `https://itecony-neriva-backend.onrender.com/api/mentors/${mentorId}`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Server Error (${response.status}): ${errorBody || response.statusText}`);
      }

      const data = await response.json();
      setMentor(data);

      // Fetch mentor's resources using GET /api/mentors/:id/resources
      if (data._id || data.id) {
        await fetchResources(data._id || data.id);
      }
    } catch (err) {
      setError(err.message);
      console.error('FULL ERROR DETAILS:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async (mentorId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `https://itecony-neriva-backend.onrender.com/api/mentors/${mentorId}/resources`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch resources');

      const data = await response.json();
      const mentorResources = Array.isArray(data) ? data : data.resources || [];
      setResources(mentorResources);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setResources([]);
    }
  };

  const handleContactMentor = async () => {
    if (!mentor) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        'https://itecony-neriva-backend.onrender.com/api/conversations',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            participantId: mentor._id || mentor.id
          })
        }
      );

      if (!response.ok) throw new Error('Failed to initiate conversation');

      const conversation = await response.json();
      window.location.href = `/networking-hub/messages/${conversation.id}`;
    } catch (err) {
      console.error('Error initiating conversation:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-teal-500 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mentor profile...</p>
        </div>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Mentor profile not found'}</p>
        </div>
      </div>
    );
  }

  const avgRating = mentor?.avgRating || 0;
  const totalResources = resources.length;
  const totalBookmarks = mentor?.totalBookmarks || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="h-40 bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-700"></div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-16 mb-6">
              <div className="flex items-end gap-4">
                <img
                  src={mentor?.profileImage || 'https://via.placeholder.com/120'}
                  alt={mentor?.firstName}
                  className="w-32 h-32 rounded-xl border-4 border-white shadow-lg object-cover"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {mentor?.firstName} {mentor?.lastName || ''}
                    </h1>
                    {mentor?.isVerified && (
                      <div className="flex items-center gap-1 bg-teal-50 px-2 py-1 rounded-full">
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        <span className="text-xs font-medium text-teal-600">Verified Mentor</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 text-lg">{mentor?.title || 'Mentor'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                onClick={handleContactMentor}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-teal-500 via-cyan-600 to-blue-700 hover:brightness-110 text-white rounded-lg transition-colors font-medium"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contact Mentor</span>
              </button>
            </div>

            {/* Bio & Info */}
            <p className="text-gray-700 mb-4">{mentor?.bio || 'No bio added yet'}</p>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
              {mentor?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>{mentor.location}</span>
                </div>
              )}
              {mentor?.company && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-teal-600" />
                  <span>{mentor.company}</span>
                </div>
              )}
            </div>

            {/* Teaching Style & Domains */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">About Me & My Style</h3>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                {mentor?.teachingStyle || 'No teaching style description provided'}
              </p>
              
              {mentor?.domains && mentor.domains.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-semibold text-gray-600">Expertise</span>
                  {mentor.domains.map((domain, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium"
                    >
                      {domain}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* At a Glance - Stats */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">At a Glance</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center border border-blue-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">📚</span>
                    </div>
                  </div>
                  <div className="font-bold text-2xl text-blue-600">{totalResources}</div>
                  <div className="text-sm text-gray-600">Resources</div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 text-center border border-amber-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="font-bold text-2xl text-amber-600">{avgRating.toFixed(1)}/5</div>
                  <div className="text-sm text-gray-600">Avg. Rating</div>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 text-center border border-teal-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                      <Bookmark className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="font-bold text-2xl text-teal-600">{totalBookmarks.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Bookmarks</div>
                </div>
              </div>
            </div>

            {/* Availability Status */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-200">
              <div className="flex items-center gap-3">
                {mentor?.openToMentorship ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Open to accepting new mentees.</p>
                      <p className="text-sm text-gray-600">{mentor?.mentorshipDescription || 'Available for mentorship'}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Not currently accepting mentees.</p>
                      <p className="text-sm text-gray-600">Check back later for availability</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* My Resources Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">My Resources</h2>
          </div>

          {resources.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {resources.slice(0, 5).map((resource, idx) => (
                <div
                  key={resource._id || idx}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-blue-600 font-bold">{resource.resourceType?.charAt(0).toUpperCase()}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{resource.resourceType}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600 flex-shrink-0">
                      <span className="flex items-center gap-1">
                        👁️ {resource.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        🏷️ {resource.bookmarks || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No resources published yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}