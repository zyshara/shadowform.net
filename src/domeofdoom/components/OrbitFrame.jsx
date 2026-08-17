// src/domeofdoom/components/OrbitFrame.jsx

import React, { useId, useRef, useEffect } from "react";
import StarIcon from "./StarIcon";

// The front ring's hand-tuned clip wedge, as raw [x%, y%] points, so
// `corner` can reflect/flip them the same way it transforms the
// geometry below instead of needing four hardcoded polygons.
const FRONT_CLIP_POINTS = [
  [0, 0],
  [0, 100],
  [100, 0],
];

const BACK_CLIP_POINTS = [
  [0, 0],
  [0, 100],
  [100, 100],
];

const OrbitFrame = ({
  // Ellipse geometry, in the 0-100 viewBox (= the card). Centered well
  // outside the card so only a sliver of it ever dips inside. These
  // are the TOP-LEFT values - pass corner to get any of the other
  // three, rather than hand-deriving mirrored/flipped numbers.
  cx = -290,
  cy = 68,
  rx = 78,
  ry = 78,

  // True 3D tilt (not a 2D rotate()) - applied to both layers identically
  // so their ellipses stay perfectly aligned with each other.
  rotateX = 43,
  rotateY = 251,

  // Which corner to hug - reuses the same top-left cx/cy/rx/ry/
  // rotateX/rotateY numbers above for all four, transformed to match.
  //
  // The rotation pivot (transformOrigin) is the card's own corner
  // (0,0), NOT its center - so mirroring/flipping about the card's
  // center lines (x=50 / y=50) is NOT the same as just negating cx/cy
  // about that pivot. Working it out (for the horizontal case; the
  // vertical case is the same argument with X/Y swapped): reflecting
  // the whole rendered result about x=50 decomposes into reflecting
  // about x=0 (negate cx, negate rotateY - rotateX is untouched, its
  // axis is perpendicular to the flip) FIRST, THEN translating the
  // already-rotated/projected result by +100 - that translate has to
  // happen AFTER rotation, since it's cx (a PRE-rotation offset) that
  // would do the wrong thing if reflected about 50 directly. Verified
  // numerically (exact match, not just close) for all four corners
  // before wiring this in. The front clip wedge is unaffected by any
  // of this - clip-path percentages are already in final screen
  // space, so plain 100-x / 100-y reflections are correct for it.
  corner = "top-left",

  orientation = "front",

  ringColor = "#BFA7FF",
  ringWidth = 2,

  // Color of the drop-shadow glow behind the rings and stars. Separate
  // from ringColor since a glow that matches the ring is flat; a
  // contrasting glow (see ORBIT_COLOR_PAIRS' glow field in Roster.jsx)
  // reads as actual light.
  glowColor = "#9FFFC8",

  // One entry per star (1-3 of them), each just its size - stagger
  // and randomization live in the caller (Roster.jsx), same as every
  // other random-per-artist value; OrbitFrame stays presentational.
  stars = [14],
  starGradientFrom = "#5425A8",
  starGradientTo = "#9FFFC8",

  duration = 30,

  className = "",
}) => {
  const id = useId().replace(/:/g, "");
  const maskId = `orbit-frame-ring-mask-${id}`;

  const mirrorX = corner === "top-right" || corner === "bottom-right";
  const flipY = corner === "bottom-left" || corner === "bottom-right";

  const effectiveCx = mirrorX ? -cx : cx;
  const effectiveCy = flipY ? -cy : cy;
  const effectiveRotateX = flipY ? -rotateX : rotateX;
  const effectiveRotateY = mirrorX ? -rotateY : rotateY;
  const offsetX = mirrorX ? 100 : 0;
  const offsetY = flipY ? 100 : 0;

  const tilt = `rotateY(${effectiveRotateY}deg) rotateX(${effectiveRotateX}deg)`;

  // Same mirrored points that make up frontClipPath below, kept as plain
  // numbers (not a CSS polygon() string) so the star's z-index effect can
  // point-in-polygon test against the exact same wedge the ring uses -
  // see the STAR MOTION + Z-INDEX comment further down for why that has
  // to be the ring's wedge specifically, not just "anywhere inside the
  // card".
  const effectiveFrontWedge = FRONT_CLIP_POINTS.map(([x, y]) => [
    mirrorX ? 100 - x : x,
    flipY ? 100 - y : y,
  ]);

  const frontClipPath = `polygon(${effectiveFrontWedge
    .map(([x, y]) => `${x}% ${y}%`)
    .join(", ")})`;

  const backClipPath = `polygon(${BACK_CLIP_POINTS.map(
    ([x, y]) => `${mirrorX ? 100 - x : x}% ${flipY ? 100 - y : y}%`
  ).join(", ")})`;

  /*
   * The billboard/counter-rotation approach (rotate the star by the
   * exact inverse of `tilt`) turned out to not reliably cancel out in
   * practice - it relies on the WHOLE chain staying in one consistent
   * 3D rendering context, and something in that chain wasn't composing
   * the way plain matrix algebra predicts, leaving the star rotated
   * almost edge-on.
   *
   * Instead: pre-compute, in plain JS, the 2D shape the tilted ellipse
   * ACTUALLY projects to on screen (same rotateY/rotateX math the
   * browser applies, done by hand here) with this project(t) function,
   * and drive the star directly from it every frame (see the STAR
   * MOTION + Z-INDEX effect below) - no 3D transform on the star's own
   * group at all, so there's nothing left that could skew it.
   */
  const X = (effectiveRotateX * Math.PI) / 180;
  const Y = (effectiveRotateY * Math.PI) / 180;
  const cosX = Math.cos(X);
  const sinX = Math.sin(X);
  const cosY = Math.cos(Y);
  const sinY = Math.sin(Y);

  // Same order as the CSS `rotateY(Y) rotateX(X)`: rotateX applies
  // first (to the flat z=0 point), then rotateY - then we drop the
  // resulting z, which is what an unperspective-d 3D transform does.
  const project = (t) => {
    const px = effectiveCx + rx * Math.cos(t);
    const py = effectiveCy + ry * Math.sin(t);
    const py1 = py * cosX; // rotateX
    const pz1 = py * sinX;
    const x2 = px * cosY + pz1 * sinY + offsetX; // rotateY (+ corner's post-rotation offset)
    const y2 = py1 + offsetY;
    return [x2, y2];
  };

  /*
   * ------------------------------------------------------------------
   * STAR MOTION + Z-INDEX (one JS clock drives both, no SMIL)
   * ------------------------------------------------------------------
   *
   * This used to split the work in two: SMIL <animateMotion> drove the
   * star's on-screen position, while a separate mechanism (first a CSS
   * @keyframes animation, then a getBoundingClientRect measurement)
   * decided z-index. Both iterations of the z-index side eventually hit
   * the same root problem - SMIL's timeline runs independently of
   * anything we control, and browsers are free to pause/throttle it for
   * content that's effectively invisible (this component sits at
   * opacity:0 whenever its card isn't hovered). That produced exactly
   * the reported bug: on first hover the star was still wherever SMIL's
   * paused clock had left it, badly out of sync with the fresh z-index
   * read, and only caught up a frame or two later once SMIL resumed.
   *
   * Fix: don't use SMIL for the star at all. Track one shared elapsed-
   * time clock ourselves (performance.now() since mount) and, every
   * rAF tick, compute the star's position with project(t) (the same
   * hand-computed 3D-projection math the ring's geometry uses), then
   * set its <g transform> directly.
   * z-index comes from testing that SAME just-computed point (not a
   * DOM measurement) against effectiveFrontWedge - the front ring's
   * actual visible region, not just "anywhere inside the card" (that
   * was a separate earlier bug - the ring only shows through this small
   * hand-tuned wedge, not the whole card interior). Position and
   * z-index are now two reads of one number for one frame, so there's
   * no separate clock left to fall out of sync with, and nothing to
   * pause independently while invisible.
   */
  const starRefs = useRef([]);
  const startTimeRef = useRef(null);

  // Standard sign-of-area point-in-triangle test (effectiveFrontWedge
  // is always a 3-point polygon).
  const isInFrontWedge = (px, py) => {
    const [[x1, y1], [x2, y2], [x3, y3]] = effectiveFrontWedge;
    const sign = (ax, ay, bx, by, cx2, cy2) =>
      (bx - ax) * (cy2 - ay) - (by - ay) * (cx2 - ax);
    const d1 = sign(x1, y1, x2, y2, px, py);
    const d2 = sign(x2, y2, x3, y3, px, py);
    const d3 = sign(x3, y3, x1, y1, px, py);
    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNeg && hasPos);
  };

  // Evenly spaces multiple stars around the shared loop. Negative -
  // star i's clock should already be `|stagger|` seconds in, matching
  // the old SMIL begin="-Ns" convention this replaces.
  const getStagger = (i) => -((i / stars.length) * duration);

  useEffect(() => {
    /*
     * project(0) - the mathematical start of the loop, t=0 - lands
     * inside the front wedge for this geometry (not by design, just
     * where the ellipse's own parametrization happens to begin). Since
     * every instance's clock starts at elapsedSec≈0 on mount, and star
     * index 0 always has zero stagger, EVERY card's first star began
     * exactly there on page load - invisible while unhovered, but the
     * first thing you'd see the moment you hovered shortly after a
     * reload, which is exactly the reported "starts front, then
     * corrects" - not a timing bug, just every instance sharing the
     * same literal start-of-loop position. Back-dating the clock by a
     * random amount (as if it had already been running before mount)
     * decorrelates each card's phase at any given moment, including
     * right after a fresh load.
     */
    if (startTimeRef.current == null) {
      startTimeRef.current = performance.now() - Math.random() * duration * 1000;
    }
    let rafId;

    // Half the star's own footprint, in the SAME 0-100 units as
    // effectiveFrontWedge/project() - the exact hysteresis the corner-
    // testing fix relied on (front as soon as any part overlaps the
    // wedge, back only once all of it has cleared), just computed
    // directly instead of measured, since position is computed too now.
    const halfSizes = stars.map((size) => size / 2);

    const tick = () => {
      const now = performance.now();

      starRefs.current.forEach((entry, i) => {
        if (!entry?.svgEl || !entry?.gEl) return;

        const stagger = getStagger(i);
        const elapsedSec = (now - startTimeRef.current) / 1000 - stagger;
        const t = ((elapsedSec % duration) / duration) * 2 * Math.PI;
        const [x, y] = project(t);

        entry.gEl.setAttribute("transform", `translate(${x} ${y})`);

        const half = halfSizes[i];
        const corners = [
          [x - half, y - half],
          [x + half, y - half],
          [x - half, y + half],
          [x + half, y + half],
        ];
        const inFront = corners.some(([px, py]) => isInFrontWedge(px, py));

        entry.svgEl.style.zIndex = inFront ? 99 : -1;
      });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [stars, duration]);

  /*
   * The star used to live inside the ring's masked/clipped groups, so
   * it inherited the SAME hide-the-card-box treatment as the ring -
   * but since the star has real size (unlike the ring's zero-width
   * stroke), that boundary sliced straight through its body instead
   * of hiding it cleanly. Fix: don't mask/clip the star at all - it's
   * its own layer (.orbit-frame__star-layer below), and visibility is
   * handled via the measured z-index effect above instead of any
   * geometric cut, so it's always drawn as a complete, unsliced star.
   */
  const starIcon = (size) => (
    <g transform={`translate(${-size / 2},${-size / 2})`}>
      <StarIcon
        size={size}
        gradientFrom={starGradientFrom}
        gradientTo={starGradientTo}
        gradientDirection="diagonal"
        showGlow={false}
        showBackground={false}
      />
    </g>
  );

  const glowFilter = `drop-shadow(0px 0px 6px ${glowColor}) drop-shadow(0px 0px 0px ${glowColor})`;

  return (
    <div className="orbit-frame" aria-hidden="true">
      {/* ============================================================
          BACK RING

          The ellipse is drawn once, tilted in real 3D (rotateY/rotateX
          on a preserve-3d group), then masked so the card's own 0-100
          box is punched out. Because the mask is applied in the OUTER
          svg's flat viewBox space - after the 3D transform has already
          projected the ellipse - it hides whatever the tilted ellipse
          actually lands on, regardless of how the tilt warps its shape.
          That's what makes this layer sit cleanly behind the card.
          ============================================================ */}

      <svg
        className={`orbit-frame__ring orbit-frame__ring--back ${orientation} ${className}`}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ filter: glowFilter }}
      >
        <defs>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
            x="-100"
            y="-100"
            width="300"
            height="300"
          >
            {/* Everything visible... */}
            <rect x="-100" y="-100" width="300" height="300" fill="white" />
            {/* ...except the card itself. */}
            <rect x="0" y="0" width="100" height="100" fill="black" />
          </mask>
        </defs>

        <g mask={`url(#${maskId})`}>
          {/* corner's post-rotation offset (see the corner prop comment
              above) - a plain SVG attribute transform, applied OUTSIDE
              the 3D-transformed group below so it doesn't interfere
              with that group's own preserve-3d chain. */}
          <g transform={`translate(${offsetX} ${offsetY})`}>
            <g
              style={{
                transformOrigin: "0 0",
                transformStyle: "preserve-3d",
                transform: tilt,
              }}
            >
              <ellipse
                cx={effectiveCx}
                cy={effectiveCy}
                rx={rx}
                ry={ry}
                fill="none"
                stroke={ringColor}
                strokeWidth={ringWidth}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          </g>
        </g>
      </svg>

      {/* ============================================================
          FRONT RING

          Same tilted ellipse again, this time clipped down to a small
          wedge that approximates the part of the ring that should sit
          ON TOP of the card. Unlike the back layer's mask (which is
          exact, punching out precisely the card's own box), this clip
          is a hand-tuned polygon - it's the "wonky" part still worth
          refining together if the front sliver doesn't line up.
          ============================================================ */}

      <svg
        className={`orbit-frame__ring orbit-frame__ring--front ${orientation} ${className}`}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          clipPath: orientation === "front" ? frontClipPath : backClipPath,
          filter: glowFilter,
        }}
      >
        <g transform={`translate(${offsetX} ${offsetY})`}>
          <g
            style={{
              transformOrigin: "0 0",
              transformStyle: "preserve-3d",
              transform: tilt,
            }}
          >
            <ellipse
              cx={effectiveCx}
              cy={effectiveCy}
              rx={rx}
              ry={ry}
              fill="none"
              stroke={ringColor}
              strokeWidth={ringWidth}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        </g>
      </svg>

      {/* ============================================================
          STARS

          1-3 of them (however many `stars` has). Deliberately their
          own layer, NOT inside either ring's mask/clip-path above -
          see the comment by starIcon for why. Position AND z-index are
          both driven imperatively by the effect above (one shared
          elapsed-time clock, no SMIL) - the <g ref> below just gets its
          transform attribute set directly every frame, so there's
          nothing to declare here for motion or timing.
          ============================================================ */}

      {stars.map((size, i) => {
        return (
          <svg
            key={i}
            ref={(el) => {
              starRefs.current[i] ??= {};
              starRefs.current[i].svgEl = el;
            }}
            className={`orbit-frame__star-layer ${className}`}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ filter: glowFilter }}
          >
            <g
              ref={(el) => {
                starRefs.current[i] ??= {};
                starRefs.current[i].gEl = el;
              }}
            >
              {starIcon(size)}
            </g>
          </svg>
        );
      })}
    </div>
  );
};

export default OrbitFrame;
