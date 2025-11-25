import { useState, useEffect } from 'react';
import { ThumbsUp, MessageSquare, Eye } from 'lucide-react';
import PostModal from '../ReUsable/PostModal/PostModal'; // Adjust path

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
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Author */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
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

// TopPostCard Component (Compact)
function TopPostCard({ post, onClick }) {
  return (
    <div 
      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex gap-2 mb-3">
          {post.tags.slice(0, 2).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Author */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
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
      <h4 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2">
        {post.title}
      </h4>

      {/* Stats */}
      <div className="flex items-center gap-3 text-gray-600 text-xs">
        <div className="flex items-center gap-1">
          <ThumbsUp className="w-3 h-3" />
          <span>{post.likes || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          <span>{post.comments || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span>{post.views || 0}</span>
        </div>
      </div>
    </div>
  );
}

// Main Dreamboard Component
export default function Dreamboard() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    fetchTopPosts();
  }, []);

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
        console.log('📦 Posts data:', data);
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
        console.log('📦 Top posts data:', data);
        setTopPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch top posts:', error);
    }
  };

  const handlePostSaved = (newPost) => {
    // Refresh posts after creating/editing
    fetchPosts();
    fetchTopPosts();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-orange-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">All posts</h2>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-2xl">+</span>
                <span className="font-medium">Ask a question</span>
              </button>
            </div>

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

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Top posts</h2>
            <div className="space-y-4">
              {topPosts.length > 0 ? (
                topPosts.map((post) => (
                  <TopPostCard
                    key={post.id}
                    post={post}
                    onClick={() => setSelectedPost(post)}
                  />
                ))
              ) : (
                <div className="bg-white rounded-xl p-6 text-center text-gray-500">
                  No top posts yet
                </div>
              )}
            </div>

            {/* Stats Card */}
            <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {posts.reduce((sum, p) => sum + (p.views || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {posts.reduce((sum, p) => sum + (p.comments || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Comments</div>
                </div>
              </div>
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