import { useState } from "react";
import { Link } from "react-router-dom";
import { colors } from "@/tokens";

const VARIANTS = {
  primary: {
    background: colors.black,
    color: colors.neon_mint,
    border: `1px solid ${colors.neon_mint}`,
    outline: `1px solid ${colors.neon_mint}`,
  },
  secondary: {
    background: colors.black,
    color: colors.lilac,
    border: `1px solid ${colors.lilac}`,
    outline: `1px solid ${colors.lilac}`,
  },
  disabled: {
    background: colors.black,
    color: "rgba(255,255,255,0.2)",
    border: "1px solid #ffffff36",
    outline: "1px solid #ffffff36",
  },
};

const PADDING = {
  default: "14px 28px",
  thin: "7px 54px",
  small: "6px 16px",
};

const FONT_SIZE = {
  default: "13px",
  thin: "13px",
  small: "10px",
};

// href is used both for genuinely external links (Spotify, Bandcamp) and,
// sometimes, for same-site paths that should really behave like `to` — an
// absolute URL, protocol-relative URL, or mailto:/tel: link is external;
// anything else (e.g. "/press") is treated as an in-app route.
const isExternalHref = (url) => /^([a-z][a-z0-9+.-]*:)?\/\//i.test(url) || /^(mailto|tel):/i.test(url);

const baseStyle = {
  fontStretch: "expanded",
  fontFamily: "Archivo, sans-serif",
  fontVariationSettings: '"wdth" 125',
  fontWeight: 800,
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

const Button = ({ variant = "primary", type = "default", to, href, children, style: extraStyle, ...props }) => {
  const [hovered, setHovered] = useState(false);
  const v = VARIANTS[variant];
  const isDisabled = variant === "disabled";

  const style = {
    ...baseStyle,
    padding: PADDING[type] ?? PADDING.default,
    fontSize: FONT_SIZE[type] ?? FONT_SIZE.default,
    background: !isDisabled && hovered ? v.color : v.background,
    color: !isDisabled && hovered ? colors.black : v.color,
    border: v.border,
    outline: v.outline,
    cursor: isDisabled ? "default" : "pointer",
    ...extraStyle,
  };

  const hoverProps = isDisabled ? {} : {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  if (href && isExternalHref(href)) {
    return (
      <a className="w-full md:max-w-[300px]" href={href} target="_blank" rel="noopener noreferrer" style={style} {...hoverProps} {...props}>
        {children}
      </a>
    );
  }

  const internalTo = to ?? href;
  if (internalTo) {
    return (
      <Link className="w-full md:max-w-[300px]" to={internalTo} style={style} {...hoverProps} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className="w-full md:max-w-[300px]" style={style} {...hoverProps} {...props}>
      {children}
    </button>
  );
};

export default Button;
