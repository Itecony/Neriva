import React from "react";

export default function AuthButton({ label, children, loading, disabled, ...props }) {
  return (
    <button
      disabled={loading || disabled}
      className={`
        w-full h-12 mt-2
        text-white text-lg font-bold font-mono 
        flex items-center justify-center 
        rounded-xl transition-all duration-200
        ${loading || disabled 
          ? "bg-blue-900/50 cursor-not-allowed opacity-80" 
          : "bg-blue-950 hover:bg-indigo-800 hover:shadow-lg active:scale-[0.98]"}
      `}
      {...props}
    >
      {loading ? (
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        label || children
      )}
    </button>
  );
}
