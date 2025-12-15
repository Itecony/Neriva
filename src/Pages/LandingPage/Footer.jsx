import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer 
      className="relative bg-cover bg-center bg-no-repeat text-white"
      style={{ backgroundImage: "url('/assets/Footer.png')" }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-12 sm:py-16">
        <div className="flex flex-col md:flex-row justify-between mb-12">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <img
                src="/assets/Neriva Main logo Dark UI.png"
                alt="Company Logo"
                className="h-14 w-25"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 space-x-10">
          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-bold mb-4">Platform</h3>
            <ul className="space-y-3">
              <li>
                <a href="/home" className="text-sm text-white hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/about-us" className="text-sm text-white hover:text-white transition-colors">
                  About us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-sm text-white hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-bold mb-4">Resources</h3>
            <ul className="space-y-3">
              {/* <li>
                <a href="/hackbar" className="text-sm text-white hover:text-white transition-colors">
                  Hackbar
                </a>
              </li>
              <li>
                <a href="/projects" className="text-sm text-white hover:text-white transition-colors">
                  Projects
                </a>
              </li>
              <li>
                <a href="/classes" className="text-sm text-white hover:text-white transition-colors">
                  Classes
                </a>
              </li> */}
              <li>
                <a href="/dreamboard/mentorship" className="text-sm text-white hover:text-white transition-colors">
                  Mentorship
                </a>
              </li>
              <li>
                <a href="/dreamboard/resources" className="text-sm text-white hover:text-white transition-colors">
                  Resource Library
                </a>
              </li>
            </ul>
          </div>

          {/* Community Links */}
          {/* <div>
            <h3 className="text-sm font-bold mb-4">Community</h3>
            <ul className="space-y-3">
              <li>
                <a href="/forum" className="text-sm text-white hover:text-white transition-colors">
                  Forum
                </a>
              </li>
              <li>
                <a href="/events" className="text-sm text-white hover:text-white transition-colors">
                  Events
                </a>
              </li>
            </ul>
          </div> */}
        </div>
          {/* Newsletter Section */}
          <div className="flex flex-col sm:flex-col justify-between items-start sm:items-center gap-6">
            <div>
              <h3 className="text-lg font-bold mb-2">Subscribe</h3>
              <p className="text-sm text-white">
                Stay updated with our latest opportunities and resources.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-white text-gray-900 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 w-full sm:w-64"
              />
              <button className="bg-transparent border border-white text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium whitespace-nowrap">
                Submit
              </button>
            </div>
            <p> By subscribing, you agree to our privacy </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-700">
          <p className="text-sm text-white">
            © 2025 Itecony Solutions. All rights reserved
          </p>
          
          {/* Social Media Icons */}
          <div className="flex gap-4">
            <a 
              href="https://www.facebook.com/share/17qBvVfZ1Q/" 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a 
              href="https://x.com/_itecony?t=JSjdR5lqv1RhAB-SS2qiaQ&s=09" 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a 
              href="https://www.instagram.com/itecony_solutions?igsh=MTBhbTM2ejBkdGp1bg==" 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a 
              href="#" 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}