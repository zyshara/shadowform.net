import React from "react";

const Eraser = ({ size = 22, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18.5 13.5 9 4a2 2 0 0 0-2.8 0L3 7.2a2 2 0 0 0 0 2.8l8 8" />
    <path d="M9.5 20H20" />
    <path d="M10.2 12.8 16 18.6" />
  </svg>
);

export default Eraser;
