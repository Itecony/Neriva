import React from "react";

export default function AuthButton({ label,children, ...props }) {
  return (
    <button
      className="w-full h-12 bg-blue-950 hover:bg-indigo-800 text-white text-lg font-bold font-mono flex items-center justify-center rounded-lg transition-colors"
      {...props}
    >
      {label || children}
    </button>
  );
}
