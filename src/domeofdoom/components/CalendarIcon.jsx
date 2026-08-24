import React from "react";

const CalendarIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3 10H21" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 3V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M16 3V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export default CalendarIcon;
