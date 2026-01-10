import { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Settings, LogOut } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Topbar() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [profile, setProfile] = useState(null);
  
  const menuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Data
  useEffect(() => {
    const initData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const headers = { 'Authorization': `Bearer ${token}` };

        const profileRes = await fetch('https://itecony-neriva-backend.onrender.com/api/profile', { headers });
        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile(data.data || data);
        }

        const notifRes = await fetch('https://itecony-neriva-backend.onrender.com/api/admin/mentor-applications?status=pending&limit=1', { headers });
        if (notifRes.ok) {
          const data = await notifRes.json();
          setPendingCount(data.pagination?.total || 0);
        }
      } catch (error) { console.error(error); }
    };
    initData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getInitials = () => {
    if (!profile) return 'U';
    return ((profile.firstName?.[0] || '') + (profile.lastName?.[0] || '')).toUpperCase();
  };

  return (
    // ✅ CHANGED: Added 'md:hidden' to hide this entire bar on desktop screens
    <header className="md:hidden bg-white border-b border-gray-200 h-16 flex items-center px-4 w-full sticky top-0 z-50">
      <div className="flex items-center justify-between w-full relative" ref={menuRef}>
        
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/assets/Neriva main logo Light UI.png" alt="Neriva" className="h-8 w-auto object-contain" />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          
          {/* Notification Icon */}
          <div className="relative">
            <button onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              {pendingCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>}
            </button>
            
            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                  <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                </div>
                {pendingCount > 0 ? (
                  <div onClick={() => navigate('/admin/mentor-applications')} className="p-3 hover:bg-teal-50 cursor-pointer transition-colors border-b border-gray-50">
                    <p className="text-sm font-medium text-gray-800">Pending Applications</p>
                    <p className="text-xs text-gray-500">{pendingCount} waiting for review.</p>
                  </div>
                ) : (
                   <div className="p-4 text-center text-gray-500 text-xs">No new notifications</div>
                )}
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button 
              onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
              className="w-9 h-9 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center hover:bg-teal-100 transition-colors"
            >
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-teal-700 font-bold text-sm">{getInitials()}</span>
              )}
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                  <p className="font-semibold text-gray-900 truncate">{profile?.firstName} {profile?.lastName}</p>
                  <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
                </div>
                <div className="p-2 space-y-1">
                  <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-teal-50 rounded-lg">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-teal-50 rounded-lg">
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg text-left">
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}