// src/domeofdoom/components/ArtistCardSingle.jsx
//
// Featured single-artist card for CatalogItem's Artists section (only used
// when a release has exactly one linked artist) - a bigger, bio-forward
// treatment than the plain ArtistCard grid used for 2+/multi-artist
// releases. Two totally different layouts (stacked/centered on mobile,
// photo-left/stats-right on desktop), not just a responsive reflow of the
// same markup, per the reference mockups.
//
// `artist` is a roster-data entry (see server/models/artist.js's
// normalizeArtist) - only name/location/photo_src/url (Bandcamp) are real.
// bio text and releases/merch counts don't exist in the data model yet and
// are hardcoded placeholders below (clearly marked). spotify_url is real —
// sourced from derived.spotify_url via normalizeArtist.
import React from "react";
import { Link } from "react-router-dom";
import { artistSlug } from "@/utils/artistSlug";
import { colors } from "@/tokens";
import StarIcon from "@/components/StarIcon";
import SectionDots from "@/components/SectionDots";
import BrutalistButton from "@/components/BrutalistButton";
import SpotifyIcon from "@/components/SpotifyIcon";
import BandcampIcon from "@/components/BandcampIcon";
import ArrowUpRightIcon from "@/components/ArrowUpRightIcon";
import LocationPinIcon from "@/components/LocationPinIcon";
import ArrowRightIcon from "@/components/ArrowRightIcon";
import MusicNoteIcon from "@/components/MusicNoteIcon";
import ShirtIcon from "@/components/ShirtIcon";

// PLACEHOLDER - no bio field on DomeOfDoomArtist yet (derived or
// overrides). Swap for artist.bio once that exists.
const PLACEHOLDER_BIO = (name) =>
  `${name} is a multidisciplinary artist exploring sound, texture, and ritual through immersive electronic music.`;

// PLACEHOLDER - no releases/shows/merch counts (or the pages to link them
// to) exist yet. Values + hrefs are fake until that data/those routes do.
const PLACEHOLDER_STATS = [
  { icon: MusicNoteIcon, label: "Releases", value: 12 },
  { icon: ShirtIcon, label: "Merch", value: 6 },
];

const ArtistBadge = ({ className }) => (
  <div className={`flex items-center gap-2 place-self-start text-sm font-semibold uppercase tracking-[0.15em] text-dod-neon-mint lg:border lg:border-dod-deep-purple lg:bg-dod-black lg:px-2 lg:py-1 ${className}`}>
    <SectionDots />
    Artist
  </div>
);

const Photo = ({ artist, className }) =>
  artist.photo_src ? (
    <img src={artist.photo_src} alt={artist.name} className={className} />
  ) : (
    <div className={`flex items-center justify-center bg-dod-black ${className}`}>
      <StarIcon
        size={64}
        gradientFrom={colors.deep_purple}
        gradientTo={colors.deep_purple}
        glowColor={colors.lilac}
        showGlow={true}
        showBackground={false}
      />
    </div>
  );

const SocialButtons = ({ spotifyUrl, bandcampUrl }) => (
  <>
    {spotifyUrl && (
      <BrutalistButton
        text="Spotify"
        textIcon={<ArrowUpRightIcon size={12} />}
        filigreeIcon={<SpotifyIcon size={16} />}
        size="sm"
        thickness="thin"
        color="neon-green"
        href={spotifyUrl}
        style={{ width: "100%" }}
      />
    )}
    {bandcampUrl && (
      <BrutalistButton
        text="Bandcamp"
        textIcon={<ArrowUpRightIcon size={12} />}
        filigreeIcon={<BandcampIcon size={16} />}
        size="sm"
        thickness="thin"
        color="lilac"
        href={bandcampUrl}
        style={{ width: "100%" }}
      />
    )}
  </>
);

const ArtistCardSingle = ({ artist }) => {
  const to = `/roster/${artistSlug(artist.name)}`;
  const spotifyUrl = artist.spotify_url ?? null;
  const bio = PLACEHOLDER_BIO(artist.name);

  return (
    <>
      {/* Mobile - stacked, centered. */}
      <div className="flex flex-col items-center gap-4 border border-dod-lilac/50 bg-black p-8 text-center lg:hidden">
        <ArtistBadge />
        <Photo
          artist={artist}
          className="aspect-square w-full max-w-[180px] rounded-full border-2 border-dod-deep-purple/80 object-cover"
        />
        <Link to={to} className="text-4xl font-semibold text-dod-neon-mint hover:underline transition-all font-archivo font-stretch-[expanded]">
          {artist.name}
        </Link>
        {artist.location && (
          <div className="flex items-center gap-1.5 text-sm text-dod-lilac">
            <LocationPinIcon size={16} />
            {artist.location}
          </div>
        )}
        <p className="text-sm text-dod-white/60">{bio}</p>
        <div className="flex w-full flex-col gap-3 md:flex-row md:justify-center">
          <SocialButtons spotifyUrl={spotifyUrl} bandcampUrl={artist.url} />
        </div>
      </div>

      {/* Desktop - photo left, bio middle, stats right. */}
      <div className="relative hidden grid-cols-6 border border-dod-lilac/50 bg-black lg:grid">
        <ArtistBadge className="absolute left-4 top-4 z-10" />
        {/* h-full so the photo always spans the full panel height (its
            width follows from the column's own width, not the other way
            around) - a fixed 380px column against this panel's usual
            ~290-300px height reads as roughly 4:3. A CSS aspect-ratio here
            instead would need the row height resolved first to compute a
            width for an `auto` column, which the browser can't do (it's a
            circular dependency) and silently collapses the image instead -
            confirmed by testing that exact approach before landing here. */}
        <Photo artist={artist} className="col-span-2 h-full w-full object-cover" />
        <div className="col-span-3 flex flex-col justify-center gap-3 p-10">
          <Link to={to} className="text-4xl font-semibold text-dod-neon-mint hover:underline transition-all font-archivo font-stretch-[expanded]">
            {artist.name}
          </Link>
          {artist.location && (
            <div className="flex items-center gap-1.5 text-sm text-dod-lilac">
              <LocationPinIcon size={16} />
              {artist.location}
            </div>
          )}
          <p className="max-w-[46ch] text-sm text-dod-white/60">{bio}</p>
          <div className="mt-2 flex gap-3">
            <SocialButtons spotifyUrl={spotifyUrl} bandcampUrl={artist.url} />
          </div>
        </div>
        <div className="relative col-span-1 flex flex-col justify-center gap-6 p-8">
          <div className="absolute bottom-6 left-0 top-6 w-px bg-dod-lilac/20" />
          {PLACEHOLDER_STATS.map(({ icon: Icon, label, value }, i) => (
            <div
              key={label}
              className={`flex flex-col text-dod-lilac ${i > 0 ? "border-t border-dod-lilac/20 pt-3" : ""}`}
            >
              <div className="grid grid-cols-[auto_1fr] items-start gap-x-2">
                <Icon size={20} className="mt-0.5 hidden xl:block" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.1em]">{label}</span>
                  <span className="text-2xl font-semibold text-dod-neon-mint">{value}</span>
                </div>
              </div>
            </div>
          ))}
          <Link
            to={to}
            className="flex w-full items-center justify-between gap-1 border-t border-dod-lilac/20 pt-3 text-xs text-dod-lilac hover:text-dod-neon-mint"
          >
            View Artist
            <ArrowRightIcon size={12} />
          </Link>
        </div>
      </div>
    </>
  );
};

export default ArtistCardSingle;
