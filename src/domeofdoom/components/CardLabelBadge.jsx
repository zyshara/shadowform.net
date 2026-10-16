import React, { useLayoutEffect, useRef, useState } from "react";

// Small tag used to label cards ("Upcoming Release", "Latest Release",
// etc). Sharp corners to match the site's brutalist edges, except the
// bottom-right, which is notched off with a diagonal cut - a tech-tag/
// ribbon shape, not a rounded pill.
//
// The whole outline (all five edges, including the notch) is drawn as a
// single SVG <polygon> stroke sized to the badge's actual rendered box via
// ResizeObserver, rather than CSS `border` + `clip-path`. clip-path trims
// painted border pixels without synthesizing a stroke along the new edge
// it introduces, which left the notch corner's border incomplete - and a
// div rotated to patch that edge back in rendered visibly thicker than
// the straight sides, an anti-aliasing artifact of rotating a 1px
// rectangle off the pixel grid. A single stroked polygon has no seam to
// begin with and renders every corner, including the two non-right-angle
// ones around the notch, at consistent width. (Houdini's CSS Paint API
// could draw this same single path too, but it's Chromium-only - no
// Safari/Firefox - so it's skipped in favor of this, which works
// everywhere SVG does.)
//
// `icon` takes the component itself (e.g. CalendarIcon), not a rendered
// element - CardLabelBadge controls its size so it always lines up with
// the text regardless of which icon is passed in.
const NOTCH = 10; // px cut off the bottom-right corner
const STROKE = 1;

function useElementSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // getBoundingClientRect, not offsetWidth/Height - the latter rounds to
    // a whole px, while the badge's actual CSS box is usually fractional
    // (e.g. 137.34375px). That gap between the rounded viewBox and the
    // true box varied by viewport (different text reflow -> different
    // fractional remainder), leaving the polygon's stroke a sub-pixel off
    // from the box it's drawn in at some breakpoints but not others.
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSize({ width: r.width, height: r.height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, size];
}

const CardLabelBadge = ({
  text,
  icon: Icon,
  color = "var(--dod-neon-mint)",
  iconSize = 13,
  className = "",
  style,
}) => {
  const [ref, { width: rawW, height: rawH }] = useElementSize();
  // Math.ceil, not Math.round - rounding DOWN would leave a sub-pixel gap
  // between the SVG's right/bottom stroke and the badge element's actual
  // edge (e.g. rawW=137.34 → Math.round→137, leaving a 0.34px gap where
  // no stroke renders). Ceiling ensures the SVG always covers the full
  // element, so the right/bottom strokes reach the edges at any zoom.
  const w = Math.ceil(rawW);
  const h = Math.ceil(rawH);
  // Inset polygon path by half the stroke width so the full stroke lands
  // inside the viewBox. Without this, the viewBox clips the outer 0.5px of
  // every edge, leaving a hairline instead of a full 1px stroke — which
  // misaligns with the card's CSS border, especially at non-100% zoom.
  const S = STROKE / 2;

  return (
    <div
      ref={ref}
      className={`relative inline-flex flex-shrink-0 items-center gap-1.5 px-2.5 py-1.5 ${className}`}
      style={{ color, background: "transparent", ...style }}
    >
      {w > 0 && h > 0 && (
        <svg
          aria-hidden="true"
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <polygon
            points={`${S},${S} ${w - S},${S} ${w - S},${h - NOTCH} ${w - NOTCH},${h - S} ${S},${h - S}`}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
          />
          {/* Diagonal notch edge overdrawn at √2× stroke width. A 45° line
              at strokeWidth=1 renders lighter (anti-aliasing covers ~0.7px
              effective width); multiplying by √2 corrects for the angle so
              the diagonal's visual weight matches the straight edges. */}
          <line
            x1={w - S} y1={h - NOTCH}
            x2={w - NOTCH} y2={h - S}
            stroke={color}
            strokeWidth={STROKE * Math.SQRT2}
          />
        </svg>
      )}

      {Icon && (
        <span className="flex items-center" aria-hidden="true">
          <Icon size={iconSize} />
        </span>
      )}
      <span
        className="whitespace-nowrap text-[10px] font-bold uppercase leading-none tracking-[0.1em]"
        style={{ fontFamily: "'PP Neue Montreal', sans-serif" }}
      >
        {text}
      </span>
    </div>
  );
};

export default CardLabelBadge;
