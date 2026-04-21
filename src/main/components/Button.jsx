// src/main/components/Button.jsx
import { useState } from "react";

// ── Colour tokens per state ───────────────────────────────────────────────────
const COLORS = {
  idle: {
    slashColor:  "var(--ornament-glyph)",
    color:       "var(--tag-lit-text)",
    borderColor: "var(--tag-lit-border)",
    tickColor:   "var(--pink-text)",
    background:  "var(--tag-lit-bg)",
  },
  hover: {
    slashColor:  "var(--pink-text)",
    color:       "var(--pink-text)",
    borderColor: "var(--pink-border)",
    tickColor:   "var(--pink-text)",
    background:  "var(--tag-lit-bg)",
  },
  disabled: {
    slashColor:  "var(--tag-dim-border)",
    color:       "var(--tag-dim-text)",
    borderColor: "var(--tag-dim-border)",
    tickColor:   "var(--tag-dim-border)",
    background:  "transparent",
  },
};

// ── Size scale ────────────────────────────────────────────────────────────────
const SIZES = {
  xxs: { cls: "text-[7px]  px-[6px]  py-[2px] gap-[3px]", tick: 5,  offset: -2, flowerMarginTop: "0px",  arrowSize: 7  },
  xs:  { cls: "text-[8px]  px-[7px]  py-[3px] gap-[3px]", tick: 6,  offset: -2, flowerMarginTop: "0px",  arrowSize: 8  },
  sm:  { cls: "text-[9px]  px-[9px]  py-[4px] gap-[4px]", tick: 7,  offset: -3, flowerMarginTop: "0px",  arrowSize: 9  },
  md:  { cls: "text-[10px] px-[11px] py-[5px] gap-[4px]", tick: 8,  offset: -2, flowerMarginTop: "-2px", arrowSize: 10 },
  lg:  { cls: "text-[11px] px-[14px] py-[6px] gap-[5px]", tick: 9,  offset: -4, flowerMarginTop: "-2px", arrowSize: 11 },
  xl:  { cls: "text-[12px] px-[18px] py-[7px] gap-[5px]", tick: 10, offset: -4, flowerMarginTop: "-2px", arrowSize: 12 },
};

// ── Per-variant font classes ──────────────────────────────────────────────────
const VARIANT_CLS = {
  primary:   "",
  secondary: "font-alagard",
  tertiary:  "font-alkhemikal",
};

// ── Corner ticks — all four corners ──────────────────────────────────────────
const TICK_POSITIONS = [
  { corner: "tl", base: (o) => ({ top: o,    left: o  }), hover: (o) => ({ top: o-1,    left: o-1  }), borderTop:    "1px solid currentColor", borderLeft:   "1px solid currentColor" },
  { corner: "tr", base: (o) => ({ top: o,    right: o }), hover: (o) => ({ top: o-1,    right: o-1 }), borderTop:    "1px solid currentColor", borderRight:  "1px solid currentColor" },
  { corner: "bl", base: (o) => ({ bottom: o, left: o  }), hover: (o) => ({ bottom: o-1, left: o-1  }), borderBottom: "1px solid currentColor", borderLeft:   "1px solid currentColor" },
  { corner: "br", base: (o) => ({ bottom: o, right: o }), hover: (o) => ({ bottom: o-1, right: o-1 }), borderBottom: "1px solid currentColor", borderRight:  "1px solid currentColor" },
];

const CornerTicks = ({ color, size, offset, hovered }) => (
  <>
    {TICK_POSITIONS.map(({ corner, base, hover, ...borders }) => {
      const pos = hovered ? hover(offset) : base(offset);
      return (
        <span
          key={corner}
          aria-hidden="true"
          style={{
            position:      "absolute",
            width:         size,
            height:        size,
            color,
            pointerEvents: "none",
            transition:    "color 150ms, top 150ms, bottom 150ms, left 150ms, right 150ms",
            ...borders,
            ...pos,
          }}
        />
      );
    })}
  </>
);

