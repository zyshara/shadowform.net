import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { readSeedData } from "@/utils/readSeedData";
import { colors } from "@/tokens";
import SubpageHeader from "@/components/SubpageHeader";
import RosterCarousel from "@/components/RosterCarousel";
import { initialsOf } from "@/components/ArtistPhoto";
import CascadeImage from "@/components/CascadeImage";
import { artistSlug } from "@/utils/artistSlug";

const PRIMARY = colors.accent;

const VIEW_STORAGE_KEY = "domeofdoom:roster:view";

const FilterChevron = () => (
  <svg
    viewBox="0 0 10 10"
    width="8"
    height="8"
    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
  >
    <polyline points="2,3 5,7 8,3" fill="none" style={{ stroke: PRIMARY }} strokeWidth="2.5" />
  </svg>
);

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.4" />
    <rect x="10.5" y="1" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.4" />
    <rect x="1" y="10.5" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.4" />
    <rect x="10.5" y="10.5" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const CarouselIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="3" width="16" height="12" stroke="currentColor" strokeWidth="1.4" />
    <line x1="6.5" y1="3" x2="6.5" y2="15" stroke="currentColor" strokeWidth="1.4" />
    <line x1="11.5" y1="3" x2="11.5" y2="15" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

function getStoredView() {
  try {
    const v = localStorage.getItem(VIEW_STORAGE_KEY);
    return v === "grid" || v === "carousel" ? v : "carousel";
  } catch {
    return "carousel";
  }
}

// Matches Tailwind's `md` breakpoint (768px) — below this, roster always
// renders as a grid regardless of the stored view preference, same as
// Discography.
function useIsBelowMd() {
  const [isBelowMd, setIsBelowMd] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767.98px)");
    const handler = (e) => setIsBelowMd(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isBelowMd;
}

const RosterGridView = ({ artists }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: 14,
    }}
  >
    {artists.map((artist, i) => (
      <Link
        key={i}
        to={`/roster/${artistSlug(artist.name)}`}
        className="disco-grid-tile"
        style={{ display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid rgba(255,255,255,.12)" }}
      >
        <div style={{ position: "relative", aspectRatio: "1", overflow: "hidden", background: colors.card }}>
          {artist.photo_src ? (
            <CascadeImage
              src={artist.photo_src}
              alt={artist.name}
              index={i}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span
                style={{
                  fontFamily: "Archivo, sans-serif",
                  fontStretch: "expanded",
                  fontVariationSettings: '"wdth" 125',
                  fontWeight: 800,
                  fontSize: 40,
                  color: "rgba(255,255,255,0.12)",
                  letterSpacing: "-1px",
                }}
              >
                {initialsOf(artist.name)}
              </span>
            </div>
          )}
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
            {artist.name}
          </span>
        </div>
      </Link>
    ))}
  </div>
);

const Roster = () => {
  const allArtists = (readSeedData("roster-data") ?? []).filter((a) => a?.name);
  const isBelowMd = useIsBelowMd();
  const [view, setView] = useState(getStoredView);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("az");

  const handleToggleView = () => {
    const next = view === "grid" ? "carousel" : "grid";
    setView(next);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // localStorage unavailable — view just won't persist across reloads
    }
  };

  const artists = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = q
      ? allArtists.filter((a) => a.name.toLowerCase().includes(q))
      : allArtists;
    list = list.slice().sort((a, b) =>
      sortOrder === "az"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
    return list;
  }, [allArtists, searchQuery, sortOrder]);

  const effectiveGrid = isBelowMd || view === "grid";

   console.log(artists);

  return (
    <>
      <div className="border-b border-dod-lilac/50 mb-10 grid grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col gap-4 p-16 pl-0">
          <span className="text-[clamp(4.5rem,6.5vw,6rem)] text-dod-neon-mint italic font-semibold">ROSTER</span>
          <div className="text-xl">
            <span className="text-dod-lilac font-bold">{artists.length}</span> of {allArtists.length} items 
          </div>
          <div className="text-xl text-dod-lilac">
            Artists who have released through our label, the DOMEOFDOOM family
          </div>
        </div>
        <div className="relative overflow-hidden">
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src=""
          />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-6">
        {allArtists.map((artist) => (
           <div className="aspect-square relative border-dod-lilac/50 border">
             <div className="w-full h-full relative z-3">
               <span className="font-ppneue text-dod-neon-mint font-semibold uppercase bottom-0 absolute p-3">{artist.name}</span>
             </div>
             <div className="w-full h-full absolute z-2 bg-dod-deep-purple/20 top-0 bg-[linear-gradient(0deg,_var(--dod-black)_0%,_transparent_40%)]"></div>
             <div className="w-full h-full absolute z-2 bg-dod-deep-purple/50 top-0 mix-blend-overlay saturate-200"></div>
             <img className="object-cover absolute w-full h-full top-0 grayscale-100" src={artist.photo_src}/>
           </div>
        ))}
      </div>
    </>
  );
};

export default Roster;
