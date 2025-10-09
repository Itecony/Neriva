import React from "react";

const AuthLayout = ({ children, image }) => {
  return (
    // Outermost gradient layer
    <div className="min-h-screen flex items-center justify-center 
    bg-[radial-gradient(circle_at_30%_40%,_#38bdf8,_#3b82f6,_#9333ea,_#1e3a8a)]">
      {/* Background image container */}
      <div 
        className="hidden md:flex fixed inset-0 bg-cover bg-center 
                   backdrop-blur-sm items-center justify-center z-50 
                   mx-5 sm:mx-20 my-20 sm:my-10 py-8 rounded-3xl"
        // ✅ Use the image prop dynamically here
        style={{ backgroundImage: `url(${image})` }}
      >
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/30 rounded-3xl"></div>

        {/* Foreground content */}
        <div className="z-10 flex items-center justify-center w-full h-full">
          {children}
        </div>
      </div>

      {/* Fallback for small screens (no image) */}
      <div className="md:hidden flex items-center justify-center w-full h-full z-10">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;

