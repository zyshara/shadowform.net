import React, { useState, useEffect, useMemo } from "react";
import { readSeedData } from "@/utils/readSeedData";
import { colors } from "@/tokens";
import OrbitFrame from "@/components/OrbitFrame";
import WarpedGrid from "@/components/WarpedGrid";
import GridDome from "@/components/GridDome";

const PRIMARY = colors.accent;

// OrbitFrame is purely presentational.
// All randomized values are generated here once per artist.
//
// Corners come in diagonal PAIRS, not picked independently - a card
// gets two OrbitFrames, either (top-left + bottom-right) or
// (top-right + bottom-left), never e.g. two corners on the same side.
const CORNER_PAIRS = [
  ["top-left", "bottom-right"],
  ["top-right", "bottom-left"],
];

const ORBIT_COLOR_PAIRS = [
  {
    ring: colors.white,
    starFrom: colors.lilac,
    starTo: colors.deep_purple,
    glow: colors.lilac,
  },
  {
    ring: colors.neon_mint,
    starFrom: colors.lilac,
    starTo: colors.lilac,
    glow: colors.white,
  },
  {
    ring: colors.lilac,
    starFrom: colors.lilac,
    starTo: colors.neon_mint,
    glow: colors.neon_mint,
  },
];

const STAR_SIZES = [12, 16, 18];

// 1-3 stars per ring, each an independently random size. OrbitFrame
// staggers their starting points around the ring itself (evenly, by
// count) - all this needs to hand it is how many and how big.
function randomStars() {
  const count = 1 + Math.floor(Math.random() * 3);
  return Array.from(
    { length: count },
    () => STAR_SIZES[Math.floor(Math.random() * STAR_SIZES.length)]
  );
}

// Small per-card variation around WarpedGrid's defaults (intensity=1,
// density=1) - enough that cards don't all look identical, not enough
// to stop reading as "the same grid".
function randomWarpedGridProps() {
  return {
    intensity: 0.5 + Math.random() * 1.1, // 0.8 - 1.2
    density: 0.1 + Math.random() * 0.4, // 0.85 - 1.15
  };
}

// Returns an array of two OrbitFrame prop objects - one per corner in
// the chosen diagonal pair. Both corners on a card share the same
// color pair (keeps each card looking like one coherent effect), but
// each corner's star count/sizes are rolled independently.
function randomOrbitPairProps() {
  const corners =
    CORNER_PAIRS[Math.floor(Math.random() * CORNER_PAIRS.length)];

  const {
    ring,
    starFrom,
    starTo,
    glow,
  } =
    ORBIT_COLOR_PAIRS[
      Math.floor(Math.random() * ORBIT_COLOR_PAIRS.length)
    ];

  return corners.map((corner) => ({
    corner,
    ringColor: ring,
    starGradientFrom: starFrom,
    starGradientTo: starTo,
    glowColor: glow,
    stars: randomStars(),
  }));
}

const Roster = () => {
  const allArtists = (readSeedData("roster-data") ?? []).filter(
    (artist) => artist?.name
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("az");

  /*
   * Generate orbit values exactly once.
   *
   * OrbitFrame never generates randomness itself.
   * Each artist therefore gets a consistent orbit configuration
   * for the lifetime of this Roster component.
   */
  const orbitPropsByName = useMemo(() => {
    const map = {};

    allArtists.forEach((artist) => {
      map[artist.name] = randomOrbitPairProps();
    });

    return map;

    // allArtists is intentionally omitted.
    // readSeedData is static for the lifetime of this page and we
    // specifically want these values generated only once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="mb-10 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {artists.map((artist) => (
          <div
            key={artist.name}
            className="
              group
              relative
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
              <img
                className="absolute inset-0 h-full w-full object-cover grayscale group transition-all group-hover:scale-110 group-hover:grayscale-0 duration-500"
                src={artist.photo_src}
                alt={artist.name}
              />

              {/* Bottom fade */}
              <div className="absolute inset-0 bg-[linear-gradient(0deg,_var(--dod-black)_0%,_transparent_40%)]" />

              {/* Color treatment */}
              <div className="absolute inset-0 bg-dod-deep-purple/50 mix-blend-overlay saturate-200 group-hover:opacity-50 transitio-all duration-500" />

              <WarpedGrid
                {...warpedGridPropsByName[artist.name]}
                className="absolute w-full h-full scale-120"
              />

              {/* Artist name */}
              <span className="absolute bottom-0 p-3 font-ppneue font-semibold uppercase text-dod-neon-mint">
                {artist.name}
              </span>
            </div>

            {/*
             * -------------------------------------------------------
             * ORBIT
             * -------------------------------------------------------
             *
             * Two OrbitFrames per card, one per corner of the diagonal
             * pair from randomOrbitPairProps() (e.g. top-left AND
             * bottom-right together, never independently chosen).
             *
             * Each OrbitFrame contains two separate visual layers:
             *
             *   rear ring  → behind this card
             *   star/front → above this card
             *
             * Testing at opacity-100 first (per request) - once confirmed,
             * swap back to:
             *   opacity-0 transition-opacity duration-300 group-hover:opacity-100
             *
             * Deliberately NOT setting z-index here (see OrbitFrame's own
             * "do not give this element a z-index" comment) - doing so
             * creates a new stacking context on the root, which hoists the
             * whole back+front ring pair above the card as one unit and
             * breaks the behind/in-front illusion entirely.
             */}
            {orbitPropsByName[artist.name].map((orbitProps) => (
              <OrbitFrame
                key={orbitProps.corner}
                {...orbitProps}
                className={`transition-all duration-500 opacity-0 group-hover:opacity-100 ${orbitProps.corner.includes("top") ? "mt-[-100px] group-hover:mt-0" : "mt-[100px] group-hover:mt-0"}`}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default Roster;
