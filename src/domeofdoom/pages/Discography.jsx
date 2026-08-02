import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { readSeedData } from "@/utils/readSeedData";
import { colors } from "@/tokens";
import Button from "@/components/Button";
import PosterFrame from "@/components/PosterFrame";
import SubpageHeader from "@/components/SubpageHeader";

const PRIMARY = colors.accent;

const VIEW_STORAGE_KEY = "domeofdoom:discography:view";

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

// Same arrow glyph as Home.jsx's ArrowRightIcon, mirrored to point left.
const ArrowLeftIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "scaleX(-1)" }}>
    <path d="M4 12H20M20 12L13 5M20 12L13 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Overlaid on a native <select> styled to look like a bordered pill button —
// pointer-events:none so clicks still reach the select underneath.
const FilterChevron = () => (
  <svg
    viewBox="0 0 10 10"
    width="8"
    height="8"
    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
  >
    <polyline points="2,3 5,7 8,3" fill="none" stroke={PRIMARY} strokeWidth="2.5" />
  </svg>
);

function tagClassName(type) {
  if (type === "Compilation") return "disco-tag-comp";
  if (type === "Remix") return "disco-tag-remix";
  if (type === "Album") return "disco-tag-album";
  if (type === "EP") return "disco-tag-ep";
  return "disco-tag-single";
}

function artistDisplay(release) {
  if (release.artists?.length) {
    return release.artists.map((a) => a.toUpperCase()).join(", ");
  }
  if (!release.artist || release.artist === "DOMEOFDOOM") return "DOME OF DOOM";
  return release.artist.toUpperCase();
}

function releaseTimestamp(release) {
  if (release.release_date) {
    const t = new Date(release.release_date).getTime();
    if (!isNaN(t)) return t;
  }
  if (release.year) return new Date(`${release.year}-01-01`).getTime();
  return 0;
}

