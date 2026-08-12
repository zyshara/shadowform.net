// src/domeofdoom/components/VinylRecord.jsx
//
// Album sleeve standing upright, turned slightly on its vertical axis
// (rotateY) rather than tilted top-down like TiltedCover (rotateX+rotateZ)
// - same real CSS 3D box technique (front face + a hinged edge face), just
// a different axis, plus a vinyl disc peeking out from behind the spine.
// Self-contained (markup + CSS in one file, via a <style> tag) per request.
//
// --vr-depth is expressed in `cqw` (container query width units, enabled by
// `container-type: inline-size` on .vinyl-record below) rather than a fixed
// px value. translateZ requires a real length (a bare % is invalid there
// and gets silently dropped), but a fixed px depth doesn't scale - it looks
// right at whatever size it was tuned against and swings proportionally
// too far at any smaller size, which is what was actually causing the
// sleeve/disc to blow past this component's own box rather than just the
// disc's intentional peek. cqw is a real length AND stays proportional to
// however big this component is actually rendered, so the composition
// holds together at any card size without a callsite-side transform:scale
// hack. The front face is also sized to 80%/92% (not a full 100% inset)
// so there's genuine room in the box for the disc's peek, rather than
// relying on a razor-thin overflow tolerance.
import React from "react";

const VinylRecord = ({ artwork }) => (
  <>
    <style>{`
      .vinyl-record {
        --vr-depth: 5cqw;
        container-type: inline-size;
        position: relative;
        width: 100%;
        aspect-ratio: 1;
        perspective: 1600px;
      }
      .vinyl-record-rotor {
        position: relative;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        transform: rotateX(-20deg) rotateY(-27deg);
        transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
      }

      /* Disc - sits behind the sleeve, pushed back in Z and offset right so
         most of it hides behind the front/spine faces, with a crescent
         showing past the sleeve's own (already-inset) edge. Sized to stay
         within the scene's own box at rest, matching the front face's
         inset so the whole composition never exceeds .vinyl-record. */
      .vinyl-record-disc {
        position: absolute;
        width: 92%;
        height: 92%;
        top: 4%;
        right: 0%;
        transform: translateZ(calc(var(--vr-depth) * -1.2));
        border-radius: 50%;
        background:
          repeating-radial-gradient(
            circle at center,
            #151515 0px,
            #151515 2px,
            #050505 2px,
            #050505 4px
          );
        box-shadow:
          0 14px 30px rgba(0, 0, 0, 0.6),
          inset 0 0 0 1px rgba(255, 255, 255, 0.06);
      }
      .vinyl-record-disc::before {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        width: 34%;
        height: 34%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: radial-gradient(
          circle,
          #b9bcbe 0 6%,
          #6b6e70 7% 12%,
          #a7aaac 13% 70%,
          #55585a 71% 74%,
          #2c2e30 75%
        );
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.4);
      }
      .vinyl-record-disc::after {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        width: 4%;
        height: 4%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: #050505;
      }

      /* Front cover face - deliberately not a full inset:0, see file
         header: leaves room on the right/top/bottom for the disc and
         spine within .vinyl-record's own box. */
      .vinyl-record-front {
        position: absolute;
        top: 4%;
        left: 0;
        width: 80%;
        height: 92%;
        overflow: hidden;
        background: #d8d8d8;
        transform: translateZ(0);
        box-shadow: 0 18px 34px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(0, 0, 0, 0.4);
      }
      .vinyl-record-front img:first-child {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      /* Spine - the sleeve's thin right edge, hinged from the front face's
         right side (same technique as TiltedCover's left/bottom faces,
         mirrored to the right since this rotates on Y, not X+Z). */
      .vinyl-record-spine {
        position: absolute;
        top: 4%;
        left: 80%;
        width: var(--vr-depth);
        height: 92%;
        transform-origin: left center;
        transform: rotateY(90deg);
        background: linear-gradient(to right, #26262a, #08090a);
      }

      /* Top spine - same hinge technique as the right spine, but off the
         front face's top edge (TiltedCover's bottom-face pattern,
         mirrored) so the extra rotateX on the rotor reveals a sliver of
         the sleeve's top thickness too, not just the right edge. */
      .vinyl-record-top {
        position: absolute;
        top: calc(4% - var(--vr-depth));
        left: 0;
        width: 80%;
        height: var(--vr-depth);
        transform-origin: bottom center;
        transform: rotateX(90deg);
        background: linear-gradient(to bottom, #2c2c30, #0a0a0c);
      }
    `}</style>

    <div className="vinyl-record">
      <div className="vinyl-record-rotor">
        <div className="vinyl-record-disc" />
        <div className="vinyl-record-front">
          {artwork && <img src={artwork} alt="" />}
        </div>
        <div className="vinyl-record-spine" />
        <div className="vinyl-record-top" />
      </div>
    </div>
  </>
);

export default VinylRecord;
