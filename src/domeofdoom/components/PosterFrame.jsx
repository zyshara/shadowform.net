import { colors } from "@/tokens";

const FLOWER_URL = "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785467660/flower_filgree_iconography_b5cbd61913.png";

const CornerFlower = ({ size, style }) => (
  <img
    src={FLOWER_URL}
    alt=""
    aria-hidden="true"
    style={{ position: "absolute", width: size, height: size, zIndex: 1, ...style }}
  />
);

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
const PosterFrame = ({ label = "DOMEOFDOOM", showText = true, bandSize = 26, flowerSize = 18, children }) => {
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
  const flowerInset = Math.max(2, Math.round(bandSize * 0.15));

  return (
    <div className="relative border border-white/10" style={{ padding: bandSize, background: colors.bg }}>
      <CornerFlower size={flowerSize} style={{ left: flowerInset, top: flowerInset }} />
      <CornerFlower size={flowerSize} style={{ right: flowerInset, top: flowerInset }} />
      <CornerFlower size={flowerSize} style={{ left: flowerInset, bottom: flowerInset }} />
      <CornerFlower size={flowerSize} style={{ right: flowerInset, bottom: flowerInset }} />

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

      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default PosterFrame;
