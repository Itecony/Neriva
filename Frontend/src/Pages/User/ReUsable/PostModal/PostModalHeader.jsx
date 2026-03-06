// src/components/PostModal/PostModalHeader.jsx
import { X } from 'lucide-react';
import { API_BASE_URL } from '../../../../config';

const getImageUrl = (img) => {
  if (!img) return null;
  const src = typeof img === 'string' ? img : img.image_url;
  if (!src) return null;
  if (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:')) return src;
  return `${API_BASE_URL}/${src}`;
};

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
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex justify-between items-center flex-shrink-0">
        <h2 className="text-base font-semibold text-gray-900">
          {mode === 'edit' ? 'Edit Post' : 'Create Post'}
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // View mode header
  return (
    <div className="bg-white border-b border-gray-100 px-5 py-3 flex justify-between items-center sticky top-0 z-10 flex-shrink-0">
      <div className="flex items-center gap-3">
        {getImageUrl(post?.author?.avatar || post?.author?.profileImage) ? (
          <img
            src={getImageUrl(post.author.avatar || post.author.profileImage)}
            alt={getAuthorName()}
            className="w-10 h-10 rounded-full object-cover border border-gray-100"
          />
        ) : (
          <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
            {getAuthorInitials()}
          </div>
        )}
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