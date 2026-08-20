// src/domeofdoom/pages/CatalogItem.jsx
//
// Individual catalog item page. Route is /catalog/:catalogParam - the param
// is either a human-assigned catalog_number (e.g. DOD_088) or a title-slug
// +uid fallback for items without one yet, see utils/catalogItemSlug.js for
// the shared resolution logic used by both this page and the Catalog grid's
// card links.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { readSeedData } from "@/utils/readSeedData";
import { findByCatalogParam } from "@/utils/catalogItemSlug";
import { artistSlug } from "@/utils/artistSlug";
import SubpageHeader from "@/components/SubpageHeader";
import TiltedCover from "@/components/TiltedCover";
import Button from "@/components/Button";
import SpotifyIcon from "@/components/SpotifyIcon";
import BandcampIcon from "@/components/BandcampIcon";
import DownloadIcon from "@/components/DownloadIcon";
import VinylRecord from "@/components/VinylRecord";
import CassetteTape from "@/components/CassetteTape";
import StarIcon from "@/components/StarIcon";
import GlobeIcon from "@/components/GlobeIcon";
import ArrowButton from "@/components/ArrowButton";
import { getVinylDiscOverride } from "@/data/vinylDiscOverrides";
import { colors } from "@/tokens";

// No genre field exists anywhere in the data pipeline yet (not on the
// Strapi DomeOfDoomArtist model, not in the Bandcamp scrape) - hardcoded
// until a real source exists, for both the Release Info grid and each
// artist card's tag.
const GENRE_PLACEHOLDER = "Bass";

function yearOf(item) {
  const t = new Date(item.release_date).getTime();
  return isNaN(t) ? null : new Date(item.release_date).getUTCFullYear();
}

