// src/domeofdoom/components/WorldMap.jsx

import React, { useMemo } from "react";
import StarIcon from "./StarIcon";
import { BLACK_DISTRESSED_STARRY_TEXTURE } from "../tokens";
import { WORLD_MAP_PATHS, WORLD_MAP_VIEWBOX_WIDTH, WORLD_MAP_VIEWBOX_HEIGHT } from "../data/worldMapPaths";

// Ported from a reference image (ChatGPT-generated): a dark world map with
// a lilac graticule, real coastlines, curved connector arcs radiating from
// one hub point, and a handful of glowing stars (one big mint "home base"
// star + smaller lilac stars) scattered across other locations. The
// coastlines are simplemaps.com's free world.svg (see worldMapPaths.js) -
// a plate-carree projection, native viewBox 2000x857 - rendered through a
// scale transform so any `width`/`height` still works.
//
// `points` is lon/lat, not that source SVG's own pixel space, so the
// projection below is calibrated (via a handful of compact, non-elongated
// countries' real centroid lat vs. their path bbox centers - Iceland, Sri
// Lanka, Madagascar, Uruguay, South Africa, Italy, Vietnam, Finland) to
// land in the same place as the real coastlines: x is plain equirectangular
// (matches the source almost exactly), y uses the fitted slope/intercept
// below since the source's vertical scale isn't 1:1 with its horizontal
// scale (857 tall for a 2000-wide, i.e. 360x180deg, map).
const LAT_TO_Y_SLOPE = -6.35;
const LAT_TO_Y_INTERCEPT = 499.4;

// `points` is the data this is actually built around: an array of
// { id, lon, lat, size?, color? }. One of them is the `hubId` (defaults to
// "los-angeles") - every other point gets a curved line back to it. Swap in
// the real city list whenever it's ready; the three defaults below are
// just placeholders so the component renders something before that.
const DEFAULT_POINTS = [
  { id: "los-angeles", label: "Los Angeles", lon: -118.24, lat: 34.05, size: 138, color: "mint" },
  { id: "london", label: "London", lon: -0.13, lat: 51.51, size: 52, color: "lilac" },
  { id: "lagos", label: "Lagos", lon: 3.38, lat: 6.52, size: 47, color: "lilac" },
  { id: "sao-paulo", label: "São Paulo", lon: -46.63, lat: -23.55, size: 52, color: "lilac" },
  { id: "tokyo", label: "Tokyo", lon: 139.69, lat: 35.68, size: 72, color: "lilac" },
  { id: "sydney", label: "Sydney", lon: 151.21, lat: -33.87, size: 47, color: "lilac" },
];

const COLOR_PRESETS = {
  mint: { gradientFrom: "#d7fbe8", gradientTo: "#A4F4C2", glowColor: "#A4F4C2" },
  lilac: { gradientFrom: "#c9c4fc", gradientTo: "#9A93F8", glowColor: "#9A93F8" },
  purple: { gradientFrom: "#a599f9", gradientTo: "#533cab", glowColor: "#8b7cf6" },
};

