import { colors } from "@/tokens";

const FLOWER_URL = "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785467660/flower_filgree_iconography_b5cbd61913.png";
const BAND_SIZE = 26;

const BAND_FONT_STYLE = {
  fontFamily: "Archivo, sans-serif",
  fontStretch: "expanded",
  fontVariationSettings: '"wdth" 125',
  fontWeight: 400,
  fontSize: "13px",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#ff6a65",
  whiteSpace: "nowrap",
};

const CornerFlower = ({ style }) => (
  <img
    src={FLOWER_URL}
    alt=""
    aria-hidden="true"
    style={{ position: "absolute", width: 18, height: 18, zIndex: 1, ...style }}
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

// A poster-style border: flower icons at each corner, "DOMEOFDOOM ·" tiled
// around all four edges (bottom/left/right rotated so the whole frame reads
// with consistent orientation, like a record sleeve).
const PosterFrame = ({ label = "DOMEOFDOOM", children }) => (
  <div
    className="relative border border-white/10"
    style={{ padding: BAND_SIZE, background: colors.bg }}
  >
    <CornerFlower style={{ left: 4, top: 4 }} />
    <CornerFlower style={{ right: 4, top: 4 }} />
    <CornerFlower style={{ left: 4, bottom: 4 }} />
    <CornerFlower style={{ right: 4, bottom: 4 }} />

    {/* top — inset past the corner flowers/vertical bands so nothing overlaps */}
    <div
      className="absolute overflow-hidden text-center"
      style={{ left: BAND_SIZE, right: BAND_SIZE, top: 0, height: BAND_SIZE, lineHeight: `${BAND_SIZE}px`, ...BAND_FONT_STYLE }}
    >
      <RepeatedLabel label={label} />
    </div>

    {/* bottom (flipped so the frame reads with 180°-rotational symmetry) */}
    <div
      className="absolute overflow-hidden text-center"
      style={{ left: BAND_SIZE, right: BAND_SIZE, bottom: 0, height: BAND_SIZE, lineHeight: `${BAND_SIZE}px`, transform: "rotate(180deg)", ...BAND_FONT_STYLE }}
    >
      <RepeatedLabel label={label} />
    </div>

    {/* left */}
    <div
      className="absolute overflow-hidden"
      style={{
        left: "3px",
        top: BAND_SIZE,
        bottom: BAND_SIZE,
        width: BAND_SIZE,
        writingMode: "vertical-rl",
        transform: "rotate(180deg)",
        ...BAND_FONT_STYLE,
      }}
    >
      <RepeatedLabel label={label} />
    </div>

    {/* right */}
    <div
      className="absolute overflow-hidden"
      style={{ right: "3px", top: BAND_SIZE, bottom: BAND_SIZE, width: BAND_SIZE, writingMode: "vertical-rl", ...BAND_FONT_STYLE }}
    >
      <RepeatedLabel label={label} />
    </div>

    <div className="relative" style={{ zIndex: 1 }}>
      {children}
    </div>
  </div>
);

export default PosterFrame;
