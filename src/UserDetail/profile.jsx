import { useState, useEffect } from 'react';
import { MessageCircle, MapPin, Briefcase, Plus, ChevronLeft, ChevronRight, Calendar, Settings, UserPlus, UserCheck, Heart, X, GraduationCap, ShieldCheck } from 'lucide-react'; 
import PostModal from '../Pages/User/ReUsable/PostModal/PostModal';
import OnboardingModal from '../UserDetail/UserOnboarding';
import { useNavigate } from 'react-router-dom';

// ✅ HELPER: Fix Image URLs
const getImageUrl = (img) => {
  if (!img) return null;
  const src = typeof img === 'string' ? img : img.image_url;
  if (!src) return null;
  if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:')) return src;
  return `https://itecony-neriva-backend.onrender.com/${src}`;
};

// ✅ HELPER: Get Initials
const getInitials = (user) => {
  if (!user) return 'U';
  const first = user.firstName?.[0] || '';
  const last = user.lastName?.[0] || '';
  return (first + last).toUpperCase() || user.username?.[0]?.toUpperCase() || 'U';
};

// ✅ UserListModal
function UserListModal({ title, users, isOpen, onClose, isLoading, navigate }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto p-2 flex-1">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-8 text-gray-500">No users found.</div>
          ) : (
            <div className="space-y-1">
              {users.map((user) => {
                const avatarUrl = getImageUrl(user.avatar || user.profileImage || user.profilePicture);
                return (
                  <div 
                    key={user.id || user._id} 
                    onClick={() => {
                      onClose(); 
                      navigate(`/profile/${user.id || user._id}`);
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer"
                  >
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt={user.firstName} 
                        className="w-10 h-10 rounded-full object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm border border-teal-200">
                        {getInitials(user)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 text-sm group-hover:text-teal-600 transition-colors">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">@{user.username || 'user'}</p>
                    </div>
                  </div>
                );
              })}
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
  
  // Follow System
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Mentor Verification
  const [isVerifiedMentor, setIsVerifiedMentor] = useState(false);

  // Modals
  const [userListModal, setUserListModal] = useState({ isOpen: false, title: '', type: '' });
  const [userList, setUserList] = useState([]);
  const [userListLoading, setUserListLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postModalMode, setPostModalMode] = useState('view');
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    setIsVerifiedMentor(false); 

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

      if (!response.ok) throw new Error(`Profile fetch failed (${response.status})`);
      
      const resData = await response.json();
      const profileData = resData.data || resData;
      setProfile(profileData);

      console.log("🔍 INSPECTING USER PROFILE:", {
        id: profileData.id || profileData._id,
        name: profileData.firstName,
        role: profileData.role,
        is_mentor: profileData.is_mentor
      });

      const targetId = profileData._id || profileData.id;
      
      if (targetId) {
        await Promise.all([
            fetchFollowStats(targetId),
            fetchPosts(targetId),
            checkMentorStatus(targetId),
            userId && !isPersonal ? checkFollowStatus(targetId) : Promise.resolve()
        ]);
      }

    } catch (err) {
      console.error("Fetch Profile Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const checkMentorStatus = async (targetId) => {
    console.log(`🌐 MENTOR CHECK: Pinging /api/mentors/${targetId}...`);
    try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`https://itecony-neriva-backend.onrender.com/api/mentors/${targetId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            console.log("✅ VERIFIED: Mentor profile exists");
            setIsVerifiedMentor(true);
        }
    } catch (e) {
        console.warn("⚠️ Mentor check failed:", e);
    }
  };

  const checkFollowStatus = async (targetId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `https://itecony-neriva-backend.onrender.com/api/users/${targetId}/is-following`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const result = await response.json();
        const status = result.data?.isFollowing || result.isFollowing;
        setIsFollowing(!!status);
      }
    } catch (err) {
      console.warn("Could not verify follow status", err);
    }
  };

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
        const response = await fetch(
            `https://itecony-neriva-backend.onrender.com/api/users/${targetId}/${type}?limit=100`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (response.ok) {
            const result = await response.json();
            setUserList(result.data || []); 
        }
    } catch (error) {
        console.error(`Failed to fetch ${type}:`, error);
    } finally {
        setUserListLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!profile) return;
    const targetId = profile._id || profile.id;
    const token = localStorage.getItem('authToken');
    setFollowLoading(true);
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
      if (response.status === 409) {
          setIsFollowing(true); 
          fetchFollowStats(targetId); 
          return;
      }
      if (!response.ok) throw new Error("Action failed");
      fetchFollowStats(targetId);
    } catch (err) {
      setIsFollowing(prevIsFollowing);
      fetchFollowStats(targetId);
    } finally {
      setFollowLoading(false);
    }
  };

  const fetchPosts = async (profileId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `https://itecony-neriva-backend.onrender.com/api/posts?userId=${profileId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        let userPosts = Array.isArray(data) ? data : (data.posts || data.data || []);
        setPosts(userPosts);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
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
    
    // Ensure we get the ID correctly
    const targetId = profile._id || profile.id;
    
    try {
      const token = localStorage.getItem('authToken');
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
      const conversation = data.conversation || data;
      
      // ✅ FIX: Navigate to the correct full path
      // This matches the route defined in App.jsx
      navigate(`/dreamboard/networking/messages/${conversation.id}`);
      
    } catch (err) {
      console.error('Error initiating conversation:', err);
    }
  };

  const handleAddInterest = () => setShowOnboardingModal(true);
  const handleOnboardingClose = () => { setShowOnboardingModal(false); fetchProfile(); };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-teal-500 animate-spin"></div></div>;
  if (error || !profile) return <div className="flex items-center justify-center min-h-screen text-red-600">{error || 'Profile not found'}</div>;

  const userInterests = profile?.interests || [];
  const isMentor = isVerifiedMentor || profile.role === 'mentor' || profile.role === 'admin' || profile.is_mentor === true;
  const joinDate = profile?.created_at || profile?.joinDate;
  
  // ✅ Profile Avatar Logic (Main Profile)
  const profileAvatarUrl = getImageUrl(profile.avatar || profile.profileImage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="h-40 bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-700"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-16 mb-6">
              
              {/* ✅ Profile Image or Initials */}
              <div className="flex items-end gap-4">
                {profileAvatarUrl ? (
                  <img
                    src={profileAvatarUrl}
                    alt={profile.firstName}
                    className="w-32 h-32 rounded-xl border-4 border-white shadow-lg object-cover bg-white"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-xl border-4 border-white shadow-lg bg-teal-600 flex items-center justify-center text-4xl font-bold text-white">
                    {getInitials(profile)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {profile?.firstName || 'User'} {profile?.lastName || ''}
                    </h1>
                    {isMentor && (
                      <span className="flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full text-xs font-bold border border-teal-200">
                        <ShieldCheck className="w-3 h-3" /> Mentor
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-lg">{profile?.title || 'Professional'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {isPersonal ? (
                  <>
                    {isMentor && (
                        <button onClick={() => navigate('/mentor/profile')} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors font-medium shadow-sm">
                            <GraduationCap className="w-5 h-5" /> <span>Mentor Dashboard</span>
                        </button>
                    )}
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="Edit profile">
                      <Settings className="w-5 h-5" /> <span>Edit</span>
                    </button>
                  </>
                ) : (
                  <>
                    {isMentor && (
                        <button onClick={() => navigate(`/mentor/${profile._id || profile.id}`)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-110 rounded-lg transition-colors font-medium shadow-md">
                            <GraduationCap className="w-5 h-5" /> <span>View Mentorship</span>
                        </button>
                    )}
                    {isFollowing ? (
                      <div className="flex gap-2">
                        <button onClick={handleMessaging} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-b from-teal-500 via-cyan-600 to-blue-700 hover:brightness-110 text-white rounded-lg transition-colors font-semibold shadow-sm">
                          <MessageCircle className="w-5 h-5" /> <span>Message</span>
                        </button>
                        <button onClick={handleFollowToggle} disabled={followLoading} className="flex items-center justify-center w-10 px-0 bg-white border border-gray-300 text-gray-500 hover:text-red-500 hover:border-red-300 rounded-lg transition-colors">
                          <UserCheck className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={handleFollowToggle} disabled={followLoading} className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold shadow-sm">
                        <UserPlus className="w-5 h-5" /> <span>Follow</span>
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
              {joinDate && <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-teal-600" /><span>Joined {new Date(joinDate).toLocaleDateString()}</span></div>}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-gray-200">
              <div className="text-center">
                <div className="font-bold text-lg text-teal-600">{posts.length}</div>
                <div className="text-sm text-gray-600">Posts</div>
              </div>
              <button onClick={() => handleShowStats('followers')} className="text-center hover:bg-gray-50 rounded-lg transition-colors py-1 group">
                <div className="font-bold text-lg text-teal-600 group-hover:text-teal-700">{followStats.followers}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </button>
              <button onClick={() => handleShowStats('following')} className="text-center hover:bg-gray-50 rounded-lg transition-colors py-1 group">
                <div className="font-bold text-lg text-teal-600 group-hover:text-teal-700">{followStats.following}</div>
                <div className="text-sm text-gray-600">Following</div>
              </button>
            </div>

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
                  const author = post.author || post.userId;
                  const authorName = (author.firstName) ? `${author.firstName} ${author.lastName || ''}` : (author.username || 'User');
                  const postAvatarUrl = getImageUrl(author.avatar || author.profileImage);
                  
                  const displayImage = (post.images && post.images.length > 0) ? getImageUrl(post.images[0]) : getImageUrl(post.image);
                  const commentCount = Array.isArray(post.comments) ? post.comments.length : (post.comments || 0);

                  return (
                    <div key={post.id || post._id} onClick={() => handleViewPost(post)} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-center gap-3 mb-4">
                        {/* ✅ Post Author Avatar / Initials */}
                        {postAvatarUrl ? (
                          <img src={postAvatarUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
                        ) : (
                          <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {getInitials(author)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{authorName}</p>
                          <p className="text-xs text-gray-500">{post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recently'}</p>
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

      <UserListModal 
        isOpen={userListModal.isOpen} 
        title={userListModal.title} 
        users={userList} 
        isLoading={userListLoading} 
        onClose={() => setUserListModal({ ...userListModal, isOpen: false })}
        navigate={navigate} 
      />

      {selectedPost !== null && <PostModal post={selectedPost || null} mode={postModalMode} onClose={handlePostClose} onSave={handlePostSave} />}
      {showOnboardingModal && <OnboardingModal isOpen={showOnboardingModal} onClose={handleOnboardingClose} existingData={profile} />}
    </div>
  );
}