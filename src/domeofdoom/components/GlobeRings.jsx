// src/domeofdoom/components/GlobeRings.jsx

import React, { useId, useMemo } from "react";

const toRad = (deg) => (deg * Math.PI) / 180;

// Generalizes the hand-authored globe GlobeSlideButton.jsx keeps privately
// (a circle + a few fixed ellipses) into plain formulas driven by counts:
// meridianCount vertical ellipses (rx tapers from 0 to `radius` - the last
// one always lands at rx===radius, i.e. the sphere's own silhouette, so no
// separate outline circle is needed) and parallelCount latitude ellipses
// per hemisphere (including the equator), each foreshortened by `tilt`
// (ry/rx) to read as a tilted sphere instead of a flat target.
function buildGlobeLines(radius, meridianCount, parallelCount, tilt) {
  const meridians = [];
  for (let k = 0; k < meridianCount; k++) {
    const angle = toRad(((k + 1) / meridianCount) * 90);
    meridians.push({ rx: radius * Math.sin(angle), ry: radius });
  }

  const parallels = [];
  for (let i = 0; i < parallelCount; i++) {
    const angle = toRad((i / parallelCount) * 90);
    const rx = radius * Math.cos(angle);
    const ry = rx * tilt;
    const cy = radius * Math.sin(angle);
    parallels.push({ cy, rx, ry });
    if (i > 0) parallels.push({ cy: -cy, rx, ry });
  }

  return { meridians, parallels };
}

const RING_DEFAULTS = {
  angle: 0,
  rx: 100,
  ry: 26,
  colorFrom: "#8b7cf6",
  colorTo: null, // null = same as colorFrom (solid, no gradient def)
  glowColor: "#ffffff",
  glowIntensity: 6,
  thickness: 2,
};

const withRingDefaults = (ring) => {
  const merged = { ...RING_DEFAULTS, ...ring };
  if (!merged.colorTo) merged.colorTo = merged.colorFrom;
  return merged;
};

const DEFAULT_RINGS = [
  { angle: -14, colorFrom: "#8b7cf6" },
  { angle: 20, rx: 106, ry: 22, colorFrom: "#5eead4" },
];

// One shared pair of half-plane clips (x>0 / x<0), reused by every ring
// regardless of its own angle - each ring's ellipse is kept unrotated and
// wrapped in its own `<g transform="rotate(angle)">` instead, so the clip
// is always applied to the ellipse in its own LOCAL (pre-rotation) space,
// then the already-correctly-split half-ellipse is rotated as a rigid
// unit. (An earlier version rotated the ellipse and a separately-rotated
// clip rect independently and relied on both transforms composing the
// same way - clip-path's coordinate space relative to an element's own
// `transform` is one of the genuinely inconsistent corners of the SVG
// spec, and at shallow angles it was visibly cutting rings on the wrong
// line instead of their true major/minor axis.) Same front/back idea
// OrbitFrame.jsx uses for its one hand-tuned card wedge, just rotation-
// order-safe for an arbitrary angle per ring.
const CLIP_REACH = 5000;

