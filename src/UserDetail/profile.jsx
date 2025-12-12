import { useState, useEffect } from 'react';
import { MessageCircle, MapPin, Briefcase, Plus, ChevronLeft, ChevronRight, Calendar, Settings } from 'lucide-react';
import PostModal from '../Pages/User/ReUsable/PostModal/PostModal';
import OnboardingModal from '../UserDetail/UserOnboarding';

export default function Profile({ userId = null, isPersonal = true }) {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentInterestIndex, setCurrentInterestIndex] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postModalMode, setPostModalMode] = useState('view');
  const [filterType, setFilterType] = useState('all');
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  // Fetch profile data
  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');

      // 1. Check if we actually have a token
      if (!token) {
        throw new Error("No 'authToken' found in localStorage. Please log in again.");
      }

      // 2. Remove trailing slashes from URLs (common cause of 404 errors)
      const endpoint = userId 
        ? `https://itecony-neriva-backend.onrender.com/api/users/${userId}/profile`
        : `https://itecony-neriva-backend.onrender.com/api/users/profile`;

      console.log("Attempting to fetch:", endpoint); // DEBUG LOG

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // 3. If request fails, read the TEXT response from server to see why
      if (!response.ok) {
        const errorBody = await response.text(); 
        console.error("Server Error Response:", errorBody); // DEBUG LOG
        
        // Throw a descriptive error
        throw new Error(`Server Error (${response.status}): ${errorBody || response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Profile Data Received:", data); // DEBUG LOG
      setProfile(data);
      
      // Fetch posts for this user
      // Ensure we have a valid ID before fetching posts
      const profileId = data._id || data.id;
      if (profileId) {
        await fetchPosts(profileId);
      } else {
        console.warn("Profile loaded, but no ID found to fetch posts.");
      }

    } catch (err) {
      setError(err.message);
      console.error('FULL ERROR DETAILS:', err);
    } finally {
      setLoading(false);
    }
  };
  const fetchPosts = async (profileId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `https://itecony-neriva-backend.onrender.com/api/posts?userId=${profileId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const data = await response.json();
      const userPosts = Array.isArray(data) ? data : data.posts || [];
      setPosts(userPosts);
      filterPosts(userPosts, 'all');
    } catch (err) {
      console.error('Error fetching posts:', err);
      setPosts([]);
    }
  };

  const filterPosts = (postList, type) => {
    let filtered = postList;
    
    if (type === 'posts') {
      filtered = postList.filter(post => post.content && !post.isCodePost);
    } else if (type === 'code') {
      filtered = postList.filter(post => post.isCodePost);
    }
    
    setFilteredPosts(filtered);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    filterPosts(posts, type);
  };

  const handleAddPost = () => {
    setPostModalMode('create');
    setSelectedPost(null);
  };

  const handleViewPost = (post) => {
    setPostModalMode('view');
    setSelectedPost(post);
  };

  const handlePostSave = (updatedPost) => {
    const updated = posts.map(p => p.id === updatedPost.id ? updatedPost : p);
    setPosts(updated);
    filterPosts(updated, filterType);
  };

  const handlePostClose = () => {
    setSelectedPost(null);
  };

  const handleMessaging = async () => {
    if (!profile || isPersonal) return;
    
    try {
      const token = localStorage.getItem('authToken');
      // Create or fetch conversation with user
      const response = await fetch(
        'https://itecony-neriva-backend.onrender.com/api/conversations',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            participantId: profile._id || profile.id
          })
        }
      );

      if (!response.ok) throw new Error('Failed to initiate conversation');
      
      const conversation = await response.json();
      // Navigate to messaging (you'd implement actual navigation here)
      window.location.href = `/networking-hub/messages/${conversation.id}`;
    } catch (err) {
      console.error('Error initiating conversation:', err);
    }
  };

  const handleAddInterest = () => {
    setShowOnboardingModal(true);
  };

  const handleOnboardingClose = () => {
    setShowOnboardingModal(false);
    fetchProfile();
  };

  const nextInterest = () => {
    if (profile?.interests && profile.interests.length > 0) {
      setCurrentInterestIndex((prev) =>
        prev === profile.interests.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevInterest = () => {
    if (profile?.interests && profile.interests.length > 0) {
      setCurrentInterestIndex((prev) =>
        prev === 0 ? profile.interests.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-teal-500 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Profile not found'}</p>
        </div>
      </div>
    );
  }

  const userInterests = profile?.interests || [];

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
                  src={profile?.profileImage || 'https://via.placeholder.com/120'}
                  alt={profile?.name}
                  className="w-32 h-32 rounded-xl border-4 border-white shadow-lg object-cover"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {profile?.firstName || profile?.name || profile?.username || 'User'}
                  </h1>
                  <p className="text-gray-600 text-lg">{profile?.title || 'Professional'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {isPersonal && (
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Edit profile"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Edit</span>
                  </button>
                )}
                {!isPersonal && (
                  <button
                    onClick={handleMessaging}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-teal-500 via-cyan-600 to-blue-700 hover:brightness-110 text-white rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Message</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bio & Contact Info */}
            <p className="text-gray-700 mb-4">{profile?.bio || 'No bio added yet'}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
              {profile?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile?.company && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-teal-600" />
                  <span>{profile.company}</span>
                </div>
              )}
              {profile?.joinDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-gray-200">
              <div className="text-center">
                <div className="font-bold text-lg text-teal-600">{posts.length}</div>
                <div className="text-sm text-gray-600">Posts</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-teal-600">{profile?.followers?.length || 0}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-teal-600">{profile?.following?.length || 0}</div>
                <div className="text-sm text-gray-600">Following</div>
              </div>
            </div>

            {/* Interests Section */}
            {isPersonal && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Interests</h3>
                  <button
                    onClick={handleAddInterest}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    title="Add or edit interests"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                {userInterests.length > 0 ? (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {userInterests.map((interest, index) => (
                        <span
                          key={index}
                          onClick={() => setCurrentInterestIndex(index)}
                          className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-all ${
                            index === currentInterestIndex
                              ? 'bg-teal-600 text-white'
                              : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                          }`}
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                    
                    {userInterests.length > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={prevInterest}
                          className="text-gray-600 hover:text-gray-900 transition-colors p-1"
                          aria-label="Previous interest"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-gray-500">
                          {currentInterestIndex + 1} of {userInterests.length}
                        </span>
                        <button
                          onClick={nextInterest}
                          className="text-gray-600 hover:text-gray-900 transition-colors p-1"
                          aria-label="Next interest"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-gray-500 text-sm italic">No interests yet</p>
                    <button
                      onClick={handleAddInterest}
                      className="mt-2 text-teal-600 hover:text-teal-700 text-sm font-medium"
                    >
                      Add your interests
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Posts */}
          <div className="lg:col-span-3 lg:col-start-1">
            {/* Post Filters & Create */}
            <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex gap-2 flex-wrap">
                  {isPersonal && (
                    <>
                      <button
                        onClick={() => handleFilterChange('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          filterType === 'all'
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => handleFilterChange('posts')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          filterType === 'posts'
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Posts
                      </button>
                      <button
                        onClick={() => handleFilterChange('code')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          filterType === 'code'
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Code Snippets
                      </button>
                    </>
                  )}
                  {!isPersonal && (
                    <>
                      <button
                        onClick={() => handleFilterChange('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          filterType === 'all'
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        All Posts
                      </button>
                      <button
                        onClick={() => handleFilterChange('posts')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          filterType === 'posts'
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Posts
                      </button>
                      <button
                        onClick={() => handleFilterChange('code')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          filterType === 'code'
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Code
                      </button>
                    </>
                  )}
                </div>

                {isPersonal && (
                  <button
                    onClick={handleAddPost}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-teal-500 via-cyan-600 to-blue-700 hover:brightness-110 text-white rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Plus className="w-5 h-5" />
                    <span>New Post</span>
                  </button>
                )}
              </div>
            </div>

            {/* Posts List */}
            {filteredPosts.length > 0 ? (
              <div className="space-y-4">
                {filteredPosts.map((post) => {
                  // Helper function to get author display name
                  const getAuthorName = () => {
                    const author = post.author || post.userId;
                    if (!author) return 'Unknown User';
                    if (typeof author === 'object') {
                      const { firstName, lastName, username } = author;
                      if (firstName && lastName) return `${firstName} ${lastName}`;
                      return firstName || lastName || username || 'Unknown User';
                    }
                    return 'Unknown User';
                  };

                  // Helper function to get author initials
                  const getAuthorInitials = () => {
                    const author = post.author;
                    if (!author || typeof author !== 'object') return 'U';
                    const { firstName, lastName } = author;
                    if (firstName && lastName) {
                      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
                    }
                    if (firstName) {
                      return firstName.substring(0, 2).toUpperCase();
                    }
                    const name = getAuthorName();
                    return name.substring(0, 2).toUpperCase() || 'U';
                  };

                  return (
                    <div
                      key={post.id || post._id}
                      onClick={() => handleViewPost(post)}
                      className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      {/* Author Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (post.author?._id || post.author?.id) {
                              window.location.href = `/profile/${post.author._id || post.author.id}`;
                            }
                          }}
                          className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm hover:bg-teal-600 transition-colors flex-shrink-0"
                          title="View profile"
                        >
                          {getAuthorInitials()}
                        </button>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {getAuthorName()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-gray-900 truncate mb-1">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                            {post.isCodePost ? `Code: ${post.codeLanguage}` : post.content?.replace(/<[^>]*>/g, '').substring(0, 100) + '...'}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.tags?.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-4 text-sm text-gray-500">
                            <span>👍 {post.likes || 0} Likes</span>
                            <span>💬 {post.commentsList?.length || 0} Comments</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          {post.image && (
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-24 h-24 rounded-lg object-cover"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
                <p className="text-gray-500 text-lg">
                  {isPersonal ? 'No posts yet. Create your first post!' : 'No posts available'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Modal */}
      {selectedPost !== null && (
        <PostModal
          post={selectedPost || null}
          mode={postModalMode}
          onClose={handlePostClose}
          onSave={handlePostSave}
        />
      )}

      {/* Onboarding Modal for Interests */}
      {showOnboardingModal && (
        <OnboardingModal
          isOpen={showOnboardingModal}
          onClose={handleOnboardingClose}
          existingData={profile}
        />
      )}
    </div>
  );
}