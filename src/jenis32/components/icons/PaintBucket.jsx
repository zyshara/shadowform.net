import React from "react";

const PaintBucket = ({ size = 22, ...props }) => (
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
    <path d="M18.5 10.5 9.8 1.8 2.3 9.3a2 2 0 0 0 0 2.8l6.6 6.6a2 2 0 0 0 2.8 0l6.8-6.8Z" />
    <path d="M4.5 4.5 7 7" />
    <path d="M1.5 12.5h16" />
    <path d="M21.5 19c0 1.5-1.1 2.8-2.2 2.8s-2.2-1.3-2.2-2.8c0-1.3 2.2-3.5 2.2-3.5s2.2 2.2 2.2 3.5Z" />
  </svg>
);

export default PaintBucket;
