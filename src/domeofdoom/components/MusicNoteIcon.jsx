import React from "react";

const MusicNoteIcon = ({ size = 14, className }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9 18V6l12-2v12"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export default MusicNoteIcon;
