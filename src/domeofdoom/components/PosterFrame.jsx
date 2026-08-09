import { colors, FLOWER_FILIGREE, FLOWER_FILIGREE_PURPLE } from "@/tokens";

// Which two edges each corner sits flush against — drives both the badge's
// own position (relative to the frame) and, in turn, which edges its hover
// image hugs (relative to the badge itself).
const CORNER_EDGES = {
  tl: { top: true, left: true },
  tr: { top: true, right: true },
  bl: { bottom: true, left: true },
  br: { bottom: true, right: true },
};

// When `clickable`, a purple variant is stacked on top of the default flower
// and crossfaded in via .poster-frame-clickable:hover (see index.css) — img
// `src` can't be transitioned directly, so this is the two-image trick. Both
// images are absolutely positioned to fill the badge span entirely.
//
// Flush offset for the badge itself — sits just past the frame's own
// border so it reads as sitting right on the corner intersection, not
// inset inward from it.
const EDGE_OFFSET = -1;

const CornerFlower = ({ corner, size, clickable }) => {
  const { top, bottom, left, right } = CORNER_EDGES[corner];

  const outerStyle = {
    position: "absolute",
    width: size,
    height: size,
    zIndex: 1,
    boxSizing: "border-box",
    display: "block",
    ...(top ? { top: EDGE_OFFSET } : { bottom: EDGE_OFFSET }),
    ...(left ? { left: EDGE_OFFSET } : { right: EDGE_OFFSET }),
  };

  return (
    <span className="poster-frame-flower" style={outerStyle}>
      <img
        src={FLOWER_FILIGREE}
        alt=""
        aria-hidden="true"
        className="poster-frame-flower-default p-[4px]"
        style={{ position: "absolute", inset: 0, objectFit: "contain" }}
      />
      {clickable && (
        <img
          src={FLOWER_FILIGREE_PURPLE}
          alt=""
          aria-hidden="true"
          className="poster-frame-flower-hover p-[4px]"
          style={{ position: "absolute", inset: 0, background: "var(--dod-accent)", objectFit: "contain" }}
        />
      )}
    </span>
  );
};

function RepeatedLabel({ label, count = 14 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <span key={i}>
          {label}
          <span className="mx-3">·</span>
        </span>
      ))}
    </>
  );
}

// A poster-style border: flower icons at each corner, with an optional
// "DOMEOFDOOM ·" text tiled around all four edges (bottom/left/right
// rotated so the whole frame reads with consistent orientation, like a
// record sleeve). `bandSize` controls the frame's overall thickness;
// `showText` toggles the repeating label off for a plainer, thinner frame.
// `skewDeg` skews the whole frame (border, corners, text bands included —
// same "let decorative content shear naturally" choice CarouselDivider
// already makes in RosterCarousel.jsx) so it visually matches a skewed
// child like ArtistPhoto; the children wrapper is counter-skewed back to
// neutral so whatever's inside renders at its own intended angle instead
// of getting sheared twice. When skewed, the wrapper also needs the same
// oversize-and-recenter treatment ArtistPhoto's own inner layer uses (see
// its comment) — pass `skewOversize` (in px, from `skewOversizePx`) or the
// counter-skewed wrapper ends up a plain rectangle sitting inside the
// frame's now-parallelogram silhouette, leaving gaps at two corners.
// `contentWidth`/`contentHeight` give the content area a fixed footprint
// (required alongside `skewDeg`) so the oversized inner layer — positioned
// absolutely within it — can extend past that footprint to close the
// corner gaps without changing the frame's own outer size; pass the
// skewed child with `fill` (e.g. `<ArtistPhoto fill .../>`) so it stretches
// to whatever size that oversized layer ends up being.
const PosterFrame = ({
  label = "DOMEOFDOOM",
  showText = true,
  bandSize = 26,
  flowerSize = 25,
  clickable = false,
  skewDeg = 0,
  skewOversize = 0,
  contentWidth,
  contentHeight,
  style,
  children,
}) => {
  const bandFontStyle = {
    fontFamily: "Archivo, sans-serif",
    fontStretch: "expanded",
    fontVariationSettings: '"wdth" 125',
    fontWeight: 400,
    fontSize: "13px",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: colors.accent,
    whiteSpace: "nowrap",
  };
  return (
    <div
      className={`relative border border-white/10 poster-frame${clickable ? " poster-frame-clickable" : ""}`}
      style={{
        padding: bandSize,
        background: colors.bg,
        transform: skewDeg ? `skewX(${-skewDeg}deg)` : undefined,
        ...style,
      }}
    >
      <CornerFlower corner="tl" size={flowerSize} clickable={clickable} />
      <CornerFlower corner="tr" size={flowerSize} clickable={clickable} />
      <CornerFlower corner="bl" size={flowerSize} clickable={clickable} />
      <CornerFlower corner="br" size={flowerSize} clickable={clickable} />

      {showText && (
        <>
          {/* top — inset past the corner flowers/vertical bands so nothing overlaps */}
          <div
            className="absolute overflow-hidden text-center"
            style={{ left: bandSize, right: bandSize, top: 0, height: bandSize, lineHeight: `${bandSize}px`, ...bandFontStyle }}
          >
            <RepeatedLabel label={label} />
          </div>

          {/* bottom (flipped so the frame reads with 180°-rotational symmetry) */}
          <div
            className="absolute overflow-hidden text-center"
            style={{ left: bandSize, right: bandSize, bottom: 0, height: bandSize, lineHeight: `${bandSize}px`, transform: "rotate(180deg)", ...bandFontStyle }}
          >
            <RepeatedLabel label={label} />
          </div>

          {/* left */}
          <div
            className="absolute overflow-hidden"
            style={{
              left: "3px",
              top: bandSize,
              bottom: bandSize,
              width: bandSize,
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              ...bandFontStyle,
            }}
          >
            <RepeatedLabel label={label} />
          </div>

          {/* right */}
          <div
            className="absolute overflow-hidden"
            style={{ right: "3px", top: bandSize, bottom: bandSize, width: bandSize, writingMode: "vertical-rl", ...bandFontStyle }}
          >
            <RepeatedLabel label={label} />
          </div>
        </>
      )}

      {skewDeg && contentWidth && contentHeight ? (
        <div className="relative overflow-hidden" style={{ zIndex: 1, width: contentWidth, height: contentHeight }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `skewX(${skewDeg}deg)`,
              width: skewOversize ? `calc(100% + ${skewOversize}px)` : "100%",
              marginLeft: skewOversize ? `-${skewOversize / 2}px` : undefined,
            }}
          >
            {children}
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden" style={{ zIndex: 1 }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default PosterFrame;
