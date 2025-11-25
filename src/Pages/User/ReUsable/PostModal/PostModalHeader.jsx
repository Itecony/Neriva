// src/components/PostModal/PostModalHeader.jsx
import { X } from 'lucide-react';

export default function PostModalHeader({ mode, post, onEdit, onClose, isEditMode }) {
  // Helper function to get author display name
  const getAuthorName = () => {
    if (!post || !post.author) return 'Unknown User';
    
    const { firstName, lastName, username } = post.author;
    
    // Combine firstName and lastName if both exist
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    
    // Fall back to firstName, lastName, or username
    return firstName || lastName || username || 'Unknown User';
  };

  // Helper function to get author initials
  const getAuthorInitials = () => {
    if (!post || !post.author) return 'U';
    
    const { firstName, lastName } = post.author;
    
    // If we have both firstName and lastName
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    
    // If we only have firstName
    if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    }
    
    // Otherwise use first two letters of the name
    const name = getAuthorName();
    return name.substring(0, 2).toUpperCase() || 'U';
  };

  if (isEditMode) {
    return (
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
        <h2 className="text-xl font-bold text-gray-900">
          {mode === 'edit' ? 'Edit Post' : 'Create New Post'}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // View mode header
  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
          {getAuthorInitials()}
        </div>
        <div>
          <span className="font-semibold text-gray-900 block">
            {getAuthorName()}
          </span>
          <span className="text-xs text-gray-500">
            {post?.createdAt 
              ? new Date(post.createdAt).toLocaleDateString() 
              : 'Recently'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Edit
          </button>
        )}
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}