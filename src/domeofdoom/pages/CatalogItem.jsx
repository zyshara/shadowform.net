// src/domeofdoom/pages/CatalogItem.jsx
//
// Individual catalog item page. Route is /catalog/:catalogParam - the param
// is either a human-assigned catalog_number (e.g. DOD_088) or a title-slug
// +uid fallback for items without one yet, see utils/catalogItemSlug.js for
// the shared resolution logic used by both this page and the Catalog grid's
// card links.
import React from "react";
import { useParams } from "react-router-dom";
import { readSeedData } from "@/utils/readSeedData";
import { findByCatalogParam } from "@/utils/catalogItemSlug";
import SubpageHeader from "@/components/SubpageHeader";
import TiltedCover from "@/components/TiltedCover";
import Button from "@/components/Button";
import SpotifyIcon from "@/components/SpotifyIcon";
import BandcampIcon from "@/components/BandcampIcon";
import DownloadIcon from "@/components/DownloadIcon";
import VinylRecord from "@/components/VinylRecord";

function yearOf(item) {
  const t = new Date(item.release_date).getTime();
  return isNaN(t) ? null : new Date(item.release_date).getUTCFullYear();
}

// Placeholder data for the tracklist/formats section - real data (actual
// track durations, real format pricing/inventory from Strapi) comes later,
// this is just to get the grid/layout/styling right first.
const MOCK_TRACKLIST = [
  { title: "Alpha Dog", duration: "3:21" },
  { title: "Hunt Mode", duration: "4:07" },
  { title: "Pack Mentality", duration: "3:55" },
  { title: "Obedience", duration: "4:38" },
  { title: "No Leash", duration: "4:12" },
  { title: "Bloodlines", duration: "3:41" },
  { title: "Gatekeeper", duration: "4:27" },
  { title: "Lone Wolf", duration: "3:33" },
  { title: "Primal Code", duration: "4:46" },
  { title: "Den", duration: "5:02" },
];
const TOTAL_DURATION = "41:42";

const MOCK_FORMATS = [
  {
    key: "digital",
    label: "Digital",
    description: ["Digital Download", "High-quality 320kbps", "MP3 + WAV"],
    price: "$7.00 USD",
    cta: "Buy Digital",
    highlighted: true,
  },
  {
    key: "vinyl",
    label: "Vinyl",
    description: ['12" Black Vinyl', "Limited Pressing"],
    price: "$22.00 USD",
    cta: "Add to Cart",
  },
  {
    key: "cassette",
    label: "Cassette",
    description: ["Cassette Tape", "Limited Edition"],
    price: "$12.00 USD",
    cta: "Add to Cart",
  },
  {
    key: "cd",
    label: "CD",
    description: ["Jewel Case CD"],
    price: "$14.00 USD",
    cta: "Add to Cart",
  },
];

// The small 2x2 dot mark next to "Tracklist"/"Formats" section labels.
const SectionDots = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" className="flex-shrink-0">
    <circle cx="3" cy="3" r="3" fill="var(--dod-lilac)" />
    <circle cx="11" cy="3" r="3" fill="var(--dod-lilac)" />
    <circle cx="3" cy="11" r="3" fill="var(--dod-lilac)" />
    <circle cx="11" cy="11" r="3" fill="var(--dod-lilac)" />
  </svg>
);

const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-2 mb-6 text-sm font-semibold uppercase tracking-[0.15em] text-dod-neon-mint">
    <SectionDots />
    {children}
  </div>
);

