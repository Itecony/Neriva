// src/components/PostModal/CommentsSection.jsx
import { useState } from 'react';
import { Send } from 'lucide-react';
import { sanitizeText } from '../../../../utils/sanitization';

export default function CommentsSection({ postId, comments, onCommentAdded }) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddComment = async () => {
    const sanitizedComment = sanitizeText(comment);
    
    if (!sanitizedComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    if (sanitizedComment.length > 1000) {
      alert('Comment must be 1000 characters or less');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://itecony-neriva-backend.onrender.com/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: sanitizedComment })
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const data = await response.json();
      console.log('✅ Comment added:', data);
      
      setComment('');
      onCommentAdded?.();
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="font-semibold text-gray-900 mb-4">
        Comments ({comments?.length || 0})
      </h3>

      {/* Existing Comments */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {Array.isArray(comments) && comments.length > 0 ? (
          comments.map((commentItem, index) => (
            <div key={commentItem.id || index} className="flex gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {commentItem.author?.initials || commentItem.author?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {commentItem.author?.username || 'Anonymous'}
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {commentItem.content || commentItem.text}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-4">
                  {commentItem.createdAt 
                    ? new Date(commentItem.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : ''}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>

      {/* Add Comment */}
      <div className="flex gap-3">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a comment... (Press Enter to send)"
          className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
          maxLength={1000}
          disabled={loading}
        />
        <button
          onClick={handleAddComment}
          disabled={loading || !comment.trim()}
          className="p-3 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors disabled:bg-teal-300 disabled:cursor-not-allowed"
          aria-label="Send comment"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        {comment.length}/1000 characters
      </p>
    </div>
  );
}