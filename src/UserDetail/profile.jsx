import { useState, useEffect } from 'react';
import { MessageCircle, MapPin, Briefcase, Plus, ChevronLeft, ChevronRight, Calendar, Settings, UserPlus, UserCheck, Heart, X } from 'lucide-react';
import PostModal from '../Pages/User/ReUsable/PostModal/PostModal';
import OnboardingModal from '../UserDetail/UserOnboarding';
import { useNavigate } from 'react-router-dom';

// ✅ User List Modal (Shows Followers/Following)
function UserListModal({ title, users, isOpen, onClose, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* List Content */}
        <div className="overflow-y-auto p-2 flex-1">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-8 text-gray-500">No users found.</div>
          ) : (
            <div className="space-y-1">
              {users.map((user) => (
                <div 
                  key={user.id || user._id} 
                  onClick={() => window.location.href = `/profile/${user.id || user._id}`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer"
                >
                  <img 
                    src={user.profilePicture || user.profileImage || 'https://via.placeholder.com/40'} 
                    alt={user.firstName} 
                    className="w-10 h-10 rounded-full object-cover border border-gray-100"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm group-hover:text-teal-600 transition-colors">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">@{user.username || 'user'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Profile({ userId = null, isPersonal = true }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentInterestIndex, setCurrentInterestIndex] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postModalMode, setPostModalMode] = useState('view');
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  
  // Follow System
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Modal State
  const [userListModal, setUserListModal] = useState({ isOpen: false, title: '', type: '' });
  const [userList, setUserList] = useState([]);
  const [userListLoading, setUserListLoading] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.id || currentUser._id;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error("No 'authToken' found. Please log in again.");

      const endpoint = userId 
        ? `https://itecony-neriva-backend.onrender.com/api/users/${userId}`
        : `https://itecony-neriva-backend.onrender.com/api/profile`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Profile fetch failed');
      
      const data = await response.json();
      setProfile(data);

      const targetId = data._id || data.id;
      
      if (targetId) {
        await Promise.all([
            fetchFollowStats(targetId),
            fetchPosts(targetId),
            !isPersonal && userId ? checkFollowStatus(targetId) : Promise.resolve()
        ]);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 1. Check if I follow this user (using efficient endpoint)
  const checkFollowStatus = async (targetId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `https://itecony-neriva-backend.onrender.com/api/users/${targetId}/is-following`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const result = await response.json();
        // Access nested data.isFollowing
        const status = result.data?.isFollowing || result.isFollowing;
        setIsFollowing(!!status);
      }
    } catch (err) {
      console.warn("Could not verify follow status", err);
    }
  };

  // ✅ 2. Get Numbers (Followers/Following Count)
  const fetchFollowStats = async (targetId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `https://itecony-neriva-backend.onrender.com/api/users/${targetId}/follower-count`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const res = await response.json();
        const data = res.data || res;
        setFollowStats({
            followers: parseInt(data.followers || 0),
            following: parseInt(data.following || 0)
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  // ✅ 3. Get Lists (When clicking numbers)
  const handleShowStats = async (type) => {
    const targetId = profile?._id || profile?.id;
    if (!targetId) return;

    setUserListModal({ 
        isOpen: true, 
        type, 
        title: type === 'followers' ? 'Followers' : 'Following' 
    });
    setUserList([]); 
    setUserListLoading(true);

    try {
        const token = localStorage.getItem('authToken');
        // Add limit to ensure we see users even if default pagination is small
        const response = await fetch(
            `https://itecony-neriva-backend.onrender.com/api/users/${targetId}/${type}?limit=100`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (response.ok) {
            const result = await response.json();
            // Handle { success: true, data: [...] } structure
            setUserList(result.data || []); 
        }
    } catch (error) {
        console.error(`Failed to fetch ${type}:`, error);
    } finally {
        setUserListLoading(false);
    }
  };

  // ✅ 4. Follow/Unfollow Action
  const handleFollowToggle = async () => {
    if (!profile) return;
    const targetId = profile._id || profile.id;
    const token = localStorage.getItem('authToken');
    
    setFollowLoading(true);

    // Optimistic Update
    const prevIsFollowing = isFollowing;
    setIsFollowing(!isFollowing);
    
    setFollowStats(prev => ({
        ...prev,
        followers: !isFollowing ? prev.followers + 1 : Math.max(0, prev.followers - 1)
    }));

    try {
      const method = isFollowing ? 'DELETE' : 'POST'; 
      const response = await fetch(`https://itecony-neriva-backend.onrender.com/api/users/${targetId}/follow`, {
        method: method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      // If server says "Already Following" (409), treat as success & sync to true
      if (response.status === 409) {
          setIsFollowing(true); 
          fetchFollowStats(targetId); // Refresh count to be accurate
          return;
      }

      if (!response.ok) throw new Error("Action failed");
      
      // Success - Refresh stats to ensure server sync
      fetchFollowStats(targetId);

    } catch (err) {
      console.error("Follow action failed:", err);
      // Revert if error
      setIsFollowing(prevIsFollowing);
      fetchFollowStats(targetId);
    } finally {
      setFollowLoading(false);
    }
  };

  // ... (Existing Post/Message Handlers - Unchanged) ...
  const fetchPosts = async (profileId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `https://itecony-neriva-backend.onrender.com/api/posts?userId=${profileId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      let userPosts = [];
      if (Array.isArray(data)) userPosts = data;
      else if (Array.isArray(data.posts)) userPosts = data.posts;
      else if (Array.isArray(data.data)) userPosts = data.data;
      setPosts(userPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setPosts([]);
    }
  };

  const handleAddPost = () => { setPostModalMode('create'); setSelectedPost(null); };
  const handleViewPost = (post) => { setPostModalMode('view'); setSelectedPost(post); };
  const handlePostSave = (updatedPost) => {
    const updated = posts.map(p => p.id === updatedPost.id ? updatedPost : p);
    if (!posts.find(p => p.id === updatedPost.id)) updated.unshift(updatedPost);
    setPosts(updated);
  };
  const handlePostClose = () => { setSelectedPost(null); };
  
 const handleMessaging = async () => {
    if (!profile || isPersonal) return;
    
    // 1. Get the target user's ID
    const targetId = profile._id || profile.id;

    try {
      const token = localStorage.getItem('authToken');
      
      // 2. Call the API you provided
      const response = await fetch('https://itecony-neriva-backend.onrender.com/api/conversations/direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId: targetId }) 
      });

      if (!response.ok) throw new Error('Failed to initiate conversation');
      
      const data = await response.json();
      
      // 3. Extract the Conversation ID
      const conversation = data.conversation || data;

      // 4. Navigate to the Route we defined in Step 1
      // This puts the ID into the URL: /dreamboard/networking/messages/550e84...
      navigate(`/dreamboard/networking/messages/${conversation.id}`);
      
    } catch (err) {
      console.error('Error initiating conversation:', err);
    }
  };

  const handleAddInterest = () => setShowOnboardingModal(true);
  const handleOnboardingClose = () => { setShowOnboardingModal(false); fetchProfile(); };
  
  const getImageUrl = (img) => {
    if (!img) return null;
    const src = typeof img === 'string' ? img : img.image_url;
    if (!src) return null;
    if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:')) return src;
    return `https://itecony-neriva-backend.onrender.com/${src}`;
  };

  const nextInterest = () => {
    if (profile?.interests && profile.interests.length > 0) {
      setCurrentInterestIndex((prev) => prev === profile.interests.length - 1 ? 0 : prev + 1);
    }
  };

  const prevInterest = () => {
    if (profile?.interests && profile.interests.length > 0) {
      setCurrentInterestIndex((prev) => prev === 0 ? profile.interests.length - 1 : prev - 1);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-teal-500 animate-spin"></div></div>;
  if (error || !profile) return <div className="flex items-center justify-center min-h-screen text-red-600">{error || 'Profile not found'}</div>;

  const userInterests = profile?.interests || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="h-40 bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-700"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-16 mb-6">
              <div className="flex items-end gap-4">
                <img
                  src={profile?.profileImage || 'https://via.placeholder.com/120'}
                  alt={profile?.name}
                  className="w-32 h-32 rounded-xl border-4 border-white shadow-lg object-cover bg-white"
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
                {isPersonal ? (
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="Edit profile">
                    <Settings className="w-5 h-5" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <>
                    {isFollowing ? (
                      <div className="flex gap-2">
                        <button onClick={handleMessaging} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-b from-teal-500 via-cyan-600 to-blue-700 hover:brightness-110 text-white rounded-lg transition-colors font-semibold shadow-sm">
                          <MessageCircle className="w-5 h-5" />
                          <span>Message</span>
                        </button>
                        <button onClick={handleFollowToggle} disabled={followLoading} className="flex items-center justify-center w-10 px-0 bg-white border border-gray-300 text-gray-500 hover:text-red-500 hover:border-red-300 rounded-lg transition-colors">
                          <UserCheck className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={handleFollowToggle} disabled={followLoading} className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold shadow-sm">
                        <UserPlus className="w-5 h-5" />
                        <span>Follow</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <p className="text-gray-700 mb-4">{profile?.bio || 'No bio added yet'}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
              {profile?.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-teal-600" /><span>{profile.location}</span></div>}
              {profile?.company && <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-teal-600" /><span>{profile.company}</span></div>}
              {profile?.joinDate && <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-teal-600" /><span>Joined {new Date(profile.joinDate).toLocaleDateString()}</span></div>}
            </div>

            {/* ✅ STATS SECTION: Clickable Followers/Following */}
            <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-gray-200">
              <div className="text-center">
                <div className="font-bold text-lg text-teal-600">{posts.length}</div>
                <div className="text-sm text-gray-600">Posts</div>
              </div>
              <button 
                onClick={() => handleShowStats('followers')} 
                className="text-center hover:bg-gray-50 rounded-lg transition-colors py-1 group"
              >
                <div className="font-bold text-lg text-teal-600 group-hover:text-teal-700">{followStats.followers}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </button>
              <button 
                onClick={() => handleShowStats('following')} 
                className="text-center hover:bg-gray-50 rounded-lg transition-colors py-1 group"
              >
                <div className="font-bold text-lg text-teal-600 group-hover:text-teal-700">{followStats.following}</div>
                <div className="text-sm text-gray-600">Following</div>
              </button>
            </div>

            {/* ... rest of your profile render ... */}
            {isPersonal && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Interests</h3>
                  <button onClick={handleAddInterest} className="text-gray-600 hover:text-gray-900 transition-colors"><Plus className="w-5 h-5" /></button>
                </div>
                {userInterests.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {userInterests.map((interest, index) => (
                      <span key={index} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">{interest}</span>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3 text-center"><button onClick={handleAddInterest} className="mt-2 text-teal-600 hover:text-teal-700 text-sm font-medium">Add your interests</button></div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3 lg:col-start-1">
            <div className="flex justify-end mb-6">
              {isPersonal && (
                <button onClick={handleAddPost} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-teal-500 via-cyan-600 to-blue-700 hover:brightness-110 text-white rounded-lg transition-colors whitespace-nowrap shadow-sm">
                  <Plus className="w-5 h-5" />
                  <span>Create New Post</span>
                </button>
              )}
            </div>

            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => {
                  const getAuthorName = () => {
                    const author = post.author || post.userId;
                    if (typeof author === 'object') return author.firstName ? `${author.firstName} ${author.lastName || ''}` : author.username;
                    return 'Unknown User';
                  };
                  const displayImage = (post.images && post.images.length > 0) ? getImageUrl(post.images[0]) : getImageUrl(post.image);
                  const commentCount = Array.isArray(post.comments) ? post.comments.length : (post.comments || 0);

                  return (
                    <div key={post.id || post._id} onClick={() => handleViewPost(post)} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {getAuthorName().charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{getAuthorName()}</p>
                          <p className="text-xs text-gray-500">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recently'}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 truncate mb-2">{post.title}</h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-4">{post.content?.replace(/<[^>]*>/g, '').substring(0, 100) + '...'}</p>
                          {post.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {post.tags.map((tag, idx) => (<span key={idx} className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">#{tag}</span>))}
                            </div>
                          )}
                          <div className="flex items-center gap-6 pt-2 border-t border-gray-100">
                            <span className="flex items-center gap-2 text-sm text-gray-500 font-medium"><Heart className="w-5 h-5 text-gray-400" /> {post.likes || 0}</span>
                            <span className="flex items-center gap-2 text-sm text-gray-500 font-medium"><MessageCircle className="w-5 h-5 text-gray-400" /> {commentCount}</span>
                          </div>
                        </div>
                        {displayImage && (<div className="w-28 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100"><img src={displayImage} alt={post.title} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} /></div>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
                <p className="text-gray-500 text-lg">{isPersonal ? 'No posts yet.' : 'No posts available'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ RENDER USER LIST MODAL */}
      <UserListModal 
        isOpen={userListModal.isOpen} 
        title={userListModal.title} 
        users={userList} 
        isLoading={userListLoading} 
        onClose={() => setUserListModal({ ...userListModal, isOpen: false })} 
      />

      {selectedPost !== null && <PostModal post={selectedPost || null} mode={postModalMode} onClose={handlePostClose} onSave={handlePostSave} />}
      {showOnboardingModal && <OnboardingModal isOpen={showOnboardingModal} onClose={handleOnboardingClose} existingData={profile} />}
    </div>
  );
}