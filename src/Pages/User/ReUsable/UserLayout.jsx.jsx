// src/UserLayout.jsx
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import BottomNav from "./BottomNav"; // ✅ Import new component

export default function UserLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      
      {/* 1. Topbar */}
      <Topbar />
      
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* 2. Sidebar (Hidden on mobile via its own CSS) */}
        <Sidebar />
        
        {/* 3. Main Content Area */}
        <main className="flex-1 overflow-y-auto scroll-smooth w-full">
          <div className={`
            min-h-full
            ${location.pathname === '/dreamboard/networking' ? '' : 'p-4 md:p-6'} 
            
            /* ✅ CRITICAL: Add padding-bottom on mobile so content isn't behind nav */
            pb-24 md:pb-6 
          `}>
            <Outlet />
          </div>
        </main>

      </div>

      {/* 4. Bottom Navigation (Visible only on mobile) */}
      <BottomNav />
      
    </div>
  );
}