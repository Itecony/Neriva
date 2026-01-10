import React from "react";

const AuthLayout = ({ children, image }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-900">
      
      {/* 1. DESKTOP BACKGROUND: Gradient */}
      <div className="absolute inset-0 hidden md:block bg-[radial-gradient(circle_at_30%_40%,_#38bdf8,_#3b82f6,_#9333ea,_#1e3a8a)]"></div>

      {/* 2. MOBILE BACKGROUND: Full Screen Image */}
      <div 
        className="absolute inset-0 md:hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      {/* 3. DESKTOP IMAGE CONTAINER (The floating card effect) */}
      <div 
        className="absolute hidden md:block inset-0 m-8 lg:m-16 rounded-[2.5rem] bg-cover bg-center shadow-2xl overflow-hidden"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>

      {/* 4. CONTENT LAYER */}
      <div className="relative z-10 w-full max-w-md px-4 h-full flex flex-col justify-center">
        {children}
      </div>

    </div>
  );
};

export default AuthLayout;