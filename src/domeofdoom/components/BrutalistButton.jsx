import React, { useState } from "react";
import { Link } from "react-router";
import GlobeIcon from "@/components/GlobeIcon";

const SIZE = {
  xxs:   { text: "text-[10px]", padX: "px-2",   gap: "gap-1",   icon: 12 },
  xs:    { text: "text-xs",     padX: "px-2.5",  gap: "gap-1.5", icon: 14 },
  sm:    { text: "text-[13px]", padX: "px-3",    gap: "gap-1.5", icon: 16 },
  md:    { text: "text-sm",     padX: "px-3.5",  gap: "gap-2",   icon: 18 },
  lg:    { text: "text-lg",     padX: "px-4",    gap: "gap-2",   icon: 20 },
  xl:    { text: "text-xl",     padX: "px-5",    gap: "gap-2",   icon: 22 },
  "2xl": { text: "text-2xl",    padX: "px-6",    gap: "gap-2.5", icon: 26 },
  "3xl": { text: "text-3xl",    padX: "px-8",    gap: "gap-3",   icon: 30 },
};

const THICKNESS = {
  "extra-thin": "py-0.5",
  thin:         "py-1.5",
  default:      "py-2.5",
  tall:         "py-4",
  taller:       "py-6",
};

// Tailwind classes for each color — base (outline) and hovered (filled)
const COLOR = {
  "neon-green":  { base: "border-dod-neon-mint text-dod-neon-mint",   hovered: "bg-dod-neon-mint text-dod-black"  },
  lilac:         { base: "border-dod-lilac text-dod-lilac",           hovered: "bg-dod-lilac text-dod-black"      },
  "deep-purple": { base: "border-dod-deep-purple text-dod-deep-purple", hovered: "bg-dod-deep-purple text-dod-white" },
};

const BrutalistButton = ({
  text,
  textIcon,
  // React element to override the default GlobeIcon; null to hide entirely
  filigreeIcon: filigreeIconProp,
  // null to hide
  filigreeText = "DOD",
  size      = "sm",
  thickness = "default",
  color     = "neon-green",
  href,
  to: internalTo,
  onClick,
  className = "",
  style: extraStyle,
  ...props
}) => {
  const [hovered, setHovered] = useState(false);

  const s = SIZE[size]          ?? SIZE.sm;
  const t = THICKNESS[thickness] ?? THICKNESS.default;
  const c = COLOR[color]        ?? COLOR["neon-green"];

  const colorClass = hovered ? c.hovered : c.base;
  const filigreeIcon = filigreeIconProp !== undefined ? filigreeIconProp : <GlobeIcon size={s.icon} />;
  const showFiligree = filigreeIcon !== null;

  const outerClass = [
    "flex items-stretch border-[3px] border-double transition-colors duration-150",
    "uppercase tracking-[0.08em] leading-none whitespace-nowrap font-bold",
    "no-underline cursor-pointer",
    s.text,
    colorClass,
    className,
  ].join(" ");

  // font-stretch: 125% (Archivo expanded axis) — not a Tailwind utility, inline only
  const fontStyle = { fontFamily: '"Archivo", sans-serif', fontStretch: "125%", ...extraStyle };

  const textSection = (
    <span className={`flex flex-1 items-center ${s.gap} ${t} ${s.padX}`}>
      <span style={{ paddingTop: "2px" }}>{text}</span>
      {textIcon && <span className="inline-flex items-center">{textIcon}</span>}
    </span>
  );

  const filigreeSection = showFiligree && (
    <>
      <span className={`flex items-center justify-center ${t} ${s.padX} border-l-[3px] border-double border-current`}>
        {filigreeIcon}
      </span>
      {filigreeText && (
        <span className={`flex items-center ${t} ${s.padX} border-l-[3px] border-double border-current`}>
          <span style={{ paddingTop: "2px" }}>{filigreeText}</span>
        </span>
      )}
    </>
  );

  const content = <>{textSection}{filigreeSection}</>;

  const hoverProps = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  if (href) {
    if (/^https?:\/\//.test(href)) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer"
          className={outerClass} style={fontStyle} {...hoverProps} {...props}>
          {content}
        </a>
      );
    }
    return (
      <Link to={href} className={outerClass} style={fontStyle} {...hoverProps} {...props}>
        {content}
      </Link>
    );
  }

  if (internalTo) {
    return (
      <Link to={internalTo} className={outerClass} style={fontStyle} {...hoverProps} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button className={outerClass} style={fontStyle} onClick={onClick} {...hoverProps} {...props}>
      {content}
    </button>
  );
};

export default BrutalistButton;
