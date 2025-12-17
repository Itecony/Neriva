import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Eye, Hand } from 'lucide-react'; // Switched ThumbsUp to Heart for better UI
import PostModal from '../ReUsable/PostModal/PostModal';

// --- Helper to fix image URLs ---
const getImageUrl = (img) => {
  if (!img) return null;
  const src = typeof img === 'string' ? img : img.image_url;
  if (!src) return null;
  
  if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }
  // Prepend backend URL for relative paths
  return `https://itecony-neriva-backend.onrender.com/${src}`;
};

// --- PostCard Component ---
function PostCard({ post, onClick }) {
  // Local state for optimistic interactions
  const [isLiked, setIsLiked] = useState(false); // In a real app, check post.isLiked from backend
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  // Safe Comment Count
  const commentCount = Array.isArray(post.comments) 
    ? post.comments.length 
    : (post.comments || 0);

  // Author Data Helper
  const author = post.author || {};
  const authorId = author.id || author._id || post.user_id;
  const initials = author.initials || 
    (author.firstName ? `${author.firstName[0]}${author.lastName?.[0] || ''}` : 'U');
  const authorName = author.firstName 
    ? `${author.firstName} ${author.lastName || ''}` 
    : (author.username || 'Unknown User');

  // Image Helper: Get first image from array or fallback to legacy single string
  const displayImage = (post.images && post.images.length > 0) 
    ? getImageUrl(post.images[0]) 
    : getImageUrl(post.image);

  // Handle Like (Stop propagation prevents modal opening)
  const handleLike = async (e) => {
    e.stopPropagation();
    
    // Optimistic Update
    const prevLiked = isLiked;
    const prevCount = likeCount;
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      const token = localStorage.getItem('authToken');
      await fetch(`https://itecony-neriva-backend.onrender.com/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Like failed", err);
      // Revert if failed
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    if (authorId) {
      window.location.href = `/profile/${authorId}`;
    }
  };

  return (
    <div 
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
      onClick={onClick}
    >
      {/* Author Header */}
      <div className="flex items-center justify-between mb-4">
        <div 
          className="flex items-center gap-3 group" 
          onClick={handleProfileClick}
        >
          <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:ring-2 ring-teal-200 transition-all">
            {initials.toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
              {authorName}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(post.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
        {post.title}
      </h3>
      
      {/* Text Preview (stripping HTML tags for safety) */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {post.content?.replace(/<[^>]*>/g, '')}
      </p>

      {/* Image Display */}
      {displayImage && (
        <div className="mb-4 rounded-xl overflow-hidden h-64 bg-gray-100">
          <img 
            src={displayImage} 
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            onError={(e) => e.target.style.display = 'none'} 
          />
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {post.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions / Stats */}
      <div className="flex items-center gap-6 pt-2 border-t border-gray-100">
        {/* Like Button */}
        <button 
          onClick={handleLike}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likeCount}</span>
        </button>

        {/* Comment Indicator */}
        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
          <MessageCircle className="w-5 h-5" />
          <span>{commentCount}</span>
        </div>
      </div>
    </div>
  );
}

// Compact Idea Card
function IdeaCard({ idea, onClick }) {
  return (
    <div 
      className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-1 text-gray-600 text-xs min-w-[50px]">
        <div className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3" />
          <span>{idea.comments}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span>{idea.views}</span>
        </div>
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-blue-600 mb-1 hover:underline line-clamp-1">
          {idea.title}
        </h4>
        <p className="text-xs text-gray-600 line-clamp-2">
          {idea.description}
        </p>
      </div>
    </div>
  );
}

// Main Dreamboard Component
export default function Dreamboard() {
  const [profile, setProfile] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Static ideas data
  const ideas = [
    { title: 'REST and GraphQL', description: "What's the difference between REST a...", comments: 0, views: 9 },
    { title: 'Leaked Password', description: 'How can I tell if my password has be....', comments: 3, views: 7 },
    { title: 'Best Font for mobile apps', description: 'Which fonts work best for mobile app ....', comments: 2, views: 9 }
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
        // Robust check for posts array location
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
      // Create safe Author object if missing
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
  const userInterests = Array.isArray(profile?.interests) ? profile.interests : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
       { /* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
             <button
              onClick={() => window.location.href = '/profile'}
              className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
            >
              <img 
                src="/assets/Image(1).png" 
                alt="Profile"
                className="w-10 h-10 rounded-lg object-contain"
              />
            </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {userName}
                </h1>
                <p className="text-gray-500 text-sm">Here's what's happening in your community</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-600 font-medium">Have an idea or question? Share it with the world!</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm flex items-center gap-2 justify-center"
              >
                <Hand className="w-4 h-4" />
                Post Idea
              </button>
            </div>
          </div>

          {/* Flex Layout: Main Feed + Right Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Feed */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onClick={() => setSelectedPost(post)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">No posts yet. Be the first to create one!</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Create Post
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
            
            {/* Top Posts Widget */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500 fill-current" /> 
                Trending Posts
              </h3>
              
              <div className="space-y-4">
                {topPosts.slice(0, 3).map((post) => {
                  const commentCount = Array.isArray(post.comments) ? post.comments.length : (post.comments || 0);
                  const img = (post.images && post.images.length > 0) ? getImageUrl(post.images[0]) : getImageUrl(post.image);
                  
                  // Safe author access
                  const author = post.author || {};
                  const authorName = author.firstName || author.username || 'User';

                  return (
                    <div 
                      key={post.id}
                      className="flex gap-3 group cursor-pointer"
                      onClick={() => setSelectedPost(post)}
                    >
                      {/* Thumbnail Image */}
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                        {img ? (
                          <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                            <span className="text-xs">No Img</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors mb-1">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{authorName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {post.likes || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
              
            {/* Top Ideas Widget */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-1">Suggested Ideas</h3>
              <p className="text-xs text-gray-500 mb-4">Based on your interests</p>
              
              <div className="space-y-1">
                {ideas.map((idea, index) => (
                  <IdeaCard key={index} idea={idea} onClick={() => {}} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          mode="view"
          onClose={() => setSelectedPost(null)}
          onSave={handlePostSaved}
        />
      )}

      {showCreateModal && (
        <PostModal
          mode="create"
          onClose={() => setShowCreateModal(false)}
          onSave={handlePostSaved}
        />
      )}
    </div>
  );
}