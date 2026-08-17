import React, { useId } from "react";

// Ported from ~/Downloads/star-icon.svg - a colored illustration (optional
// dark background + glow + gradient-filled sparkle), not a monochrome
// currentColor line icon like the other icons in this directory. Colors
// are now props (defaulting to the original ported values) rather than
// hardcoded, since different usages want different gradients/glows;
// background and glow are each toggleable for uses that just want the bare
// star shape (e.g. as a decorative filler over existing page content).
// Gradient ids are per-instance (useId) so multiple StarIcons on one page
// don't collide - SVG ids are global to the document.
const StarIcon = ({
  size = 24,
  gradientFrom = "#a599f9",
  gradientTo = "#6a4fe0",
  gradientDirection = "diagonal", // "diagonal" | "vertical"
  glowColor = "#8b7cf6",
  showGlow = true,
  showBackground = true,
  backgroundColor = "#0a0812",
  opacity = 1,
  className = "",
}) => {
  const uid = useId();
  const glowId = `star-icon-glow-${uid}`;
  const fillId = `star-icon-fill-${uid}`;
  const [x1, y1, x2, y2] = gradientDirection === "vertical" ? ["0%", "0%", "0%", "100%"] : ["0%", "0%", "100%", "100%"];

  return (
    <svg width={size} height={size} viewBox="-30 -30 260 260" xmlns="http://www.w3.org/2000/svg" style={{ opacity }} className={className}>
      <defs>
        {showGlow && (
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={glowColor} stopOpacity="0.55" />
            <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
          </radialGradient>
        )}
        <linearGradient id={fillId} x1={x1} y1={y1} x2={x2} y2={y2}>
          <stop offset="0%" stopColor={gradientFrom} />
          <stop offset="100%" stopColor={gradientTo} />
        </linearGradient>
      </defs>
      {showBackground && <rect x="-30" y="-30" width="260" height="260" fill={backgroundColor} />}
      {showGlow && <circle cx="100" cy="100" r="90" fill={`url(#${glowId})`} />}
      <path
        d="M100,-25 L112,78 L160,45 L122,92 L180,100 L122,108 L160,155 L112,122 L100,225 L88,122 L40,155 L78,108 L20,100 L78,92 L40,45 L88,78 Z"
        fill={`url(#${fillId})`}
      />
    </svg>
  );
};

export default StarIcon;
