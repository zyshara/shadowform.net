import React from "react";

// Small tag used to label cards ("Upcoming Release", "Latest Release",
// etc). Sharp corners to match the site's brutalist edges, except the
// bottom-right, which is notched off with a diagonal cut (clip-path) -
// a tech-tag/ribbon shape, not a rounded pill.
//
// `icon` takes the component itself (e.g. CalendarIcon), not a rendered
// element - CardLabelBadge controls its size so it always lines up with
// the text regardless of which icon is passed in.
const NOTCH = 10; // px cut off the bottom-right corner

const CardLabelBadge = ({
  text,
  icon: Icon,
  color = "var(--dod-neon-mint)",
  iconSize = 13,
  className = "",
  style,
}) => (
  <div
    className={`inline-flex flex-shrink-0 items-center gap-1.5 border px-2.5 py-1.5 ${className}`}
    style={{
      borderColor: color,
      color,
      background: `color-mix(in srgb, ${color} 6%, transparent)`,
      clipPath: `polygon(0 0, 100% 0, 100% calc(100% - ${NOTCH}px), calc(100% - ${NOTCH}px) 100%, 0 100%)`,
      ...style,
    }}
  >
    {Icon && (
      <span className="flex items-center" aria-hidden="true">
        <Icon size={iconSize} />
      </span>
    )}
    <span
      className="whitespace-nowrap text-[10px] font-black uppercase leading-none tracking-[0.1em]"
      style={{
        fontFamily: "Archivo, sans-serif",
        fontStretch: "expanded",
        fontVariationSettings: '"wdth" 125',
      }}
    >
      {text}
    </span>
  </div>
);

export default CardLabelBadge;
