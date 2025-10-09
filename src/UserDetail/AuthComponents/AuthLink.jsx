import React from "react";
import { Link } from "react-router-dom";

const AuthLink = ({ to, children, design = "default" }) => {
  // Define different styles based on the "design" prop
  const baseStyle = "text-sm transition-colors duration-200";
  
  const designs = {
    default: "text-white hover:text-blue-400",               // Normal link (no underline)
    underline: "text-white hover:text-blue-400 underline",   // Always underlined
    subtle: "text-white hover:underline hover:text-blue-400",// Only underline on hover
    accent: "text-blue-400 underline decoration-dotted",     // Dotted underline style
  };

  const designStyle = designs[design] || designs.default;

  return (
    <Link to={to} className={`${baseStyle} ${designStyle}`}>
      {children}
    </Link>
  );
};

export default AuthLink;
