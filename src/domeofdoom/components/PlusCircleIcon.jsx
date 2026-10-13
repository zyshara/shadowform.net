import React from "react";

const PlusCircleIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export default PlusCircleIcon;
