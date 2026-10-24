import WarpedGrid from "@/components/WarpedGrid";

// Small per-card variation around WarpedGrid's defaults (intensity=1,
// density=1) - enough that cards don't all look identical, not enough
// to stop reading as "the same grid".
function randomWarpedGridProps(name) {
  let seed = 0;
  for (const char of name) seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  return {
    intensity: 0.5 + random() * 1.1, // 0.8 - 1.2
    density: 0.1 + random() * 0.4, // 0.85 - 1.15
  };
}

// Shared by roster cards and event artwork so the grid and tint stay identical.
export default function ArtworkOverlay({ name = "" }) {
  return <span className="pointer-events-none absolute inset-0" aria-hidden="true">
    <span className="absolute inset-0 bg-[linear-gradient(0deg,_var(--dod-black)_0%,_transparent_40%)]" />
    <span className="absolute inset-0 bg-dod-deep-purple/50 mix-blend-overlay saturate-200 group-hover:opacity-50 group-focus-visible:opacity-50 transition-all duration-500" />
    <WarpedGrid {...randomWarpedGridProps(name)} className="absolute w-full h-full scale-120" />
  </span>;
}
