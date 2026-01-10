// src/components/BottomNav.jsx
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Network
} from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dreamboard', href: '/dreamboard' },
    { icon: BookOpen, label: 'Resources', href: '/resources' },
    { icon: Users, label: 'Mentors', href: '/dreamboard/mentorship' },
    { icon: Network, label: 'Network', href: '/dreamboard/networking' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 flex justify-around items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] safe-area-pb">
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        // Check if active (flexible matching)
        const isActive = item.href === '/dreamboard'
            ? location.pathname === '/dreamboard'
            : location.pathname.startsWith(item.href);

        return (
          <Link
            key={index}
            to={item.href}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-[70px] ${
              isActive 
                ? 'text-teal-600 bg-teal-50' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'fill-current opacity-100 stroke-2' : 'stroke-1.5'}`} />
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}