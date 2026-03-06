import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../config';
import socketService from '../../../utils/socketService';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Network,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Award
} from 'lucide-react';

import { useNotifications } from '../../../context/NotificationContext';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { alerts, profile, logout } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (!profile) return 'U';
    const first = profile.firstName?.[0] || '';
    const last = profile.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  const getUserRole = () => {
    if (profile?.role === 'admin') return 'Admin';
    if (profile?.is_mentor) return 'Mentor';
    if (!profile?.role) return 'Member';
    return profile.role.charAt(0).toUpperCase() + profile.role.slice(1);
  };

  const getImageUrl = (img) => {
    if (!img) return null;
    const src = typeof img === 'string' ? img : img.image_url;
    if (!src) return null;
    if (src.startsWith('http') || src.startsWith('blob:')) return src;
    return `${API_BASE_URL}/${src}`;
  };

  // ✅ UPDATED: Added 'id' keys to map alerts to items
  const menuItems = [
    { id: 'dreamboard', icon: LayoutDashboard, label: 'Dreamboard', href: '/dreamboard' },
    { id: 'resources', icon: BookOpen, label: 'Resource Library', href: '/resources' },
    { id: 'mentorship', icon: Users, label: 'Mentorship Hub', href: '/dreamboard/mentorship' },
    { id: 'networking', icon: Network, label: 'Networking Hub', href: '/networking' },
  ];

  return (
    <aside
      className={`
        hidden md:flex 
        h-full bg-gradient-to-b from-teal-600 via-cyan-700 to-blue-800 
        text-white flex-col transition-all duration-300 shadow-2xl z-50 relative 
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >

      {/* --- Header Section --- */}
      <div className={`relative flex flex-col items-center transition-all duration-300 ${isCollapsed ? 'pt-6 pb-4' : 'pt-6 pb-6 px-4'}`}>

        {/* Logo & Toggle */}
        <div className={`w-full flex items-center transition-all duration-300 ${isCollapsed ? 'flex-col gap-4 mb-4' : 'justify-between mb-5 px-1'}`}>
          <img
            src={isCollapsed ? "/assets/Neriva Favicon Secondary.png" : "/assets/Neriva Main logo Dark UI.png"}
            alt="Neriva"
            className={`object-contain transition-all duration-300 ${isCollapsed ? 'h-8 w-8' : 'h-10 w-auto'}`}
          />
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Profile Avatar */}
        <div onClick={() => navigate('/profile')} className="relative cursor-pointer group">
          {profile?.avatar || profile?.profileImage ? (
            <img
              src={getImageUrl(profile.avatar || profile.profileImage)}
              alt={profile.firstName}
              className={`rounded-full object-cover border-2 border-white/30 group-hover:border-white transition-all shadow-lg bg-white/10 ${isCollapsed ? 'w-10 h-10' : 'w-16 h-16'
                }`}
              onError={(e) => { e.target.onerror = null; e.target.src = ""; }}
            />
          ) : (
            <div className={`rounded-full bg-white/10 flex items-center justify-center font-bold text-white border-2 border-white/30 group-hover:border-white transition-all shadow-lg backdrop-blur-sm ${isCollapsed ? 'w-10 h-10 text-sm' : 'w-16 h-16 text-xl'
              }`}>
              {getInitials()}
            </div>
          )}
        </div>

        {/* Name & Role */}
        {!isCollapsed && (
          <div className="text-center mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <h3 onClick={() => navigate('/profile')} className="text-lg font-bold text-white truncate max-w-[180px] cursor-pointer hover:text-teal-100">
              {profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : 'Loading...'}
            </h3>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              {profile?.role === 'admin' ? (
                <ShieldCheck className="w-3 h-3 text-teal-200" />
              ) : profile?.is_mentor ? (
                <Award className="w-3 h-3 text-yellow-300" />
              ) : null}
              <p className="text-xs text-teal-100/80 font-medium uppercase tracking-wider">{getUserRole()}</p>
            </div>
          </div>
        )}
      </div>

      {/* --- Divider --- */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-2"></div>

      {/* --- Navigation Items --- */}
      <nav className={`flex-1 overflow-y-auto px-3 space-y-1 py-2 ${isCollapsed ? '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden' : 'custom-scrollbar'}`}>
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.href === '/dreamboard'
            ? location.pathname === '/dreamboard'
            : location.pathname === item.href || location.pathname.startsWith(item.href + '/');

          // ✅ Get Alert Count for this item
          const alertCount = alerts[item.id] || 0;

          return (
            <Link
              key={index}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                ? 'bg-white/15 text-white shadow-sm font-semibold'
                : 'text-white/80 hover:bg-white/5 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-teal-200' : ''}`} />

                {/* ✅ ALERT BADGE (Collapsed Mode) */}
                {isCollapsed && alertCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-teal-700 rounded-full"></span>
                )}
              </div>

              {!isCollapsed && (
                <>
                  <span className="text-sm tracking-wide flex-1">{item.label}</span>

                  {/* ✅ ALERT BADGE (Expanded Mode) - Red Dot Style */}
                  {alertCount > 0 && (
                    <div className="flex items-center justify-center">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm"></span>
                    </div>
                  )}
                </>
              )}

              {isCollapsed && (
                <div className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-white/10">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* --- Bottom Actions --- */}
      <div className="p-4 border-t border-white/10 space-y-1 bg-black/10">
        <Link to="/profile" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-white/80 hover:bg-white/10 hover:text-white ${isCollapsed ? 'justify-center' : ''}`}>
          <Settings className="w-5 h-5" />
          {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
        </Link>

        <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-red-200 hover:bg-red-500/20 hover:text-red-100 ${isCollapsed ? 'justify-center' : ''}`}>
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="text-sm font-medium">Log out</span>}
        </button>
      </div>
    </aside>
  );
}