// src/main/components/Button.jsx
import { useState } from "react";

// ── Colour tokens per variant + state ────────────────────────────────────────
const COLORS = {
  idle:  { color: "var(--tag-dim-text)",  borderColor: "var(--tag-dim-border)",  background: "var(--tag-dim-bg)"  },
  hover: { color: "var(--tag-lit-text)",  borderColor: "var(--tag-lit-border)",  background: "var(--tag-lit-bg)"  },
};

// ── Per-variant Tailwind classes ──────────────────────────────────────────────
//   primary   — inherits page font, 9px
//   secondary — font-alagard, 9px
//   tertiary  — font-alkhemikal, 10px
const VARIANT_CLS = {
  primary:   "text-[9px]",
  secondary: "font-alagard text-[9px]",
  tertiary:  "font-alkhemikal text-[10px]",
};

const PALETTE = {
  primary:   COLORS,
  secondary: COLORS,
  tertiary:  COLORS,
};

// ── Shared Tailwind classes (no font-size — that's per-variant) ──────────────
const BASE_CLS =
  "relative inline-flex items-center justify-center " +
  "tracking-[0.18em] uppercase " +
  "px-[10px] py-[5px] rounded-[2px] border " +
  "whitespace-nowrap overflow-hidden select-none " +
  "transition-colors duration-150";

// ── Button ────────────────────────────────────────────────────────────────────
//
//  Props
//    variant   "primary" | "secondary" | "tertiary"   default "primary"
//    accent    "front" | "end" | "none"               default "none"  — adds ✦
//    disabled  bool   — grayscale + diagonal slash + no interaction
//    href      string — renders as <a>
//    onClick   fn     — renders as <button>
//    target / rel     — forwarded to <a>
//    children
//
const Button = ({
  children,
  variant   = "primary",
  accent    = "none",
  disabled  = false,
  className = "",
  href,
  onClick,
  target,
  rel,
}) => {
  const [hovered, setHovered] = useState(false);

  const palette    = PALETTE[variant] ?? PALETTE.primary;
  const colors     = (!disabled && hovered) ? palette.hover : palette.idle;
  const variantCls = VARIANT_CLS[variant] ?? VARIANT_CLS.primary;

  const dynamicStyle = {
    ...colors,
    cursor: disabled ? "not-allowed" : "pointer",
    filter: disabled ? "grayscale(1)" : "none",
    textDecoration: "none",
  };

  const handlers = disabled ? {} : {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  const cls = [BASE_CLS, variantCls, className].filter(Boolean).join(" ");

  const inner = (
    <>
      {accent === "front" && <span className="mr-[5px]">✦</span>}
      {children}
      {accent === "end"   && <span className="ml-[5px]">✦</span>}
      {disabled && (
        <span
          aria-hidden="true"
          style={{
            position:      "absolute",
            inset:         0,
            borderRadius:  "inherit",
            background:    "linear-gradient(to bottom right, transparent calc(50% - 0.5px), currentColor calc(50% - 0.5px), currentColor calc(50% + 0.5px), transparent calc(50% + 0.5px))",
            opacity:       0.35,
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );

  if (href && !disabled) {
    return <a href={href} target={target} rel={rel} className={cls} style={dynamicStyle} {...handlers}>{inner}</a>;
  }

  if (onClick && !disabled) {
    return <button type="button" onClick={onClick} className={cls} style={dynamicStyle} {...handlers}>{inner}</button>;
  }

  return <span className={cls} style={dynamicStyle} {...handlers}>{inner}</span>;
};

export default Button;
