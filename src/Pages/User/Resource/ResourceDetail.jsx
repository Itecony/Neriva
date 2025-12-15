import { useState } from 'react';
import { ChevronLeft, Star, Bookmark, CheckCircle, Share2, X, Menu, AlertCircle } from 'lucide-react';

export default function ResourceDetail({ resourceId = '1' }) {
  const [activeTab, setActiveTab] = useState('description');
  const [showSidebar, setShowSidebar] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [proofLink, setProofLink] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data - replace with API call
  const resource = {
    title: 'Advanced Prototyping in Figma',
    mentor: 'Jane Doe',
    mentorImage: 'https://via.placeholder.com/40',
    description: `Dive deep into Figma's advanced prototyping features to create realistic, dynamic, and interactive user experiences. This course will take you beyond the basics of linking screens and introduce you to variables, conditional logic, and advanced animations.\n\nYou'll learn how to build complex prototypes that feel like real applications, enabling you to test user flows more effectively and present your designs with greater impact. By the end of this course, you will be able to build prototypes that can handle user inputs, manage states, and create sophisticated micro-interactions.`,
    learningOutcomes: [
      'Mastering Figma variables for dynamic content.',
      'Implementing conditional logic to create branching user flows.',
      'Crafting advanced animations and transitions.',
      'Building and testing complex, multi-state components.'
    ],
    prerequisites: 'Basic knowledge of Figma and UI/UX design principles',
    tags: ['Figma', 'Prototyping', 'UI/UX', 'Interaction Design'],
    resourceType: 'Video Course',
    domain: 'UI/UX Design',
    difficulty: 'Intermediate',
    estimatedTime: '4 hours',
    rating: 4.5,
    reviews: 128,
    ratingBreakdown: {
      5: 65,
      4: 25,
      3: 5,
      2: 3,
      1: 2
    },
    comments: [
      {
        id: 1,
        author: 'John Appleseed',
        avatar: 'https://via.placeholder.com/40',
        timestamp: '2 days ago',
        text: 'This was a game-changer for my workflow. The section on variables finally clicked for me. Highly recommended!'
      },
      {
        id: 2,
        author: 'Sarah Connor',
        avatar: 'https://via.placeholder.com/40',
        timestamp: '1 week ago',
        text: 'Does anyone have a good example of how they\'ve used conditional logic for a settings panel? I\'m a bit stuck on that part.'
      }
    ]
  };

  const handleSubmitReview = async () => {
    if (reviewText.length < 50) {
      alert('Review must be at least 50 characters');
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `https://itecony-neriva-backend.onrender.com/api/resources/${resourceId}/review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            rating: userRating,
            reviewText: reviewText
          })
        }
      );
      if (response.ok) {
        setReviewText('');
        setUserRating(0);
        alert('Review submitted successfully!');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review');
    }
  };

  const handleSubmitCompletion = async () => {
    if (!proofLink.trim()) {
      alert('Please provide a proof link');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `https://itecony-neriva-backend.onrender.com/api/resources/${resourceId}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            proofLink: proofLink,
            proofType: 'link'
          })
        }
      );
      if (response.ok) {
        setShowModal(false);
        setProofLink('');
        alert('Resource marked as complete!');
      }
    } catch (err) {
      console.error('Error marking resource complete:', err);
      alert('Failed to mark resource complete');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `https://itecony-neriva-backend.onrender.com/api/resources/${resourceId}/bookmark`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      if (response.ok) {
        alert('Resource bookmarked!');
      }
    } catch (err) {
      console.error('Error bookmarking resource:', err);
    }
  };

  const renderStars = (count, filled) => {
    return Array(5).fill(0).map((_, i) => (
      <span
        key={i}
        className={`text-lg ${i < filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setShowSidebar(false)}
        ></div>
      )}

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <a className="text-gray-600 dark:text-gray-400 text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors" href="#">
            Home
          </a>
          <span className="text-gray-600 dark:text-gray-400 text-sm">/</span>
          <a className="text-gray-600 dark:text-gray-400 text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors" href="#">
            UI/UX Design
          </a>
          <span className="text-gray-600 dark:text-gray-400 text-sm">/</span>
          <span className="text-gray-900 dark:text-white text-sm font-medium">Advanced Prototyping in Figma</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* Page Heading */}
            <div className="space-y-4">
              <h1 className="text-gray-900 dark:text-white text-4xl md:text-5xl font-black tracking-tight">
                {resource.title}
              </h1>
              <div className="flex items-center gap-4">
                <img
                  src={resource.mentorImage}
                  alt={resource.mentor}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <a className="text-lg font-medium text-blue-600 dark:text-blue-400 hover:underline" href="#">
                  By {resource.mentor}
                </a>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 -mb-px">
                  {['description', 'outcomes', 'prerequisites'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base transition-colors ${
                        activeTab === tab
                          ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                          : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      {tab === 'description' ? 'Description' : tab === 'outcomes' ? 'Learning Outcomes' : 'Prerequisites'}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="text-gray-600 dark:text-gray-300 space-y-4">
                {activeTab === 'description' && (
                  <div className="space-y-4">
                    {resource.description.split('\n').map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                    <ul className="list-disc pl-5 space-y-2">
                      {resource.learningOutcomes.map((outcome, idx) => (
                        <li key={idx}>{outcome}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {activeTab === 'outcomes' && (
                  <div>
                    <ul className="list-disc pl-5 space-y-2">
                      {resource.learningOutcomes.map((outcome, idx) => (
                        <li key={idx}>{outcome}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {activeTab === 'prerequisites' && (
                  <p>{resource.prerequisites}</p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-3">
              {resource.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Reviews & Comments Section */}
            <div className="space-y-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Reviews & Comments</h2>

              {/* Rating Summary */}
              <div className="flex flex-wrap gap-x-12 gap-y-6 p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex flex-col gap-2">
                  <p className="text-gray-900 dark:text-white text-5xl font-black">{resource.rating}</p>
                  <div className="flex gap-0.5">
                    {renderStars(5, Math.floor(resource.rating))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-base">Based on {resource.reviews} reviews</p>
                </div>

                <div className="grid min-w-[240px] max-w-[400px] flex-1 grid-cols-[20px_1fr_40px] items-center gap-x-4 gap-y-2">
                  {Object.entries(resource.ratingBreakdown)
                    .reverse()
                    .map(([rating, percent]) => (
                      <div key={rating} className="contents">
                        <p className="text-gray-900 dark:text-white text-sm">{rating}</p>
                        <div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="rounded-full bg-yellow-400"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm text-right">{percent}%</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Add Review Form */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Leave a Review</h3>
                <div className="flex items-center gap-2">
                  <p className="text-gray-600 dark:text-gray-400">Your rating:</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setUserRating(star)}
                        className="text-3xl transition-colors"
                      >
                        {star <= userRating ? (
                          <span className="text-yellow-400">★</span>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600 hover:text-yellow-400">★</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your thoughts on this resource (min. 50 characters)..."
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitReview}
                    className="px-6 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                  >
                    Submit Review
                  </button>
                </div>
              </div>

              {/* Comments Thread */}
              <div className="space-y-6">
                {resource.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-4">
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-bold text-gray-900 dark:text-white">{comment.author}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{comment.timestamp}</p>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column Sidebar - Collapsible */}
          {/* Mobile Sidebar Toggle Button */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden fixed bottom-8 right-8 z-40 flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Sidebar */}
          <aside
            className={`fixed lg:static lg:col-span-1 inset-y-0 right-0 z-40 w-80 lg:w-auto lg:z-0 transition-transform duration-300 ease-in-out transform overflow-y-auto ${
              showSidebar ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
            }`}
          >
            <div className="lg:sticky lg:top-24 space-y-6 p-6 lg:p-0">
              {/* Close button for mobile */}
              <button
                onClick={() => setShowSidebar(false)}
                className="lg:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Action Buttons */}
              <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
                <button 
                  onClick={() => {
                    const resource = resources[0];
                    if (resource && resource.url) {
                      window.open(resource.url, '_blank');
                    }
                  }}
                  className="w-full flex items-center justify-center rounded-lg h-12 bg-blue-600 hover:bg-blue-700 text-white gap-2 text-lg font-bold transition-colors"
                >
                  <span>▶</span>
                  View Resource
                </button>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={handleBookmark}
                    className="flex flex-col items-center justify-center rounded-lg h-16 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 gap-1 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Bookmark className="w-5 h-5" />
                    Bookmark
                  </button>
                  <button 
                    onClick={() => setShowModal(true)}
                    className="flex flex-col items-center justify-center rounded-lg h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 gap-1 text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark Complete
                  </button>
                  <button className="flex flex-col items-center justify-center rounded-lg h-16 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 gap-1 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </div>

              {/* Metadata */}
              <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Details</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="text-blue-600 dark:text-blue-400 pt-1">📁</div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Resource Type</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{resource.resourceType}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-blue-600 dark:text-blue-400 pt-1">🎨</div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Domain</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{resource.domain}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-blue-600 dark:text-blue-400 pt-1">📊</div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Difficulty Level</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{resource.difficulty}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-blue-600 dark:text-blue-400 pt-1">⏱️</div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Time</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{resource.estimatedTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Completion Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg m-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mark Resource Complete</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600 dark:text-gray-300">Provide a link to your work (e.g., GitHub repo, deployed project) to mark this resource as complete.</p>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Proof Link
                </label>
                <input
                  type="url"
                  value={proofLink}
                  onChange={(e) => setProofLink(e.target.value)}
                  placeholder="https://github.com/your-repo"
                  className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCompletion}
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
              >
                <span>⬆️</span>
                {loading ? 'Uploading...' : 'Submit Completion Proof'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}