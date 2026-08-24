import React from "react";

const ShirtIcon = ({ size = 14, className }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8 4 4 7l2 3 2-1.2V20h8V8.8L18 10l2-3-4-3-2 2h-4L8 4Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

export default ShirtIcon;