function slugify(str) {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function releaseSlug(release) {
  return `${slugify(release.release_name)}-${release.uid}`;
}

function extractUidFromSlug(param) {
  if (!param) return null;
  const idx = param.lastIndexOf("-");
  return idx === -1 ? param : param.slice(idx + 1);
}

function getStoredView() {
  try {
    const v = localStorage.getItem(VIEW_STORAGE_KEY);
    return v === "grid" || v === "list" ? v : "list";
  } catch {
    return "list";
  }
}

// Matches Tailwind's `md` breakpoint (768px) — below this, discography always
// renders as a grid regardless of the stored view preference, since the
// sidebar + 3D preview layout doesn't fit small screens.
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

// Drives the same { rx, ry } shape as the mouse-tilt handler, but from the
// device's gyroscope. iOS 13+ requires an explicit user gesture to grant
// motion access (DeviceOrientationEvent.requestPermission), so callers
// should surface `permissionState === "prompt"` as a button. The first
// reading received is treated as "flat" — tilt is reported relative to
// however the phone happened to be held, not an absolute angle.
function useGyroTilt(enabled) {
  const [gyroTilt, setGyroTilt] = useState({ rx: 0, ry: 0 });
  const [permissionState, setPermissionState] = useState(() => {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      return "prompt";
    }
    return "granted";
  });
  const baselineRef = useRef(null);

  useEffect(() => {
    if (!enabled || permissionState !== "granted") return;
    baselineRef.current = null;

    const handler = (e) => {
      if (e.beta == null || e.gamma == null) return;
      if (!baselineRef.current) baselineRef.current = { beta: e.beta, gamma: e.gamma };
      const dBeta = e.beta - baselineRef.current.beta;
      const dGamma = e.gamma - baselineRef.current.gamma;
      setGyroTilt({
        rx: Math.max(-22, Math.min(22, dBeta * -0.8)),
        ry: Math.max(-22, Math.min(22, dGamma * 0.8)),
      });
    };

    window.addEventListener("deviceorientation", handler);
    return () => window.removeEventListener("deviceorientation", handler);
  }, [enabled, permissionState]);

  const requestPermission = async () => {
    try {
      const result = await DeviceOrientationEvent.requestPermission();
      setPermissionState(result === "granted" ? "granted" : "denied");
    } catch {
      setPermissionState("denied");
    }
  };

  return { gyroTilt, permissionState, requestPermission };
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

const GridView = ({ releases, onSelect }) => (
  <div style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: 14,
      }}
    >
      {releases.map((release, i) => (
        <div
          key={release.uid ?? i}
          onClick={() => onSelect(release)}
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
              <img
                src={release.cover_art_src}
                alt={release.release_name}
                className="disco-grid-img"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <CoverPlaceholder />
            )}
          </div>
          <div
            style={{
              height: 12,
              width: "100%",
              flexShrink: 0,
              background: PRIMARY,
              display: "flex",
              alignItems: "center",
              padding: "0 6px",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                font: "600 8px 'Helvetica Neue', Helvetica, Arial, sans-serif",
                color: colors.bg,
                letterSpacing: ".02em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {release.release_name}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Card size caps at 600px, or 50% of viewport height (the original desktop
// feel), or the full width available — that last bound is what keeps this
// square card from overflowing narrow-but-tall mobile viewports, where a
// vh-only cap can easily exceed the screen's actual width.
const CARD_SIZE_CSS = "min(600px, 50vh, 100%)";

const ReleaseCard = ({ release, tilt, hovering, onMouseMove, onMouseLeave }) => {
  const sheenX = 50 + tilt.ry * 1.6;
  const sheenY = 50 - tilt.rx * 1.6;
  const tiltTransition = hovering
    ? "transform 80ms ease-out"
    : "transform 500ms cubic-bezier(.2,.8,.2,1)";

  return (
    <div
      style={{
        perspective: "1400px",
        position: "relative",
        zIndex: 1,
        width: CARD_SIZE_CSS,
        aspectRatio: "1 / 1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div
        style={{
          position: "relative",
          width: "92%",
          aspectRatio: "1 / 1",
          borderRadius: 4,
          boxShadow: "0 30px 70px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.1)",
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${hovering ? 1.04 : 1})`,
          transition: tiltTransition,
          transformStyle: "preserve-3d",
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
            inset: 0,
            pointerEvents: "none",
            background: `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255,255,255,.22), transparent 55%)`,
            opacity: hovering ? 1 : 0,
            transition: "opacity .3s ease",
          }}
        />
      </div>
    </div>
  );
};

const ReleaseDetail = ({ release }) => (
  <div
    style={{
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      position: "relative",
      zIndex: 1,
      width: CARD_SIZE_CSS,
    }}
  >
    <div className="flex flex-col gap-[2px]">
      <div
        style={{
          fontFamily: "Archivo, sans-serif",
          fontSize: "16px",
          fontWeight: 600,
          fontStretch: "expanded",
          fontVariationSettings: '"wdth" 125',
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          color: "#fff",
        }}
      >
        {release.release_name}
      </div>
      <div
        style={{
          font: "500 11px 'Helvetica Neue', Helvetica, Arial, sans-serif",
          color: PRIMARY,
          letterSpacing: ".05em",
          textTransform: "uppercase",
        }}
      >
        {artistDisplay(release)}
      </div>
      <div
        style={{
          font: "400 10px 'Helvetica Neue', Helvetica, Arial, sans-serif",
          color: "rgba(255,255,255,.35)",
          letterSpacing: ".04em",
          textTransform: "uppercase",
        }}
      >
        {release.type} · {release.year}
      </div>
    </div>
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-5" style={{ marginTop: 8, width: "100%" }}>
      {release.spotify_url ? (
        <Button type="thin" variant="primary" href={release.spotify_url} style={{ width: "100%" }}>
          Spotify
        </Button>
      ) : (
        <Button variant="disabled" type="thin" style={{ width: "100%" }}>
          Not on Spotify
        </Button>
      )}
      {release.bandcamp_url && (
        <Button type="thin" variant="secondary" href={release.bandcamp_url} style={{ width: "100%" }}>
          Bandcamp
        </Button>
      )}
    </div>
  </div>
);

const Discography = () => {
  const allReleases = readSeedData("discography-data") ?? [];
  const [searchParams, setSearchParams] = useSearchParams();

  const [view, setView] = useState(getStoredView);
  const isBelowMd = useIsBelowMd();
  const [activeIndex, setActiveIndex] = useState(0);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [hovering, setHovering] = useState(false);
  const [sortOrder, setSortOrder] = useState("latest");
  const [artistFilter, setArtistFilter] = useState("all");

  const handleToggleView = () => {
    const next = view === "grid" ? "list" : "grid";
    setView(next);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // localStorage unavailable — view just won't persist across reloads
    }
  };

  // Grid tile click (mobile-forced grid, or desktop with "grid" preference).
  const handleSelectRelease = (release) => {
    setSearchParams({ release: releaseSlug(release) });
  };

  // Sidebar row click in 3D/list view — stay put, just switch the preview
  // and mirror the selection into the URL for shareability.
  const handleActivateRelease = (release, i) => {
    setActiveIndex(i);
    setSearchParams({ release: releaseSlug(release) }, { replace: true });
  };

  const handleBackToDiscography = () => {
    setSearchParams({}, { replace: true });
  };

  // The release referenced by ?release=, resolved independent of view/filter
  // state — a permalink should always point at the same release regardless
  // of how the page happens to be browsed right now.
  const linkedRelease = useMemo(() => {
    const uid = extractUidFromSlug(searchParams.get("release"));
    if (!uid) return null;
    return allReleases.find((r) => String(r.uid) === String(uid)) ?? null;
  }, [searchParams, allReleases]);

  // Grid contexts (mobile — always grid — or desktop with "grid" preference)
  // show the standalone single-release page; 3D/list view instead keeps the
  // sidebar + preview UI, with the linked release just highlighted. This is
  // derived fresh every render (not stored state) so resizing the window
  // reactively switches between the two without needing a fresh page load.
  const effectiveGrid = isBelowMd || view === "grid";
  const showSingleRelease = effectiveGrid && !!linkedRelease;
  const gyro = useGyroTilt(showSingleRelease && isBelowMd);

  const artistOptions = useMemo(() => {
    const set = new Set();
    allReleases.forEach((r) => {
      const names = r.artists?.length
        ? r.artists
        : r.artist && r.artist !== "DOMEOFDOOM"
        ? [r.artist]
        : [];
      names.forEach((n) => set.add(n));
    });
    return Array.from(set);
  }, [allReleases]);

  const releases = useMemo(() => {
    let list =
      artistFilter === "all"
        ? allReleases
        : allReleases.filter((r) =>
            r.artists?.length ? r.artists.includes(artistFilter) : r.artist === artistFilter
          );
    list = list
      .slice()
      .sort((a, b) =>
        sortOrder === "earliest"
          ? releaseTimestamp(a) - releaseTimestamp(b)
          : releaseTimestamp(b) - releaseTimestamp(a)
      );
    return list;
  }, [allReleases, artistFilter, sortOrder]);

  const active =
    linkedRelease && !effectiveGrid
      ? linkedRelease
      : releases.length
      ? releases[Math.min(activeIndex, releases.length - 1)]
      : null;

  const bgRelease = showSingleRelease ? linkedRelease : active;

  const [currentBgSrc, setCurrentBgSrc] = useState(bgRelease?.cover_art_src ?? null);
  const [prevBgSrc, setPrevBgSrc] = useState(null);
  const currentBgSrcRef = useRef(bgRelease?.cover_art_src ?? null);

  useEffect(() => {
    const next = bgRelease?.cover_art_src ?? null;
    if (next === currentBgSrcRef.current) return;
    setPrevBgSrc(currentBgSrcRef.current);
    currentBgSrcRef.current = next;
    setCurrentBgSrc(next);
    const t = setTimeout(() => setPrevBgSrc(null), 700);
    return () => clearTimeout(t);
  }, [bgRelease?.cover_art_src]);

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

  return (
    <div
      className="mx-auto max-w-[1400px] px-10 py-10 lg:py-[70px]"
      style={{
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        position: "relative",
        overflow: "hidden",
        isolation: "isolate",
      }}
    >
      {/* Atmospheric background — crossfade between prev and current */}
      {prevBgSrc && (
        <div
          key={prevBgSrc + "_out"}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${prevBgSrc})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "200% center",
            animation: "bgFadeOut 0.6s ease forwards",
            zIndex: -1,
            pointerEvents: "none",
          }}
        />
      )}
      {currentBgSrc && (
        <div
          key={currentBgSrc + "_in"}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${currentBgSrc})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "200% center",
            animation: "bgFadeIn 0.6s ease forwards",
            zIndex: -1,
            pointerEvents: "none",
          }}
        />
      )}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to right, #0d0b0a 30%, rgba(13,11,10,0.5) 65%, #0d0b0a 100%)",
          zIndex: -1,
          pointerEvents: "none",
        }}
      />

      {showSingleRelease ? (
        <>
          <button
            onClick={handleBackToDiscography}
            style={{
              alignSelf: "flex-start",
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: "rgba(255,255,255,.5)",
              font: "600 12px 'Helvetica Neue', Helvetica, Arial, sans-serif",
              letterSpacing: ".05em",
              textTransform: "uppercase",
            }}
          >
            <ArrowLeftIcon size={12} />
            All Releases
          </button>
          <div
            className="relative flex justify-center items-center flex-col flex-1 gap-[48px] sm:gap-[20px] lg:gap-[48px]"
            style={{ minHeight: 500 }}
          >
            <ReleaseCard
              release={linkedRelease}
              tilt={isBelowMd ? gyro.gyroTilt : tilt}
              hovering={isBelowMd ? true : hovering}
              onMouseMove={isBelowMd ? undefined : handlePreviewMove}
              onMouseLeave={isBelowMd ? undefined : handlePreviewLeave}
            />
            {isBelowMd && gyro.permissionState === "prompt" && (
              <button
                onClick={gyro.requestPermission}
                style={{
                  background: "none",
                  border: "1px solid rgba(255,255,255,.25)",
                  borderRadius: 4,
                  padding: "8px 18px",
                  color: "rgba(255,255,255,.7)",
                  cursor: "pointer",
                  font: "600 11px 'Helvetica Neue', Helvetica, Arial, sans-serif",
                  letterSpacing: ".05em",
                  textTransform: "uppercase",
                }}
              >
                Enable Tilt
              </button>
            )}
            <ReleaseDetail release={linkedRelease} />
          </div>
        </>
      ) : (
        <>
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex flex-col gap-[8px] w-full sm:max-w-[50%]">
              <SubpageHeader heading="Discography">
              <div className="flex w-full flex-col gap-4 w-full items-start justify-start">
                <div className="flex flex-row w-full">
                <span className="disco-filter-count">
                  <b>{releases.length}</b> releases
                </span>
                <div className="disco-filter-dot"> · </div>
                  <span className="disco-filter-count">
                    <b>{artistOptions.length}</b> artists
                  </span>
                </div>
                <div className="flex flex-row gap-4 w-full">
                <span className="w-full" style={{ position: "relative", display: "inline-flex" }}>
                  <select
                    value={sortOrder}
                    onChange={(e) => {
                      setSortOrder(e.target.value);
                      setActiveIndex(0);
                    }}
                    className="disco-filter-select w-full"
                  >
                    <option value="latest">latest first</option>
                    <option value="earliest">earliest first</option>
                  </select>
                  <FilterChevron />
                </span>
                {artistOptions.length > 0 && (
                  <>
                    <span className="w-full" style={{ position: "relative", display: "inline-flex" }}>
                      <select
                        value={artistFilter}
                        onChange={(e) => {
                          setArtistFilter(e.target.value);
                          setActiveIndex(0);
                        }}
                        className="disco-filter-select w-full"
                      >
                        <option value="all">all artists</option>
                        {artistOptions.sort().map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                      <FilterChevron />
                    </span>
                  </>
                )}
              </div>
              </div>
              </SubpageHeader>
            </div>
            {!isBelowMd && (
              <button
                onClick={handleToggleView}
                title={view === "grid" ? "Switch to preview view" : "Switch to grid view"}
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
                {view === "grid" ? <ListIcon /> : <GridIcon />}
              </button>
            )}
          </div>

          {/* Below the md breakpoint, always render grid (sidebar + 3D
              preview doesn't fit small screens) regardless of preference. */}
          <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
            {isBelowMd || view === "grid" ? (
              <GridView releases={releases} onSelect={handleSelectRelease} />
            ) : (
              <div style={{ flex: 1, display: "flex", gap: 28, minHeight: 0 }}>
                {/* Sidebar */}
                  <div
                    className="disco-sidebar-scroll"
                    style={{
                      width: 280,
                      height: 640,
                      flexShrink: 0,
                      border: "1px solid rgba(255,255,255,.1)",
                      overflowY: "scroll",
                      background: "oklch(0.18 0.008 60)",
                    }}
                  >
                    {releases.map((release, i) => {
                      const on = release.uid != null ? release.uid === active?.uid : i === activeIndex;
                      return (
                        <div
                          key={release.uid ?? i}
                          onClick={() => handleActivateRelease(release, i)}
                          className={`disco-item-1a min-h-[60px]${on ? " active" : ""}`}
                        >
                          <span className="disco-item-1a-title">{release.release_name}</span>
                          <span className="disco-item-1a-year">{release.year}</span>
                          <span className={`disco-tag ${tagClassName(release.type)}`}>
                            {release.type === "Compilation" ? "Comp" : release.type}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                {/* Preview + detail */}
                {active && (
                  <div className="relative flex justify-center items-center flex-col flex-1 gap-[48px] sm:gap-[20px] lg:gap-[48px] h-[700px]">
                    <ReleaseCard
                      release={active}
                      tilt={tilt}
                      hovering={hovering}
                      onMouseMove={handlePreviewMove}
                      onMouseLeave={handlePreviewLeave}
                    />
                    <ReleaseDetail release={active} />
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Discography;
