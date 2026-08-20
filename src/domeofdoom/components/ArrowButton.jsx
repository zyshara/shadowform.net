import React from "react";

// Bordered chevron button - prev/next style navigation. Default/hover/
// active/disabled states per the reference design: a thin colored border
// and icon at rest, a soft glow on hover, a filled/brighter-glow tint
// while pressed, and a flat muted grey when disabled (computed separately
// from the color variants below rather than layered via CSS disabled:
// modifiers, so a disabled button never flashes hover/active color on
// touch devices that treat tap as hover+active).
//
// Tap area and visible square are independent on purpose - a mobile tap
// target needs to be much taller than the square (e.g. spanning a whole
// carousel row for easy thumbing) without the border itself stretching
// into a tall rectangle. The outer <button> is the (invisible, borderless)
// tap area, sized via `size`/`className`; the inner square carries the
// border/glow and stays a fixed size via `boxClassName`. group-hover/
// group-active on the square react to the whole outer tap area, not just
// the square itself, so the visual feedback still covers the full target.
const COLOR_CLASSES = {
  "deep-purple":
    "border-dod-deep-purple text-dod-deep-purple group-hover:shadow-[0_0_12px_-2px_var(--dod-deep-purple)] group-active:bg-dod-deep-purple/20 group-active:shadow-[0_0_16px_-1px_var(--dod-deep-purple)]",
  lilac:
    "border-dod-lilac text-dod-lilac group-hover:shadow-[0_0_12px_-2px_var(--dod-lilac)] group-active:bg-dod-lilac/20 group-active:shadow-[0_0_16px_-1px_var(--dod-lilac)]",
  "neon-mint":
    "border-dod-neon-mint text-dod-neon-mint group-hover:shadow-[0_0_12px_-2px_var(--dod-neon-mint)] group-active:bg-dod-neon-mint/20 group-active:shadow-[0_0_16px_-1px_var(--dod-neon-mint)]",
};

const ArrowButton = ({
  direction = "left",
  color = "lilac",
  size,
  boxClassName = "w-10 h-10",
  iconClassName = "w-4 h-4",
  className = "",
  disabled = false,
  onClick,
  ...rest
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    style={size ? { width: size, height: size } : undefined}
    className={`group flex flex-shrink-0 items-center justify-center ${
      disabled ? "cursor-not-allowed" : "cursor-pointer"
    } ${className}`}
    {...rest}
  >
    <span
      className={`flex items-center justify-center border transition-[box-shadow,background-color] duration-150 ${boxClassName} ${
        disabled ? "border-dod-white/15 text-dod-white/20" : COLOR_CLASSES[color] ?? COLOR_CLASSES.lilac
      }`}
    >
      <svg className={iconClassName} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d={direction === "right" ? "M9 6L15 12L9 18" : "M15 6L9 12L15 18"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  </button>
);

export default ArrowButton;
