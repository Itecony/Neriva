import {Outlet} from 'react-router-dom'
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

export default function UserLayout() {
  return (
    <div className="flex flex-col h-screen">
      {/* Topbar - Full width at top */}
      <Topbar />
      
      {/* Sidebar and Main Content - Below topbar */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-gray-50" data-no-padding={location.pathname === '/networking'}>
          <div className={location.pathname === '/dreamboard/networking' ? '' : 'p-6'}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}