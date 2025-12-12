import { useState, useEffect } from 'react';
import { 
  Home, 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Trophy, 
  DollarSign, 
  Briefcase, 
  Network,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://itecony-neriva-backend.onrender.com/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dreamboard', href: '/dreamboard' },
    { icon: BookOpen, label: 'Resource Library', href: '/resources' },
    { icon: Users, label: 'Mentorship Hub', href: '/mentorship' },
    { icon: Network, label: 'Networking hub', href: '/dreamboard/networking' },
  ];

  const bottomItems = [
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: LogOut, label: 'Log out', href: '/login' },
  ];

  return (
    <aside className={`h-full bg-gradient-to-b from-teal-500 via-cyan-600 to-blue-700 text-white flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-60'
    }`}>
      
      {/* Toggle Button + Profile Section */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'p-4 flex justify-center' : 'p-4'}`}>
        {!isCollapsed && (
          <>
            {/* Profile Card */}
            <div className="mb-4 text-center">
              <img
                src="/assets/Image(1).png"
                alt={profile?.firstName}
                className="w-16 h-16 rounded-full object-contain mx-auto mb-2 border-2 border-white border-opacity-50"
              />
              <h3 
                onClick={() => window.location.href = '/profile'}
                className="text-sm font-semibold text-white truncate cursor-pointer">
                {profile?.firstName} {profile?.lastName}
              </h3>
            </div>
            {/* Divider */}
            <div className="w-full h-px bg-white bg-opacity-20 mb-4"></div>
          </>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-3 hover:bg-white hover:bg-opacity-20 hover:text-teal-600 rounded-lg transition-colors w-full flex justify-center"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 pb-4 overflow-y-auto px-3">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <a
              key={index}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 hover:bg-white hover:text-teal-600 hover:bg-opacity-10 rounded-lg transition-colors ${
                isCollapsed ? 'justify-center' : 'justify-start'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon className="w-5 h-5 font-semibold flex-shrink-0" />
              {!isCollapsed && <span className="text-base font-medium">{item.label}</span>}
            </a>
          );
        })}
      </nav>

      {/* Bottom Items */}
      <div className="border-t border-white border-opacity-20 py-4 px-3">
        {bottomItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <a
              key={index}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 hover:bg-white hover:text-teal-600 hover:bg-opacity-10 rounded-lg transition-colors ${
                isCollapsed ? 'justify-center' : 'justify-start'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </a>
          );
        })}
      </div>
    </aside>
  );
}