import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      id="contact"
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
          <div className="grid grid-cols-2 gap-8 md:gap-16">
            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-bold mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/" className="text-sm text-white hover:text-white transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-sm text-white hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#mentorship" className="text-sm text-white hover:text-white transition-colors">
                    Mentorship
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="text-sm font-bold mb-4">Explore</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#resources" className="text-sm text-white hover:text-white transition-colors">
                    Resources
                  </a>
                </li>
                <li>
                  <a href="#networking" className="text-sm text-white hover:text-white transition-colors">
                    Networking
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
            <p className="text-sm text-white mt-2">By subscribing, you agree to our privacy policy.</p>
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
              href="https://www.facebook.com/share/1FetEL3YF7/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://x.com/_itecony?t=3Btv48zPAi6l7j-rKTPsZA&s=09"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              aria-label="X (Twitter)"
            >
              {/* X Icon SVG since lucide-react might not have it or it might be Twitter */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/itecony_solutions?igsh=MTBhbTM2ejBkdGp1bg=="
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://ng.linkedin.com/in/itecony-solutions-ltd-10835536a?utm_source=share&utm_medium=member_mweb&utm_campaign=share_via&utm_content=profile"
              target="_blank"
              rel="noopener noreferrer"
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