// ── SVG Arrow ─────────────────────────────────────────────────────────────────
// Renders a crisp, stroke-based arrow at an exact pixel size.
// direction "right" | "up-right"
// size      px number — matched to button font size
// color     CSS color string
const Arrow = ({ direction, size, color, isHovered }) => {
  const s = size;
  // viewBox is square, paths drawn on a 10x10 grid then scaled to s×s
  const paths = {
    // ── → : horizontal line + arrowhead
    right: (
      <>
        <line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <polyline points="6,2.5 9,5 6,7.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    // ── ↗ : diagonal line + arrowhead
    "up-right": (
      <>
        <line x1="2" y1="8" x2="8" y2="2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <polyline points="4.5,2 8,2 8,5.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      width={s}
      height={s}
      viewBox="0 0 10 10"
      fill="none"
      style={{
        color,
        flexShrink:  0,
        display:     "inline-block",
        verticalAlign: "middle",
        filter:      isHovered ? "drop-shadow(0 0 3px var(--pink-glow))" : "none",
        transition:  "color 150ms, filter 150ms",
      }}
    >
      {paths[direction] ?? paths.right}
    </svg>
  );
};

// ── Button ────────────────────────────────────────────────────────────────────
//
//  Props
//    variant   "primary" | "secondary" | "tertiary"       default "primary"
//    size      "xxs" | "xs" | "sm" | "md" | "lg" | "xl"   default "sm"
//    arrow     "right" | "up-right" | "none"              default "none"
//    disabled  bool   — opacity + diagonal slash + no interaction
//    href      string — renders as <a>
//    onClick   fn     — renders as <button>
//    target / rel     — forwarded to <a>
//    children
//
const Button = ({
  children,
  variant   = "primary",
  size      = "xs",
  arrow     = "none",
  flower    = false,
  corners   = false,
  disabled  = false,
  className = "",
  href,
  onClick,
  target,
  rel,
}) => {
  const [hovered, setHovered] = useState(false);

  const colors     = disabled ? COLORS.disabled : hovered ? COLORS.hover : COLORS.idle;
  const sizeTokens = SIZES[size] ?? SIZES.sm;
  const variantCls = VARIANT_CLS[variant] ?? "";
  const isHovered  = hovered && !disabled;
  const showArrow  = arrow === "right" || arrow === "up-right";

  const wrapperStyle = {
    border:         `1px solid ${colors.borderColor}`,
    background:     colors.background,
    filter:         isHovered ? "drop-shadow(0 0 3px var(--pink-glow))" : "none",
    opacity:        disabled ? 0.5 : 1,
    cursor:         disabled ? "not-allowed" : "pointer",
    textDecoration: "none",
    transition:     "border-color 150ms, filter 150ms",
  };

  const handlers = disabled ? {} : {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  const wrapperCls = [
    "relative inline-flex items-center",
    "tracking-[0.18em] uppercase whitespace-nowrap select-none",
    sizeTokens.cls,
    variantCls,
    className,
  ].filter(Boolean).join(" ");

  const glowStyle = isHovered ? { filter: "drop-shadow(0 0 3px var(--pink-glow))" } : {};

  const inner = (
    <>
      { corners && (
          <CornerTicks
            color={colors.tickColor}
            size={sizeTokens.tick}
            offset={sizeTokens.offset}
            hovered={isHovered}
          />
      )}

      {/* ✿ prefix */}
      { flower && (
          <span
            aria-hidden="true"
            className="shrink-0 leading-none transition-colors duration-150"
            style={{
              color:     colors.slashColor,
              fontSize:  `calc(${sizeTokens.cls.match(/text-\[(\w+)\]/)?.[1] ?? "9px"} + 1px)`,
              marginTop: sizeTokens.flowerMarginTop,
            }}
          >
            ✿
          </span>
      )}

      {/* label */}
      <span
        className="transition-colors duration-150"
        style={{ color: colors.color, ...glowStyle }}
      >
        {children}
      </span>

      {/* optional SVG arrow */}
      {showArrow && (
        <span className="inline-flex items-center">
          <Arrow
            direction={arrow}
            size={sizeTokens.arrowSize}
            color={colors.color}
            isHovered={isHovered}
          />
        </span>
      )}

      {/* disabled diagonal slash */}
      {disabled && (
        <span
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-35"
          style={{
            background: "linear-gradient(to bottom right, transparent calc(50% - 0.5px), currentColor calc(50% - 0.5px), currentColor calc(50% + 0.5px), transparent calc(50% + 0.5px))",
            color:      colors.color,
          }}
        />
      )}
    </>
  );

  if (href && !disabled)
    return <a href={href} target={target} rel={rel} className={wrapperCls} style={wrapperStyle} {...handlers}>{inner}</a>;
  if (onClick && !disabled)
    return <button type="button" onClick={onClick} className={wrapperCls} style={wrapperStyle} {...handlers}>{inner}</button>;
  return <span className={wrapperCls} style={wrapperStyle} {...handlers}>{inner}</span>;
};

export default Button;
