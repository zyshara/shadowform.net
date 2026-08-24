import React from "react";

const SectionDots = ({ color = "var(--dod-lilac)", size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g fill={color}>
      <path d="M30 30 L37.99 17.66 A9.5 9.5 0 1 0 22.01 17.66 Z" />
      <path d="M30 30 L37.99 17.66 A9.5 9.5 0 1 0 22.01 17.66 Z" transform="rotate(90 30 30)" />
      <path d="M30 30 L37.99 17.66 A9.5 9.5 0 1 0 22.01 17.66 Z" transform="rotate(180 30 30)" />
      <path d="M30 30 L37.99 17.66 A9.5 9.5 0 1 0 22.01 17.66 Z" transform="rotate(270 30 30)" />
    </g>
  </svg>
);

export default SectionDots;
