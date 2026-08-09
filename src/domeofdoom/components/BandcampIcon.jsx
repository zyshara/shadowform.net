import React from "react";

// Bandcamp's flag/arrow mark (the standard glyph shape, also used by
// projects like Simple Icons) drawn as a single currentColor path — no
// baked-in circle background, so it always matches whatever color it's
// placed in, e.g. a Button's text color.
const BandcampIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 18.75l7.437-13.5H24l-7.438 13.5H0z" fill="currentColor" />
  </svg>
);

export default BandcampIcon;
