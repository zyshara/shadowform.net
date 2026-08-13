// src/domeofdoom/components/GridDome.jsx

import React, { useMemo } from "react";
import StarIcon from "./StarIcon";

// Ported from a Claude Design project ("Geodesic dome with sloped
// ground", GridDome.jsx) - a geodesic wireframe dome (meridians,
// latitudes, lattice cross-bracing, sparkle nodes) on a flat
// background, rendered as a single SVG. `width` is the dome's
// half-width in SVG units (try 120-380); `perspective` scales how
// tall/flat the dome reads (negative values flip it, per the original
// slider's -1.8 to 1.8 range).
//
// buildDome() still computes groundPath/groundLines/stars (unused
// below) - kept as-is to match the design source 1:1 in case a future
// design update brings the ground/starfield back.

const toRad = (d) => (d * Math.PI) / 180;

// Shared between buildDome() and the star's position below, so moving
// the dome (e.g. lowering the crown to leave more sky above it) can't
// drift the two out of sync.
const CX = 400;
const APEX_Y = 130;

function buildDome(rx0, perspective = 1) {
  const cx = CX, apexY = APEX_Y, domeH = 248, ry0 = 52 * perspective;
  const pt = (phiDeg, thetaDeg) => {
    const phi = toRad(phiDeg), th = toRad(thetaDeg);
    return {
      x: cx + Math.sin(phi) * Math.cos(th) * rx0,
      y: apexY + (1 - Math.cos(phi)) * domeH - Math.sin(phi) * Math.sin(th) * ry0,
      front: Math.max(0, -Math.sin(th)),
    };
  };
  const thetaSteps = 18, thetaInc = 20;
  const latDegs = [18, 32, 46, 60, 72, 84, 90];
  const nodePhis = [0, ...latDegs];

  const taper = (x1, y1, x2, y2, endW, midW, power) => {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const N = 8, top = [], bot = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const x = x1 + dx * t, y = y1 + dy * t;
      const w = (midW + (endW - midW) * Math.pow(Math.abs(2 * t - 1), power)) / 2;
      top.push((x + nx * w).toFixed(1) + "," + (y + ny * w).toFixed(1));
      bot.push((x - nx * w).toFixed(1) + "," + (y - ny * w).toFixed(1));
    }
    bot.reverse();
    return "M" + top.join(" L") + " L" + bot.join(" L") + " Z";
  };

  const meridians = [];
  for (let ti = 0; ti < thetaSteps; ti++) {
    const thetaDeg = ti * thetaInc;
    for (let s = 0; s < nodePhis.length - 1; s++) {
      const a = pt(nodePhis[s], thetaDeg), b = pt(nodePhis[s + 1], thetaDeg);
      const front = (a.front + b.front) / 2;
      const endW = 2.6 + 1.6 * front;
      meridians.push({ d: taper(a.x, a.y, b.x, b.y, endW, endW * 0.32, 2.2), o: (0.22 + 0.5 * front).toFixed(2) });
    }
  }

  const latitudes = [];
  for (const phiDeg of latDegs) {
    const isRim = phiDeg === 90;
    for (let ti = 0; ti < thetaSteps; ti++) {
      const t0 = ti * thetaInc, t1 = t0 + thetaInc;
      const a = pt(phiDeg, t0), b = pt(phiDeg, t1);
      const front = (a.front + b.front) / 2;
      const endW = (isRim ? 3.4 : 2.4) + 1.6 * front;
      latitudes.push({ d: taper(a.x, a.y, b.x, b.y, endW, endW * (isRim ? 0.45 : 0.32), 2.2), o: (isRim ? 0.35 : 0.18) + 0.5 * front });
    }
  }

  const sparkle = (x, y, ry) => {
    const rx = ry * 0.6;
    const innerX = rx * 0.28, innerY = ry * 0.28;
    return `M${x.toFixed(1)},${(y - ry).toFixed(1)} `
      + `Q${(x + innerX).toFixed(1)},${(y - innerY).toFixed(1)} ${(x + rx).toFixed(1)},${y.toFixed(1)} `
      + `Q${(x + innerX).toFixed(1)},${(y + innerY).toFixed(1)} ${x.toFixed(1)},${(y + ry).toFixed(1)} `
      + `Q${(x - innerX).toFixed(1)},${(y + innerY).toFixed(1)} ${(x - rx).toFixed(1)},${y.toFixed(1)} `
      + `Q${(x - innerX).toFixed(1)},${(y - innerY).toFixed(1)} ${x.toFixed(1)},${(y - ry).toFixed(1)} Z`;
  };

  const diamonds = [];
  for (const phiDeg of latDegs) {
    if (phiDeg === 90) continue;
    for (let ti = 0; ti < thetaSteps; ti++) {
      const q = pt(phiDeg, ti * thetaInc);
      const size = 2.8 + (phiDeg / 90) * 2.8;
      diamonds.push({ d: sparkle(q.x, q.y, size), o: (0.35 + 0.55 * q.front).toFixed(2) });
    }
  }

  const lattice = [];
  for (let s = 0; s < latDegs.length - 1; s++) {
    const inner = latDegs[s], outer = latDegs[s + 1];
    for (let ti = 0; ti < thetaSteps; ti++) {
      const t0 = ti * thetaInc, t1 = t0 + thetaInc;
      const a = pt(inner, t0), b = pt(inner, t1), c = pt(outer, t0), d = pt(outer, t1);
      const front = (a.front + b.front + c.front + d.front) / 4;
      const endW = 2 + 1.2 * front;
      lattice.push({
        d: taper(a.x, a.y, d.x, d.y, endW, endW * 0.3, 2.2) + " " + taper(b.x, b.y, c.x, c.y, endW, endW * 0.3, 2.2),
        o: (0.14 + 0.4 * front).toFixed(2),
      });
    }
  }

  const baseY = apexY + domeH;
  const spread = Math.max(rx0 + 40, 260);
  const groundPath = `M0,480 L0,${baseY - 6} Q${cx - spread},${baseY - 60} ${cx},${baseY - 20} Q${cx + spread},${baseY - 60} 800,${baseY - 6} L800,480 Z`;
  const groundLines = [0, 1, 2].map((i) => {
    const off = 40 + i * 55;
    return {
      d: `M0,${baseY - 6 + off} Q${cx - spread},${baseY - 60 + off * 0.5} ${cx},${baseY - 20 + off * 0.35} Q${cx + spread},${baseY - 60 + off * 0.5} 800,${baseY - 6 + off}`,
      o: (0.18 - i * 0.04).toFixed(2),
    };
  });

  const stars = [];
  for (let i = 0; i < 60; i++) {
    const x = (i * 137.5) % 800;
    const y = (i * 71.3) % 200;
    stars.push({ x: x.toFixed(1), y: y.toFixed(1), r: (0.5 + (i % 5) * 0.15).toFixed(2), o: (0.25 + (i % 4) * 0.15).toFixed(2) });
  }

  return { meridians, latitudes, diamonds, lattice, groundPath, groundLines, stars };
}