const WorldMap = ({
  // Default to the source map's own native size so the land <path>s need no
  // rescaling; pass a different width/height and they're scaled via a <g>
  // transform instead (see `landScale` below), same as the points are.
  width = WORLD_MAP_VIEWBOX_WIDTH,
  height = WORLD_MAP_VIEWBOX_HEIGHT,
  points = DEFAULT_POINTS,
  hubId = "los-angeles",

  backgroundColor = "#030507",
  showBackground = true,
  landColor = "#6a63c9",
  landOpacity = 0.55,
  gridColor = "#4a4480",
  gridOpacity = 0.4,
  arcColor = "#8b7cf6",
  arcOpacity = 0.6,
  arcWidth = 2.2,
  showBackgroundStars = true,
  showTexture = true,
  textureOpacity = 0.5,

  preserveAspectRatio = "xMidYMid slice",
  className = "",
}) => {
  const project = useMemo(
    () => (lon, lat) => ({
      x: ((lon + 180) / 360) * width,
      y: ((LAT_TO_Y_SLOPE * lat + LAT_TO_Y_INTERCEPT) / WORLD_MAP_VIEWBOX_HEIGHT) * height,
    }),
    [width, height]
  );

  const landScale = `${width / WORLD_MAP_VIEWBOX_WIDTH} ${height / WORLD_MAP_VIEWBOX_HEIGHT}`;

  const gridLines = useMemo(() => {
    const verticals = [];
    const horizontals = [];
    for (let lon = -180; lon <= 180; lon += 30) {
      const x = project(lon, 0).x;
      verticals.push({ x1: x, y1: 0, x2: x, y2: height });
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const y = project(0, lat).y;
      horizontals.push({ x1: 0, y1: y, x2: width, y2: y });
    }
    return { verticals, horizontals };
  }, [project, width, height]);

  const projectedPoints = useMemo(
    () => points.map((p) => ({ ...p, ...project(p.lon, p.lat) })),
    [points, project]
  );

  const hub = projectedPoints.find((p) => p.id === hubId) ?? projectedPoints[0];

  // Gentle arcs from the hub to every other point - a quadratic curve
  // bowed toward the top of the viewport (negative y control-point offset)
  // so longer hops read as "higher" flight paths, like the reference image.
  const arcs = useMemo(() => {
    if (!hub) return [];
    return projectedPoints
      .filter((p) => p.id !== hub.id)
      .map((p) => {
        const mx = (hub.x + p.x) / 2;
        const my = (hub.y + p.y) / 2;
        const dist = Math.hypot(p.x - hub.x, p.y - hub.y);
        const bow = Math.min(dist * 0.28, 160);
        return `M${hub.x.toFixed(1)},${hub.y.toFixed(1)} Q${mx.toFixed(1)},${(my - bow).toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      });
  }, [hub, projectedPoints]);

  // Deterministic scattered background sparkles, same recipe WormholeGrid
  // uses for its star field.
  const bgStars = useMemo(() => {
    if (!showBackgroundStars) return [];
    return Array.from({ length: 90 }, (_, i) => ({
      x: (((i * 137.5) % 100) / 100) * width,
      y: (((i * 71.3) % 100) / 100) * height,
      r: 0.9 + (i % 5) * 0.35,
      o: 0.15 + (i % 4) * 0.1,
    }));
  }, [showBackgroundStars, width, height]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio={preserveAspectRatio}
        xmlns="http://www.w3.org/2000/svg"
        className="block"
      >
        {showBackground && <rect x={0} y={0} width={width} height={height} fill={backgroundColor} />}

        {bgStars.map((s, i) => (
          <circle key={`bg-${i}`} cx={s.x} cy={s.y} r={s.r} fill="#ffffff" opacity={s.o} />
        ))}

        <g stroke={gridColor} strokeOpacity={gridOpacity} strokeWidth={1.8}>
          {gridLines.verticals.map((l, i) => (
            <line key={`v-${i}`} {...l} />
          ))}
          {gridLines.horizontals.map((l, i) => (
            <line key={`h-${i}`} {...l} />
          ))}
          <rect x={1} y={1} width={width - 2} height={height - 2} fill="none" />
        </g>

        <g
          fill="none"
          stroke={landColor}
          strokeOpacity={landOpacity}
          strokeWidth={1.1}
          strokeLinejoin="round"
          transform={`scale(${landScale})`}
        >
          {WORLD_MAP_PATHS.map((d, i) => (
            <path key={`land-${i}`} d={d} />
          ))}
        </g>

        <g fill="none" stroke={arcColor} strokeOpacity={arcOpacity} strokeWidth={arcWidth}>
          {arcs.map((d, i) => (
            <path key={`arc-${i}`} d={d} />
          ))}
        </g>

        {projectedPoints.map((p) => {
          const preset = COLOR_PRESETS[p.color] ?? COLOR_PRESETS.lilac;
          const size = p.size ?? 20;
          return (
            <g key={p.id} transform={`translate(${p.x - size / 2},${p.y - size / 2})`}>
              <foreignObject width={size} height={size} style={{ overflow: "visible" }}>
                <StarIcon size={size} showBackground={false} {...preset} />
              </foreignObject>
            </g>
          );
        })}
      </svg>

      {showTexture && (
        <img
          className="pointer-events-none absolute inset-0 h-full w-full object-cover mix-blend-overlay"
          style={{ opacity: textureOpacity }}
          src={BLACK_DISTRESSED_STARRY_TEXTURE}
          alt=""
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default WorldMap;
