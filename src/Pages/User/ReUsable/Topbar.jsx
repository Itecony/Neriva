import { Search } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 w-full">
      <div className="flex items-center justify-between w-full">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/assets/Neriva main logo Light UI.png"
            alt="Company Logo"
            className="h-14 w-25"
          />
        </div>
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />
            <input
              type="text"
              placeholder="Search"
              className="placeholder:text-black w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Right side - can add user profile, notifications etc */}
        <div className="flex items-center gap-4">
          {/* Placeholder for future additions like profile icon */}
        </div>
      </div>
    </header>
  );
}