import { useState, useEffect } from 'react';
import { 
  Bookmark, 
  CheckCircle, 
  Clock, 
  Flame, 
  Compass, 
  ArrowRight 
} from 'lucide-react';

export default function MentorshipHub() {
  const [activeTab, setActiveTab] = useState('continue'); // 'continue', 'completed', 'reviews'
  const [profile, setProfile] = useState(null);

  // Mock Data for the Stats Row
  const stats = [
    { label: 'Bookmarked', value: '4', icon: Bookmark, color: 'text-blue-500' },
    { label: 'Completion Rate', value: '76%', icon: CheckCircle, color: 'text-green-500' },
    { label: 'Learning Hours', value: '42.5h', icon: Clock, color: 'text-purple-500' },
    { label: 'Learning Streak', value: '12 days', icon: Flame, color: 'text-orange-500' },
    { label: 'Domains Explored', value: '5', icon: Compass, color: 'text-yellow-500' },
  ];

  // Mock Data for "Continue Learning"
  const learningItems = [
    {
      id: 1,
      type: 'ARTICLE',
      title: 'Advanced CSS and Sass',
      description: 'Master modern CSS techniques including Flexbox, Grid, and responsive design patterns...',
      progress: 65,
    },
    {
      id: 2,
      type: 'VIDEO',
      title: 'React Hooks Deep Dive',
      description: 'Understand the internal working of React Hooks and how to build custom hooks...',
      progress: 40,
    },
    {
      id: 3,
      type: 'COURSE',
      title: 'Full Stack Development',
      description: 'A comprehensive guide to building MERN stack applications from scratch...',
      progress: 12,
    }
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-4 lg:p-8 font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        
        <div className="flex gap-3">
          {/* Explore More Button */}
          <button 
            onClick={() => window.location.href = '/dreamboard/resources'}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
          >
            Explore Resources <ArrowRight className="w-4 h-4" />
          </button>
          
          <button className="bg-blue-900 text-white px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-colors font-medium text-sm">
            Become a Mentor
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="text-gray-500 text-sm font-medium">{stat.label}</span>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div>
        {/* Tabs */}
        <div className="flex gap-8 mb-6 border-b border-gray-200">
          {['Continue Learning', 'Completed', 'My reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase().split(' ')[0])}
              className={`pb-3 text-sm font-semibold transition-colors relative ${
                activeTab === tab.toLowerCase().split(' ')[0]
                  ? 'text-gray-900' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
              {activeTab === tab.toLowerCase().split(' ')[0] && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* List of Learning Items */}
        <div className="space-y-4 max-w-4xl">
          {learningItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow"
            >
              {/* Thumbnail Placeholder */}
              <div className="w-full sm:w-48 h-32 bg-gray-200 rounded-xl flex-shrink-0"></div>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <span className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-1 block">
                    {item.type}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                    {item.description}
                  </p>
                </div>

                {/* Progress Section */}
                <div>
                   <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-gray-700">{item.progress}% complete</span>
                   </div>
                   <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                   </div>
                </div>
              </div>

              {/* Action Button (Right Side on Desktop) */}
              <div className="flex items-center justify-end sm:justify-center">
                <button className="bg-blue-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-blue-800 transition-colors">
                  Continue
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (if needed) */}
        {learningItems.length === 0 && (
           <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
             <p className="text-gray-500">You haven't started any courses yet.</p>
             <button 
                onClick={() => window.location.href = '/dreamboard/resources'}
                className="mt-4 text-blue-600 font-medium hover:underline"
             >
               Browse Library
             </button>
           </div>
        )}
      </div>

    </div>
  );
}