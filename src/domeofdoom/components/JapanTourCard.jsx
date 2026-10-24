// src/domeofdoom/components/JapanTourCard.jsx

import React, { useMemo } from "react";
import StarIcon from "./StarIcon";
import WarpedGrid from "./WarpedGrid";
import GlobeIcon from "./GlobeIcon";
import { JAPAN_MAP_PATHS } from "../data/japanMapPaths";

// Portrait tour-announcement card (reference: a ChatGPT-mocked "Japan Tour"
// story graphic) - Japan's coastline (simplemaps.com's free jp.svg, see
// japanMapPaths.js) with a glowing hub star over the lead city and arcs out
// to the rest of the route, WarpedGrid layered on top as a texture, and the
// existing GlobeIcon badged in the corner.
//
// Same lon/lat calibration idea as WorldMap.jsx: x is plain equirectangular
// against the source's own viewBox, y is a fitted slope/intercept (checked
// against Osaka, Kyoto, Nagoya/Aichi, Hiroshima, Fukuoka and Nagano, all
// compact-enough prefectures that a bbox center is a fair stand-in for
// their real centroid).
const LON_TO_X_SLOPE = 28.0276;
const LON_TO_X_INTERCEPT = -3384.1141;
const LAT_TO_Y_SLOPE = -29.4824;
const LAT_TO_Y_INTERCEPT = 1478.8259;

// Where the map's own coastline data (mainland Hokkaido through Kyushu;
// Okinawa and the remote Izu/Ogasawara islands fall outside this window and
// are simply cropped by the card, same as the reference graphic) gets
// framed inside the card's own 600x1000 viewBox.
const MAP_SCALE = 1.16;
const MAP_TRANSLATE_X = -231;
const MAP_TRANSLATE_Y = 115;

const DEFAULT_CITIES = [
  { id: "tokyo", label: "Tokyo", lon: 139.6917, lat: 35.6895, size: 70, color: "mint", hub: true },
  { id: "hamamatsu", label: "Hamamatsu", lon: 137.7261, lat: 34.7108, size: 30, color: "lilac" },
  { id: "osaka", label: "Osaka", lon: 135.5023, lat: 34.6937, size: 30, color: "lilac" },
];

const COLOR_PRESETS = {
  mint: { gradientFrom: "#d7fbe8", gradientTo: "#A4F4C2", glowColor: "#A4F4C2" },
  lilac: { gradientFrom: "#c9c4fc", gradientTo: "#9A93F8", glowColor: "#9A93F8" },
};

const project = (lon, lat) => ({
  x: LON_TO_X_SLOPE * lon + LON_TO_X_INTERCEPT,
  y: LAT_TO_Y_SLOPE * lat + LAT_TO_Y_INTERCEPT,
});

const JapanTourCard = ({
  title = "JAPAN TOUR",
  dateLabel = "SEPT 17 – 26",
  cities = DEFAULT_CITIES,
  backgroundColor = "#030507",
  landColor = "#6a63c9",
  landOpacity = 0.6,
  arcColor = "#8b7cf6",
  arcOpacity = 0.75,
  className = "",
}) => {
  const projectedCities = useMemo(() => cities.map((c) => ({ ...c, ...project(c.lon, c.lat) })), [cities]);
  const hub = projectedCities.find((c) => c.hub) ?? projectedCities[0];

  const arcs = useMemo(() => {
    if (!hub) return [];
    return projectedCities
      .filter((c) => c.id !== hub.id)
      .map((c) => {
        const mx = (hub.x + c.x) / 2;
        const my = (hub.y + c.y) / 2;
        const dist = Math.hypot(c.x - hub.x, c.y - hub.y);
        const bow = Math.min(dist * 0.32, 70);
        return `M${hub.x.toFixed(1)},${hub.y.toFixed(1)} Q${mx.toFixed(1)},${(my - bow).toFixed(1)} ${c.x.toFixed(1)},${c.y.toFixed(1)}`;
      });
  }, [hub, projectedCities]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ backgroundColor }}>
      <svg
        viewBox="0 0 600 1000"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        className="block h-full w-full"
      >
        <rect x={0} y={0} width={600} height={1000} fill={backgroundColor} />

        <g transform={`translate(${MAP_TRANSLATE_X},${MAP_TRANSLATE_Y}) scale(${MAP_SCALE})`}>
          <g fill="none" stroke={landColor} strokeOpacity={landOpacity} strokeWidth={1} strokeLinejoin="round">
            {JAPAN_MAP_PATHS.map((d, i) => (
              <path key={`land-${i}`} d={d} />
            ))}
          </g>

          <g fill="none" stroke={arcColor} strokeOpacity={arcOpacity} strokeWidth={1.8}>
            {arcs.map((d, i) => (
              <path key={`arc-${i}`} d={d} />
            ))}
          </g>

          {projectedCities.map((c) => {
            const preset = COLOR_PRESETS[c.color] ?? COLOR_PRESETS.lilac;
            const size = c.size ?? 28;
            return (
              <g key={c.id} transform={`translate(${c.x - size / 2},${c.y - size / 2})`}>
                <foreignObject width={size} height={size} style={{ overflow: "visible" }}>
                  <StarIcon size={size} showBackground={false} {...preset} />
                </foreignObject>
              </g>
            );
          })}
        </g>
      </svg>

      <WarpedGrid
        className="pointer-events-none absolute inset-0 h-full w-full"
        gradientFrom="#9A93F8"
        gradientTo="#533cab"
        strokeOpacity={0.18}
        strokeWidth={1.1}
      />

      <div className="pointer-events-none absolute left-0 top-0 p-5">
        <h3 className="m-0 text-xl font-bold uppercase leading-tight tracking-[0.04em] text-dod-lilac">{title}</h3>
        <p className="m-0 mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-dod-lilac/80">{dateLabel}</p>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 p-5">
        {cities.map((c) => (
          <p key={c.id} className="m-0 text-xs font-semibold uppercase leading-relaxed tracking-[0.12em] text-dod-lilac">
            {c.label}
          </p>
        ))}
      </div>

      <div className="pointer-events-none absolute bottom-0 right-0 flex items-center justify-center rounded-full border border-dod-lilac/50 p-2 m-5">
        <GlobeIcon size={20} className="text-dod-lilac" />
      </div>
    </div>
  );
};

export default JapanTourCard;
