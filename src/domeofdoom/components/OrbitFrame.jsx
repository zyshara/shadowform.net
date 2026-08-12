// src/domeofdoom/components/OrbitFrame.jsx

import React, { useId } from "react";
import StarIcon from "./StarIcon";

// The front ring's hand-tuned clip wedge, as raw [x%, y%] points, so
// `corner` can reflect/flip them the same way it transforms the
// geometry below instead of needing four hardcoded polygons.
const FRONT_CLIP_POINTS = [
  [0, 10],
  [30, -16],
  [50, 50],
  [-100, 0],
];

const OrbitFrame = ({
  // Ellipse geometry, in the 0-100 viewBox (= the card). Centered well
  // outside the card so only a sliver of it ever dips inside. These
  // are the TOP-LEFT values - pass corner to get any of the other
  // three, rather than hand-deriving mirrored/flipped numbers.
  cx = -60,
  cy = 15,
  rx = 40,
  ry = 26,

  // True 3D tilt (not a 2D rotate()) - applied to both layers identically
  // so their ellipses stay perfectly aligned with each other.
  rotateX = 39,
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
  stars = [20],
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

  const frontClipPath = `polygon(${FRONT_CLIP_POINTS.map(
    ([x, y]) => `${mirrorX ? 100 - x : x}% ${flipY ? 100 - y : y}%`
  ).join(", ")})`;

  /*
   * The billboard/counter-rotation approach (rotate the star by the
   * exact inverse of `tilt`) turned out to not reliably cancel out in
   * practice - it relies on the WHOLE chain (including the
   * <animateMotion> group) staying in one consistent 3D rendering
   * context, and something in that chain (likely animateMotion's SMIL
   * transform, which predates CSS 3D transforms) wasn't composing the
   * way plain matrix algebra predicts, leaving the star rotated
   * almost edge-on.
   *
   * Instead: pre-compute, in plain JS, the 2D shape the tilted ellipse
   * ACTUALLY projects to on screen (same rotateY/rotateX math the
   * browser applies, done by hand here), and animate the star along
   * THAT flat path directly - no 3D transform on the star's own
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

  const SAMPLES = 240;
  const samplePoints = [];
  for (let i = 0; i <= SAMPLES; i++) {
    samplePoints.push(project((i / SAMPLES) * 2 * Math.PI));
  }

  const flatOrbitPath =
    samplePoints
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
      .join(" ") + " Z";

  /*
   * The star used to live inside the ring's masked/clipped groups, so
   * it inherited the SAME hide-the-card-box treatment as the ring -
   * but since the star has real size (unlike the ring's zero-width
   * stroke), that boundary sliced straight through its body instead
   * of hiding it cleanly. Fix: don't mask/clip the star at all - it's
   * its own layer (.orbit-frame__star-layer below), and visibility is
   * handled via the star-z-index keyframes instead of any geometric
   * cut, so it's always drawn as a complete, unsliced star.
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

  return (
    <div className={`orbit-frame ${className}`} aria-hidden="true">
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
        className="orbit-frame__ring orbit-frame__ring--back"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ filter: `drop-shadow(0px 0px 6px ${glowColor})` }}
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
        className="orbit-frame__ring orbit-frame__ring--front"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          clipPath: frontClipPath,
          filter: `drop-shadow(0px 0px 6px ${glowColor})`,
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
          see the comment by starIcon for why. Each travels the same
          flatOrbitPath but starts at its own stagger offset (an even
          split of the loop by star count, via a negative SMIL `begin`
          - the standard trick for spacing multiple copies around one
          shared motion path) so multiple stars don't clump together.
          The z-index keyframes get the matching negative animation-delay
          so each star's front/behind toggle stays in sync with ITS OWN
          position rather than all firing on the same fixed schedule.
          ============================================================ */}

      {stars.map((size, i) => {
        const stagger = -((i / stars.length) * duration);
        return (
          <svg
            key={i}
            className="orbit-frame__star-layer"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
              animationDelay: `${stagger}s`,
              filter: `drop-shadow(0px 0px 6px ${glowColor})`,
            }}
          >
            <g>
              <animateMotion
                calcMode="linear"
                dur={`${duration}s`}
                begin={`${stagger}s`}
                repeatCount="indefinite"
                path={flatOrbitPath}
                rotate="0"
              />
              {starIcon(size)}
            </g>
          </svg>
        );
      })}

      <style>{`
        /*
         * ============================================================
         * ROOT
         * ============================================================
         */

        .orbit-frame {
          position: absolute;
          inset: 0;

          width: 100%;
          height: 100%;

          overflow: visible;
          pointer-events: none;

          /*
           * IMPORTANT:
           *
           * Do NOT give this element a z-index.
           *
           * Its children need to exist at different stacking levels:
           *
           *   back ring  → z-index: 0
           *   card       → z-index: 10
           *   front ring → z-index: 20
           *   star       → z-index: 30
           *
           * The star's own visibility isn't driven by z-index/masking
           * at all though - see the star layer's opacity <animate>.
           */
        }

        /*
         * ============================================================
         * RINGS
         * ============================================================
         */

        .orbit-frame__ring {
          position: absolute;
          inset: 0;

          width: 100%;
          height: 100%;

          overflow: visible;
          pointer-events: none;
          /* filter (drop-shadow using glowColor) is set inline - see style={{ filter: ... }} above. */
        }

        .orbit-frame__ring--back {
          z-index: -1;
        }

        .orbit-frame__ring--front {
          z-index: 20;

          /*
           * clip-path itself is set inline (style={{ clipPath: frontClipPath }}
           * above) instead of here, since it needs to mirror/flip along
           * with the rest of the geometry depending on the corner prop -
           * see FRONT_CLIP_POINTS. Still a hand-tuned wedge; adjust
           * those points to chase the ring's actual position as
           * cx/cy/rx/ry/rotateX/rotateY change.
           */
          overflow: hidden;
        }

        /*
         * ============================================================
         * STAR LAYER
         * ============================================================
         */

        .orbit-frame__star-layer {
          animation: star-z-index 30s linear infinite;

          position: absolute;
          inset: 0;

          width: 100%;
          height: 100%;

          overflow: visible;
          pointer-events: none;

          z-index: -1;
          /* filter (drop-shadow using glowColor) is set inline - see style={{ filter: ... }} above. */
        }

        @keyframes star-z-index {
          0% {
            z-index: -1;
          }
          20% {
            z-index: -1;
          }
          21% {
            z-index: 29;
          }
          70% {
            z-index: 29; 
          }
          71% {
            z-index: -1; 
          }
          100% {
            z-index: -1;
          }
        }
      `}</style>
    </div>
  );
};

export default OrbitFrame;