function formatReleaseDate(item) {
  const t = new Date(item.release_date).getTime();
  if (isNaN(t)) return null;
  return new Date(item.release_date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// item.tracks is DomeofDoomCatalogItem.derived.tracks, copied through
// verbatim from the Bandcamp scrape (see backfillCatalogItems.js) - each
// entry is { position, title, artist, durationSeconds, duration, url }.
// durationSeconds can be null (Bandcamp doesn't always expose it), so the
// total is summed defensively and only shown once at least one track has
// a real value - showing "0:00" would be actively misleading.
function formatDuration(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function totalDurationOf(tracks) {
  const known = (tracks ?? []).filter((t) => t.durationSeconds > 0);
  if (known.length === 0) return null;
  return formatDuration(known.reduce((sum, t) => sum + t.durationSeconds, 0));
}

// Bandcamp doesn't always expose the pre-formatted duration string even
// when it exposes the raw seconds (~1% of tracks across the catalog) -
// fall back to formatting durationSeconds ourselves. durationSeconds is 0
// (not null) for not-yet-released tracks Bandcamp hasn't published real
// audio for yet, so 0 is treated the same as missing rather than shown as
// a real "0:00".
function trackDuration(track) {
  if (track.duration) return track.duration;
  if (track.durationSeconds > 0) return formatDuration(track.durationSeconds);
  return "—";
}

// item.packages is DomeofDoomCatalogItem.derived.packages, copied through
// verbatim from the Bandcamp scrape. Bandcamp's package list always
// includes a placeholder "Digital" entry even when digital purchase isn't
// actually enabled - every field on it besides formatType is null, unlike
// real packages which always carry a real availability value (same rule
// backfillCatalogItems.js's computeFormatNames uses server-side). Every
// matching real package per normalized format name (not just one) - a
// repress adds a second Cassette/Vinyl/etc package alongside the
// original, and both should show up as separate cards, in a fixed
// display order by format. Bandcamp's own package order is guaranteed
// chronological with the newest first, so within a format group index 0
// is the most recent press and the last index is the 1st press -
// pressNumber below is derived from that, counting up from the oldest.
const FORMAT_DISPLAY_ORDER = [
  { key: "digital", label: "Digital", match: "digital" },
  { key: "vinyl", label: "Vinyl", match: "vinyl" },
  { key: "cassette", label: "Cassette", match: "cassette" },
  { key: "cd", label: "CD", match: "compact disc" },
];

function realFormatsOf(packages) {
  const byMatch = new Map();
  for (const p of packages ?? []) {
    if (p.availability == null) continue;
    const f = (p.formatType || "").toLowerCase();
    for (const { match } of FORMAT_DISPLAY_ORDER) {
      if (f.includes(match)) {
        if (!byMatch.has(match)) byMatch.set(match, []);
        byMatch.get(match).push(p);
      }
    }
  }
  return FORMAT_DISPLAY_ORDER.filter(({ match }) => byMatch.has(match)).flatMap(({ key, label, match }) => {
    const pkgs = byMatch.get(match);
    return pkgs.map((pkg, i) => ({
      key: `${key}-${i}`,
      formatKey: key,
      label,
      pkg,
      // Only meaningful (and only shown) when a format has more than one
      // press - a lone Digital/CD/etc doesn't need a "1st Press" tag.
      pressNumber: pkgs.length > 1 ? pkgs.length - i : null,
    }));
  });
}

// Long titles ("The Family Of Things/This Home We Built") only get a
// browser-native wrap opportunity at actual spaces - a slash-joined pair
// of track names has no spaces around the slash, so it just runs past the
// container instead of breaking there. <wbr/> after each break char adds
// an optional break point without inserting a visible space/hyphen.
const TITLE_BREAK_CHARS = ["/"];

function withBreakOpportunities(text, breakChars = TITLE_BREAK_CHARS) {
  const pattern = new RegExp(`([${breakChars.map((c) => `\\${c}`).join("")}])`);
  return text.split(pattern).map((part, i) =>
    breakChars.includes(part) ? (
      <React.Fragment key={i}>
        {part}
        <wbr />
      </React.Fragment>
    ) : (
      part
    )
  );
}

// Vinyl/cassette package descriptions are dod-bandcamp-scraper's
// desc_pt1+desc_pt2 joined with a blank line (see buildPackages in
// scraper.js) - desc_pt1 alone is the actual pressing summary (color/
// pressing count/etc), desc_pt2 tends to run long (credits, liner notes),
// which is too much for a small format card.
function firstParagraph(text) {
  return text?.split(/\n\s*\n/)[0] ?? text;
}

function pressLabel(n) {
  if (n === 1) return "1st Press";
  if (n === 2) return "2nd Press";
  if (n === 3) return "3rd Press";
  return `${n}th Press`;
}

// The small 2x2 dot mark next to "Tracklist"/"Formats" section labels.
const SectionDots = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" className="flex-shrink-0">
    <circle cx="3" cy="3" r="3" fill="var(--dod-lilac)" />
    <circle cx="11" cy="3" r="3" fill="var(--dod-lilac)" />
    <circle cx="3" cy="11" r="3" fill="var(--dod-lilac)" />
    <circle cx="11" cy="11" r="3" fill="var(--dod-lilac)" />
  </svg>
);

const SectionLabel = ({ children, className }) => (
  <div className={`flex items-center gap-2 mb-6 text-sm font-semibold uppercase tracking-[0.15em] text-dod-neon-mint ${className}`}>
    <SectionDots />
    {children}
  </div>
);

const InfoField = ({ label, value }) => (
  <div className="grid grid-cols-[auto_auto] justify-between md:justify-center md:grid-cols-[134px_1fr] gap-3 text-md md:text-sm">
    <span className="uppercase tracking-[0.1em] text-sm md:text-xs font-semibold text-dod-lilac">{label}</span>
    <span className="text-dod-white">{value ?? "—"}</span>
  </div>
);

// Photo/placeholder diameter - "medium" for a featured/solo artist,
// "small" for anywhere several cards share a row and a 120px photo would
// crowd it. size (not just className) since the StarIcon fallback's own
// icon size needs to scale down with it, not just the circle around it.
// max-w (not a fixed h-*/w-*) so the avatar can shrink below its target
// size when the card runs out of room - paired with aspect-square below
// so it shrinks in lockstep on both axes instead of squishing.
const AVATAR_SIZE = {
  small: { box: "max-w-[88px]", icon: 56 },
  medium: { box: "max-w-[120px]", icon: 76 },
  large: { box: "max-w-[100px] lg:max-w-[120px]", icon: 76 },
};

// `artist` is a roster-data entry (see the linkedArtists join in
// CatalogItem below) - name, location, photo_src, all sourced from the
// Bandcamp artist roster scrape, not from the catalog item itself.
const ArtistCard = ({ artist, size = "small", className = "" }) => {
  const to = `/roster/${artistSlug(artist.name)}`;
  const avatar = AVATAR_SIZE[size];
  return (
    <div className={`grid grid-cols-[auto_1fr] justify-between gap-4 ${className}`}>
      {artist.photo_src ? (
        <img
          src={artist.photo_src}
          alt={artist.name}
          className={`${avatar.box} aspect-square w-full self-start rounded-full object-cover border-2 border-dod-deep-purple/80`}
        />
      ) : (
        // No scraped Bandcamp photo (e.g. artists created directly in
        // Strapi from catalog/track credits, not from the Bandcamp artist
        // roster) - same treatment as Roster.jsx's photo-less cards, just
        // circular here to match this card's real-photo shape instead of
        // filling a whole square tile.
        <div
          className={`flex ${avatar.box} aspect-square w-full self-start items-center justify-center rounded-full border-2 border-dod-deep-purple/50 bg-dod-black`}
        >
          <StarIcon
            size={avatar.icon}
            gradientFrom={colors.deep_purple}
            gradientTo={colors.deep_purple}
            glowColor={colors.lilac}
            showGlow={true}
            showBackground={false}
          />
        </div>
      )}
      <div className="flex min-w-0 flex-col gap-3 justify-center">
        <div className="flex min-w-0 flex-col gap-1">
          <Link to={to} className="truncate font-semibold text-dod-neon-mint hover:underline">
            {artist.name}
          </Link>
          {/* Always rendered (not conditional on artist.location existing)
              so every card reserves the same height for this line -
              otherwise cards without a location end up shorter than their
              siblings and the row looks misaligned. */}
          <div className="truncate text-xs text-dod-lilac text-wrap">{artist.location || " "}</div>
        </div>
      </div>
    </div>
  );
};

// Real, self-built scrollbar rather than relying on the browser's native
// one - native scrollbars (even styled via ::-webkit-scrollbar/
// scrollbar-color) still fade/disappear on inactivity on some platforms,
// which is exactly what we don't want here. The scrollable area itself
// hides its native scrollbar entirely (see .tracklist-scroll in index.css)
// and this renders a permanently-visible track + thumb next to it instead,
// kept in sync with real scroll position and draggable.
const TracklistScrollArea = ({ children, count }) => {
  const scrollRef = useRef(null);
  const trackRef = useRef(null);
  const [thumb, setThumb] = useState(null); // null = content fits, no thumb needed

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight + 1) {
      setThumb(null);
      return;
    }
    const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, 24);
    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop = clientHeight - thumbHeight;
    const thumbTop = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTop : 0;
    setThumb({ top: thumbTop, height: thumbHeight });
  }, []);

  useEffect(() => {
    measure();
  }, [measure, count]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const handleThumbPointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const el = scrollRef.current;
    if (!el || !thumb) return;
    const startY = e.clientY;
    const startScrollTop = el.scrollTop;
    const maxScrollTop = el.scrollHeight - el.clientHeight;
    const maxThumbTop = el.clientHeight - thumb.height;

    const onMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const deltaRatio = maxThumbTop > 0 ? deltaY / maxThumbTop : 0;
      el.scrollTop = Math.min(Math.max(startScrollTop + deltaRatio * maxScrollTop, 0), maxScrollTop);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // Clicking empty track space (not the thumb itself) jumps to that position.
  const handleTrackClick = (e) => {
    const el = scrollRef.current;
    if (!el || e.target !== trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickRatio = (e.clientY - rect.top) / rect.height;
    const maxScrollTop = el.scrollHeight - el.clientHeight;
    el.scrollTop = clickRatio * maxScrollTop;
  };

  return (
    <div className="relative">
      <div ref={scrollRef} onScroll={measure} className="tracklist-scroll max-h-[360px] overflow-y-auto pr-3">
        {children}
      </div>
      {thumb && (
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="absolute right-[-8px] top-0 bottom-0 w-1.5 cursor-pointer bg-dod-lilac/15"
        >
          <div
            onPointerDown={handleThumbPointerDown}
            className="absolute left-0 w-full cursor-grab bg-dod-neon-mint active:cursor-grabbing"
            style={{ top: thumb.top, height: thumb.height }}
          />
        </div>
      )}
    </div>
  );
};

const CatalogItem = () => {
  const { catalogParam } = useParams();
  // Stepped through by the two ArrowButtons next to the Spotify/Bandcamp
  // row - slideDirection just tracks which way the user last pressed, so
  // the incoming slide (see the `key={slideIndex}` remount below) can
  // animate in from the matching side. Declared before the `if (!item)`
  // early return below since hooks can't follow a conditional return.
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);

  const allItems = readSeedData("catalog-items-data") ?? [];
  const item = findByCatalogParam(allItems, catalogParam);

  if (!item) {
    return (
      <div className="mx-auto max-w-[1400px] px-10 py-10 lg:py-[70px]">
        <SubpageHeader heading="Release Not Found" />
      </div>
    );
  }

  const formats = realFormatsOf(item.packages);

  // Cover carousel slides: just the tilted 3D cover and the flat artwork
  // for now.
  const coverSlides = [{ type: "tilted" }, ...(item.artwork_url ? [{ type: "image", src: item.artwork_url }] : [])];
  const goToSlide = (direction) => {
    setSlideDirection(direction);
    setSlideIndex((i) => (i + direction + coverSlides.length) % coverSlides.length);
  };

  // item.artists (normalizeCatalogItem) is name-only - the richer profile
  // (photo, location) lives in roster-data instead (normalized
  // DomeOfDoomArtist records, see server/models/artist.js), joined here by
  // name. roster-data is seeded into every domeofdoom page unconditionally,
  // so this is a plain lookup, no fetch. Names that don't match anyone
  // currently in Strapi are dropped rather than shown as a broken card.
  const roster = readSeedData("roster-data") ?? [];
  const rosterByName = new Map(roster.map((a) => [a.name, a]));
  let linkedArtists = item.artists.map((name) => rosterByName.get(name)).filter(Boolean);

  // A compilation's artist order coming off Bandcamp is basically
  // arbitrary (whatever order tracks/credits happened to be scraped in) -
  // alphabetical reads as intentional, a normal release's is usually
  // meaningful (billing order) and stays as-is.
  if (item.type === "Compilation") {
    linkedArtists = [...linkedArtists].sort((a, b) => a.name.localeCompare(b.name));
  }

  // Solo/duo releases name the artist(s) directly (top panel + the
  // TiltedCover spine below); anything bigger reads as a label release -
  // built off linkedArtists (roster-confirmed), not the raw item.artists
  // strings, so this only ever shows/links artists that actually exist on
  // the roster.
  const isSoloOrDuo = linkedArtists.length <= 2;
  const artistLabel = isSoloOrDuo ? linkedArtists.map((a) => a.name).join(", ") : "DOMEOFDOOM";

  // Shared by every Release Info / Artists frame below - kept as one
  // constant so the two always stay visually identical bordered boxes.
  const FRAME_CLASS = "p-10 border border-dod-lilac/50 bg-black";

  return (
    <div className="font-ppneue pt-10 flex flex-col gap-8">
      <div className="grid gap-2 grid-cols-6 items-center justify-center w-full h-full">
        <div className="pt-8 flex flex-col gap-8 col-start-1 col-span-6 md:col-span-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs md:text-sm font-medium tracking-[0.15em] text-dod-lilac">
              { item.catalog_number && (
                <>
                  <GlobeIcon size={16} /> {item.catalog_number} ·
                </>
              )}
              <div className="uppercase text-xs md:text-sm font-medium tracking-[0.15em] text-dod-white">
               {item.type} {yearOf(item) ? `· ${yearOf(item)}` : ""}
              </div>
            </div>
            <div className="text-5xl md:text-[clamp(20px,3vw,8rem)] leading-[1.05] italic font-semibold uppercase text-dod-neon-mint">
              {withBreakOpportunities(item.title)}
            </div>
            <div className="text-xl text-dod-deep-purple font-medium">
              { linkedArtists.length > 0
                ? linkedArtists.map((artist, i) => (
                    <React.Fragment key={artist.name}>
                      {i > 0 && ", "}
                      <Link to={`/roster/${artistSlug(artist.name)}`} className="hover:text-dod-neon-mint transition-all underline">
                        {artist.name}
                      </Link>
                    </React.Fragment>
                  ))
                : "DOMEOFDOOM"}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <InfoField label="Catalog Number" value={item.catalog_number} />
            <InfoField label="Release Date" value={formatReleaseDate(item)} />
            <InfoField label="Label" value="Dome of Doom" />
            <InfoField label="Format" value={formats.length > 0 ? [...new Set(formats.map((f) => f.label))].join(", ") : null} />
            <InfoField label="Genre" value={GENRE_PLACEHOLDER} />
          </div>
          {item.description && (
            <div
              className="rich-text font-ppneue text-dod-white/50"
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
          )}
        </div>
        <div className="row-start-1 col-start-2 col-span-4 md:col-start-4 md:col-span-3">
          <div
            key={slideIndex}
            className={slideDirection === 1 ? "cover-slide-in-right" : "cover-slide-in-left"}
          >
            {coverSlides[slideIndex].type === "tilted" ? (
              <TiltedCover
                className="md:p-[50px] lg:p[60px]"
                artworkUrl={item.artwork_url}
                title={item.title}
                text={{
                  "tilted-cover-left": {
                    first: item.catalog_number,
                    middle: "DOMEOFDOOM",
                    last: item.title,
                  },
                  "tilted-cover-bottom": {
                    first: artistLabel,
                  },
                }}
              />
            ) : (
              <img
                src={coverSlides[slideIndex].src}
                alt={item.title}
                className="aspect-square w-full object-cover md:p-[50px] lg:p[60px]"
              />
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row col-start-1 col-span-6 md:col-span-3">
          {item.spotify_url ? (
            <Button type="thin" variant="primary" href={item.spotify_url} style={{ width: "100%" }}>
              <span className="inline-flex items-center gap-[6px] leading-none">
                <SpotifyIcon size={14} />
                Spotify
              </span>
            </Button>
          ) : (
            <Button variant="disabled" type="thin" style={{ width: "100%" }}>
              <span className="inline-flex items-center gap-[6px] leading-none">
                <SpotifyIcon size={14} />
                Spotify
              </span>
            </Button>
          )}
          {item.bandcamp_url && (
            <Button type="thin" variant="secondary" href={item.bandcamp_url} style={{ width: "100%" }}>
              <span className="inline-flex items-center gap-[6px] leading-none">
                <BandcampIcon size={14} />
                Bandcamp
              </span>
            </Button>
          )}
        </div>

        {/* Steps through coverSlides (tilted cover, flat artwork, then any
            scraped package photos). On mobile this sits in row 1 (same row
            as the cover itself, per the grid's auto-placement/overlap) so
            self-stretch + items-stretch lets each button's tap target fill
            the whole cover height instead of just its own small icon box -
            on desktop it drops into row 2 alongside the Spotify/Bandcamp
            buttons (via the same auto-placement into column 5) at a normal
            fixed 40px square. */}
        <div className="col-start-1 row-start-1 md:row-start-2 col-span-6 md:col-start-5 md:col-span-1 self-stretch flex items-stretch md:items-center justify-between">
          <ArrowButton
            direction="left"
            color="lilac"
            className="w-10 h-full md:h-10"
            iconClassName="w-[10px] h-[10px] md:w-4 md:h-4"
            onClick={() => goToSlide(-1)}
          />
          <ArrowButton
            direction="right"
            color="lilac"
            className="w-10 h-full md:h-10"
            iconClassName="w-[10px] h-[10px] md:w-4 md:h-4"
            onClick={() => goToSlide(1)}
          />
        </div>

      </div>

      <div className="grid grid-rows-1 grid-cols-6 gap-10 p-10 border border-dod-lilac/50 min-h-126 bg-black">
        <div className="flex flex-col col-start-1 col-span-6 xl:col-start-1 xl:col-span-2">
          <SectionLabel>Tracklist</SectionLabel>
          {item.tracks?.length > 0 ? (
            <div className="flex-1 flex flex-col justify-between">
              {/* Fixed h-9 rows x 10 = 360px, so exactly 10 tracks show before
                  this needs to scroll - shorter tracklists just end early. */}
              <TracklistScrollArea count={item.tracks.length}>
                {item.tracks.map((track, i) => (
                  <div
                    key={track.position ?? i}
                    className="flex h-9 items-center gap-3 border-b border-dod-lilac/20 text-sm"
                  >
                    <span className="text-dod-lilac tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1 truncate text-dod-white">{track.title}</span>
                    <span className="text-dod-lilac tabular-nums">{trackDuration(track)}</span>
                  </div>
                ))}
              </TracklistScrollArea>
              {totalDurationOf(item.tracks) && (
                <div className="flex items-center justify-between pt-4 text-sm font-semibold uppercase tracking-[0.1em] text-dod-lilac">
                  <span>Total Duration</span>
                  <span className="tabular-nums">{totalDurationOf(item.tracks)}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 py-4 text-sm text-dod-white/50">No tracklist available.</div>
          )}
        </div>

        <div className="flex flex-col col-start-1 col-span-6 xl:col-start-3 xl:col-span-4">
          <SectionLabel>Formats</SectionLabel>
          {formats.length > 0 ? (
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
              {formats.map((format) => {
                const vinylDiscImages = format.formatKey === "vinyl" ? getVinylDiscOverride(format.pkg) : null;
                return (
                <div
                  key={format.key}
                  className={`flex flex-col gap-3 border p-4 ${
                    format.formatKey === "digital" ? "border-dod-neon-mint" : "border-dod-lilac/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-dod-white">
                      {format.label}
                    </span>
                    {format.pressNumber != null && (
                      <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.1em] text-dod-lilac">
                        {pressLabel(format.pressNumber)}
                      </span>
                    )}
                  </div>
                  <div className="relative aspect-square overflow-hidden">
                    {format.formatKey === "digital" ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="aspect-square w-[70%] max-w-[160px] flex items-center justify-center border border-dashed border-dod-neon-mint/50 text-dod-neon-mint">
                          <DownloadIcon size={28} />
                        </div>
                      </div>
                    ) : format.formatKey === "vinyl" ? (
                      <div className="absolute p-2 pb-0 inset-0 flex items-center justify-center">
                        <VinylRecord artwork={item.artwork_url} discImages={vinylDiscImages} />
                      </div>
                    ) : format.formatKey === "cassette" ? (
                      <div className="absolute p-4 pb-0 inset-0 flex items-center justify-center">
                        <CassetteTape artwork={item.artwork_url} />
                      </div>
                    ) : (
                      item.artwork_url && (
                        <img
                          src={item.artwork_url}
                          alt={format.label}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      )
                    )}
                  </div>
                  {format.formatKey !== "digital" && format.pkg.description && (
                    <div className="whitespace-pre-line text-xs text-dod-white/60">
                      {format.formatKey === "vinyl" || format.formatKey === "cassette"
                        ? firstParagraph(format.pkg.description)
                        : format.pkg.description}
                    </div>
                  )}
                </div>
                );
              })}
              {/* Decorative filler for leftover grid columns (only exists at
                  md:grid-cols-4 - hidden below that, where the grid is only
                  2 columns and empty slots would just wrap to a new row). */}
              {Array.from({ length: Math.max(0, 4 - formats.length) }).map((_, i) => (
                <div
                  key={`filler-${i}`}
                  className="hidden lg:flex items-center justify-center border border-dashed border-dod-deep-purple/50 p-4"
                >
                  <StarIcon
                    size={48}
                    gradientFrom={colors.deep_purple}
                    gradientTo={colors.lilac}
                    gradientDirection="vertical"
                    showGlow={false}
                    showBackground={false}
                    opacity={0.5}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-sm text-dod-white/50">No formats available.</div>
          )}
        </div>
      </div>

      {/* ============================================================
          ARTISTS

          Desktop-only layout (mobile falls back to stacked full-width -
          not addressed yet, see conversation history). Release Info used
          to share this grid with Artists, but it's been hoisted up into
          the hero - so an artist-less release just renders nothing here
          now, and Artists is always the lone full-width frame rather
          than sharing a row with anything. Card size/layout depends
          entirely on how many artists actually joined against
          roster-data above:

            1 artist   -> one (large) artist card, full width
            2 artists  -> both (large) side by side
            3 artists  -> all 3 side by side, medium
            4+ artists -> every artist (small) in a plain 4-per-row grid
          ============================================================ */}

      {linkedArtists.length > 0 && (
        <div className={`grid grid-cols-6 gap-4 ${FRAME_CLASS}`}>
          {linkedArtists.length === 1 && (
            <>
              <SectionLabel className="col-start-1 col-span-6">Artists</SectionLabel>
              <ArtistCard artist={linkedArtists[0]} size="large" />
            </>
          )}

          {linkedArtists.length === 2 && (
            <div className={`col-span-6 ${FRAME_CLASS}`}>
              <SectionLabel>Artists</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ArtistCard artist={linkedArtists[0]} size="large" />
                <ArtistCard artist={linkedArtists[1]} size="large" />
              </div>
            </div>
          )}

          {linkedArtists.length === 3 && (
            <div className={`col-span-6 ${FRAME_CLASS}`}>
              <SectionLabel>Artists</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ArtistCard artist={linkedArtists[0]} size="medium" />
                <ArtistCard artist={linkedArtists[1]} size="medium" />
                <ArtistCard artist={linkedArtists[2]} size="medium" />
              </div>
            </div>
          )}

          {linkedArtists.length >= 4 && (
            <div className={`col-span-6 ${FRAME_CLASS}`}>
              <SectionLabel>Artists</SectionLabel>
              <div className="grid grid-cols-4 gap-12">
                {linkedArtists.map((artist) => (
                  <ArtistCard key={artist.name} artist={artist} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CatalogItem;
