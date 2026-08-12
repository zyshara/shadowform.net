// src/domeofdoom/components/CassetteTape.jsx
//
// Clear-plastic cassette jewel case standing upright, same rotor transform
// as VinylRecord (rotateX(-20deg) rotateY(-27deg), same --depth-in-cqw
// technique) so the two format cards read as one consistent 3D "shelf" of
// physical media. The "jewel case" read comes from .cassette-tape-case: an
// empty, transparent-background box whose only content is layered outer +
// inset box-shadows (dark outer shadow for depth, bright inset shadows for
// glass-edge highlights) - adapted from a flat 2D CD-jewel-case CSS pen
// (codepen.io/nrjmadan/pen/AXpXoL) into this component's real 3D rotor, so
// it tilts along with the artwork instead of sitting flat. Four small
// .cassette-tape-tab elements along the case's top/bottom edge are the
// case's hinge clips, same technique. --ct-depth is deliberately much
// larger than VinylRecord's - a cassette jewel case reads as a noticeably
// thicker box than a flat vinyl sleeve, not just a photo with a spine.
import React from "react";
import { LOGO_URL } from "@/tokens";

const CassetteTape = ({ artwork }) => (
  <>
    <style>{`
      .cassette-tape {
        --ct-depth: 22cqw;
        container-type: inline-size;
        position: relative;
        width: 100%;
        aspect-ratio: 1;
        perspective: 1600px;
      }
      .cassette-tape-rotor {
        position: relative;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        transform: rotateX(-20deg) rotateY(-27deg);
        transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
      }

      /* Jewel case shell - transparent box, all "glass" read comes from
         these shadows (see file header). Sits behind the artwork in Z and
         slightly larger on every side so it reads as the case the J-card
         is inserted into. */
      .cassette-tape-case {
        position: absolute;
        top: 0;
        left: 7%;
        width: calc(64% + 5px);
        height: 100%;
        border-radius: 2px;
        background: rgba(0, 0, 0, 0);
        box-shadow:
          0 2px 10px 1px rgba(0, 0, 0, 0.6),
          inset 0 0 20px 2px rgba(0, 0, 0, 0.4),
          inset 0 0 5px 1px rgba(255, 255, 255, 0.6),
          inset 0 0 0 1px rgba(255, 255, 255, 0.2);
        transform: translateZ(0);
      }

      /* Front face - the J-card artwork, sitting proud of the case shell
         in Z so it reads as inserted inside the clear plastic. */
      .cassette-tape-front {
        position: absolute;
        top: 4%;
        left: 10%;
        width: calc(58% + 5px);
        height: 92%;
        overflow: hidden;
        background: #d8d8d8;
        transform: translateZ(0);
        box-shadow: 0 18px 34px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(0, 0, 0, 0.4);
      }
      .cassette-tape-front img:first-child {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      /* Right spine - the case's own thickness, hinged off the front
         face's right edge (same technique TiltedCover uses for its
         left/bottom faces). Deep (--ct-depth) so the case reads as a real
         box, not a flat card with a sliver of edge. */
      .cassette-tape-spine {
        position: absolute;
        top: 4%;
        left: calc(68% + 5px);
        width: var(--ct-depth);
        height: 92%;
        transform-origin: left center;
        transform: rotateY(90deg);
        background: linear-gradient(
          to right,
          rgba(255, 255, 255, 0.35),
          rgba(180, 185, 190, 0.5) 40%,
          rgba(20, 22, 24, 0.85)
        );
      }

      /* Top spine - same hinge technique, off the front face's top edge
         (mirrors VinylRecord's top spine so both format cards reveal a
         top edge under the same rotor rotateX). */
      .cassette-tape-top {
        position: absolute;
        top: calc(4% - var(--ct-depth));
        left: 10%;
        width: calc(58% + 5px);
        height: var(--ct-depth);
        transform-origin: bottom center;
        transform: rotateX(90deg);
        background: linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0.4),
          rgba(180, 185, 190, 0.5) 40%,
          rgba(20, 22, 24, 0.85)
        );
      }

      /* Case-shell versions of both visible edges - same transparent +
         layered-shadow "glass" trick as .cassette-tape-case, just hinged
         like .cassette-tape-spine/-top instead of sitting flat, so the
         case's own thickness reads as clear plastic on every visible
         face, not just the front. Sit just past the opaque spine/top so
         both show: opaque edge underneath, glass sheen on top. */
      .cassette-tape-case-right {
        position: absolute;
        top: 0;
        left: calc(71% + 5px);
        width: var(--ct-depth);
        height: 100%;
        transform-origin: left center;
        transform: rotateY(90deg);
        background: rgba(0, 0, 0, 0);
        box-shadow:
          0 2px 10px 1px rgba(0, 0, 0, 0.6),
          inset 0 0 14px 2px rgba(0, 0, 0, 0.4),
          inset 0 0 4px 1px rgba(255, 255, 255, 0.6),
          inset 0 0 0 1px rgba(255, 255, 255, 0.2);
      }
      .cassette-tape-case-top {
        position: absolute;
        top: calc(0% - var(--ct-depth));
        left: 7%;
        width: calc(64% + 5px);
        height: var(--ct-depth);
        transform-origin: bottom center;
        transform: rotateX(90deg);
        background: rgba(0, 0, 0, 0);
        box-shadow:
          0 2px 10px 1px rgba(0, 0, 0, 0.6),
          inset 0 0 14px 2px rgba(0, 0, 0, 0.4),
          inset 0 0 4px 1px rgba(255, 255, 255, 0.6),
          inset 0 0 0 1px rgba(255, 255, 255, 0.2);
      }

      /* Back face - solid/opaque (unlike the clear front), sitting the
         full case depth behind the front so the box reads as fully
         enclosed instead of an open shell when seen from any angle. */
      .cassette-tape-back {
        position: absolute;
        top: 4%;
        left: 10%;
        width: calc(58% + 5px);
        height: 92%;
        background: linear-gradient(155deg, #1c1e21, #0a0b0c 60%);
        transform: translateZ(calc(var(--ct-depth) * -1));
      }
    `}</style>

    <div className="cassette-tape">
      <div className="cassette-tape-rotor">
        <div className="cassette-tape-back" />
        <div className="cassette-tape-case" />
        <div className="cassette-tape-front">
          {artwork && <img src={artwork} alt="" />}
        </div>
        <div className="cassette-tape-spine" />
        <div className="cassette-tape-top" />
        <div className="cassette-tape-case-right" />
        <div className="cassette-tape-case-top" />
      </div>
    </div>
  </>
);

export default CassetteTape;
