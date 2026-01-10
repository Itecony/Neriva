import { useState, useEffect } from 'react';
import { 
  ChevronLeft, Star, Bookmark, CheckCircle, Share2, X, Menu, 
  AlertCircle, Clock, BarChart, User, MessageSquare, TrendingUp, Users,
  ThumbsUp, Trash2, Edit2, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ResourceDetail({ resourceId }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('description');
  const [resource, setResource] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  
  // We treat "comments" as a mixed list or the primary feedback list for now
  const [reviews, setReviews] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User Interaction States
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(true); // ✅ NEW
  const [existingUserReview, setExistingUserReview] = useState(null); // ✅ NEW: Track if user reviewed

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.id || currentUser._id;

  useEffect(() => {
    if (resourceId) {
      fetchResourceData();
      fetchReviews(); // Changed name to clarify context
    }
  }, [resourceId]);

  useEffect(() => {
    if (resource && resource.mentor_id === currentUserId) {
      fetchAnalytics();
    }
  }, [resource]);

  // ✅ NEW: Check if current user has a review in the list
  useEffect(() => {
    if (reviews.length > 0 && currentUserId) {
      const myReview = reviews.find(r => r.user?.id === currentUserId || r.user_id === currentUserId);
      if (myReview) {
        setExistingUserReview(myReview);
        // Pre-fill form for editing
        setUserRating(myReview.rating);
        setReviewText(myReview.review_text || '');
        setWouldRecommend(myReview.would_recommend);
      } else {
        setExistingUserReview(null);
        // Reset form if no review found (e.g. after delete)
        setUserRating(0);
        setReviewText('');
        setWouldRecommend(true);
      }
    }
  }, [reviews, currentUserId]);

  const fetchResourceData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`https://itecony-neriva-backend.onrender.com/api/resources/${resourceId}`, { headers });
      if (!response.ok) throw new Error('Failed to load resource');
      const data = await response.json();
      const resData = data.resource || data.data || data;
      setResource(resData);
      if (resData.is_bookmarked) setIsBookmarked(true);
      if (resData.is_completed) setIsCompleted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      // Assuming comments endpoint returns reviews or there is a similar endpoint. 
      // If reviews are separate, switch URL to /api/resources/${resourceId}/reviews
      const response = await fetch(`https://itecony-neriva-backend.onrender.com/api/resources/${resourceId}/comments`);
      if (response.ok) {
        const data = await response.json();
        // Handle potentially different response structures
        setReviews(data.comments || data.reviews || []);
      }
    } catch (err) {
      console.error("Error fetching reviews", err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://itecony-neriva-backend.onrender.com/api/resources/${resourceId}/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error("Failed to load analytics", err);
    }
  };

  // --- REVIEW ACTIONS (Create/Update/Delete) ---

  const handleSubmitReview = async () => {
    if (reviewText.length < 10) return alert('Review must be at least 10 characters');
    if (userRating === 0) return alert('Please select a rating');
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // ✅ Determine Method: PUT if editing, POST if creating
      const method = existingUserReview ? 'PUT' : 'POST';
      const endpoint = `https://itecony-neriva-backend.onrender.com/api/resources/${resourceId}/review`;

      const response = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          rating: userRating, 
          review_text: reviewText, 
          would_recommend: wouldRecommend 
        })
      });

      if (response.ok) {
        alert(existingUserReview ? 'Review updated!' : 'Review submitted successfully!');
        fetchReviews(); // Refresh list
        fetchResourceData(); // Refresh aggregate rating
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!confirm("Are you sure you want to delete your review?")) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://itecony-neriva-backend.onrender.com/api/resources/${resourceId}/review`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setExistingUserReview(null); // Clear local state
        setUserRating(0);
        setReviewText('');
        alert('Review deleted');
        fetchReviews();
        fetchResourceData();
      } else {
        throw new Error('Failed to delete review');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- HELPFUL ACTION ---

  const handleMarkHelpful = async (reviewId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return navigate('/login');

      // Optimistic Update locally
      setReviews(prev => prev.map(r => {
        if (r.id === reviewId) {
          return { ...r, helpful_count: (r.helpful_count || 0) + 1 };
        }
        return r;
      }));

      const response = await fetch(`https://itecony-neriva-backend.onrender.com/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        // Revert on error
        fetchReviews();
        throw new Error('Failed to mark helpful');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- OTHER ACTIONS ---

  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return navigate('/login');
      const previousState = isBookmarked;
      setIsBookmarked(!isBookmarked);
      const method = previousState ? 'DELETE' : 'POST'; 
      const response = await fetch(`https://itecony-neriva-backend.onrender.com/api/resources/${resourceId}/bookmark`, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: method === 'POST' ? JSON.stringify({ status: 'bookmarked' }) : undefined
      });
      if (!response.ok) throw new Error('Failed to bookmark');
    } catch (err) {
      setIsBookmarked(!isBookmarked);
      alert("Failed to update bookmark");
    }
  };

  const handleSubmitCompletion = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://itecony-neriva-backend.onrender.com/api/resources/${resourceId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ completion_date: new Date().toISOString() })
      });
      if (response.ok) {
        setIsCompleted(true);
        setShowCompleteModal(false);
      } else {
        throw new Error('Failed to complete');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- RENDERERS ---

  const renderStars = (rating) => Array(5).fill(0).map((_, i) => (
    <span key={i} className={`text-lg ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
  ));

  const renderListOrText = (content) => {
    if (!content) return <p className="text-gray-400 italic">None specified.</p>;
    if (Array.isArray(content)) return <ul className="list-disc pl-5 space-y-2">{content.map((item, i) => <li key={i}>{item}</li>)}</ul>;
    return <p className="whitespace-pre-line leading-relaxed">{content}</p>;
  };

  // ... (renderAnalyticsDashboard and renderTrendChart remain same as previous step) ...
  const renderTrendChart = (data = [], label) => ( /* omitted for brevity, same as before */ <div/> );
  const renderAnalyticsDashboard = () => ( /* omitted for brevity, same as before */ <div/> );

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-blue-600 rounded-full border-t-transparent"></div></div>;
  if (error) return <div className="text-center py-20 text-red-600">Error: {error}</div>;
  if (!resource) return <div className="text-center py-20 text-gray-500">Resource not found.</div>;

  const mentorName = resource.mentor?.firstName ? `${resource.mentor.firstName} ${resource.mentor.lastName}` : 'Unknown Mentor';
  const mentorImage = resource.mentor?.avatar || 'https://via.placeholder.com/40';
  const estimatedTime = resource.estimated_time_minutes ? `${Math.floor(resource.estimated_time_minutes / 60)}h ${resource.estimated_time_minutes % 60}m` : 'N/A';
  const isOwner = resource.mentor_id === currentUserId;

  return (
    <div className="bg-white w-full min-h-[600px] flex flex-col">
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 mb-8 text-sm">
          <button onClick={() => navigate('/resources')} className="text-gray-500 hover:text-blue-600">Resources</button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">{resource.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Header Content ... same as before */}
            <div className="space-y-4">
              <h1 className="text-gray-900 text-3xl md:text-4xl font-black tracking-tight leading-tight">{resource.title}</h1>
              <div className="flex items-center gap-4">
                <img src={mentorImage} alt={mentorName} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                <div><p className="text-sm text-gray-500">Created by</p><button className="font-medium text-blue-600 hover:underline">{mentorName}</button></div>
              </div>
            </div>

            {/* Tabs */}
            <div className="space-y-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 -mb-px overflow-x-auto hide-scrollbar">
                  {['description', 'outcomes', 'prerequisites'].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium capitalize transition-colors ${activeTab === tab ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>{tab === 'outcomes' ? 'Learning Outcomes' : tab}</button>
                  ))}
                  {isOwner && <button onClick={() => setActiveTab('analytics')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium capitalize transition-colors flex items-center gap-2 ${activeTab === 'analytics' ? 'text-purple-600 border-purple-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}><BarChart className="w-4 h-4" /> Analytics</button>}
                </nav>
              </div>
              <div className="text-gray-700 leading-relaxed min-h-[150px]">
                {activeTab === 'description' && renderListOrText(resource.description)}
                {activeTab === 'outcomes' && renderListOrText(resource.learning_outcomes)}
                {activeTab === 'prerequisites' && renderListOrText(resource.prerequisites)}
                {activeTab === 'analytics' && isOwner && renderAnalyticsDashboard()}
              </div>
            </div>

            {/* Reviews Section */}
            {activeTab !== 'analytics' && (
              <div className="pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews & Comments</h2>
                
                {/* ✅ UPDATED: Review Form with Edit/Cancel Logic */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-gray-900">
                      {existingUserReview ? 'Edit Your Review' : 'Leave a Review'}
                    </h4>
                    {existingUserReview && (
                      <button onClick={handleDeleteReview} className="text-red-500 text-xs hover:underline flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Delete Review
                      </button>
                    )}
                  </div>

                  {/* Star Rating Input */}
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setUserRating(star)} className="text-2xl hover:scale-110 transition-transform">
                        <span className={star <= userRating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                      </button>
                    ))}
                  </div>

                  {/* Recommend Checkbox */}
                  <div className="flex items-center gap-2 mb-4">
                    <input 
                      type="checkbox" 
                      id="recommend" 
                      checked={wouldRecommend} 
                      onChange={(e) => setWouldRecommend(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="recommend" className="text-sm text-gray-700">I would recommend this resource</label>
                  </div>

                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your feedback (min 10 chars)..."
                    className="w-full p-3 bg-white rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                    rows="3"
                  />
                  
                  <div className="flex justify-end gap-2">
                    {existingUserReview && (
                      <button onClick={() => {
                        // Cancel edit: reset to existing
                        setReviewText(existingUserReview.review_text);
                        setUserRating(existingUserReview.rating);
                      }} className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm font-medium">Reset</button>
                    )}
                    <button onClick={handleSubmitReview} disabled={submitting || !userRating} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm">
                      {submitting ? 'Submitting...' : (existingUserReview ? 'Update Review' : 'Submit Review')}
                    </button>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="flex gap-4 p-4 bg-white rounded-lg border border-gray-100 relative group">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 flex-shrink-0">
                        {review.user?.firstName?.[0] || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-900">{review.user?.firstName} {review.user?.lastName}</span>
                              <span className="text-xs text-gray-400">• {new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                            {/* Display Rating if available */}
                            {review.rating && (
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex">{renderStars(review.rating)}</div>
                                {review.would_recommend && (
                                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                                    <Check className="w-3 h-3" /> Recommended
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* ✅ HELPFUL BUTTON */}
                          <button 
                            onClick={() => handleMarkHelpful(review.id)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors bg-gray-50 px-2 py-1 rounded-md border border-gray-100 hover:border-blue-200"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            Helpful ({review.helpful_count || 0})
                          </button>
                        </div>
                        
                        <p className="text-gray-600 text-sm mt-1">{review.review_text || review.comment_text}</p>
                      </div>
                    </div>
                  ))}
                  {reviews.length === 0 && <p className="text-gray-500 italic">No reviews yet.</p>}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Actions ... (Same as before) */}
          <aside className="lg:sticky lg:top-6 h-fit space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
              <button onClick={() => window.open(resource.url, '_blank')} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2">Start Learning <Share2 className="w-4 h-4" /></button>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleBookmark} className={`flex flex-col items-center justify-center py-3 rounded-lg border text-sm font-medium transition-colors ${isBookmarked ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}><Bookmark className={`w-5 h-5 mb-1 ${isBookmarked ? 'fill-current' : ''}`} />{isBookmarked ? 'Saved' : 'Save'}</button>
                {isCompleted ? (<div className="flex flex-col items-center justify-center py-3 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm font-medium cursor-default"><CheckCircle className="w-5 h-5 mb-1" />Completed</div>) : (<button onClick={() => setShowCompleteModal(true)} className="flex flex-col items-center justify-center py-3 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors text-sm font-medium"><CheckCircle className="w-5 h-5 mb-1" />Complete</button>)}
              </div>
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <div className="flex justify-between items-center text-sm"><span className="text-gray-500 flex items-center gap-2"><Clock className="w-4 h-4"/> Duration</span><span className="font-semibold text-gray-900">{estimatedTime}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-gray-500 flex items-center gap-2"><BarChart className="w-4 h-4"/> Level</span><span className="font-semibold text-gray-900 capitalize">{resource.difficulty_level}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-gray-500 flex items-center gap-2"><Share2 className="w-4 h-4"/> Type</span><span className="font-semibold text-gray-900 capitalize">{resource.resource_type}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Completion Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Mark as Complete?</h3>
            <p className="text-gray-500 text-sm mb-6">This will update your progress and add it to your learning history.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCompleteModal(false)} className="flex-1 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">Cancel</button>
              <button onClick={handleSubmitCompletion} disabled={submitting} className="flex-1 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 font-medium">
                {submitting ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}