import { useState, useEffect } from 'react';
import { Hand, ThumbsUp, MessageSquare, Eye } from 'lucide-react';
import PostModal from '../ReUsable/PostModal/PostModal';

// PostCard Component
function PostCard({ post, onClick }) {
  return (
    <div 
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {post.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Author */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {(() => {
            const { firstName, lastName, username, initials } = post.author || {};
            if (initials) return initials;
            if (firstName && lastName) return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
            if (firstName) return firstName.charAt(0).toUpperCase();
            if (lastName) return lastName.charAt(0).toUpperCase();
            if (username) return username.charAt(0).toUpperCase();
            return 'U';
          })()}
        </div>
        <span className="text-sm font-medium text-gray-900">
          {(() => {
            const { firstName, lastName, username } = post.author || {};
            if (firstName && lastName) return `${firstName} ${lastName}`;
            return firstName || lastName || username || 'Unknown User';
          })()}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        {post.title}
      </h3>

      {/* Image */}
      {post.image && (
        <img 
          src={post.image} 
          alt={post.title}
          className="w-full h-48 object-cover rounded-xl mb-4"
        />
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-gray-600 text-sm">
        <div className="flex items-center gap-1">
          <ThumbsUp className="w-4 h-4" />
          <span>{post.likes || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare className="w-4 h-4" />
          <span>{post.comments || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span>{post.views || 0}</span>
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
          <MessageSquare className="w-3 h-3" />
          <span>{idea.comments}</span>
        </div>
        <div>
          <span>{idea.views} views</span>
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

  const ideas = [
    {
      title: 'REST and GraphQL',
      description: "What's the difference between REST a...",
      comments: 0,
      views: 9
    },
    {
      title: 'Leaked Password',
      description: 'How can I tell if my password has be....',
      comments: 3,
      views: 7
    },
    {
      title: 'Best Font for mobile apps',
      description: 'Which fonts work best for mobile app ....',
      comments: 2,
      views: 9
    }
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
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error("❌ Failed to fetch profile:", err);
      if (err.message.includes('unauthorized') || err.message.includes('token')) {
        window.location.href = '/login';
      }
    }
  };

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://itecony-neriva-backend.onrender.com/api/posts?page=1&limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
    fetchPosts();
    fetchTopPosts();
    setShowCreateModal(false);
  };

  const userName = profile?.firstName || profile?.username || 'USER';
  const userInterests = Array.isArray(profile?.interests) ? profile.interests : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Hand className="w-6 h-6" />
            <h1 className="text-2xl font-bold text-gray-900">
              WELCOME {userName.toUpperCase()}
            </h1>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">Post Ideas, Innovations. Ask Questions and Get solutions</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="text-black text-sm px-4 py-2 bg-white rounded-xl hover:text-blue-700 font-semibold border border-gray-200"
              >
                Ideas? ...
              </button>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-sm text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                Post Idea
              </button>
            </div>
          </div>
        </div>

        {/* Flex Layout: Main Feed + Right Sidebar */}
        <div className="flex gap-6">
          {/* Main Feed */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onClick={() => setSelectedPost(post)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-gray-500">No posts yet. Be the first to create one!</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                >
                  Create First Post
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-80 flex-shrink-0 space-y-6">
            {/* Grow Card */}
            <div className="relative h-40 rounded-xl overflow-hidden group cursor-pointer">
              <img 
                src="/assets/grow-communities.png" 
                alt="Grow" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all"></div>
              <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Grow</span>
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                </div>
                <div>
                  <span className="text-sm">Explore communities...</span>
                </div>
              </div>
            </div>

            {/* Top Posts */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-3">Top Posts</h3>
              <div className="space-y-3">
                {topPosts.slice(0, 3).map((post) => (
                  <div 
                    key={post.id}
                    className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => setSelectedPost(post)}
                  >
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{post.likes || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{post.comments || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-3 w-full text-center">
                View more
              </button>
            </div>

            {/* Top Ideas */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-3">Top Ideas for You</h3>
              <p className="text-xs text-gray-600 mb-3">
                {userInterests.length > 0 
                  ? 'Based on your interests' 
                  : 'Popular from the community'}
              </p>
              <div className="space-y-2">
                {ideas.map((idea, index) => (
                  <IdeaCard key={index} idea={idea} onClick={() => {}} />
                ))}
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-3 w-full text-center">
                View more
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Post Modal */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          mode="view"
          onClose={() => setSelectedPost(null)}
          onSave={handlePostSaved}
        />
      )}

      {/* Create Post Modal */}
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