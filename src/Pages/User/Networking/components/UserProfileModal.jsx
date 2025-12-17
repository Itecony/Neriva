import { useState, useEffect } from 'react';
import { MapPin, Briefcase, User, Users } from 'lucide-react';

export default function UserProfileModal({ user, isOpen, onClose, isGroup = false }) {
  const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });
  const [loadingStats, setLoadingStats] = useState(false);

  // Safe ID check
  const userId = user?.id || user?._id;

  // Fetch Stats when modal opens
  useEffect(() => {
    if (isOpen && userId && !isGroup) {
      fetchStats();
    }
  }, [isOpen, userId, isGroup]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // 1. Fetch Follower/Following Counts
      const followRes = await fetch(
        `https://itecony-neriva-backend.onrender.com/api/users/${userId}/follower-count`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      // 2. Fetch Posts to get Count
      const postsRes = await fetch(
        `https://itecony-neriva-backend.onrender.com/api/posts?userId=${userId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const newStats = { followers: 0, following: 0, posts: 0 };

      if (followRes.ok) {
        const data = await followRes.json();
        // Handle various response structures (data wrapper or direct)
        const statsData = data.data || data;
        newStats.followers = parseInt(statsData.followers || statsData.followersCount || 0);
        newStats.following = parseInt(statsData.following || statsData.followingCount || 0);
      }

      if (postsRes.ok) {
        const data = await postsRes.json();
        // Check if array or paginated object
        let postsArray = [];
        if (Array.isArray(data)) postsArray = data;
        else if (Array.isArray(data.posts)) postsArray = data.posts;
        else if (Array.isArray(data.data)) postsArray = data.data;
        
        newStats.posts = postsArray.length;
      }

      setStats(newStats);

    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (!isOpen || !user) return null;

  const userInterests = Array.isArray(user.interests) ? user.interests : [];

  // Helper for Initials
  const getInitials = () => {
    if (isGroup) return 'GR';
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase() || user.username?.[0]?.toUpperCase() || 'U';
  };

  // Helper for Name
  const displayName = isGroup 
    ? user.name 
    : (user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username || 'Unknown User');

  // Handle backdrop click to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
      >
        
        {/* Content Area */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {!isGroup ? (
            <>
              {/* Avatar & Basic Info */}
              <div className="flex flex-col items-center text-center pb-2">
                <div className="relative mb-3">
                  {user.profileImage || user.profilePicture ? (
                    <img
                      src={user.profileImage || user.profilePicture}
                      alt={user.firstName}
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 shadow-sm"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                      {getInitials()}
                    </div>
                  )}
                </div>
                
                <h3 className="font-bold text-xl text-gray-900">
                  {displayName}
                </h3>
                {user.username && <p className="text-sm text-gray-500 font-medium">@{user.username}</p>}
              </div>

              {/* ✅ LIVE STATS GRID */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100">
                <div className="text-center">
                  <div className={`font-bold text-teal-600 text-lg ${loadingStats ? 'animate-pulse bg-gray-200 w-8 h-6 mx-auto rounded' : ''}`}>
                    {loadingStats ? '' : stats.followers}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">Followers</div>
                </div>
                <div className="text-center border-x border-gray-100">
                  <div className={`font-bold text-teal-600 text-lg ${loadingStats ? 'animate-pulse bg-gray-200 w-8 h-6 mx-auto rounded' : ''}`}>
                    {loadingStats ? '' : stats.following}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">Following</div>
                </div>
                <div className="text-center">
                  <div className={`font-bold text-teal-600 text-lg ${loadingStats ? 'animate-pulse bg-gray-200 w-8 h-6 mx-auto rounded' : ''}`}>
                    {loadingStats ? '' : stats.posts}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">Posts</div>
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <div className="text-center">
                  <p className="text-sm text-gray-700 leading-relaxed">{user.bio}</p>
                </div>
              )}

              {/* Contact Info */}
              {(user.location || user.company) && (
                <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-xl">
                  {user.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-teal-500" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.company && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-4 h-4 text-teal-500" />
                      <span>{user.company}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Interests */}
              {userInterests.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {userInterests.slice(0, 5).map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium border border-teal-100"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => window.location.href = `/profile/${userId}`}
                  className="w-full px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors text-sm font-semibold shadow-sm hover:shadow-md"
                >
                  View Full Profile
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-semibold"
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Group Info */}
              <div className="text-center pb-4 border-b border-gray-100">
                <div className="w-16 h-16 mx-auto bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mb-3">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-1">{user.name}</h3>
                <p className="text-sm text-gray-500 font-medium">{user.memberCount} members</p>
              </div>

              {/* Description */}
              {user.description && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-sm text-gray-700 text-center">{user.description}</p>
                </div>
              )}

              {/* Members Preview */}
              {user.members && user.members.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Members</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {user.members.map((member) => (
                      <div key={member.id || member._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        {member.profileImage ? (
                           <img src={member.profileImage} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                           <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold">
                             {(member.firstName?.[0] || 'U')}
                           </div>
                        )}
                        <span className="text-sm font-medium text-gray-700">
                          {member.firstName} {member.lastName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-semibold mt-2"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}