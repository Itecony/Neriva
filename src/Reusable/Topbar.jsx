import { useState } from 'react';
import { ChevronRight, Menu, X } from 'lucide-react';

export default function Topbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Desktop Topbar - visible on sm screens and above */}
      <nav className="hidden sm:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <a href="/" className="flex items-center">
              <div className="flex items-center gap-2">
                {/* <div className="w-8 h-8 bg-blue-600 rounded"></div>
                <span className="text-xl font-bold text-gray-900">ITECONY</span>
                <span className="text-sm text-gray-600">SOLUTIONS</span> */}
              </div>
            </a>
            {/* Navigation Links */}
            <div className="flex items-center gap-8">
              <a href="/" className="text-black font-semibold hover:underline transition-colors">
                Home
              </a>
              <a href="/communities" className="text-black font-semibold hover:underline transition-colors">
                Communities
              </a>
              <a href="/projects" className="text-black font-semibold hover:underline transition-colors">
                Projects
              </a>
              <a href="/resources" className="flex items-center gap-1 text-black font-semibold hover:underline transition-colors">
                Resources
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
            {/* Login Button */}
            <a
              href="/login"
              className="bg-blue-800 text-white flex items-center justify-center px-2 py-1 rounded-xl hover:bg-indigo-800 transition-colors"
            >
              Login
            </a>
          </div>
        </div>
      </nav>

      {/* Mobile Topbar - visible only on mobile screens */}
      <nav className="sm:hidden bg-white border-b border-gray-200">
        <div className="px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={toggleSidebar}
                className="text-gray-900 hover:text-gray-600 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Logo */}
              <a href="/" className="flex items-center">
                <div className="flex items-center gap-2">
                  {/* <div className="w-8 h-8 bg-blue-600 rounded"></div>
                  <span className="text-xl font-bold text-gray-900">ITECONY</span>
                  <span className="text-sm text-gray-600">SOLUTIONS</span> */}
                </div>
              </a>
            </div>

            {/* Login Button - Always visible on top right */}
            <a href="/login">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                Login
              </button>
            </a>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
            onClick={toggleSidebar}
          ></div>

          {/* Sidebar */}
          <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 sm:hidden">
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded"></div>
                  <div>
                    {/* <span className="text-lg font-bold text-gray-900 block">ITECONY</span>
                    <span className="text-xs text-gray-600">SOLUTIONS</span> */}
                  </div>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="text-gray-900 hover:text-gray-600 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Sidebar Navigation */}
              <nav className="flex flex-col p-4 gap-4">
                <a
                  href="/"
                  className="text-black hover:underline transition-colors py-2"
                  onClick={toggleSidebar}
                >
                  Home
                </a>
                <a
                  href="/communities"
                  className="text-gray-900 hover:text-gray-600 transition-colors py-2"
                  onClick={toggleSidebar}
                >
                  Communities
                </a>
                <a
                  href="/projects"
                  className="text-gray-900 hover:text-gray-600 transition-colors py-2"
                  onClick={toggleSidebar}
                >
                  Projects
                </a>
                <a
                  href="/resources"
                  className="flex items-center gap-1 text-gray-900 hover:text-gray-600 transition-colors py-2"
                  onClick={toggleSidebar}
                >
                  Resources
                  <ChevronRight className="w-4 h-4" />
                </a>
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}