import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Eye, Hand, Sparkles, TrendingUp, Search, Compass, X } from 'lucide-react';
import PostModal from '../ReUsable/PostModal/PostModal';

// --- Helper to fix image URLs ---
const getImageUrl = (img) => {
  if (!img) return null;
  const src = typeof img === 'string' ? img : img.image_url;
  if (!src) return null;
  
  if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }
  return `https://itecony-neriva-backend.onrender.com/${src}`;
};

// --- PostCard Component ---
function PostCard({ post, onClick }) {
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  const commentCount = Array.isArray(post.comments) ? post.comments.length : (post.comments || 0);
  const author = post.author || {};
  const authorId = author.id || author._id || post.user_id;
  const initials = author.initials || (author.firstName ? `${author.firstName[0]}${author.lastName?.[0] || ''}` : 'U');
  const authorName = author.firstName ? `${author.firstName} ${author.lastName || ''}` : (author.username || 'Unknown User');

  const displayImage = (post.images && post.images.length > 0) ? getImageUrl(post.images[0]) : getImageUrl(post.image);

  // Check Server Status on Mount
  useEffect(() => {
    let isMounted = true;

    const checkServerStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`https://itecony-neriva-backend.onrender.com/api/posts/${post.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok && isMounted) {
          const data = await response.json();
          const serverPost = data.post || data; 

          console.log(`[Post ${post.id}] Sync Response:`, {
            server_is_liked: serverPost.is_liked,
            server_likes: serverPost.likes,
            local_is_liked: isLiked
          });

          if (serverPost.is_liked !== undefined) {
            setIsLiked(serverPost.is_liked);
          }
          if (serverPost.likes !== undefined) {
            setLikeCount(serverPost.likes);
          }
        }
      } catch (err) {
        console.warn(`[Post ${post.id}] Background sync failed:`, err);
      }
    };

    checkServerStatus();

    return () => { isMounted = false; };
  }, [post.id]); 

  const handleLike = async (e) => {
    e.stopPropagation();

    const previousLiked = isLiked;
    const previousCount = likeCount;

    // Optimistic Update
    const nextIsLiked = !isLiked;
    const nextLikeCount = nextIsLiked ? likeCount + 1 : Math.max(0, likeCount - 1);

    setIsLiked(nextIsLiked);
    setLikeCount(nextLikeCount);

    try {
      const token = localStorage.getItem('authToken');
      const method = nextIsLiked ? 'POST' : 'DELETE';

      const response = await fetch(`https://itecony-neriva-backend.onrender.com/api/posts/${post.id}/like`, {
        method: method,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message === "You already liked this post") {
          console.warn(`[Post ${post.id}] Mismatch fix: Force TRUE`);
          setIsLiked(true);
          if (!previousLiked) setLikeCount(previousCount + 1);
          return;
        }
        
        if (data.message === "You have not liked this post") {
          console.warn(`[Post ${post.id}] Mismatch fix: Force FALSE`);
          setIsLiked(false);
          if (previousLiked) setLikeCount(Math.max(0, previousCount - 1));
          return;
        }

        throw new Error(data.message);
      }

      if (data.likes !== undefined) setLikeCount(data.likes);

    } catch (err) {
      console.error(`[Post ${post.id}] Like failed:`, err);
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    }
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    if (authorId) {
      window.location.href = `/profile/${authorId}`;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100" onClick={onClick}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 group" onClick={handleProfileClick}>
          <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-all">
            {initials.toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{authorName}</span>
            <span className="text-xs text-gray-500">{new Date(post.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.content?.replace(/<[^>]*>/g, '')}</p>
      {displayImage && (
        <div className="mb-4 rounded-xl overflow-hidden h-64 bg-gray-100">
          <img src={displayImage} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" onError={(e) => e.target.style.display = 'none'} />
        </div>
      )}
      {post.tags && post.tags.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {post.tags.map((tag, index) => (
            <span key={index} className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">#{tag}</span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-6 pt-2 border-t border-gray-100">
        <button onClick={handleLike} className={`flex items-center gap-2 text-sm font-medium transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likeCount}</span>
        </button>
        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
          <MessageCircle className="w-5 h-5" />
          <span>{commentCount}</span>
        </div>
      </div>
    </div>
  );
}

// --- Compact Idea Card ---
function IdeaCard({ idea, onClick }) {
  return (
    <div className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer" onClick={onClick}>
      <div className="flex flex-col items-center gap-1 text-gray-600 text-xs min-w-[50px]">
        <div className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /><span>{idea.comments}</span></div>
        <div className="flex items-center gap-1"><Eye className="w-3 h-3" /><span>{idea.views}</span></div>
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-blue-600 mb-1 hover:underline line-clamp-1">{idea.title}</h4>
        <p className="text-xs text-gray-600 line-clamp-2">{idea.description}</p>
      </div>
    </div>
  );
}

// --- Sub-Component: Sidebar Content ---
const SidebarContent = ({ activeTab, setActiveTab, topPosts, ideas, onPostClick }) => (
  <div className="space-y-4">
    <div className="flex p-1 bg-gray-100 rounded-xl mb-4 relative">
      <button 
        onClick={() => setActiveTab('trending')}
        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
          activeTab === 'trending' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <TrendingUp className="w-4 h-4" /> Trending
      </button>
      <button 
        onClick={() => setActiveTab('ideas')}
        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
          activeTab === 'ideas' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Sparkles className="w-4 h-4" /> Ideas
      </button>
    </div>

    {activeTab === 'trending' ? (
      topPosts.length > 0 ? (
        topPosts.slice(0, 5).map((post) => {
          const img = (post.images && post.images.length > 0) ? getImageUrl(post.images[0]) : getImageUrl(post.image);
          const author = post.author || {};
          const authorName = author.firstName || author.username || 'User';

          return (
            <div key={post.id} className="flex gap-3 group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors" onClick={() => onPostClick(post)}>
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                {img ? (
                  <img src={img} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50"><span className="text-[10px]">No Img</span></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors mb-1">{post.title}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="truncate max-w-[80px]">{authorName}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-500 fill-current" /> {post.likes || 0}</span>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-8 text-gray-400 text-sm">No trending posts yet</div>
      )
    ) : (
      ideas.map((idea, index) => (
        <IdeaCard key={index} idea={idea} onClick={() => {}} />
      ))
    )}
    
    <div className="mt-4 pt-3 border-t border-gray-100 text-center">
      <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline">
        View All {activeTab === 'trending' ? 'Posts' : 'Ideas'}
      </button>
    </div>
  </div>
);

// --- Main Component ---
export default function Dreamboard() {
  const [profile, setProfile] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMobileExplore, setShowMobileExplore] = useState(false);
  const [posts, setPosts] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [sidebarTab, setSidebarTab] = useState('trending');

  const ideas = [
    { title: 'REST vs GraphQL', description: "What's the difference between REST and GraphQL APIs...", comments: 5, views: 120 },
    { title: 'Leaked Password Check', description: 'How can I tell if my password has been compromised in a breach...', comments: 3, views: 85 },
    { title: 'Mobile Fonts Guide', description: 'Which fonts work best for mobile app readability on small screens...', comments: 8, views: 200 },
    { title: 'React Performance', description: 'Tips for optimizing large React applications using memo and useCallback...', comments: 12, views: 340 },
    { title: 'Design Systems 101', description: 'How to start building a consistent design system for your startup...', comments: 6, views: 150 }
  ];

  useEffect(() => {
    fetchProfile();
    fetchPosts();
    fetchTopPosts();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://itecony-neriva-backend.onrender.com/api/users/profile/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setProfile(await response.json());
      }
    } catch (err) {
      console.error("❌ Failed to fetch profile:", err);
    }
  };

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://itecony-neriva-backend.onrender.com/api/posts?page=1&limit=10', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        let postsArray = [];
        if (Array.isArray(data)) postsArray = data;
        else if (Array.isArray(data.posts)) postsArray = data.posts;
        else if (Array.isArray(data.data)) postsArray = data.data;
        setPosts(postsArray);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopPosts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://itecony-neriva-backend.onrender.com/api/posts/top?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTopPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch top posts:', error);
    }
  };
  
  const handlePostSaved = (newPost) => {
    setPosts((prevPosts) => {
      const postWithAuthor = {
        ...newPost,
        author: newPost.author || profile || { firstName: 'You', username: 'Me' },
        likes: 0,
        comments: 0,
        views: 0
      };
      return [postWithAuthor, ...prevPosts];
    });
    setShowCreateModal(false);
    fetchPosts();
    fetchTopPosts();
  };

  const userName = profile?.firstName || profile?.username || 'USER';
  const userInitials = profile?.firstName 
    ? `${profile.firstName[0]}${profile.lastName?.[0] || ''}`.toUpperCase() 
    : (profile?.username?.[0] || 'U').toUpperCase();
  const userImage = profile?.avatar || profile?.profileImage;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
       
        {/* --- Header Section (Fixed Mobile Layout) --- */}
        <div className="mb-5">
            
            {/* Top Row: Profile, Text, and Actions */}
            <div className="flex items-center justify-between gap-3 mb-6">
              
              {/* Left: Profile & Welcome */}
              <div className="flex items-center gap-3 flex-1">
                
                {/* Profile Image - Fixed Size */}
                <button 
                  onClick={() => window.location.href = '/profile'} 
                  className="flex-shrink-0 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all overflow-hidden"
                >
                  {userImage ? (
                    <img 
                      src={userImage} 
                      alt="Profile" 
                      className="w-10 h-10 md:w-12 md:h-12 object-cover" 
                    />
                  ) : (
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 flex items-center justify-center text-white font-bold text-sm md:text-base">
                      {userInitials}
                    </div>
                  )}
                </button>
                
                {/* Text - Wraps properly now */}
                <div className="flex flex-col">
                  <h1 className="text-lg md:text-2xl font-bold text-gray-900 leading-tight break-words">
                    Welcome back, {userName}
                  </h1>
                  <p className="text-gray-500 text-xs md:text-sm leading-snug mt-0.5">
                    Here's what's happening
                  </p>
                </div>
              </div>

              {/* Right: Search (Desktop) OR Explore Button (Mobile) */}
              {/* flex-shrink-0 ensures the button never shrinks or misaligns */}
              <div className="flex items-center gap-2 flex-shrink-0"> 
                
                {/* Search Bar: Hidden on Mobile */}
                <div className="relative hidden md:block w-64 lg:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search thoughts, ideas..." 
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>

                {/* Explore Button: Visible ONLY on Mobile */}
                <button 
                  onClick={() => setShowMobileExplore(true)}
                  className="md:hidden p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  <Compass className="w-5 h-5" />
                </button>

              </div>
            </div>
            
            {/* Create Post Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-600 font-medium text-sm sm:text-base">Have an idea or question? Share it with the world!</p>
              <button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm flex items-center gap-2 justify-center">
                <Hand className="w-4 h-4" /> Post Idea
              </button>
            </div>
        </div>

        {/* --- Main Layout --- */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Feed */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto"></div></div>
            ) : posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">No posts yet. Be the first to create one!</p>
                <button onClick={() => setShowCreateModal(true)} className="px-6 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors">Create Post</button>
              </div>
            )}
          </div>

          {/* Unified Right Sidebar (Desktop Only) */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm sticky top-6">
              <SidebarContent 
                activeTab={sidebarTab} 
                setActiveTab={setSidebarTab} 
                topPosts={topPosts} 
                ideas={ideas} 
                onPostClick={setSelectedPost} 
              />
            </div>
          </div>

        </div>
      </div>

      {/* --- MOBILE EXPLORE DRAWER (Overlay) --- */}
      {showMobileExplore && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-right duration-200 md:hidden">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" /> Explore
            </h2>
            <button onClick={() => setShowMobileExplore(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* 1. Mobile Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search ideas, posts, people..." 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {/* 2. Sidebar Content (Reused) */}
            <SidebarContent 
              activeTab={sidebarTab} 
              setActiveTab={setSidebarTab} 
              topPosts={topPosts} 
              ideas={ideas} 
              onPostClick={(post) => {
                setSelectedPost(post);
                setShowMobileExplore(false);
              }} 
            />
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedPost && <PostModal post={selectedPost} mode="view" onClose={() => setSelectedPost(null)} onSave={handlePostSaved} />}
      {showCreateModal && <PostModal mode="create" onClose={() => setShowCreateModal(false)} onSave={handlePostSaved} />}
    </div>
  );
}