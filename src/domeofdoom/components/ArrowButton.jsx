import React from "react";

// Bordered square chevron button - prev/next style navigation. Default/
// hover/active/disabled states per the reference design: a thin colored
// border and icon at rest, a soft glow on hover, a filled/brighter-glow
// tint while pressed, and a flat muted grey when disabled (computed
// separately from the color variants below rather than layered via CSS
// disabled: modifiers, so a disabled button never flashes hover/active
// color on touch devices that treat tap as hover+active).
const COLOR_CLASSES = {
  "deep-purple":
    "border-dod-deep-purple text-dod-deep-purple hover:shadow-[0_0_12px_-2px_var(--dod-deep-purple)] active:bg-dod-deep-purple/20 active:shadow-[0_0_16px_-1px_var(--dod-deep-purple)]",
  lilac:
    "border-dod-lilac text-dod-lilac hover:shadow-[0_0_12px_-2px_var(--dod-lilac)] active:bg-dod-lilac/20 active:shadow-[0_0_16px_-1px_var(--dod-lilac)]",
  "neon-mint":
    "border-dod-neon-mint text-dod-neon-mint hover:shadow-[0_0_12px_-2px_var(--dod-neon-mint)] active:bg-dod-neon-mint/20 active:shadow-[0_0_16px_-1px_var(--dod-neon-mint)]",
};

const ArrowButton = ({
  direction = "left",
  color = "lilac",
  size = 40,
  className = "",
  disabled = false,
  onClick,
  ...rest
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    style={{ width: size, height: size }}
    className={`flex flex-shrink-0 items-center justify-center border transition-[box-shadow,background-color] duration-150 ${
      disabled
        ? "cursor-not-allowed border-dod-white/15 text-dod-white/20"
        : `cursor-pointer ${COLOR_CLASSES[color] ?? COLOR_CLASSES.lilac}`
    } ${className}`}
    {...rest}
  >
    <svg width="40%" height="40%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d={direction === "right" ? "M9 6L15 12L9 18" : "M15 6L9 12L15 18"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </button>
);

export default ArrowButton;
