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

// ── Themed char renderer ───────────────────────────────────────────────────────
// Used for fire + rainbow — splits children into individual animated chars.
const ThemedTag = ({ children, theme, className, style }) => {
  const chars = String(children).split("");
  return (
    <span className={`${className} tag-theme--${theme}`} style={style}>
      {chars.map((char, i) => (
        <span key={i} className="tag-theme-char" style={{ "--char-i": i }}>
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
};

// ── Tag ───────────────────────────────────────────────────────────────────────
//
//  Props
//    variant   "lit" | "dim"   default "lit"
//    size      "xxs" | "xs" | "sm" | "md" | "lg" | "xl"   default "sm"
//    theme     "fire-glitch" | "rainbow-party" | "blizzard"  — animated fun variant
//    href      string — renders as <a>, dim at rest → lit on hover
//    onClick   fn     — renders as <button>, dim at rest → lit on hover
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
  // Interactive tags: dim at rest, lit on hover
  const colorKey = isInteractive ? (hovered ? "lit" : "dim") : (variant === "dim" ? "dim" : "lit");
  const colors   = COLORS[colorKey];
  const sizeCls  = SIZES[size] ?? SIZES.sm;

  const cls = [BASE_CLS, sizeCls, isInteractive && "transition-colors duration-150 cursor-pointer", extraCls]
    .filter(Boolean).join(" ");

  const style = {
    color:       colors.color,
    borderColor: colors.borderColor,
    background:  colors.background,
  };

  const handlers = isInteractive ? {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  } : {};

  // ── themed variants (fire / rainbow / blizzard) ─────────────────────────────
  if (theme === "fire-glitch" || theme === "rainbow-party" || theme === "blizzard") {
    const { borderColor: _bc, background: _bg, ...themeStyle } = style;
    const themedEl = <ThemedTag theme={theme} className={cls} style={themeStyle}>{children}</ThemedTag>;

    if (onClick) return (
      <button onClick={onClick} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
        {themedEl}
      </button>
    );
    if (href) return (
      <a href={href} target={target} rel={rel} style={{ textDecoration: "none" }}>
        {themedEl}
      </a>
    );
    return themedEl;
  }

  // ── link ──────────────────────────────────────────────────────────────────────
  if (href) return (
    <a href={href} target={target} rel={rel} className={cls} style={{ ...style, textDecoration: "none" }} {...handlers}>
      {children}
    </a>
  );

  // ── button ────────────────────────────────────────────────────────────────────
  if (onClick) return (
    <button type="button" onClick={onClick} className={cls} style={style} {...handlers}>
      {children}
    </button>
  );

  // ── static span ───────────────────────────────────────────────────────────────
  return (
    <span className={cls} style={style}>
      {children}
    </span>
  );
};

export default Tag;
