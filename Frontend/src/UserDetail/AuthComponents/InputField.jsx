import React from 'react';

const InputField = ({ id, type = "text", placeholder, value, onChange }) => {
  return (
    <div className="flex flex-col gap-y-2 w-full">
      <div className="relative flex items-center w-full">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="
            w-full 
            p-3.5 
            rounded-xl 
            bg-white/10 
            border border-white/10 
            backdrop-blur-md
            text-white 
            placeholder-white/60 
            font-medium
            transition-all 
            duration-200
            focus:outline-none 
            focus:ring-2 
            focus:ring-blue-400 
            focus:bg-white/20
          "
        />
      </div>
    </div>
  );
};

export default InputField;