const CatalogItem = () => {
  const { catalogParam } = useParams();

  const allItems = readSeedData("catalog-items-data") ?? [];
  const item = findByCatalogParam(allItems, catalogParam);

  if (!item) {
    return (
      <div className="mx-auto max-w-[1400px] px-10 py-10 lg:py-[70px]">
        <SubpageHeader heading="Release Not Found" />
      </div>
    );
  }

  const artistLabel = item.artists.length > 0 ? item.artists.join(", ") : "DOMEOFDOOM";

    console.log(item);

  return (
    <div className="font-ppneue py-10">
      <div className="grid grid-cols-6 items-center justify-center w-full h-full">
        <div className="flex flex-col gap-4 pr-2 col-start-1 col-span-3">
          <div className="text-[clamp(20px,3vw,8rem)] leading-[1.05] italic font-semibold uppercase text-dod-neon-mint">
            {item.title}
          </div>
          <div className="text-xl text-dod-deep-purple font-medium">{artistLabel}</div>
          <div className="uppercase text-sm font-medium tracking-[0.15em] text-dod-white">
            {item.type} {yearOf(item) ? `· ${yearOf(item)}` : ""}
          </div>
          <div className="flex flex-col gap-3 lg:flex-row">
            {item.spotify_url ? (
              <Button type="thin" variant="primary" href={item.spotify_url} style={{ width: "100%" }}>
                <span className="inline-flex items-center gap-[6px]">
                  <SpotifyIcon size={14} />
                  Spotify
                </span>
              </Button>
            ) : (
              <Button variant="disabled" type="thin" style={{ width: "100%" }}>
                <span className="inline-flex items-center gap-[6px]">
                  <SpotifyIcon size={14} />
                  Not Available
                </span>
              </Button>
            )}
            {item.bandcamp_url && (
              <Button type="thin" variant="secondary" href={item.bandcamp_url} style={{ width: "100%" }}>
                <span className="inline-flex items-center gap-[6px]">
                  <BandcampIcon size={14} />
                  Bandcamp
                </span>
              </Button>
            )}
          </div>
        </div>
        <div className="col-start-4 col-span-3 p-30 pt-0">
          <TiltedCover
            artworkUrl={item.artwork_url}
            title={item.title}
            artistLabel={artistLabel}
            catalogNumber={item.catalog_number}
          />
        </div>
      </div>

      <div className="grid grid-cols-6 gap-10 p-10 border border-dod-lilac/50 min-h-126">
        <div className="col-start-1 col-span-2">
          <SectionLabel>Tracklist</SectionLabel>
          <div>
            {MOCK_TRACKLIST.map((track, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2 border-b border-dod-lilac/20 text-sm"
              >
                <span className="text-dod-lilac tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 text-dod-white">{track.title}</span>
                <span className="text-dod-lilac tabular-nums">{track.duration}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-4 text-sm font-semibold uppercase tracking-[0.1em] text-dod-lilac">
              <span>Total Duration</span>
              <span className="tabular-nums">{TOTAL_DURATION}</span>
            </div>
          </div>
        </div>

        <div className="col-start-3 col-span-4">
          <SectionLabel>Formats</SectionLabel>
          <div className="grid grid-cols-4 gap-4">
            {MOCK_FORMATS.map((format) => (
              <div
                key={format.key}
                className={`flex flex-col gap-3 border p-4 ${
                  format.highlighted ? "border-dod-neon-mint" : "border-dod-lilac/30"
                }`}
              >
                <div className="text-xs font-semibold uppercase tracking-[0.1em] text-dod-white">
                  {format.label}
                </div>
                <div className="relative aspect-square overflow-hidden">
                  {format.key === "digital" ? (
                    <div className="absolute inset-2 flex items-center justify-center border border-dashed border-dod-neon-mint/50 text-dod-neon-mint">
                      <DownloadIcon size={28} />
                    </div>
                  ) : format.key === "vinyl" ? (
                    <div className="format-vinyl-tilt absolute inset-0 flex items-center justify-center">
                      <VinylRecord artworkUrl={item.artwork_url} title={item.title} className="w-[85%]" />
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
                <div className="flex flex-col gap-0.5 text-xs text-dod-white/60">
                  {format.description.map((line, i) => (
                    <span key={i}>{line}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogItem;
