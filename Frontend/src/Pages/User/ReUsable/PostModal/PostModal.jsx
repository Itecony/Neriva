import { useState, useEffect, useCallback, useRef } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import PostModalHeader from './PostModalHeader';
import TextEditor from './TextEditor';
import MediaInput from './MediaInput';
import CommentsSection from './CommentSection';
import {
  validatePostData,
  sanitizePostData,
  sanitizeMarkdown
} from '../../../../utils/sanitization';
import { API_BASE_URL } from '../../../../config';

export default function PostModal({
  post = null,
  mode = 'view',
  onClose,
  onSave,
  onUpdate // ✅ New Prop for syncing
}) {
  const [isEditMode, setIsEditMode] = useState(mode === 'create' || mode === 'edit');
  const [loading, setLoading] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [errors, setErrors] = useState([]);

  // ✅ STATE: Track Likes & Comments locally
  const [likeCount, setLikeCount] = useState(post?.likes || 0);
  // Note: ideally your 'post' object from API should have an 'is_liked' boolean field.
  const [isLiked, setIsLiked] = useState(post?.is_liked || false);
  const [comments, setComments] = useState(post?.commentsList || []);

  const [filesToUpload, setFilesToUpload] = useState([]);
  const lastTagsRef = useRef(post?.tags || []);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.id || currentUser._id;

  const isAuthor = post?.author && (
    (post.author._id && post.author._id === currentUserId) ||
    (post.author.id && post.author.id === currentUserId) ||
    (post.user_id && post.user_id === currentUserId)
  );

  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    tags: post?.tags || [],
    image: post?.image || '',
    images: post?.images || [],
  });

  // Sync state when post changes
  useEffect(() => {
    if (post) {
      setLikeCount(post.likes || 0);
      if (post.is_liked !== undefined) setIsLiked(post.is_liked);
      // Only fetch comments if we are opening a NEW post, not just updating the current one
      // We'll rely on post.id logic in the dependency array
      if (mode === 'view') fetchComments(post.id);
    }
  }, [post?.id, mode]);

  const fetchComments = async (postId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const commentsArray = Array.isArray(data) ? data : (data.comments || []);
        setComments(commentsArray);

        // ✅ Notify parent (Dreamboard)
        if (onUpdate && post) {
          onUpdate({ ...post, comments: commentsArray, commentsCount: commentsArray.length });
        }
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors([]);
  };

  const handleImagesChange = (newImages) => {
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleFilesChange = (files) => {
    setFilesToUpload(files);
  };

  const uploadImageToPost = async (postId, file) => {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('postId', postId);
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/api/posts/upload-image`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) throw new Error('Image upload failed');
    return response.json();
  };

  // --------------------------------------------------------
  // ✅ LOGIC: Optimistic Like/Unlike
  // --------------------------------------------------------
  const handleLikePost = async () => {
    if (!post) return;

    // 1. Capture previous state for rollback
    const previousLiked = isLiked;
    const previousCount = likeCount;

    // 2. Determine new state (Optimistic)
    const newLikedState = !isLiked;
    const newLikeCount = newLikedState ? likeCount + 1 : likeCount - 1;

    // 3. Apply Optimistic Update immediately
    setIsLiked(newLikedState);
    setLikeCount(newLikeCount);

    // ✅ Notify parent immediately
    if (onUpdate && post) {
      onUpdate({
        ...post,
        is_liked: newLikedState,
        likes: newLikeCount
      });
    }

    try {
      const token = localStorage.getItem('authToken');
      const method = newLikedState ? 'POST' : 'DELETE';

      const response = await fetch(`${API_BASE_URL}/api/posts/${post.id}/like`, {
        method: method,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to update like status');
      }

    } catch (error) {
      console.error("Error updating like status", error);
      // 5. Revert on failure
      setIsLiked(previousLiked);
      setLikeCount(previousCount);

      // Revert parent
      if (onUpdate && post) {
        onUpdate({
          ...post,
          is_liked: previousLiked,
          likes: previousCount
        });
      }
    }
  };

  const handleSubmit = async () => {
    const validation = validatePostData(formData);

    // ✅ CRITICAL: Use the returned sanitized data
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const token = localStorage.getItem('authToken');
      const url = mode === 'edit'
        ? `${API_BASE_URL}/api/posts/${post.id}`
        : `${API_BASE_URL}/api/posts`;

      const method = mode === 'edit' ? 'PUT' : 'POST';

      // ✅ SECURITY FIX: Use sanitized data for payload
      const sanitizedPayload = validation.data;

      const postPayload = {
        title: sanitizedPayload.title,
        content: sanitizedPayload.content,
        tags: sanitizedPayload.tags
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save post');
      }

      const data = await response.json();
      const newPostId = data.post?.id || data.id;

      if (filesToUpload.length > 0 && newPostId) {
        setIsUploadingImages(true);
        try {
          await Promise.all(filesToUpload.map(file => uploadImageToPost(newPostId, file)));
        } catch (uploadErr) {
          console.error("Image upload failed", uploadErr);
        }
        setIsUploadingImages(false);
      }

      if (onSave) onSave(data.post);
      onClose();
    } catch (error) {
      console.error('❌ Error saving post:', error);
      setErrors([error.message || 'Failed to save post.']);
    } finally {
      setLoading(false);
      setIsUploadingImages(false);
    }
  };

  const handleTagsDetected = useCallback((detectedTags) => {
    if (JSON.stringify(lastTagsRef.current) === JSON.stringify(detectedTags)) return;
    lastTagsRef.current = detectedTags;
    setFormData(prev => ({ ...prev, tags: detectedTags }));
  }, []);


  if (isEditMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all" onClick={onClose}>
        <div className="bg-white w-full max-w-lg h-auto max-h-[85vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl transform transition-all mb-20 sm:mb-0" onClick={(e) => e.stopPropagation()}>
          <PostModalHeader mode={mode} isEditMode={true} onClose={onClose} />

          <div className="p-0 flex-1 overflow-y-auto custom-scrollbar relative">
            <div className="p-4 sm:p-5 space-y-3">
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 p-4 rounded text-red-700 text-sm">
                  {errors.map((e, i) => <div key={i}>{e}</div>)}
                </div>
              )}
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Title"
                className="w-full text-xl sm:text-2xl font-bold placeholder-gray-300 border-b border-gray-100 py-2 focus:outline-none focus:border-teal-500 transition-colors bg-transparent"
                maxLength={200}
              />

              <div className='flex items-center gap-2 text-xs'>
                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium border border-blue-100">
                  Tip
                </span>
                <span className="text-gray-500">
                  Use <span className="font-semibold text-gray-700">#hashtags</span> to tag your post
                </span>
                <span className="ml-auto text-gray-400 font-mono">
                  {formData.tags.length > 0 ? `${formData.tags.length} tags` : ''}
                </span>
              </div>

              <TextEditor
                value={formData.content}
                onChange={handleInputChange}
                onTagsDetected={handleTagsDetected}
              />

              <div className="flex justify-end items-start mt-4">
                <div className="flex-shrink-0 w-full">
                  <MediaInput
                    images={formData.images}
                    onImagesChange={handleImagesChange}
                    onFilesChange={handleFilesChange}
                    onError={(err) => setErrors([err])}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3 flex-shrink-0">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg text-sm font-medium transition-colors">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={loading || isUploadingImages}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-70 disabled:cursor-not-allowed text-sm font-semibold shadow-md transform transition-all active:scale-95 flex items-center gap-2"
            >
              {isUploadingImages ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Post Update</span>
                )
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View Mode
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-lg h-auto max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col mb-20 sm:mb-0" onClick={(e) => e.stopPropagation()}>
        <PostModalHeader
          mode={mode}
          post={post}
          isEditMode={false}
          onEdit={isAuthor ? () => setIsEditMode(true) : null}
          onClose={onClose}
        />
        <div className="p-0 overflow-y-auto custom-scrollbar flex-1 relative">
          <div className="p-5 sm:p-6">
            {post.tags?.length > 0 && (
              <div className="flex gap-2 mb-4 flex-wrap">
                {post.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium border border-teal-100">#{tag}</span>
                ))}
              </div>
            )}

            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 leading-tight">{post.title}</h2>

            <div className="prose prose-sm sm:prose-base max-w-none mb-8 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeMarkdown(post.content) }} />

            {/* Render Images */}
            {((post.images && post.images.length > 0) || post.image) && (
              <div className={`grid gap-2 mb-8 ${post.images?.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {post.images?.map((img, i) => {
                  let src = typeof img === 'string' ? img : img.image_url;
                  if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('blob:')) {
                    src = `${API_BASE_URL}/${src}`;
                  }
                  return <img key={i} src={src} className="rounded-xl object-cover w-full h-auto max-h-96 border border-gray-100 shadow-sm" alt={`Post ${i}`} onError={(e) => { e.target.style.display = 'none'; }} />;
                })}
                {(!post.images || post.images.length === 0) && post.image && (
                  <img src={post.image.startsWith('http') ? post.image : `${API_BASE_URL}/${post.image}`} className="rounded-xl object-cover w-full h-auto max-h-96 border border-gray-100 shadow-sm" alt="Post" />
                )}
              </div>
            )}

            {/* ✅ UPDATED: Like Button with Action Handler */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={handleLikePost}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 border ${isLiked
                  ? 'bg-red-50 text-red-600 border-red-100'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <Heart
                  className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`}
                />
                <span className="font-semibold text-xs">
                  {likeCount}
                </span>
              </button>

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 rounded-full border border-gray-200">
                <MessageCircle className="w-4 h-4" />
                <span className="font-semibold text-xs">
                  {comments.length}
                </span>
              </div>
            </div>

            <div className="mt-8">
              <CommentsSection
                postId={post.id}
                comments={comments}
                onCommentAdded={() => fetchComments(post.id)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}