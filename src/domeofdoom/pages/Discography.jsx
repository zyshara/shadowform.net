import React, { useState, useMemo } from "react";
import { readSeedData } from "@/utils/readSeedData";
import { colors } from "@/tokens";

const PRIMARY = colors.accent;
const SECONDARY = colors.secondary;

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.4" />
    <rect x="10.5" y="1" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.4" />
    <rect x="1" y="10.5" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.4" />
    <rect x="10.5" y="10.5" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="2" width="16" height="3" stroke="currentColor" strokeWidth="1.4" />
    <rect x="1" y="7.5" width="16" height="3" stroke="currentColor" strokeWidth="1.4" />
    <rect x="1" y="13" width="16" height="3" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

function tagColor(type) {
  if (type === "Compilation") return SECONDARY;
  if (type === "Remix") return PRIMARY;
  if (type === "Album") return "rgba(255,255,255,.85)";
  return "rgba(255,255,255,.5)";
}

function artistDisplay(artist) {
  if (!artist || artist === "DOMEOFDOOM") return "DOME OF DOOM";
  return `${artist.toUpperCase()}`;
}

const CoverPlaceholder = () => (
  <div
    style={{
      width: "100%",
      height: "100%",
      background:
        "repeating-linear-gradient(20deg, oklch(0.24 0.006 60) 0px, oklch(0.24 0.006 60) 9px, oklch(0.2 0.006 60) 9px, oklch(0.2 0.006 60) 18px)",
    }}
  />
);

const selectStyle = {
  color: PRIMARY,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  cursor: "pointer",
  outline: "none",
};

