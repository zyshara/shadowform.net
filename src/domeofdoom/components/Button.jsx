import { useState } from "react";
import { Link } from "react-router-dom";

const grainSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/></filter><rect width="256" height="256" filter="url(#n)"/></svg>`;
const grainUrl = `url("data:image/svg+xml,${encodeURIComponent(grainSvg)}")`;

const BG = "rgb(13, 11, 10)";

const VARIANTS = {
  primary: {
    background: BG,
    color: "oklch(0.72 0.19 25)",
    border: "2px solid oklch(0.72 0.19 25)",
    outline: "2px solid oklch(0.72 0.19 25)",
  },
  secondary: {
    background: BG,
    color: "oklch(0.78 0.08 320)",
    border: "2px solid oklch(0.78 0.08 320)",
    outline: "2px solid oklch(0.78 0.08 320)",
  },
  disabled: {
    background: BG,
    color: "rgba(255,255,255,0.2)",
    border: "2px solid #ffffff36",
    outline: "2px solid #ffffff36",
  },
};

const PADDING = {
  default: "14px 28px",
  thin: "7px 54px",
};

const baseStyle = {
  borderRadius: "5px",
  fontStretch: "expanded",
  fontFamily: "Archivo, sans-serif",
  fontVariationSettings: '"wdth" 125',
  fontWeight: 800,
  fontSize: "13px",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  textDecoration: "none",
  position: "relative",
  overflow: "hidden",
  outlineOffset: "2px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  cursor: "pointer",
  transition: "background 0.18s ease, color 0.18s ease",
  whiteSpace: "nowrap",
};

const Grain = () => (
  <span
    aria-hidden="true"
    style={{
      position: "absolute",
      inset: 0,
      zIndex: 1,
      backgroundImage: grainUrl,
      backgroundRepeat: "repeat",
      backgroundSize: "256px 256px",
      mixBlendMode: "hard-light",
      opacity: 0.18,
      pointerEvents: "none",
    }}
  />
);

const Button = ({ variant = "primary", type = "default", to, href, children, style: extraStyle, ...props }) => {
  const [hovered, setHovered] = useState(false);
  const v = VARIANTS[variant];
  const isDisabled = variant === "disabled";

  const style = {
    ...baseStyle,
    padding: PADDING[type] ?? PADDING.default,
    background: !isDisabled && hovered ? v.color : v.background,
    color: !isDisabled && hovered ? BG : v.color,
    border: v.border,
    outline: v.outline,
    cursor: isDisabled ? "default" : "pointer",
    ...extraStyle,
  };

  const hoverProps = isDisabled ? {} : {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={style} {...hoverProps} {...props}>
        <Grain />
        {children}
      </a>
    );
  }

  if (to) {
    return (
      <Link to={to} style={style} {...hoverProps} {...props}>
        <Grain />
        {children}
      </Link>
    );
  }

  return (
    <button style={style} {...hoverProps} {...props}>
      <Grain />
      {children}
    </button>
  );
};

export default Button;