// width: dome half-width in SVG units (default 250). Try 120-380.
const GridDome = ({
  width = 250,
  perspective = 1,
  style,

  // A StarIcon sitting behind the dome's crown, like a sun/star rising
  // behind it - drawn after the background but before the mesh, so
  // the mesh paints over its lower half. cx/apexY below match
  // buildDome()'s own (fixed, width-independent) crown position.
  showStar = true,
  starSize = 160,
  starGradientFrom = "#6a4fe0",
  starGradientTo = "#a599f9",
  starGlowColor = "#8b7cf6",
}) => {
  const { meridians, latitudes, diamonds, lattice } = useMemo(
    () => buildDome(width, perspective),
    [width, perspective]
  );

  const cx = CX;
  const apexY = APEX_Y;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", ...style }}>
      <svg viewBox="0 0 800 480" width="100%" height="100%" style={{ display: "block", maxWidth: 1100 }}>
        <defs />

        {showStar && (
          <g transform={`translate(${cx - starSize / 2},${apexY - starSize / 2})`}>
            <StarIcon
              size={starSize}
              gradientFrom={starGradientFrom}
              gradientTo={starGradientTo}
              glowColor={starGlowColor}
              showGlow
              showBackground={false}
            />
          </g>
        )}

        {latitudes.map((lat, i) => (
          <path key={i} d={lat.d} fill="#6a5cf0" opacity={lat.o} />
        ))}
        {meridians.map((mer, i) => (
          <path key={i} d={mer.d} fill="#6a5cf0" opacity={mer.o} />
        ))}
        {lattice.map((lt, i) => (
          <path key={i} d={lt.d} fill="#5b4fd6" opacity={lt.o} />
        ))}
        {diamonds.map((dm, i) => (
          <path key={i} d={dm.d} fill="#9d8fff" opacity={dm.o} />
        ))}
      </svg>
    </div>
  );
};

export default GridDome;
