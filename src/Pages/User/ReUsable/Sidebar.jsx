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
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    // { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: LayoutDashboard, label: 'Dreamboard', href: 'dashboard/dreamboard' },
    { icon: BookOpen, label: 'Resource Library', href: '/resources' },
    { icon: Users, label: 'Mentorship Hub', href: '/mentorship' },
    // { icon: Trophy, label: 'Challenges', href: '/challenges' },
    // { icon: DollarSign, label: 'Funding', href: '/funding' },
    // { icon: Briefcase, label: 'Job/ I.T. Exchange', href: '/jobs' },
    { icon: Network, label: 'Networking hub', href: '/networking' },
  ];

  const bottomItems = [
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: LogOut, label: 'Log out', href: '/login' },
  ];

  return (
    <aside className="w-60 h-full bg-gradient-to-b from-teal-500 via-cyan-600 to-blue-700 text-white flex flex-col">
      {/* Menu Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <a
              key={index}
              href={item.href}
              className="flex items-center gap-3 px-6 py-3 hover:bg-white hover:text-cyan-700 hover:bg-opacity-10 transition-colors"
            >
              <Icon className="w-5 h-5 font-semibold" />
              <span className="text-base font-medium">{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Bottom Items */}
      <div className="border-t border-white border-opacity-20 py-4">
        {bottomItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <a
              key={index}
              href={item.href}
              className="flex items-center gap-3 px-6 py-3 hover:bg-white hover:bg-opacity-10 hover:text-cyan-700 transition-colors"
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </a>
          );
        })}
      </div>
    </aside>
  );
}