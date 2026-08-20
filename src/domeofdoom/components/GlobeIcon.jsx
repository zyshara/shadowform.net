import React from "react";

// A simple wireframe globe - outer circle, horizontal equator, and a
// lens-shaped meridian (the same curve GridDome.jsx uses for its dome
// silhouette, just mirrored top-to-bottom into a full sphere instead of
// a single hemisphere) plus one more meridian rotated 90°, flattened
// into an ellipse the way a front-on globe illustration foreshortens it.
const GlobeIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <ellipse cx="12" cy="12" rx="3.6" ry="9" stroke="currentColor" strokeWidth="1.6" />
    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export default GlobeIcon;
