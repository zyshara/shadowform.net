import React, { useState, useEffect, useMemo } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { readSeedData } from "@/utils/readSeedData";
import { colors } from "@/tokens";
import WarpedGrid from "@/components/WarpedGrid";
import GridDome from "@/components/GridDome";
import StarIcon from "@/components/StarIcon";

const PRIMARY = colors.accent;

// Small per-card variation around WarpedGrid's defaults (intensity=1,
// density=1) - enough that cards don't all look identical, not enough
// to stop reading as "the same grid".
function randomWarpedGridProps() {
  return {
    intensity: 0.5 + Math.random() * 1.1, // 0.8 - 1.2
    density: 0.1 + Math.random() * 0.4, // 0.85 - 1.15
  };
}

const Roster = () => {
  usePageTitle("Roster");
  const allArtists = (readSeedData("roster-data") ?? []).filter(
    (artist) => artist?.name
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("az");

  const warpedGridPropsByName = useMemo(() => {
    const map = {};

    allArtists.forEach((artist) => {
      map[artist.name] = randomWarpedGridProps();
    });

    return map;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const artists = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let list = query
      ? allArtists.filter((artist) =>
          artist.name.toLowerCase().includes(query)
        )
      : allArtists;

    return list.slice().sort((a, b) =>
      sortOrder === "az"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
  }, [allArtists, searchQuery, sortOrder]);

  const { visibleItems: visibleArtists, sentinelRef } = useInfiniteScroll(artists, 24);

  return (
    <>
      {/* Header */}
      <div className="mb-10 grid grid-cols-1 border-b border-dod-lilac/50 md:grid-cols-2">
        <div className="flex flex-col gap-4 lg:p-16 lg:pl-0">
          <span className="text-[clamp(4.5rem,6.5vw,6rem)] font-semibold italic text-dod-neon-mint">
            ROSTER
          </span>

          <div className="text-xl">
            <span className="font-bold text-dod-lilac">
              {artists.length}
            </span>{" "}
            of {allArtists.length} items
          </div>

          <div className="text-xl text-dod-lilac">
            Artists who have released through our label, the DOMEOFDOOM family
          </div>
        </div>

        <div className="relative overflow-hidden">
          <GridDome
            width={295}
            perspective={1}
            style={{ transform: "scale(1.2)" }}
          />
        </div>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {visibleArtists.map((artist) => (
          <div
            key={artist.name}
            className="
              group
              relative
              z-0
              aspect-square
              overflow-visible
              border
              border-dod-lilac/50
              hover:z-32
              cursor-pointer
            "
          >
            {/*
             * -------------------------------------------------------
             * CARD
             * -------------------------------------------------------
             *
             * This entire layer sits above the rear portion of the
             * orbit ring.
             */}
            <div className="absolute inset-0 overflow-hidden">
              {artist.photo_src ? (
                <img
                  className="absolute inset-0 h-full w-full object-cover grayscale group transition-all group-hover:scale-110 group-hover:grayscale-0 duration-500"
                  src={artist.photo_src}
                  alt={artist.name}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                // No scraped Bandcamp photo (e.g. artists created directly
                // in Strapi from catalog/track credits, not from the
                // Bandcamp artist roster - see conversation history) -
                // same star used as the Formats-grid filler on CatalogItem.
                <div className="absolute inset-0 flex items-center justify-center bg-dod-black">
                  <StarIcon
                    size={96}
                    gradientFrom={colors.deep_purple}
                    gradientTo={colors.deep_purple}
                    glowColor={colors.lilac}
                    showGlow={true}
                    showBackground={false}
                  />
                </div>
              )}

              {/* Bottom fade */}
              <div className="absolute inset-0 bg-[linear-gradient(0deg,_var(--dod-black)_0%,_transparent_40%)]" />

              {/* Color treatment */}
              <div className="absolute inset-0 bg-dod-deep-purple/50 mix-blend-overlay saturate-200 group-hover:opacity-50 transition-all duration-500" />

              <WarpedGrid
                {...warpedGridPropsByName[artist.name]}
                className="absolute w-full h-full scale-120"
              />

              {/* Artist name */}
              <span className="absolute bottom-0 p-3 font-ppneue font-semibold uppercase text-dod-neon-mint">
                {artist.name}
              </span>
            </div>

          </div>
        ))}
      </div>
      <div ref={sentinelRef} className="mb-10" />
    </>
  );
};

export default Roster;
