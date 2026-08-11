// src/domeofdoom/components/TiltedCover.jsx
//
// CatalogItem hero: the artwork rendered as a real tilted 3D print/box
// rather than a flat image with a drop shadow. Built from three actual CSS
// 3D faces (front/left/bottom, see .tilted-cover-* in index.css) so the
// artist name and catalog number sit on the object's own physical edge,
// like a printed spine - not text overlaid on top of a flat photo.
import React from "react";
import { LOGO_URL } from "@/tokens";

const TiltedCover = ({ artworkUrl, title, artistLabel, catalogNumber, className = "" }) => (
  <div className={`tilted-cover-scene ${className}`}>
    <div className="tilted-cover-rotor">
      <div className="tilted-cover-face tilted-cover-front">
        {artworkUrl && <img src={artworkUrl} alt={title} />}
        <img className="tilted-cover-mark" src={LOGO_URL} alt="" aria-hidden="true" />
      </div>
      <div className="tilted-cover-face tilted-cover-left">
        <span>{artistLabel}</span>
      </div>
      <div className="tilted-cover-face tilted-cover-bottom">
        <span className="tilted-cover-bottom-title">{title}</span>
        {catalogNumber && <span className="tilted-cover-bottom-catno">{catalogNumber}</span>}
      </div>
    </div>
  </div>
);

export default TiltedCover;
