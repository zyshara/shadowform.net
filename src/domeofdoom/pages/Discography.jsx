import React, { useState } from "react";
import { readSeedData } from "@/utils/readSeedData";
import { colors } from "@/tokens";

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

const Discography = () => {
  const releases = readSeedData("discography-data") ?? [];
  const [view, setView] = useState("list");
  const [activeIndex, setActiveIndex] = useState(0);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [hovering, setHovering] = useState(false);

  const active = releases[Math.min(activeIndex, releases.length - 1)];

  const selectRelease = (i) => {
    setActiveIndex(i);
    setView("list");
  };

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

  return (
    <div className="mx-auto max-w-[1400px] px-10 py-[70px]">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="m-0 font-[Arial,sans-serif] text-[48px] font-black uppercase leading-none tracking-tight">
            Discography
          </h1>
          <div className="mt-2 text-[13px] font-bold uppercase tracking-[0.08em] text-white/40">
            {releases.length} releases · from Bandcamp
          </div>
        </div>
        <button
          onClick={() => setView(view === "grid" ? "list" : "grid")}
          title={view === "grid" ? "Switch to preview view" : "Switch to grid view"}
          className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded border border-white/25 text-white/70 transition-colors hover:border-white/50 hover:text-white"
        >
          {view === "grid" ? <ListIcon /> : <GridIcon />}
        </button>
      </div>

      {view === "grid" && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
          {releases.map((release, i) => (
            <div
              key={i}
              onClick={() => selectRelease(i)}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-md border border-white/10"
            >
              <img
                src={release.cover_art_src}
                alt={release.release_name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 truncate px-2 py-1.5 text-[12px] font-bold text-white" style={{ background: "linear-gradient(transparent, rgba(0,0,0,.8))" }}>
                {release.release_name}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "list" && active && (
        <div className="flex gap-7">
          <div
            className="h-[600px] w-[280px] flex-none overflow-y-auto rounded-md border border-white/10"
            style={{ background: colors.card }}
          >
            {releases.map((release, i) => {
              const on = i === activeIndex;
              return (
                <div
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className="cursor-pointer border-l-2 px-4 py-2.5 transition-colors"
                  style={{
                    background: on ? "rgba(255,255,255,0.06)" : "transparent",
                    borderColor: on ? colors.accent : "transparent",
                  }}
                >
                  <div className="truncate text-[13px] font-bold" style={{ color: on ? colors.text : "rgba(255,255,255,0.55)" }}>
                    {release.release_name}
                  </div>
                  <div className="truncate text-[11px] font-medium text-white/35">{release.artist}</div>
                </div>
              );
            })}
          </div>

          <div className="relative flex h-[600px] flex-1 flex-col items-center justify-center">
            <div
              style={{ perspective: "1400px" }}
              className="flex h-[380px] w-[380px] items-center justify-center"
              onMouseMove={handlePreviewMove}
              onMouseLeave={handlePreviewLeave}
            >
              <div
                style={{
                  transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${hovering ? 1.04 : 1})`,
                  transition: hovering ? "transform 80ms ease-out" : "transform 500ms cubic-bezier(.2,.8,.2,1)",
                  transformStyle: "preserve-3d",
                  boxShadow: "0 30px 70px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.1)",
                }}
                className="relative h-[320px] w-[320px] rounded-md"
              >
                <img
                  src={active.cover_art_src}
                  alt={active.release_name}
                  className="h-full w-full rounded-md object-cover"
                />
                <div
                  className="pointer-events-none absolute inset-0 rounded-md transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255,255,255,.22), transparent 55%)`,
                    opacity: hovering ? 1 : 0,
                  }}
                />
                <div
                  className="pointer-events-none absolute bottom-3.5 left-3.5 max-w-[85%] truncate font-[Arial,sans-serif] text-[16px] font-black uppercase text-white"
                  style={{ textShadow: "0 2px 8px rgba(0,0,0,.8)" }}
                >
                  {active.release_name}
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 text-center text-[11px] font-bold uppercase tracking-[0.06em] text-white/30">
              {active.artist} — move mouse to rotate
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discography;
