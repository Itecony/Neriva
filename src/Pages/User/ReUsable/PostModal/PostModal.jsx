import { useState, useEffect, useCallback, useRef } from 'react';
import PostModalHeader from './PostModalHeader';
// import ContentTypeToggle from './ContentTypeToggle'; // ❌ Not in API use case for now
import TextEditor from './TextEditor';
// import CodeEditor from './CodeEditor'; // ❌ User requested to comment out code features
import MediaInput from './MediaInput';
import CommentsSection from './CommentSection';
// import CodeDisplay from './CodeDisplay'; // ❌ User requested to comment out code features
import { 
  validatePostData, 
  sanitizePostData,
  // detectCode,     // ❌ Commented out
  // detectLanguage  // ❌ Commented out
} from '../../../../utils/sanitization';

export default function PostModal({ 
  post = null,
  mode = 'view', 
  onClose,
  onSave
}) {
  const [isEditMode, setIsEditMode] = useState(mode === 'create' || mode === 'edit');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  
  // Ref to track last tags to prevent infinite loop
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
    images: post?.images || [], // ✅ Supported by API (Array of strings)
    // video: post?.video || '', // ❌ Not in API docs
    // isCodePost: post?.isCodePost || false, // ❌ Commented out
    // code: post?.code || '',                // ❌ Commented out
    // codeLanguage: post?.codeLanguage || 'javascript' // ❌ Commented out
  });
  
  const [comments, setComments] = useState(post?.commentsList || []);
  // const [contentType, setContentType] = useState(post?.isCodePost ? 'code' : 'text'); // ❌ Defaulting to text only now

  useEffect(() => {
    if (post && mode === 'view') {
      fetchComments(post.id);
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
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors([]); 
  };

  /* ❌ Commented out Code Detection Logic
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
  */

  const handleImagesChange = (newImages) => {
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  /* ❌ Video not supported in API
  const handleVideoChange = (newVideo) => {
    setFormData(prev => ({ ...prev, video: newVideo }));
  };
  */

  const handleError = (error) => {
    if (typeof error === 'string') {
      setErrors([error]);
    } else if (Array.isArray(error)) {
      setErrors(error);
    }
    setTimeout(() => setErrors([]), 5000);
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

      if (onSave) onSave(data.post);
      onClose();
    } catch (error) {
      console.error('❌ Error saving post:', error);
      setErrors([error.message || 'Failed to save post.']);
    } finally {
      setLoading(false);
    }
  };
  
  // ✅ Stable tag handler
  const handleTagsDetected = useCallback((detectedTags) => {
    if (JSON.stringify(lastTagsRef.current) === JSON.stringify(detectedTags)) {
      return;
    }
    lastTagsRef.current = detectedTags;
    setFormData(prev => ({ ...prev, tags: detectedTags }));
  }, []);

  const handleLikePost = async () => {
    if (!post) return;
    try {
        const token = localStorage.getItem('authToken');
        await fetch(`https://itecony-neriva-backend.onrender.com/api/posts/${post.id}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    } catch (error) {
        console.error("Error liking post", error);
    }
  };

  /* ❌ Helper removed since we only support text now
  const renderContentInput = () => {
    if (contentType === 'text') {
      return (
        <TextEditor
          value={formData.content}
          onChange={handleInputChange}
          // onPaste={handleContentPaste} // ❌ Code detection removed
          onTagsDetected={handleTagsDetected}
        />
      );
    }
    return (
      <CodeEditor
        code={formData.code}
        language={formData.codeLanguage}
        onChange={handleInputChange}
      />
    );
  };
  */

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
            
            {/* ✅ Only TextEditor remains */}
            <TextEditor
              value={formData.content}
              onChange={handleInputChange}
              onTagsDetected={handleTagsDetected}
            />

            <div className="flex justify-between items-start">
              <div className="flex-shrink-0">
                {/* <ContentTypeToggle 
                  contentType={contentType} 
                  onToggle={handleContentTypeToggle} 
                /> ❌ Removed Code Toggle */}
              </div>
              <div className="flex-shrink-0">
                <MediaInput
                  images={formData.images}
                  // video={formData.video} // ❌ Video not supported
                  onImagesChange={handleImagesChange}
                  // onVideoChange={handleVideoChange} // ❌ Video not supported
                  onError={handleError}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50">
                {loading ? 'Saving...' : 'Save'}
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
          
          {/* ❌ Removed Code Display check
          {post.isCodePost && post.code ? (
             <CodeDisplay code={post.code} language={post.codeLanguage} image={post.image} />
          ) : ( ... ) */}
          
          <div className="prose prose-sm max-w-none mb-6" dangerouslySetInnerHTML={{ __html: post.content }} />

          {/* Legacy Image support (single) */}
          {post.image && !post.images?.length && (
            <img src={post.image} className="w-full h-64 object-cover rounded-xl mb-6" alt={post.title} />
          )}

          {/* New Image Array support (multiple) */}
          {post.images?.length > 0 && (
             <div className="grid grid-cols-2 gap-2 mb-6">
               {post.images.map((img, i) => {
                 // Handle if img is object {image_url} or string
                 const src = typeof img === 'string' ? img : img.image_url;
                 return <img key={i} src={src} className="rounded-lg object-cover w-full h-48" alt={`Gallery ${i}`} />
               })}
             </div>
          )}

          {/* ❌ Removed Video Display */}
          {/* {post.video && ( <video ... /> )} */}

          <button onClick={handleLikePost} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg mb-6">
             <span>👍</span> {post.likes || 0} Likes
          </button>

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