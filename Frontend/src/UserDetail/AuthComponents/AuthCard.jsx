import React from "react";

const AuthCard = ({ children }) => {
  return (
    <div 
      className="
        w-full 
        bg-white/10 backdrop-blur-xl 
        border border-white/20 shadow-2xl 
        rounded-3xl 
        p-6 sm:p-8 
        
        /* ✅ MOBILE FILL FIX: */
        /* Forces card to be tall on mobile, auto height on desktop */
        min-h-[75vh] md:min-h-0 
        flex flex-col justify-center
      "
    >
      {/* Optional: Glass shine effect */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
      
      {children}
    </div>
  );
};

export default AuthCard;

// bg-gradient-to-b from-sky-300 to-blue-600