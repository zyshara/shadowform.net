import React from "react";

// Small disc mark for a "Releases" stat row.
const VinylIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

export default VinylIcon;
