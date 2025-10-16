import { useState } from 'react';
import { ThumbsUp, MessageSquare, Eye, X, Send } from 'lucide-react';

// Post Card Component
function PostCard({ post, onClick }) {
  return (
    <div 
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Tags */}
      <div className="flex gap-2 mb-4">
        {post.tags.map((tag, index) => (
          <span 
            key={index}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Author */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
          {post.author.initials}
        </div>
        <span className="text-sm font-medium text-gray-900">{post.author.name}</span>
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
          <span>{post.likes}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare className="w-4 h-4" />
          <span>{post.comments}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span>{post.views}</span>
        </div>
      </div>
    </div>
  );
}

// Top Post Card Component (Compact)
function TopPostCard({ post, onClick }) {
  return (
    <div 
      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Tags */}
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

      {/* Author */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
          {post.author.initials}
        </div>
        <span className="text-xs font-medium text-gray-900">{post.author.name}</span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2">
        {post.title}
      </h4>

      {/* Stats */}
      <div className="flex items-center gap-3 text-gray-600 text-xs">
        <div className="flex items-center gap-1">
          <ThumbsUp className="w-3 h-3" />
          <span>{post.likes}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          <span>{post.comments}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span>{post.views}</span>
        </div>
      </div>
    </div>
  );
}

// Post Modal Component
function PostModal({ post, onClose }) {
  const [comment, setComment] = useState('');

  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
              {post.author.initials}
            </div>
            <span className="font-semibold text-gray-900">{post.author.name}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {post.title}
          </h2>

          {post.image && (
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-64 object-cover rounded-xl mb-6"
            />
          )}

          {post.content && (
            <p className="text-gray-700 mb-6">{post.content}</p>
          )}

          {/* Comments Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Comments</h3>
            
            {/* Existing Comments */}
            <div className="space-y-4 mb-6">
              {post.commentsList && post.commentsList.map((comment, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {comment.author.initials}
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-3">
                    <p className="text-sm text-gray-900">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="flex gap-3">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button className="p-3 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Dreamboard Component
export default function Dreamboard() {
  const [selectedPost, setSelectedPost] = useState(null);

  // Sample data - replace with props from API
  const allPosts = [
    {
      id: 1,
      title: "What's the difference between REST and GraphQL?",
      tags: ["software development", "cloud computing"],
      author: { name: "Jane Doe", initials: "JD" },
      image: "/assets/code-example.jpg",
      likes: 20,
      comments: 6,
      views: 320,
      content: "I've been learning about APIs and I'm curious about the main differences between REST and GraphQL. Which one should I use for my next project?",
      commentsList: [
        { author: { initials: "KL" }, text: "Dummy text goes here" }
      ]
    },
    {
      id: 2,
      title: "How can I tell if my password has been leaked?",
      tags: ["Cybersecurity", "cloud computing"],
      author: { name: "James Doe", initials: "JD" },
      image: null,
      likes: 15,
      comments: 8,
      views: 250,
      content: "I'm worried about password security. What are the best ways to check if my passwords have been compromised?",
      commentsList: []
    }
  ];

  const topPosts = [
    {
      id: 3,
      title: "Which fonts work best for mobile app design?",
      tags: ["Cybersecurity", "Graphic Design"],
      author: { name: "place holder", initials: "PH" },
      likes: 28,
      comments: 12,
      views: 450,
      content: "Looking for recommendations on mobile-friendly fonts.",
      commentsList: []
    },
    {
      id: 4,
      title: "Which fonts work best for mobile app design?",
      tags: ["Cybersecurity", "Graphic Design"],
      author: { name: "place holder", initials: "PH" },
      likes: 32,
      comments: 15,
      views: 380,
      content: "Typography tips for mobile interfaces.",
      commentsList: []
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-orange-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed - All Posts */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">All posts</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <span className="text-2xl">+</span>
                <span className="font-medium">Ask a question</span>
              </button>
            </div>

            <div className="space-y-4">
              {allPosts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onClick={() => setSelectedPost(post)}
                />
              ))}
            </div>
          </div>

          {/* Sidebar - Top Posts */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Top posts</h2>
            <div className="space-y-4">
              {topPosts.map((post) => (
                <TopPostCard 
                  key={post.id} 
                  post={post}
                  onClick={() => setSelectedPost(post)}
                />
              ))}
            </div>

            {/* Stats Card */}
            <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">6</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">77</div>
                  <div className="text-sm text-gray-600">Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">6</div>
                  <div className="text-sm text-gray-600">Comments</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <PostModal 
          post={selectedPost} 
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}