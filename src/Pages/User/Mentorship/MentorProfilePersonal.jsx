import { useState, useEffect } from 'react';
import { MapPin, Briefcase, Plus, ChevronLeft, ChevronRight, Calendar, Settings, Star, Bookmark, Edit2 } from 'lucide-react';

export default function MentorProfilePersonal() {
  const [mentor, setMentor] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingTeaching, setIsEditingTeaching] = useState(false);
  const [bioText, setBioText] = useState('');
  const [teachingText, setTeachingText] = useState('');

  // Fetch mentor profile and resources
  useEffect(() => {
    fetchMentorProfile();
  }, []);

  const fetchMentorProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error("No 'authToken' found in localStorage. Please log in again.");
      }

      // GET /api/mentors/profile (protected, mentor only)
      const endpoint = 'https://itecony-neriva-backend.onrender.com/api/mentors/profile';

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
      setBioText(data.bio || '');
      setTeachingText(data.teachingStyle || '');

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

  const handleSaveBio = async () => {
    try {
      const token = localStorage.getItem('authToken');
      // PUT /api/mentors/profile (protected, mentor only)
      const response = await fetch(
        'https://itecony-neriva-backend.onrender.com/api/mentors/profile',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            bio: bioText,
            teaching_style: mentor.teachingStyle,
            open_to_mentorship: mentor.openToMentorship,
            mentorship_description: mentor.mentorshipDescription
          })
        }
      );

      if (!response.ok) throw new Error('Failed to save profile');

      const updated = await response.json();
      setMentor(updated);
      setIsEditingBio(false);
    } catch (err) {
      console.error('Error saving bio:', err);
    }
  };

  const handleSaveTeachingStyle = async () => {
    try {
      const token = localStorage.getItem('authToken');
      // PUT /api/mentors/profile (protected, mentor only)
      const response = await fetch(
        'https://itecony-neriva-backend.onrender.com/api/mentors/profile',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            bio: mentor.bio,
            teaching_style: teachingText,
            open_to_mentorship: mentor.openToMentorship,
            mentorship_description: mentor.mentorshipDescription
          })
        }
      );

      if (!response.ok) throw new Error('Failed to save profile');

      const updated = await response.json();
      setMentor(updated);
      setIsEditingTeaching(false);
    } catch (err) {
      console.error('Error saving teaching style:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-teal-500 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your mentor profile...</p>
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
                  className="w-32 h-32 rounded-xl border-4 border-white shadow-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
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
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                title="Edit profile"
              >
                <Settings className="w-5 h-5" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Bio Section - Editable */}
            <div className="mb-6">
              {isEditingBio ? (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-900">Bio</label>
                  <textarea
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows="4"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveBio}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingBio(false);
                        setBioText(mentor.bio || '');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="group relative cursor-pointer"
                  onClick={() => setIsEditingBio(true)}
                >
                  <p className="text-gray-700">{bioText || 'No bio added yet. Click to add one.'}</p>
                  <Edit2 className="w-4 h-4 absolute top-0 right-0 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              )}
            </div>

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

            {/* Teaching Style & Domains Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="mb-4">
                {isEditingTeaching ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900">Teaching Style</label>
                    <textarea
                      value={teachingText}
                      onChange={(e) => setTeachingText(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      rows="4"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveTeachingStyle}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingTeaching(false);
                          setTeachingText(mentor.teachingStyle || '');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="group relative cursor-pointer"
                    onClick={() => setIsEditingTeaching(true)}
                  >
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center justify-between">
                      About Me & My Style
                      <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {teachingText || 'No teaching style description provided. Click to add one.'}
                    </p>
                  </div>
                )}
              </div>

              {mentor?.domains && mentor.domains.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
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
          <div className="px-6 py-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">My Resources</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-teal-500 via-cyan-600 to-blue-700 hover:brightness-110 text-white rounded-lg transition-colors">
              <Plus className="w-5 h-5" />
              <span>Create Resource</span>
            </button>
          </div>

          {resources.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {resources.slice(0, 5).map((resource, idx) => (
                <div
                  key={resource._id || idx}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group"
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
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 className="w-4 h-4 text-teal-600 hover:text-teal-700" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 mb-4">No resources published yet</p>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-teal-500 via-cyan-600 to-blue-700 hover:brightness-110 text-white rounded-lg transition-colors mx-auto">
                <Plus className="w-5 h-5" />
                <span>Create Your First Resource</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}