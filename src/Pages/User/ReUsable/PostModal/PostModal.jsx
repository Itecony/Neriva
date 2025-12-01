// src/components/PostModal/PostModal.jsx
import { useState, useEffect } from 'react';
import PostModalHeader from './PostModalHeader';
import ContentTypeToggle from './ContentTypeToggle';
import TextEditor from './TextEditor';
import CodeEditor from './CodeEditor';
import MediaInput from './MediaInput';
import CommentsSection from './CommentSection';
import CodeDisplay from './CodeDisplay';
import { 
  validatePostData, 
  sanitizePostData,
  detectCode,
  detectLanguage 
} from '../../../../utils/sanitization';

export default function PostModal({ 
  post = null,
  mode = 'view', // 'view', 'create', 'edit'
  onClose,
  onSave
}) {
  const [isEditMode, setIsEditMode] = useState(mode === 'create' || mode === 'edit');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    tags: post?.tags || [],
    image: post?.image || '',
    images: post?.images || [],
    video: post?.video || '',
    isCodePost: post?.isCodePost || false,
    code: post?.code || '',
    codeLanguage: post?.codeLanguage || 'javascript'
  });
  
  const [comments, setComments] = useState(post?.commentsList || []);
  const [contentType, setContentType] = useState(post?.isCodePost ? 'code' : 'text');

  // Fetch comments when in view mode
  useEffect(() => {
    if (post && mode === 'view') {
      fetchComments(post.id);
    }
  }, [post, mode]);

  const fetchComments = async (postId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://itecony-neriva-backend.onrender.com/api/posts/${postId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setComments(data);
        } else if (data.comments && Array.isArray(data.comments)) {
          setComments(data.comments);
        } else {
          setComments([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors([]); // Clear errors on input change
  };

  // Handle paste with code detection
  const handleContentPaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    
    if (detectCode(pastedText)) {
      e.preventDefault();
      
      const detectedLang = detectLanguage(pastedText);
      setContentType('code');
      
      setFormData(prev => ({
        ...prev,
        code: pastedText,
        codeLanguage: detectedLang,
        isCodePost: true
      }));
      
      alert(`Code detected! Switched to ${detectedLang} mode.`);
    }
  };

  const handleContentTypeToggle = (type) => {
    setContentType(type);
    setFormData(prev => ({
      ...prev,
      isCodePost: type === 'code'
    }));
  };

  const handleImagesChange = (newImages) => {
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleVideoChange = (newVideo) => {
    setFormData(prev => ({
      ...prev,
      video: newVideo
    }));
  };


  const handleError = (error) => {
    if (typeof error === 'string') {
      setErrors([error]);
    } else if (Array.isArray(error)) {
      setErrors(error);
    }
    
    // Auto-clear errors after 5 seconds
    setTimeout(() => setErrors([]), 5000);
  };

  const handleSubmit = async () => {
    // Validate form data
    const validation = validatePostData(formData);
    
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const token = localStorage.getItem('authToken');
      const url = mode === 'edit' 
        ? `https://itecony-neriva-backend.onrender.com/api/posts/${post.id}`
        : 'https://itecony-neriva-backend.onrender.com/api/posts';
      
      const method = mode === 'edit' ? 'PUT' : 'POST';

      // Sanitize all form data before sending
      const sanitizedData = sanitizePostData(formData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sanitizedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save post');
      }

      const data = await response.json();
      console.log('✅ Post saved:', data);

      if (onSave) {
        onSave(data.post);
      }

      onClose();
    } catch (error) {
      console.error('❌ Error saving post:', error);
      setErrors([error.message || 'Failed to save post. Please try again.']);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTagsDetected = (detectedTags) => {
  setFormData(prev => ({
    ...prev,
    tags: detectedTags
  }));
};

  const handleLikePost = async () => {
    if (!post) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://itecony-neriva-backend.onrender.com/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Post liked:', data);
      }
    } catch (error) {
      console.error('❌ Error liking post:', error);
    }
  };

  // CREATE/EDIT MODE UI
  if (isEditMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur">
        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <PostModalHeader
            mode={mode}
            isEditMode={true}
            onClose={onClose}
          />

          <div className="p-6 space-y-4">
          {/* Error Display */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800 mb-2">
                Please fix the following errors:
              </p>
              <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Title */}
          <div>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Title..."
              className="w-full px-4 py-3 text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {formData.title.length}/200
            </p>
          </div>

          {/* Conditional Content Input */}
          {contentType === 'text' ? (
            <TextEditor
              value={formData.content}
              onChange={handleInputChange}
              onPaste={handleContentPaste}
              onTagsDetected={handleTagsDetected}
            />
          ) : (
            <CodeEditor
              code={formData.code}
              language={formData.codeLanguage}
              onChange={handleInputChange}
            />
          )}

          {/* Content Type Toggle and Media Input - Side by Side */}
          <div className="flex justify-between items-start">
            <div className="flex-shrink-0">
              <ContentTypeToggle
                contentType={contentType}
                onToggle={handleContentTypeToggle}
              />
            </div>
            
            <div className="flex-shrink-0">
              <MediaInput
                images={formData.images}
                video={formData.video}
                onImagesChange={handleImagesChange}
                onVideoChange={handleVideoChange}
                onError={handleError}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-b from-teal-500 via-cyan-600 to-blue-700 hover:brightness-110 text-white rounded-lg transition-colors disabled:bg-teal-300"
            >
              {loading ? 'Saving...' : mode === 'edit' ? 'Update Post' : 'Create Post'}
            </button>
          </div>
        </div>
        </div>
      </div>
    );
  }

  // VIEW MODE UI
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <PostModalHeader
          mode={mode}
          post={post}
          isEditMode={false}
          onEdit={() => setIsEditMode(true)}
          onClose={onClose}
        />

        <div className="p-6">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
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

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {post.title}
          </h2>

          {/* Code Display (if code post) */}
          {post.isCodePost && post.code && (
            <CodeDisplay
              code={post.code}
              language={post.codeLanguage}
              image={post.image}
            />
          )}

          {/* Images (if not code post or no code) */}
          {!post.isCodePost && post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-64 object-cover rounded-xl mb-6"
            />
          )}

          {/* Multiple Images */}
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {post.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${post.title} - Image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          {/* Video */}
          {post.video && (
            <video
              src={post.video}
              controls
              className="w-full rounded-xl mb-6"
            />
          )}

          {/* Text Content */}
          {post.content && !post.isCodePost && (
            <div 
              className="prose prose-sm max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}

          {/* Like Button */}
          <button
            onClick={handleLikePost}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors mb-6"
          >
            <span>👍</span>
            <span className="text-sm font-medium">{post.likes || 0} Likes</span>
          </button>

          {/* Comments Section */}
          <CommentsSection
            postId={post.id}
            comments={comments}
            onCommentAdded={() => fetchComments(post.id)}
          />
        </div>
      </div>
    </div>
  );
}