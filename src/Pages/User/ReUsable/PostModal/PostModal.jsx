import { useState, useEffect, useCallback, useRef } from 'react';
import { Heart, MessageCircle } from 'lucide-react'; 
import PostModalHeader from './PostModalHeader';
import TextEditor from './TextEditor';
import MediaInput from './MediaInput';
import CommentsSection from './CommentSection';
import { 
  validatePostData, 
  sanitizePostData,
} from '../../../../utils/sanitization';

export default function PostModal({ 
  post = null,
  mode = 'view', 
  onClose,
  onSave
}) {
  const [isEditMode, setIsEditMode] = useState(mode === 'create' || mode === 'edit');
  const [loading, setLoading] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [errors, setErrors] = useState([]);
  
  // ✅ STATE: Track Likes & Comments locally
  const [likeCount, setLikeCount] = useState(post?.likes || 0);
  // Note: ideally your 'post' object from API should have an 'is_liked' boolean field.
  // Defaulting to false if not present.
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
      // If API provides 'is_liked', use it. Otherwise, defaults to false.
      if (post.is_liked !== undefined) setIsLiked(post.is_liked);
      
      if (mode === 'view') fetchComments(post.id);
    }
  }, [post, mode]);

  const fetchComments = async (postId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://itecony-neriva-backend.onrender.com/api/posts/${postId}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const commentsArray = Array.isArray(data) ? data : (data.comments || []);
        setComments(commentsArray);
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

    const response = await fetch('https://itecony-neriva-backend.onrender.com/api/posts/upload-image', {
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
    // If currently liked, we are unliking (decrement). If not, liking (increment).
    const newLikedState = !isLiked;
    const newLikeCount = newLikedState ? likeCount + 1 : likeCount - 1;

    // 3. Apply Optimistic Update immediately
    setIsLiked(newLikedState);
    setLikeCount(newLikeCount);

    try {
      const token = localStorage.getItem('authToken');
      
      // 4. Determine Method based on intended action
      // If we just set it to True, we want to POST (Like). If False, DELETE (Unlike).
      const method = newLikedState ? 'POST' : 'DELETE';

      const response = await fetch(`https://itecony-neriva-backend.onrender.com/api/posts/${post.id}/like`, {
        method: method,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to update like status');
      }
      
      // Optional: Sync exact count from server response if available
      // const data = await response.json();
      // if (data.likes !== undefined) setLikeCount(data.likes);

    } catch (error) {
      console.error("Error updating like status", error);
      // 5. Revert on failure
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    }
  };

  const handleSubmit = async () => {
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
      
      const postPayload = {
        title: formData.title,
        content: formData.content,
        tags: formData.tags
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur">
        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <PostModalHeader mode={mode} isEditMode={true} onClose={onClose} />
          <div className="p-6 space-y-4">
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
              placeholder="Title..."
              className="w-full px-4 py-3 text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              maxLength={200}
            />
            
            <TextEditor
              value={formData.content}
              onChange={handleInputChange}
              onTagsDetected={handleTagsDetected}
            />

            <div className="flex justify-end items-start mt-4">
              <div className="flex-shrink-0">
                <MediaInput
                  images={formData.images}
                  onImagesChange={handleImagesChange}
                  onFilesChange={handleFilesChange} 
                  onError={(err) => setErrors([err])}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
              <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Cancel</button>
              <button 
                onClick={handleSubmit} 
                disabled={loading || isUploadingImages} 
                className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
              >
                {isUploadingImages ? 'Uploading Images...' : (loading ? 'Saving...' : 'Save Post')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View Mode
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <PostModalHeader
          mode={mode}
          post={post}
          isEditMode={false}
          onEdit={isAuthor ? () => setIsEditMode(true) : null}
          onClose={onClose}
        />
        <div className="p-6">
          {post.tags?.length > 0 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {post.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">#{tag}</span>
              ))}
            </div>
          )}
          
          <h2 className="text-2xl font-bold mb-6">{post.title}</h2>
          
          <div className="prose prose-sm max-w-none mb-6" dangerouslySetInnerHTML={{ __html: post.content }} />

          {/* Render Images */}
          {((post.images && post.images.length > 0) || post.image) && (
             <div className={`grid gap-2 mb-6 ${post.images?.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
               {post.images?.map((img, i) => {
                 let src = typeof img === 'string' ? img : img.image_url;
                 if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('blob:')) {
                    src = `https://itecony-neriva-backend.onrender.com/${src}`;
                 }
                 return <img key={i} src={src} className="rounded-lg object-cover w-full h-auto max-h-96" alt={`Post ${i}`} onError={(e) => { e.target.style.display = 'none'; }} />;
               })}
               {(!post.images || post.images.length === 0) && post.image && (
                 <img src={post.image.startsWith('http') ? post.image : `https://itecony-neriva-backend.onrender.com/${post.image}`} className="rounded-lg object-cover w-full h-auto max-h-96" alt="Post" />
               )}
             </div>
          )}

          {/* ✅ UPDATED: Like Button with Action Handler */}
          <div className="flex items-center gap-6 mb-6 pt-4 border-t border-gray-100">
            <button 
              onClick={handleLikePost}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                isLiked 
                  ? 'bg-red-50 text-red-600' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart 
                className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} 
              />
              <span className="font-semibold text-sm">
                {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
              </span>
            </button>

            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-full">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold text-sm">
                {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
              </span>
            </div>
          </div>

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