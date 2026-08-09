// src/domeofdoom/components/RosterCarousel.jsx
// Adapted from the Claude Design "Roster Carousel" project, option 1a (pure
// parallelogram carousel) — https://claude.ai/design/p/102a00db.../Roster+Carousel.dc.html
// Each card is skewed, then its inner image is counter-skewed and
// oversized so the photo itself renders undistorted inside the
// parallelogram. Barlow Condensed (design's font) swapped for the site's
// own Archivo-expanded treatment; artists without a photo fall back to
// their initials on a tinted card, same as the design's placeholder state.
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { colors, FLOWER_FILIGREE } from "@/tokens";
import { artistSlug } from "@/utils/artistSlug";
import ArtistPhoto from "@/components/ArtistPhoto";

const headingFont = {
  fontFamily: "Archivo, sans-serif",
  fontStretch: "expanded",
  fontVariationSettings: '"wdth" 125',
};

const SKEW_DEG = 12;

const RosterCard = ({ artist, height }) => (
  <Link
    to={`/roster/${artistSlug(artist.name)}`}
    className="block"
    style={{ width: 380, height, flexShrink: 0, cursor: "pointer" }}
  >
    <ArtistPhoto name={artist.name} src={artist.photo_src} height={height} fill hoverEffect>
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
            maxWidth: 330,
          }}
        >
          {artist.name}
        </div>
      </div>
    </ArtistPhoto>
  </Link>
);

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
        margin: "0 11px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <img src={FLOWER_FILIGREE} alt="" aria-hidden="true" style={{ width: 16, height: 16, margin: "18px 0", flexShrink: 0 }} />
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
      <img src={FLOWER_FILIGREE} alt="" aria-hidden="true" style={{ width: 16, height: 16, margin: "18px 0", flexShrink: 0 }} />
    </div>
  );
};

const CARD_HEIGHT = 680;

const RosterCarousel = ({ artists = [] }) => {
  const named = artists.filter((a) => a?.name);
  if (!named.length) return null;

  const doubled = [...named, ...named];
  const duration = Math.max(20, named.length * 2.8);

  return (
    <div className="my-0 mx-auto max-w-[1400px] roster-carousel-wrap relative w-full overflow-hidden" style={{ background: colors.bg }}>
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
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default RosterCarousel;
