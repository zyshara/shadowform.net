// src/domeofdoom/components/WormholeGrid.jsx

import React, { useId, useMemo } from "react";

// Ported from a Claude Design playground ("WormholeGrid") - a procedural
// funnel-grid SVG: concentric rings + radial spokes receding into a throat,
// under a radial gradient. Same conventions as WarpedGrid/GridDome (useId
// per-instance gradient ids, useMemo'd geometry, per-element opacity
// falloff). `solid` (default true) renders the mesh as opaque, depth-sorted
// quads so the near rim properly occludes the far throat, instead of plain
// stroked lines; `warpStrength` > 0 layers an feTurbulence/feDisplacementMap
// filter on top for organic distortion; `throatGlowColor`/`Intensity`/
// `Reach` re-stroke the near-throat lines themselves (mix-blend-mode:
// screen) rather than drawing a separate blurred glow shape, so the tint is
// clipped exactly to the line geometry with no bleed into empty space.

const WARP_BASE_FREQUENCY = "0.012 0.02";

function smoothPath(points, closed) {
  const n = points.length;
  if (n < 3) {
    const d0 = `M${points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" L")}`;
    return closed ? `${d0} Z` : d0;
  }
  const at = (i) => {
    if (closed) return points[((i % n) + n) % n];
    if (i < 0) return points[0];
    if (i >= n) return points[n - 1];
    return points[i];
  };
  let d = `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  const segCount = closed ? n : n - 1;
  for (let i = 0; i < segCount; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return closed ? `${d} Z` : d;
}

function buildWormhole({ ringCount, spokeCount, outerR, innerR, perspective, depth, depthPower, gapEase }) {
  const basePoint = (t, theta) => {
    const r = innerR + (outerR - innerR) * Math.pow(1 - t, gapEase);
    const y = -depth * Math.pow(t, depthPower);
    return { x: Math.cos(theta) * r, y: y + Math.sin(theta) * (r * perspective) };
  };

  const grid = [];
  for (let i = 0; i < ringCount; i++) {
    const t = ringCount > 1 ? i / (ringCount - 1) : 0;
    const row = [];
    for (let j = 0; j < spokeCount; j++) {
      const theta = ((j * 360) / spokeCount) * (Math.PI / 180);
      const p = basePoint(t, theta);
      row.push({ x: p.x, y: p.y, t });
    }
    grid.push(row);
  }

  const rings = grid.map((row) => ({ d: smoothPath(row, true), t: row[0].t }));

  const spokes = [];
  for (let j = 0; j < spokeCount; j++) {
    const col = grid.map((row) => row[j]);
    spokes.push(smoothPath(col, false));
  }

  return { rings, spokes };
}

// Same grid as buildWormhole, but as opaque quads (one per ring-segment x
// spoke-segment cell) instead of stroked lines, sorted back-to-front by t
// (throat=1 is always farthest, rim=0 is always nearest - unambiguous and
// monotonic by construction, unlike sorting by screen-y) so the near rim
// properly paints over the far throat, the way a solid surface occludes.
function buildCells({ ringCount, spokeCount, outerR, innerR, perspective, depth, depthPower, gapEase }) {
  const basePoint = (t, theta) => {
    const r = innerR + (outerR - innerR) * Math.pow(1 - t, gapEase);
    const y = -depth * Math.pow(t, depthPower);
    return { x: Math.cos(theta) * r, y: y + Math.sin(theta) * (r * perspective) };
  };

  const grid = [];
  const ringTs = [];
  for (let i = 0; i < ringCount; i++) {
    const t = ringCount > 1 ? i / (ringCount - 1) : 0;
    ringTs.push(t);
    const row = [];
    for (let j = 0; j <= spokeCount; j++) {
      const theta = (((j % spokeCount) * 360) / spokeCount) * (Math.PI / 180);
      row.push(basePoint(t, theta));
    }
    grid.push(row);
  }

  const cells = [];
  for (let ri = 0; ri < ringCount - 1; ri++) {
    const cellT = (ringTs[ri] + ringTs[ri + 1]) / 2;
    for (let rj = 0; rj < spokeCount; rj++) {
      const a = grid[ri][rj], b = grid[ri][rj + 1], c = grid[ri + 1][rj + 1], d = grid[ri + 1][rj];
      const dStr = `M${a.x.toFixed(2)},${a.y.toFixed(2)} L${b.x.toFixed(2)},${b.y.toFixed(2)} L${c.x.toFixed(2)},${c.y.toFixed(2)} L${d.x.toFixed(2)},${d.y.toFixed(2)} Z`;
      cells.push({ d: dStr, t: cellT });
    }
  }
  cells.sort((p, q) => q.t - p.t);
  return cells;
}

const WormholeGrid = ({
  size = 640,
  scale = 2.5,
  ringCount = 20,
  spokeCount = 44,
  perspective = 0.47,
  gapEase = 3.5,
  depth = 378,
  tiltDeg = 180,
  strokeWidth = 0.4,
  strokeOpacity = 0.69,
  warpStrength = 0,

  colorOuter = "#5b4fd6",
  colorMid = "#8b7cf6",
  colorInner = "#a599f9",

  // Tints the mesh's own stroke near the throat (mix-blend-mode: screen) -
  // throatGlowReach is the fraction of the depth (0-1, measured back from
  // the vanishing point) that gets tinted. This is drawn as a second pass
  // over the SAME line/cell geometry, not a separate blurred shape, so it's
  // clipped to the lines themselves with no halo bleeding into empty space.
  throatGlowColor = "#9A93F8",
  throatGlowIntensity = 0.7,
  throatGlowReach = 0.3,
  throatGlowSpread = 1,

  solid = true,
  showGlow = true,
  showStars = false,
  showStar = false,

  backgroundColor = "#050308",
  showBackground = true,
  preserveAspectRatio = "xMidYMid meet",
  className = "",
}) => {
  const uid = useId();
  const gradientId = `wormhole-grid-${uid}`;
  const turbulenceId = `wormhole-turbulence-${uid}`;
  const lineGlowId = `wormhole-line-glow-${uid}`;
  const starGlowId = `wormhole-star-glow-${uid}`;
  const starFillId = `wormhole-star-fill-${uid}`;

  const outerR = size * 0.47;
  const innerR = size * 0.006;
  const vx = size / 2;
  const vy = size / 2;
  const throatY = -depth;
  const throatThreshold = 1 - throatGlowReach;
  const haloWidth = Math.max(strokeWidth * 3 * throatGlowSpread, 0.6);
  const haloOpacity = throatGlowIntensity * 0.4;
  const filterAttr = warpStrength > 0 ? `url(#${turbulenceId})` : undefined;

  const { rings, spokes } = useMemo(
    () => buildWormhole({ ringCount, spokeCount, outerR, innerR, perspective, depth, depthPower: 1.6, gapEase }),
    [ringCount, spokeCount, outerR, innerR, perspective, depth, gapEase]
  );

  const cells = useMemo(() => {
    if (!solid) return [];
    return buildCells({ ringCount, spokeCount, outerR, innerR, perspective, depth, depthPower: 1.6, gapEase });
  }, [solid, ringCount, spokeCount, outerR, innerR, perspective, depth, gapEase]);

  // Each cell/ring's own paint, immediately followed by its glow passes when
  // it qualifies - NOT a separate pass drawn after the whole mesh, which
  // would let a far cell's glow paint over a nearer cell that should be
  // occluding it. Interleaving keeps later (nearer) items correctly on top
  // of earlier (farther) ones, glow or not.
  const glowPasses = (d) => [
    { d, fill: "none", stroke: throatGlowColor, strokeWidth: haloWidth, strokeOpacity: haloOpacity, filter: `url(#${lineGlowId})`, style: { mixBlendMode: "screen" } },
    { d, fill: "none", stroke: throatGlowColor, strokeWidth, strokeOpacity: throatGlowIntensity, filter: undefined, style: { mixBlendMode: "screen" } },
  ];

  const meshItems = useMemo(() => {
    if (!solid) return [];
    const items = [];
    cells.forEach((cell) => {
      items.push({ d: cell.d, fill: backgroundColor, stroke: `url(#${gradientId})`, strokeWidth, strokeOpacity, filter: filterAttr, style: undefined });
      if (showGlow && cell.t >= throatThreshold) items.push(...glowPasses(cell.d));
    });
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solid, cells, showGlow, throatThreshold, strokeWidth, strokeOpacity, throatGlowColor, throatGlowIntensity, haloWidth, haloOpacity, filterAttr, backgroundColor, gradientId, lineGlowId]);

  const wireItems = useMemo(() => {
    if (solid) return [];
    const items = [];
    spokes.forEach((d) => {
      items.push({ d, stroke: `url(#${gradientId})`, strokeWidth, strokeOpacity: strokeOpacity * 0.85, filter: filterAttr, style: undefined });
    });
    rings.forEach((ring) => {
      items.push({ d: ring.d, stroke: `url(#${gradientId})`, strokeWidth, strokeOpacity: strokeOpacity * (0.35 + 0.65 * (1 - ring.t)), filter: filterAttr, style: undefined });
      if (showGlow && ring.t >= throatThreshold) items.push(...glowPasses(ring.d));
    });
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solid, spokes, rings, showGlow, throatThreshold, strokeWidth, strokeOpacity, throatGlowColor, throatGlowIntensity, haloWidth, haloOpacity, filterAttr, gradientId, lineGlowId]);

  const starSize = 110;
  const starCx = size * 0.78;
  const starCy = size * 0.2;

  const stars = useMemo(() => {
    if (!showStars) return [];
    return Array.from({ length: 50 }, (_, i) => ({
      x: (((i * 137.5) % 100) / 100) * size,
      y: (((i * 71.3) % 100) / 100) * size,
      r: 0.4 + (i % 5) * 0.12,
      o: 0.2 + (i % 4) * 0.12,
    }));
  }, [showStars, size]);

  return (
    <svg
      className={className}
      viewBox={`0 0 ${size} ${size}`}
      preserveAspectRatio={preserveAspectRatio}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={gradientId} gradientUnits="userSpaceOnUse" cx={vx} cy={vy + throatY * 0.7} r={outerR * 1.1}>
          <stop offset="0%" stopColor={colorInner} />
          <stop offset="55%" stopColor={colorMid} />
          <stop offset="100%" stopColor={colorOuter} />
        </radialGradient>
        {warpStrength > 0 && (
          <filter id={turbulenceId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency={WARP_BASE_FREQUENCY} numOctaves={2} seed={7} result="wgNoise" />
            <feDisplacementMap in="SourceGraphic" in2="wgNoise" scale={warpStrength} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        )}
        {showGlow && (
          <filter id={lineGlowId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation={Math.max(strokeWidth * 1.5 * throatGlowSpread, 0.3)} />
          </filter>
        )}
        {showStar && (
          <>
            <radialGradient id={starGlowId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={colorMid} stopOpacity="0.55" />
              <stop offset="100%" stopColor={colorMid} stopOpacity="0" />
            </radialGradient>
            <linearGradient id={starFillId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0fdfa" />
              <stop offset="100%" stopColor={colorMid} />
            </linearGradient>
          </>
        )}
      </defs>

      {showBackground && <rect x={0} y={0} width={size} height={size} fill={backgroundColor} />}

      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#ffffff" opacity={s.o} />
      ))}

      <g transform={`translate(${vx},${vy}) rotate(${tiltDeg}) scale(${scale})`}>
        {solid
          ? meshItems.map((item, i) => (
              <path
                key={i}
                d={item.d}
                fill={item.fill}
                stroke={item.stroke}
                strokeWidth={item.strokeWidth}
                strokeOpacity={item.strokeOpacity}
                strokeLinejoin="round"
                filter={item.filter}
                style={item.style}
              />
            ))
          : wireItems.map((item, i) => (
              <path
                key={i}
                d={item.d}
                fill="none"
                stroke={item.stroke}
                strokeWidth={item.strokeWidth}
                strokeOpacity={item.strokeOpacity}
                strokeLinecap="round"
                filter={item.filter}
                style={item.style}
              />
            ))}

        <circle cx={0} cy={throatY} r={innerR * 2.4} fill={backgroundColor} />
      </g>

      {showStar && (
        <g transform={`translate(${starCx},${starCy}) scale(${starSize / 200}) translate(-100,-100)`}>
          <circle cx={100} cy={100} r={90} fill={`url(#${starGlowId})`} />
          <path
            d="M100,-25 L112,78 L160,45 L122,92 L180,100 L122,108 L160,155 L112,122 L100,225 L88,122 L40,155 L78,108 L20,100 L78,92 L40,45 L88,78 Z"
            fill={`url(#${starFillId})`}
          />
        </g>
      )}
    </svg>
  );
};

export default WormholeGrid;
