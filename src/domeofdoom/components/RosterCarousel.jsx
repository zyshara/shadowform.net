// src/domeofdoom/components/RosterCarousel.jsx
// Adapted from the Claude Design "Roster Carousel" project, option 1a (pure
// parallelogram carousel) — https://claude.ai/design/p/102a00db.../Roster+Carousel.dc.html
// Each card is skewed, then its inner image is counter-skewed and
// oversized so the photo itself renders undistorted inside the
// parallelogram. Barlow Condensed (design's font) swapped for the site's
// own Archivo-expanded treatment; artists without a photo fall back to
// their initials on a tinted card, same as the design's placeholder state.
import { Fragment } from "react";
import { colors } from "@/tokens";

const FLOWER_URL = "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785467660/flower_filgree_iconography_b5cbd61913.png";
const FLOWER_URL_PURPLE = "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1786002015/flower_decor_purple_eedfc4f98d.png";

const headingFont = {
  fontFamily: "Archivo, sans-serif",
  fontStretch: "expanded",
  fontVariationSettings: '"wdth" 125',
};

const SKEW_DEG = 12;
const CARD_SKEW = `skewX(-${SKEW_DEG}deg)`;
const COUNTER_SKEW = `skewX(${SKEW_DEG}deg)`;

// A counter-skewed child only fully cancels its skewed parent's shear (and
// so covers the parent's slanted overflow-hidden edges with no gaps) if
// it's widened by roughly the total horizontal shear the parent's height
// introduces — this depends on height, not on the child's own width, so a
// narrow divider needs the same oversize as a wide card of the same
// height. Under-sizing this is exactly why the divider's "vertical" text
// was actually rendering on a slant.
function skewOversizePx(height) {
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

const RosterCard = ({ artist, height }) => {
  const oversize = skewOversizePx(height);
  return (
  <div
    className="roster-carousel-card"
    style={{ width: 280, height, flexShrink: 0, transform: CARD_SKEW, overflow: "hidden", position: "relative" }}
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
      {artist.photo_src ? (
        <img
          src={artist.photo_src}
          alt={artist.name}
          className="h-full w-full object-cover"
          style={{ display: "block" }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span
            style={{
              ...headingFont,
              fontWeight: 800,
              fontSize: 64,
              color: "rgba(255,255,255,0.09)",
              letterSpacing: "-1px",
              userSelect: "none",
            }}
          >
            {initialsOf(artist.name)}
          </span>
        </div>
      )}
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-full"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)",
          padding: "42px 20px 18px",
        }}
      >
        <div
          style={{
            ...headingFont,
            fontWeight: 700,
            fontSize: 16,
            color: "#fff",
            textTransform: "uppercase",
            letterSpacing: "1px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 230,
          }}
        >
          {artist.name}
        </div>
      </div>
    </div>
  </div>
  );
};

// Fills the thin parallelogram of negative space that two skewed cards
// leave between them, in the same poster-border language as
// PosterFrame.jsx — a corner flower top and bottom, a vertical repeating
// "DOMEOFDOOM ·" band between them. Unlike the cards, this content is NOT
// counter-skewed — it leans with the parallelogram, bordered like a slim
// angled pillar between cards, with a little breathing-room margin on
// each side.
const CarouselDivider = ({ height }) => {
  const bandFontStyle = {
    ...headingFont,
    fontWeight: 400,
    fontSize: "11px",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: colors.accent,
    whiteSpace: "nowrap",
  };

  return (
    <div
      style={{
        width: 40,
        height,
        flexShrink: 0,
        transform: `skew(-${SKEW_DEG}deg, -1deg)`,
        position: "relative",
        border: `1px solid ${colors.accent}`,
        margin: "0 11px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <img src={FLOWER_URL} alt="" aria-hidden="true" style={{ width: 16, height: 16, margin: "18px 0", flexShrink: 0 }} />
      <div
        className="overflow-hidden"
        style={{ flex: 1, width: 22, writingMode: "vertical-rl", ...bandFontStyle, marginRight: 4 }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i}>
            DOMEOFDOOM
            <span className="mx-2">·</span>
          </span>
        ))}
      </div>
      <img src={FLOWER_URL} alt="" aria-hidden="true" style={{ width: 16, height: 16, margin: "18px 0", flexShrink: 0 }} />
    </div>
  );
};

const CARD_HEIGHT = 520;

const RosterCarousel = ({ artists = [] }) => {
  const named = artists.filter((a) => a?.name);
  if (!named.length) return null;

  const doubled = [...named, ...named];
  const duration = Math.max(20, named.length * 2.8);

  return (
    <div className="roster-carousel-wrap relative w-full overflow-hidden" style={{ background: colors.bg, padding: "56px 0" }}>
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 z-10"
        style={{ width: 110, background: `linear-gradient(to right, ${colors.bg}, transparent)` }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 z-10"
        style={{ width: 110, background: `linear-gradient(to left, ${colors.bg}, transparent)` }}
      />
      <div
        className="roster-carousel-track flex items-stretch"
        style={{ width: "max-content", animation: `rosterScroll ${duration}s linear infinite` }}
      >
        {doubled.map((artist, i) => (
          <Fragment key={`${artist.name}-${i}`}>
            <RosterCard artist={artist} height={CARD_HEIGHT} />
            <CarouselDivider height={CARD_HEIGHT} />
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default RosterCarousel;
