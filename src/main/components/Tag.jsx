// src/main/components/Tag.jsx
// Import TagThemes.css in your index.css: @import "./TagThemes.css";

import { useState } from "react";

// ── Colour tokens ─────────────────────────────────────────────────────────────
const COLORS = {
  lit: {
    color:       "var(--tag-lit-text)",
    borderColor: "var(--tag-lit-border)",
    background:  "var(--tag-lit-bg)",
  },
  dim: {
    color:       "var(--ornament-glyph)",
    borderColor: "var(--tag-dim-border)",
    background:  "var(--tag-dim-bg)",
  },
};

// ── Size scale (mirrors Button.jsx) ──────────────────────────────────────────
const SIZES = {
  xxs: "text-[7px]  px-[6px]  py-[2px]",
  xs:  "text-[8px]  px-[7px]  py-[3px]",
  sm:  "text-[9px]  px-[9px]  py-[4px]",
  md:  "text-[10px] px-[11px] py-[5px]",
  lg:  "text-[11px] px-[14px] py-[6px]",
  xl:  "text-[12px] px-[18px] py-[7px]",
};

const BASE_CLS = "tracking-[0.18em] uppercase rounded-[2px] border whitespace-nowrap select-none";

// ── Tag ───────────────────────────────────────────────────────────────────────
//
//  Props
//    variant   "lit" | "dim"                                   default "lit"
//    size      "xxs" | "xs" | "sm" | "md" | "lg" | "xl"       default "sm"
//    theme     "fire-glitch" | "rainbow-party" | "blizzard"    — CSS-animated variant;
//              theme class is applied directly to the rendered element so size
//              and theme always stay in sync. Colors are handled entirely by
//              TagThemes.css — no inline style overrides needed.
//    href      string — renders as <a>; dim at rest → lit on hover (non-themed)
//    onClick   fn     — renders as <button>; dim at rest → lit on hover (non-themed)
//    target / rel     — forwarded to <a>
//    children
//
const Tag = ({
  children,
  variant  = "lit",
  size     = "sm",
  theme,
  onClick,
  href,
  target,
  rel,
  className: extraCls = "",
}) => {
  const [hovered, setHovered] = useState(false);

  const isInteractive = !!(href || onClick);

  // Themed tags: CSS class owns all color/border/bg — no inline style override.
  // Plain tags: dim at rest when interactive, lit on hover; otherwise use `variant`.
  const colorKey = (hovered && isInteractive) ? "lit" : (variant === "dim" ? "dim" : "lit");
  const style    = theme
    ? {
        opacity:     colorKey === "dim" ? 0.45 : 1,
        borderColor: colorKey === "dim" ? "var(--tag-dim-border)" : undefined,
        background:  colorKey === "dim" ? "var(--tag-dim-bg)"     : undefined,
        transition:  "opacity 150ms, border-color 150ms, background 150ms",
      }
    : { color: COLORS[colorKey].color, borderColor: COLORS[colorKey].borderColor, background: COLORS[colorKey].background };

  const cls = [
    BASE_CLS,
    SIZES[size] ?? SIZES.sm,
    theme && `tag-theme--${theme}`,
    isInteractive && "transition-colors duration-150 cursor-pointer",
    extraCls,
  ].filter(Boolean).join(" ");

  // Themed variants split text into per-character spans so CSS can animate each char.
  const content = theme
    ? String(children).split("").map((char, i) => (
        <span key={i} className="tag-theme-char" style={{ "--char-i": i }}>
          {char === " " ? "\u00A0" : char}
        </span>
      ))
    : children;

  const handlers = isInteractive
    ? { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) }
    : {};

  if (href) return (
    <a href={href} target={target} rel={rel} className={cls} style={{ ...style, textDecoration: "none" }} {...handlers}>
      {content}
    </a>
  );

  if (onClick) return (
    <button type="button" onClick={onClick} className={cls} style={style} {...handlers}>
      {content}
    </button>
  );

  return <span className={cls} style={style}>{content}</span>;
};

export default Tag;
