import { useState, useEffect } from 'react';
import { Hand, MessageSquare } from 'lucide-react';
import PostModal from '../ReUsable/PostModal/PostModal';


export default function Home() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);

  const ideas = [
    {
      title: 'REST and GraphQL',
      description: "What's the difference between REST a...",
      comments: 0,
      views: 9
    },
    {
      title: 'Leaked Password',
      description: 'How can I tell if my password has be....',
      comments: 3,
      views: 7
    },
    {
      title: 'Best Font for mobile apps',
      description: 'Which fonts work best for mobile app ....',
      comments: 2,
      views: 9
    }
  ];


  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('https://itecony-neriva-backend.onrender.com/api/users/profile/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      // According to docs, profile returns user data directly (no wrapper)
      const data = await response.json();
      
      console.log('📦 Profile data:', data);
      console.log('Role:', data.role);
      console.log('Interests:', data.interests);
      
      setProfile(data);
      setLoading(false);
      
    } catch (err) {
      console.error("❌ Failed to fetch profile:", err);
      setError(err.message);
      setLoading(false);
      
      if (err.message.includes('unauthorized') || err.message.includes('token')) {
        window.location.href = '/login';
      }
    }
  };


  const handlePostIdea = () => {
    setShowPostModal(true);
  };

  const handlePostSaved = (newPost) => {
    console.log('✅ Post created:', newPost);
    // Optionally refresh data or show success message
    setShowPostModal(false);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load profile</p>
          <button 
            onClick={fetchProfile}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Extract values from profile (according to docs)
  const userName = profile?.firstName || profile?.username || 'USER';
  // const userRole = profile?.role || 'Not set';
  const userInterests = Array.isArray(profile?.interests) ? profile.interests : [];


  return (
    <div className="max-w-7xl mx-auto">

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Hand className="w-6 h-6" />
          <h1 className="text-2xl font-bold text-gray-900">
            WELCOME {userName.toUpperCase()}
          </h1>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Post Ideas, Innovations. Ask Questions and Get solutions</p>
        </div>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        {/* Grow Card */}
        <div className="relative h-40 rounded-xl overflow-hidden group cursor-pointer">
          <img 
            src="/assets/grow-communities.png" 
            alt="Grow" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all"></div>
          <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Grow</span>
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
            </div>
            <div>
              <span className="text-sm">Explore communities...</span>
            </div>
          </div>
        </div>

        </div>


      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Ideas Section */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Top Ideas for you</h2>
            <p className="text-sm text-gray-600">
              {userInterests.length > 0 
                ? 'Based on your interests' 
                : 'Explore popular ideas from the community'}
            </p>
          </div>
          
          <div className="space-y-4">
            {ideas.map((idea, index) => (
              <div 
                key={index}
                className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 p-3 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex flex-col items-center gap-1 text-gray-600 text-xs min-w-[60px]">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>{idea.comments} comments</span>
                  </div>
                  <div>
                    <span>{idea.views} views</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-blue-600 font-medium mb-1 hover:underline">
                    {idea.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {idea.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-4">
            Read more....
          </button>
        </div>

      </div>


      {/* Post Idea Modal - ADD THIS */}
      {showPostModal && (
        <PostModal
          mode="create"
          onClose={() => setShowPostModal(false)}
          onSave={handlePostSaved}
        />
      )}
    </div>
  );
}