// A wireframe sphere (meridian + latitude lines, gradient-capable stroke,
// optional glow, a dark fill behind the mesh so it reads as a solid body)
// with any number of tilted rings threaded through it. Number of rings is
// just `rings.length` - angle/color/glow/thickness are all per-ring.
const GlobeRings = ({
  size = 220,

  // --- the sphere ---
  radius = 70,
  meridianCount = 4,
  parallelCount = 4,
  tilt = 0.22, // ry/rx ratio of the latitude ellipses (3D foreshortening)
  rotation = 0, // 2D lean of the whole sphere (fill + mesh), degrees - left/right tilt
  strokeWidth = 1,
  gradientFrom = "#a599f9",
  gradientTo = "#6a4fe0",
  gradientDirection = "diagonal", // "diagonal" | "vertical" | "horizontal"
  glowColor = "#ffffff",
  glowIntensity = 4,
  showFill = true,
  fillColor = "#0a0812",
  fillOpacity = 0.92,

  // --- rings: one entry per ring, however many you want. Each entry can
  // set any of RING_DEFAULTS' keys (angle, rx, ry, colorFrom, colorTo,
  // glowColor, glowIntensity, thickness) - anything left out falls back
  // to that default.
  rings = DEFAULT_RINGS,

  className = "",
}) => {
  const uid = useId().replace(/:/g, "");
  const strokeId = `globe-rings-stroke-${uid}`;

  const [gx1, gy1, gx2, gy2] =
    gradientDirection === "vertical"
      ? ["0%", "0%", "0%", "100%"]
      : gradientDirection === "horizontal"
      ? ["0%", "0%", "100%", "0%"]
      : ["0%", "0%", "100%", "100%"];

  const { meridians, parallels } = useMemo(
    () => buildGlobeLines(radius, Math.max(1, meridianCount), Math.max(1, parallelCount), tilt),
    [radius, meridianCount, parallelCount, tilt]
  );

  const resolvedRings = useMemo(() => rings.map(withRingDefaults), [rings]);

  const vbHalf = useMemo(() => {
    const ringExtent = resolvedRings.reduce((m, r) => Math.max(m, r.rx, r.ry), 0);
    return Math.ceil(Math.max(radius, ringExtent) * 1.35);
  }, [radius, resolvedRings]);

  const globeGlowFilter = glowIntensity > 0 ? `drop-shadow(0px 0px ${glowIntensity}px ${glowColor})` : undefined;

  const ringEllipse = (ring, i, pass) => {
    const stroke = ring.colorFrom === ring.colorTo ? ring.colorFrom : `url(#${strokeId}-ring-${i})`;
    const glow = ring.glowIntensity > 0 ? `drop-shadow(0px 0px ${ring.glowIntensity}px ${ring.glowColor})` : undefined;
    return (
      <g key={`${pass}-${i}`} transform={`rotate(${ring.angle})`}>
        <ellipse
          cx={0}
          cy={0}
          rx={ring.rx}
          ry={ring.ry}
          fill="none"
          stroke={stroke}
          strokeWidth={ring.thickness}
          clipPath={`url(#${strokeId}-${pass})`}
          style={{ filter: glow }}
        />
      </g>
    );
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-vbHalf} ${-vbHalf} ${vbHalf * 2} ${vbHalf * 2}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={strokeId} x1={gx1} y1={gy1} x2={gx2} y2={gy2}>
          <stop offset="0%" stopColor={gradientFrom} />
          <stop offset="100%" stopColor={gradientTo} />
        </linearGradient>
        {/* Shared, unrotated half-plane clips - see the CLIP_REACH comment
            above for why these stay fixed while the rings rotate instead
            of the other way around. */}
        <clipPath id={`${strokeId}-front`}>
          <rect x={0} y={-CLIP_REACH} width={CLIP_REACH} height={CLIP_REACH * 2} />
        </clipPath>
        <clipPath id={`${strokeId}-back`}>
          <rect x={-CLIP_REACH} y={-CLIP_REACH} width={CLIP_REACH} height={CLIP_REACH * 2} />
        </clipPath>
        {resolvedRings.map(
          (ring, i) =>
            ring.colorFrom !== ring.colorTo && (
              <linearGradient key={i} id={`${strokeId}-ring-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={ring.colorFrom} />
                <stop offset="100%" stopColor={ring.colorTo} />
              </linearGradient>
            )
        )}
      </defs>

      {/* Ring BACK halves - under the sphere's fill, so the fill occludes
          whatever part of each ring should read as passing behind it. */}
      {resolvedRings.map((ring, i) => ringEllipse(ring, i, "back"))}

      {/* The sphere itself - fill plus wireframe mesh, rotated together as
          one rigid body so `rotation` reads as leaning the whole globe
          left/right rather than just flattening its latitude lines (that's
          `tilt`, a separate knob). Occludes the ring back-halves. */}
      <g transform={`rotate(${rotation})`}>
        {showFill && <circle cx={0} cy={0} r={radius} fill={fillColor} opacity={fillOpacity} />}
        <g fill="none" stroke={`url(#${strokeId})`} strokeWidth={strokeWidth} style={{ filter: globeGlowFilter }}>
          {meridians.map((m, i) => (
            <ellipse key={`mer-${i}`} cx={0} cy={0} rx={m.rx} ry={m.ry} />
          ))}
          {parallels.map((p, i) => (
            <ellipse key={`par-${i}`} cx={0} cy={p.cy} rx={p.rx} ry={p.ry} />
          ))}
        </g>
      </g>

      {/* Ring FRONT halves - over everything above. */}
      {resolvedRings.map((ring, i) => ringEllipse(ring, i, "front"))}
    </svg>
  );
};

export default GlobeRings;
