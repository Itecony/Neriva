import React from 'react';
// Import other necessary icons here as you add them

// Add a 'Icon' prop (capitalized because it's a component)
const InputField = ({ id, type = "text", placeholder, value, onChange}) => {
  return (
    <div className="flex flex-col gap-y-2 w-full">
      {/* Container to hold the icon and the input */}
      <div className="relative flex items-center w-full">
        {/* The input field */}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="placeholder-white placeholder:font-semibold text-white font-semibold w-full p-2 sm:p-3 rounded-xl bg-white/10 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default InputField;