const Discography = () => {
  const allReleases = readSeedData("discography-data") ?? [];
  const [view, setView] = useState("list");
  const [activeIndex, setActiveIndex] = useState(0);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [hovering, setHovering] = useState(false);
  const [sortOrder, setSortOrder] = useState("latest");
  const [artistFilter, setArtistFilter] = useState("all");

  const artistOptions = useMemo(
    () =>
      Array.from(
        new Set(
          allReleases
            .map((r) => r.artist)
            .filter(Boolean)
            .filter((a) => a !== "DOMEOFDOOM")
        )
      ),
    [allReleases]
  );

  const releases = useMemo(() => {
    let list =
      artistFilter === "all"
        ? allReleases
        : allReleases.filter((r) => r.artist === artistFilter);
    if (sortOrder === "earliest") list = list.slice().reverse();
    return list;
  }, [allReleases, artistFilter, sortOrder]);

  const active = releases.length
    ? releases[Math.min(activeIndex, releases.length - 1)]
    : null;

  const handlePreviewMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: py * -22, ry: px * 22 });
    setHovering(true);
  };

  const handlePreviewLeave = () => {
    setTilt({ rx: 0, ry: 0 });
    setHovering(false);
  };

  const sheenX = 50 + tilt.ry * 1.6;
  const sheenY = 50 - tilt.rx * 1.6;
  const tiltTransition = hovering
    ? "transform 80ms ease-out"
    : "transform 500ms cubic-bezier(.2,.8,.2,1)";

  return (
    <div
      className="mx-auto max-w-[1400px] px-10 py-[70px]"
      style={{
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div
            className="m-0 font-[Arial,sans-serif] text-[48px] font-black uppercase leading-none tracking-tight"
          >
            Discography
          </div>
          <div className="flex flex-row mt-2 gap-4 text-[13px] font-bold uppercase tracking-[0.08em] text-white/40" >
            <span>{releases.length} releases</span>
            <span>·</span>
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setActiveIndex(0);
              }}
              style={selectStyle}
            >
              <option value="latest" style={{ background: "#1a1917", color: "#eee" }}>
                latest first
              </option>
              <option value="earliest" style={{ background: "#1a1917", color: "#eee" }}>
                earliest first
              </option>
            </select>
            {artistOptions.length > 0 && (
              <>
                <span>·</span>
                <select
                  value={artistFilter}
                  onChange={(e) => {
                    setArtistFilter(e.target.value);
                    setActiveIndex(0);
                  }}
                  style={selectStyle}
                >
                  <option value="all" style={{ background: "#1a1917", color: "#eee" }}>
                    all artists
                  </option>
                  {artistOptions.map((a) => (
                    <option key={a} value={a} style={{ background: "#1a1917", color: "#eee" }}>
                      {a}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => setView(view === "grid" ? "list" : "grid")}
          title={view === "grid" ? "Switch to preview view" : "Switch to grid view"}
          style={{
            width: 38,
            height: 38,
            background: "none",
            border: "1px solid rgba(255,255,255,.25)",
            borderRadius: 2,
            color: "rgba(255,255,255,.7)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {view === "grid" ? <ListIcon /> : <GridIcon />}
        </button>
      </div>

      {/* Grid view */}
      {view === "grid" && (
        <div style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
              gap: 14,
            }}
          >
            {releases.map((release, i) => (
              <div
                key={i}
                onClick={() => {
                  setActiveIndex(i);
                  setView("list");
                }}
                style={{
                  position: "relative",
                  aspectRatio: "1",
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                {release.cover_art_src ? (
                  <img
                    src={release.cover_art_src}
                    alt={release.release_name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <CoverPlaceholder />
                )}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "4px 6px",
                    font: "600 8.5px 'Helvetica Neue', Helvetica, Arial, sans-serif",
                    color: "#fff",
                    background: "linear-gradient(transparent, rgba(0,0,0,.75))",
                    letterSpacing: ".02em",
                    pointerEvents: "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {release.release_name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div style={{ flex: 1, display: "flex", gap: 28, minHeight: 0 }}>
          {/* Sidebar */}
          <div
            style={{
              width: 280,
              height: 600,
              flexShrink: 0,
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 4,
              overflowY: "auto",
              background: "oklch(0.18 0.008 60)",
            }}
          >
            {releases.map((release, i) => {
              const on = i === activeIndex;
              return (
                <div
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 16px",
                    cursor: "pointer",
                    background: on ? "rgba(255,255,255,.07)" : "transparent",
                    borderLeft: `2px solid ${on ? PRIMARY : "transparent"}`,
                  }}
                >
                  <span
                    style={{
                      font: "500 11px 'Helvetica Neue', Helvetica, Arial, sans-serif",
                      color: on ? "#fff" : "rgba(255,255,255,.6)",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {release.release_name}
                  </span>
                  <span
                    style={{
                      font: "400 9.5px 'Helvetica Neue', Helvetica, Arial, sans-serif",
                      color: "rgba(255,255,255,.3)",
                      flexShrink: 0,
                    }}
                  >
                    {release.year}
                  </span>
                  <span
                    style={{
                      font: "600 8.5px 'Helvetica Neue', Helvetica, Arial, sans-serif",
                      color: tagColor(release.type),
                      letterSpacing: ".04em",
                      flexShrink: 0,
                      textTransform: "uppercase",
                    }}
                  >
                    {release.type === "Compilation" ? "Comp" : release.type }
                  </span>
                </div>
              );
            })}
          </div>

          {/* Preview + detail */}
          {active && (
            <div
              className="relative flex justify-center items-center flex-col lg:flex-row flex-1 gap-[48px] sm:gap-[20px] lg:gap-[48px]"
            >
              {/* 3D card */}
              <div
                style={{
                  perspective: "1400px",
                  width: "min(400px, 44vh)",
                  height: "min(400px, 44vh)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                onMouseMove={handlePreviewMove}
                onMouseLeave={handlePreviewLeave}
              >
                <div
                  style={{
                    position: "relative",
                    width: "min(360px, 40vh)",
                    height: "min(360px, 40vh)",
                    borderRadius: 4,
                    boxShadow:
                      "0 30px 70px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.1)",
                    transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${hovering ? 1.04 : 1})`,
                    transition: tiltTransition,
                    transformStyle: "preserve-3d",
                    overflow: "hidden",
                  }}
                >
                  {active.cover_art_src ? (
                    <img
                      src={active.cover_art_src}
                      alt={active.release_name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <CoverPlaceholder />
                  )}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      background: `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255,255,255,.22), transparent 55%)`,
                      opacity: hovering ? 1 : 0,
                      transition: "opacity .3s ease",
                    }}
                  />
                </div>
              </div>

              {/* Detail panel */}
              <div
                style={{
                  width: 220,
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div>
                  <div
                    style={{
                      font: "600 20px 'Helvetica Neue', Helvetica, Arial, sans-serif",
                      color: "#fff",
                      letterSpacing: ".02em",
                      textTransform: "uppercase",
                    }}
                  >
                    {active.release_name}
                  </div>
                  <div
                    style={{
                      font: "500 11px 'Helvetica Neue', Helvetica, Arial, sans-serif",
                      color: PRIMARY,
                      letterSpacing: ".05em",
                      textTransform: "uppercase",
                      marginTop: 6,
                    }}
                  >
                    {artistDisplay(active.artist)}
                  </div>
                  <div
                    style={{
                      font: "400 10px 'Helvetica Neue', Helvetica, Arial, sans-serif",
                      color: "rgba(255,255,255,.35)",
                      letterSpacing: ".04em",
                      textTransform: "uppercase",
                      marginTop: 4,
                    }}
                  >
                    {active.type} · {active.year}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  {active.spotify_url ? (
                    <a
                      href={active.spotify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "block",
                        textAlign: "center",
                        padding: "9px 0",
                        border: `1px solid ${PRIMARY}`,
                        font: "600 10px 'Helvetica Neue', Helvetica, Arial, sans-serif",
                        letterSpacing: ".06em",
                        color: PRIMARY,
                        textDecoration: "none",
                      }}
                    >
                      SPOTIFY
                    </a>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "9px 0",
                        border: "1px solid rgba(255,255,255,.1)",
                        font: "600 10px 'Helvetica Neue', Helvetica, Arial, sans-serif",
                        letterSpacing: ".06em",
                        color: "rgba(255,255,255,.2)",
                      }}
                    >
                      NOT ON SPOTIFY
                    </div>
                  )}
                  {active.bandcamp_url && (
                    <a
                      href={active.bandcamp_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "block",
                        textAlign: "center",
                        padding: "9px 0",
                        border: `1px solid ${SECONDARY}`,
                        font: "600 10px 'Helvetica Neue', Helvetica, Arial, sans-serif",
                        letterSpacing: ".06em",
                        color: "rgba(255,255,255,.75)",
                        textDecoration: "none",
                      }}
                    >
                      BANDCAMP
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Discography;
