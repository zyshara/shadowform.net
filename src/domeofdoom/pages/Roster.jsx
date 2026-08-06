import React, { useState, useEffect } from "react";
import { readSeedData } from "@/utils/readSeedData";
import { colors } from "@/tokens";
import SubpageHeader from "@/components/SubpageHeader";
import RosterCarousel, { initialsOf } from "@/components/RosterCarousel";
import CascadeImage from "@/components/CascadeImage";

const PRIMARY = colors.accent;

const VIEW_STORAGE_KEY = "domeofdoom:roster:view";

// Same overlaid-chevron treatment as Discography's filter selects.
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
      gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
      gap: 14,
    }}
  >
    {artists.map((artist, i) => (
      <div
        key={i}
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
      </div>
    ))}
  </div>
);

const Roster = () => {
  const artists = (readSeedData("roster-data") ?? []).filter((a) => a?.name);
  const isBelowMd = useIsBelowMd();
  const [view, setView] = useState(getStoredView);

  const handleToggleView = () => {
    const next = view === "grid" ? "carousel" : "grid";
    setView(next);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // localStorage unavailable — view just won't persist across reloads
    }
  };

  const effectiveGrid = isBelowMd || view === "grid";

  return (
    <div>
      <div className="mx-auto max-w-[1400px] px-10 pt-10 lg:pt-[70px]">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex flex-col gap-[8px] w-full sm:max-w-[50%]">
            <SubpageHeader heading="Roster">
              <div className="flex w-full flex-col gap-4 items-start justify-start">
                <div className="flex flex-row w-full">
                  <span className="disco-filter-count">
                    <b>{artists.length}</b> artists
                  </span>
                </div>
                {/* Placeholders for the search/filter UI to come — not wired up yet. */}
                <div className="flex flex-row gap-4 w-full">
                  <span className="w-full" style={{ position: "relative", display: "inline-flex" }}>
                    <select className="disco-filter-select w-full" defaultValue="az">
                      <option value="az">a–z</option>
                      <option value="newest">newest</option>
                    </select>
                    <FilterChevron />
                  </span>
                  <span className="w-full" style={{ position: "relative", display: "inline-flex" }}>
                    <select className="disco-filter-select w-full" defaultValue="all">
                      <option value="all">all genres</option>
                    </select>
                    <FilterChevron />
                  </span>
                </div>
              </div>
            </SubpageHeader>
          </div>
          {!isBelowMd && (
            <button
              onClick={handleToggleView}
              title={view === "grid" ? "Switch to carousel view" : "Switch to grid view"}
              style={{
                width: 38,
                height: 38,
                background: "none",
                border: "1px solid rgba(255,255,255,.25)",
                color: "rgba(255,255,255,.7)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {view === "grid" ? <CarouselIcon /> : <GridIcon />}
            </button>
          )}
        </div>
      </div>

      {effectiveGrid ? (
        <div className="mx-auto max-w-[1400px] px-10 pb-10 lg:pb-[70px]">
          <RosterGridView artists={artists} />
        </div>
      ) : (
        <RosterCarousel artists={artists} />
      )}
    </div>
  );
};

export default Roster;
