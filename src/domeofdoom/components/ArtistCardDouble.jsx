import React from "react";
import { Link } from "react-router-dom";
import { artistSlug } from "@/utils/artistSlug";
import { colors } from "@/tokens";
import StarIcon from "@/components/StarIcon";
import Button from "@/components/Button";
import SpotifyIcon from "@/components/SpotifyIcon";
import BandcampIcon from "@/components/BandcampIcon";
import LocationPinIcon from "@/components/LocationPinIcon";
import SectionDots from "@/components/SectionDots";

const SectionLabel = () => (
  <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-dod-neon-mint">
    <SectionDots />
    Artists
  </div>
);

const Photo = ({ artist, className }) =>
  artist.photo_src ? (
    <img src={artist.photo_src} alt={artist.name} className={className} />
  ) : (
    <div className={`flex items-center justify-center bg-dod-black ${className}`}>
      <StarIcon
        size={48}
        gradientFrom={colors.deep_purple}
        gradientTo={colors.deep_purple}
        glowColor={colors.lilac}
        showGlow={true}
        showBackground={false}
      />
    </div>
  );

const SocialButtons = ({ spotifyUrl, bandcampUrl, className = "flex flex-col gap-2" }) => (
  <div className={className}>
    {spotifyUrl ? (
      <Button type="thin" variant="primary" href={spotifyUrl}>
        <span className="inline-flex items-center gap-[6px] leading-none">
          <SpotifyIcon size={14} />
          Spotify
        </span>
      </Button>
    ) : (
      <Button variant="disabled" type="thin">
        <span className="inline-flex items-center gap-[6px] leading-none">
          <SpotifyIcon size={14} />
          Spotify
        </span>
      </Button>
    )}
    {bandcampUrl && (
      <Button type="thin" variant="secondary" href={bandcampUrl}>
        <span className="inline-flex items-center gap-[6px] leading-none">
          <BandcampIcon size={14} />
          Bandcamp
        </span>
      </Button>
    )}
  </div>
);

const ArtistCardDouble = ({ artists }) => {
  const [a, b] = artists;
  const toA = `/roster/${artistSlug(a.name)}`;
  const toB = `/roster/${artistSlug(b.name)}`;

  return (
    <>
      {/* Mobile — centered stacked cards */}
      <div className="flex flex-col border border-dod-lilac/50 bg-black lg:hidden">
        <div className="px-8 pt-6">
          <SectionLabel />
        </div>
        <div className="divide-y divide-dod-lilac/20">
          {[{ artist: a, to: toA }, { artist: b, to: toB }].map(({ artist, to }) => (
            <div key={artist.name} className="flex flex-col items-center gap-4 p-8 text-center">
              <Photo
                artist={artist}
                className="aspect-square w-[140px] flex-shrink-0 rounded-full border-2 border-dod-deep-purple/80 object-cover"
              />
              <Link
                to={to}
                className="text-2xl font-semibold text-dod-neon-mint underline transition-colors hover:text-dod-deep-purple"
              >
                {artist.name}
              </Link>
              {artist.location && (
                <div className="flex items-center gap-1.5 text-sm text-dod-lilac">
                  <LocationPinIcon size={13} />
                  {artist.location}
                </div>
              )}
              <div className="flex w-full flex-col gap-3">
                <SocialButtons spotifyUrl={artist.spotify_url} bandcampUrl={artist.url} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop — side by side with star divider */}
      <div className="relative hidden flex-col border border-dod-lilac/50 bg-black lg:flex">
        {/* Star divider spans the full card height */}
        <div className="absolute bottom-10 left-1/2 top-10 flex -translate-x-1/2 flex-col items-center">
          <div className="w-px flex-1 bg-dod-lilac/20" />
          <StarIcon
            size={36}
            gradientFrom={colors.deep_purple}
            gradientTo={colors.neon_mint}
            showGlow={true}
            showBackground={false}
          />
          <div className="w-px flex-1 bg-dod-lilac/20" />
        </div>

        <div className="px-8 pt-6">
          <SectionLabel />
        </div>
        <div className="grid grid-cols-2">
          {/* Artist A */}
          <div className="flex items-center gap-5 px-8 py-8 pr-12">
            <Photo
              artist={a}
              className="aspect-square w-[88px] flex-shrink-0 rounded-full border-2 border-dod-deep-purple/80 object-cover"
            />
            <div className="flex min-w-0 flex-col gap-2">
              <Link
                to={toA}
                className="truncate text-2xl font-semibold text-dod-neon-mint underline transition-colors hover:text-dod-deep-purple"
              >
                {a.name}
              </Link>
              <div className={`flex items-center gap-1.5 text-base text-dod-lilac ${!a.location ? "invisible" : ""}`}>
                <LocationPinIcon size={14} />
                {a.location || "placeholder"}
              </div>
              <SocialButtons
                spotifyUrl={a.spotify_url}
                bandcampUrl={a.url}
                className="flex flex-row gap-4"
              />
            </div>
          </div>

          {/* Artist B */}
          <div className="flex items-center gap-5 px-8 py-8 pl-12">
            <Photo
              artist={b}
              className="aspect-square w-[88px] flex-shrink-0 rounded-full border-2 border-dod-deep-purple/80 object-cover"
            />
            <div className="flex min-w-0 flex-col gap-2">
              <Link
                to={toB}
                className="truncate text-2xl font-semibold text-dod-neon-mint underline transition-colors hover:text-dod-deep-purple"
              >
                {b.name}
              </Link>
              <div className={`flex items-center gap-1.5 text-base text-dod-lilac ${!b.location ? "invisible" : ""}`}>
                <LocationPinIcon size={14} />
                {b.location || "placeholder"}
              </div>
              <SocialButtons
                spotifyUrl={b.spotify_url}
                bandcampUrl={b.url}
                className="flex flex-row gap-4"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArtistCardDouble;
