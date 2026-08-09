// src/domeofdoom/components/ArtistPhoto.jsx
//
// The skewed-parallelogram photo treatment shared by the roster carousel
// cards (RosterCarousel.jsx) and the artist page header — same skew/
// counter-skew math so a photo always renders undistorted inside the
// slanted frame regardless of where it's used.

import { colors } from "@/tokens";

const headingFont = {
  fontFamily: "Archivo, sans-serif",
  fontStretch: "expanded",
  fontVariationSettings: '"wdth" 125',
};

export const SKEW_DEG = 12;
const CARD_SKEW = `skewX(-${SKEW_DEG}deg)`;
const COUNTER_SKEW = `skewX(${SKEW_DEG}deg)`;

// A counter-skewed child only fully cancels its skewed parent's shear (and
// so covers the parent's slanted overflow-hidden edges with no gaps) if
// it's widened by roughly the total horizontal shear the parent's height
// introduces — this depends on height, not on the child's own width, so a
// narrow box needs the same oversize as a wide one of the same height.
export function skewOversizePx(height) {
  const shear = height * Math.tan((SKEW_DEG * Math.PI) / 180);
  return Math.ceil(shear + 90);
}

export const initialsOf = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

// `fill` sizes the box to 100% of its parent (for use inside a wrapper —
// e.g. a Link — that already sets the pixel dimensions) instead of using
// `width`/`height` directly; `height` is always required as a plain
// number since the skew math needs a real pixel value either way.
// `hoverEffect` opts into the brightness/scale hover treatment (see
// .roster-carousel-card in index.css) — only the carousel wants that;
// standalone uses like the artist page header should stay static.
const ArtistPhoto = ({ name, src, width = 380, height, fill = false, hoverEffect = false, initialsFontSize = 64, style, children }) => {
  const oversize = skewOversizePx(height);
  return (
    <div
      className={hoverEffect ? "roster-carousel-card" : ""}
      style={{
        width: fill ? "100%" : width,
        height: fill ? "100%" : height,
        flexShrink: 0,
        transform: CARD_SKEW,
        overflow: "hidden",
        position: "relative",
        ...style,
      }}
    >
      <div
        style={{
          transform: COUNTER_SKEW,
          width: `calc(100% + ${oversize}px)`,
          marginLeft: `-${oversize / 2}px`,
          height: "100%",
          position: "relative",
          background: colors.card,
        }}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover"
            style={{ display: "block" }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span
              style={{
                ...headingFont,
                fontWeight: 800,
                fontSize: initialsFontSize,
                color: "rgba(255,255,255,0.09)",
                letterSpacing: "-1px",
                userSelect: "none",
              }}
            >
              {initialsOf(name)}
            </span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default ArtistPhoto;
