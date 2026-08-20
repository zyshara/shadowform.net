import React from "react";
import { useParams, Link } from "react-router-dom";
import { readSeedData } from "@/utils/readSeedData";
import { colors } from "@/tokens";
import SubpageHeader from "@/components/SubpageHeader";
import SectionHeader from "@/components/SectionHeader";
import PosterFrame from "@/components/PosterFrame";
import ArtistPhoto, { SKEW_DEG, skewOversizePx } from "@/components/ArtistPhoto";
import CascadeImage from "@/components/CascadeImage";
import Button from "@/components/Button";
import SpotifyIcon from "@/components/SpotifyIcon";
import BandcampIcon from "@/components/BandcampIcon";
import { ShowRow } from "@/pages/Shows";
import { releaseSlug } from "@/utils/releaseSlug";
import { artistSlug } from "@/utils/artistSlug";

const PRIMARY = colors.accent;

const PHOTO_WIDTH = 400;
const PHOTO_HEIGHT = 500;
// Matches PosterFrame's own default bandSize — needed here to work out the
// frame's total rendered height for the skew-overhang math below.
const FRAME_BAND_SIZE = 26;
const FRAME_HEIGHT = PHOTO_HEIGHT + FRAME_BAND_SIZE * 2;
// skewX shears around the box's vertical center by default, so half the
// frame's height pushes left, half pushes right — shifting the whole frame
// right by that amount pulls its leftmost (bottom-left) point back to where
// an unskewed box would have started, lining it up with content below.
const FRAME_SKEW_SHIFT = Math.round((FRAME_HEIGHT / 2) * Math.tan((SKEW_DEG * Math.PI) / 180));
// How much wider than the frame's own content area the inner (counter-
// skewed) wrapper — and the photo inside it — need to be to fully cover
// the frame's slanted corners with no gaps; same formula ArtistPhoto uses
// internally for its own photo layer.
const FRAME_SKEW_OVERSIZE = skewOversizePx(FRAME_HEIGHT);

function showTimestamp(show) {
  const [y, m, d] = show.date.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

function releaseTimestamp(release) {
  if (release.release_date) {
    const t = new Date(release.release_date).getTime();
    if (!isNaN(t)) return t;
  }
  if (release.year) return new Date(`${release.year}-01-01`).getTime();
  return 0;
}

const Artist = () => {
  const { artistSlug: slugParam } = useParams();

  const allArtists = (readSeedData("roster-data") ?? []).filter((a) => a?.name);
  const artist = allArtists.find((a) => artistSlug(a.name) === slugParam);

  const allReleases = readSeedData("discography-data") ?? [];
  const releases = artist
    ? allReleases
        .filter((r) => (r.artists?.length ? r.artists.includes(artist.name) : r.artist === artist.name))
        .slice()
        .sort((a, b) => releaseTimestamp(b) - releaseTimestamp(a))
    : [];

  const allShows = readSeedData("shows-data") ?? [];
  const artistShows = artist
    ? allShows.filter((s) => s.artists?.some((a) => a.name === artist.name))
    : [];
  const now = Date.now();
  const upcomingShows = artistShows
    .filter((s) => showTimestamp(s) >= now)
    .sort((a, b) => showTimestamp(a) - showTimestamp(b));
  const pastShows = artistShows
    .filter((s) => showTimestamp(s) < now)
    .sort((a, b) => showTimestamp(b) - showTimestamp(a));

  if (!artist) {
    return (
      <div className="mx-auto max-w-[1400px] px-10 py-10 lg:py-[70px]">
        <SubpageHeader heading="Artist Not Found" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-10 py-10 lg:py-[70px]">
        <div className="flex flex-col sm:flex-row gap-20">
          <PosterFrame
            skewDeg={SKEW_DEG}
            skewOversize={FRAME_SKEW_OVERSIZE}
            contentWidth={PHOTO_WIDTH}
            contentHeight={PHOTO_HEIGHT}
            style={{ marginLeft: FRAME_SKEW_SHIFT }}
          >
            <ArtistPhoto name={artist.name} src={artist.photo_src} height={PHOTO_HEIGHT} fill />
          </PosterFrame>
          <div className="flex flex-1 flex-col justify-between gap-6">
            <SubpageHeader
              heading={artist.name}
              subheading={
                <span className="disco-filter-count">
                  <b>{releases.length}</b> releases
                  {upcomingShows.length > 0 && (
                    <>
                      <span className="disco-filter-dot"> · </span>
                      <b>{upcomingShows.length}</b> upcoming shows
                    </>
                  )}
                </span>
              }
            />
            <p className="text-[14px] leading-relaxed text-white/60">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus convallis quam nec cursus
              convallis. In hac habitasse platea dictumst.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="thin"
                variant="primary"
                href={`https://open.spotify.com/search/${encodeURIComponent(artist.name)}`}
              >
                <span className="inline-flex items-center gap-[6px]">
                  <SpotifyIcon size={14} />
                  Spotify
                </span>
              </Button>
              {artist.url ? (
                <Button type="thin" variant="secondary" href={artist.url}>
                  <span className="inline-flex items-center gap-[6px]">
                    <BandcampIcon size={14} />
                    Bandcamp
                  </span>
                </Button>
              ) : (
                <Button type="thin" variant="disabled">
                  <span className="inline-flex items-center gap-[6px]">
                    <BandcampIcon size={14} />
                    Not on Bandcamp
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>

      <div className="mt-16">
        <SectionHeader title="Releases" />
        {releases.length === 0 ? (
          <div className="py-10 text-center text-[14px]" style={{ color: "rgba(255,255,255,.35)" }}>
            No releases yet — check back soon.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 14,
            }}
          >
            {releases.map((release, i) => (
              <Link
                key={release.uid ?? i}
                to={`/discography?release=${releaseSlug(release)}`}
                className="disco-grid-tile"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,.12)",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "relative", aspectRatio: "1", overflow: "hidden" }}>
                  {release.cover_art_src ? (
                    <CascadeImage
                      src={release.cover_art_src}
                      alt={release.release_name}
                      index={i}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  ) : null}
                </div>
                <div
                  className="h-[16px] md:h-[12px]"
                  style={{
                    width: "100%",
                    flexShrink: 0,
                    borderTop: `1px solid ${PRIMARY}`,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 6px",
                    overflow: "hidden",
                    marginTop: "1px",
                  }}
                >
                  <span
                    style={{
                      font: "600 8px 'Helvetica Neue', Helvetica, Arial, sans-serif",
                      color: "white",
                      letterSpacing: ".02em",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {release.release_name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-16">
        <SectionHeader title="Upcoming Shows" />
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,.08)",
            borderBottom: "1px solid rgba(255,255,255,.08)",
            background: "oklch(from var(--dod-accent2) l c h / 0.03)",
          }}
        >
          {upcomingShows.length === 0 ? (
            <div className="py-10 text-center text-[14px]" style={{ color: "rgba(255,255,255,.35)" }}>
              No shows announced yet — check back soon.
            </div>
          ) : (
            upcomingShows.map((show, i) => <ShowRow key={`upcoming-${i}`} show={show} index={i} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default Artist;
