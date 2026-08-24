import React, { useState } from "react";
import { Link } from "react-router-dom";

// Detailed wireframe globe — inherits currentColor, scales via width/height
function WireGlobe({ size = "100%" }) {
  return (
    <svg
      viewBox="-52 -52 104 104"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      vectorEffect="non-scaling-stroke"
      style={{ display: "block", overflow: "visible" }}
      aria-hidden="true"
    >
      <g strokeLinecap="round">
        <circle cx="0" cy="0" r="45" />
        {[6, 20, 33].map((rx) => (
          <ellipse key={rx} cx="0" cy="0" rx={rx} ry="45" />
        ))}
        {[
          [0,   45,   10],
          [-14, 42.8, 9.4],
          [14,  42.8, 9.4],
          [-28, 35.2, 7.7],
          [28,  35.2, 7.7],
          [-39, 22.4, 4.9],
          [39,  22.4, 4.9],
        ].map(([cy, rx, ry]) => (
          <ellipse key={cy} cx="0" cy={cy} rx={rx} ry={ry} />
        ))}
      </g>
    </svg>
  );
}

const SIZES = {
  xs: { font: 11, ls: "0em", pad: 18, gap: 7 },
  sm: { font: 13, ls: "0em", pad: 22, gap: 9 },
  md: { font: 15, ls: "0em",  pad: 28, gap: 12 },
  lg: { font: 18, ls: "0em", pad: 36, gap: 14 },
  xl: { font: 22, ls: "0em", pad: 46, gap: 17 },
};

const THICKNESS = {
  "extra thin": 40,
  thin:          56,
  default:       78,
  thick:         100,
  tall:          130,
};

/**
 * GlobeSlideButton
 *
 * @param {string}    text        button label
 * @param {ReactNode} icon        optional glyph to the RIGHT of the text
 * @param {ReactNode} leftIcon    optional icon to the LEFT of the text (e.g. SpotifyIcon)
 * @param {string}    color       accent hex or CSS var — border, text, glow all derive from it
 * @param {"xs"|"sm"|"md"|"lg"|"xl"} size
 * @param {"extra thin"|"thin"|"default"|"thick"|"tall"} thickness
 * @param {number}    duration    slide duration in ms
 * @param {number}    labelShift  px the label drifts right on hover
 * @param {string}    href        external URL (opens in new tab) or internal path
 */
export default function GlobeSlideButton({
  text = "Listen now",
  icon = null,
  leftIcon = null,
  color = "#4ef08a",
  size = "md",
  thickness = "default",
  duration = 520,
  labelShift = 26,
  href,
  to: internalTo,
  onClick,
  ...rest
}) {
  const [on, setOn] = useState(false);

  const s = SIZES[size]     ?? SIZES.md;
  const h = THICKNESS[thickness] ?? THICKNESS.default;

  // color-mix works with CSS vars: mix("var(--dod-neon-mint)", pct, "#fff")
  const mix = (pct, other) =>
    `color-mix(in srgb, ${color} ${pct}%, ${other})`;

  const globe = Math.round(h * 1.5);
  const chamfer = Math.round(h * 0.2);
  const clip = `polygon(${chamfer}px 0, 100% 0, 100% calc(100% - ${chamfer}px), calc(100% - ${chamfer}px) 100%, 0 100%, 0 ${chamfer}px)`;
  const ease = `transform ${duration}ms cubic-bezier(.22,.61,.24,1)`;

  const slot = {
    position: "absolute",
    top: Math.round((h - globe) / 2 + h * 0.13),
    width: globe,
    height: globe,
    color,
  };

  const glide = (x) => ({
    display: "block",
    opacity: 0.85,
    transform: x,
    transition: ease,
  });

  const handlers = {
    onMouseEnter: () => setOn(true),
    onMouseLeave: () => setOn(false),
    onFocus:      () => setOn(true),
    onBlur:       () => setOn(false),
  };

  const shellStyle = {
    position: "relative",
    display: "block",
    boxSizing: "border-box",
    height: h,
    minWidth: Math.round(h * 4.1),
    padding: 1,
    background: `${color}`, //`linear-gradient(115deg, ${mix(40, "#fff")} 0%, ${color} 22%, ${mix(34, "#000")} 52%, ${color} 78%, ${mix(58, "#fff")} 100%)`,
    clipPath: clip,
    textDecoration: "none",
    filter: `drop-shadow(0 0 ${on ? 15 : 9}px ${mix(on ? 48 : 30, "transparent")})`,
    transition: `filter ${duration}ms ease`,
  };

  const innerStyle = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    padding: `0 ${Math.max(s.pad, Math.round(globe * 0.6))}px`,
    boxSizing: "border-box",
    background: "var(--dod-black)", //mix(9, "#05070a"),
    overflow: "hidden",
    clipPath: clip,
  };

  const labelTextStyle = {
    display: "flex",
    alignItems: "center",
    gap: s.gap,
    whiteSpace: "nowrap",
    // Archivo Expanded (variable font axis 125%) instead of Space Grotesk
    fontFamily: "'Archivo', system-ui, sans-serif",
    fontStretch: "125%",
    fontWeight: 700,
    fontSize: s.font,
    lineHeight: 1,
    letterSpacing: s.ls,
    textTransform: "uppercase",
    color: mix(88, "#ffffff"),
    //textShadow: `0 0 10px ${mix(50, "transparent")}`,
  };

  const content = (
    <span style={innerStyle}>
      {/* left globe — slides IN from left on hover */}
      <span style={{ ...slot, left: -Math.round(globe * 0.2) }}>
        <span style={glide(on ? "translateX(0)" : "translateX(-180%)")}>
          <WireGlobe />
        </span>
      </span>

      {/* right globe — slides OUT to right on hover */}
      <span style={{ ...slot, right: -Math.round(globe * 0.2) }}>
        <span style={glide(on ? "translateX(180%)" : "translateX(0)")}>
          <WireGlobe />
        </span>
      </span>

      {/* label drifts right on hover */}
      <span style={{
        position: "relative",
        display: "block",
        transform: on ? `translateX(${labelShift}px)` : "translateX(0)",
        transition: ease,
      }}>
        <span style={labelTextStyle}>
          {leftIcon && (
            <span style={{ display: "flex", alignItems: "center", lineHeight: 1 }}>
              {leftIcon}
            </span>
          )}
          {text}
          {icon && (
            <span style={{ display: "flex", alignItems: "center", fontSize: Math.round(s.font * 1.1), lineHeight: 1 }}>
              {icon}
            </span>
          )}
        </span>
      </span>
    </span>
  );

  if (href) {
    if (/^https?:\/\//.test(href)) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer"
          style={shellStyle} {...handlers} {...rest}>
          {content}
        </a>
      );
    }
    return (
      <Link to={href} style={shellStyle} {...handlers} {...rest}>
        {content}
      </Link>
    );
  }

  if (internalTo) {
    return (
      <Link to={internalTo} style={shellStyle} {...handlers} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button style={{ ...shellStyle, border: "none", cursor: "pointer", padding: 1 }}
      onClick={onClick} {...handlers} {...rest}>
      {content}
    </button>
  );
}
