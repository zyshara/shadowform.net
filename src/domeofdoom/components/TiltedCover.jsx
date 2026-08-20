// src/domeofdoom/components/TiltedCover.jsx
//
// CatalogItem hero: the artwork rendered as a real tilted 3D print/box
// rather than a flat image with a drop shadow. Built from three actual CSS
// 3D faces (front/left/bottom, see .tilted-cover-* in index.css) so text
// sits on the object's own physical edge, like a printed spine - not text
// overlaid on top of a flat photo.
import React from "react";
import { LOGO_URL } from "@/tokens";

// `text` is a mapping keyed by face class name, each value an optional
// {first, middle, last} set of strings - whichever keys are present
// render as separate spans, laid out via that face's own flex
// justify-content:space-between (one key sits at the start, two sit at
// each end, three spread start/center/end). Lets a caller put whatever
// it wants on whichever face without this component knowing what a
// "catalog number" or "artist" is - title/artworkUrl stay as their own
// props since they're used for the front face's actual image, not text.
const TiltedCover = ({ artworkUrl, title, text = {}, className = "" }) => {
  const left = text["tilted-cover-left"] ?? {};
  const bottom = text["tilted-cover-bottom"] ?? {};

  return (
    <div className={`tilted-cover-scene ${className}`}>
      <div className="tilted-cover-rotor">
        <div className="tilted-cover-face tilted-cover-front">
          {artworkUrl && <img src={artworkUrl} alt={title} />}
          <img className="tilted-cover-mark" src={LOGO_URL} alt="" aria-hidden="true" />
        </div>
        <div className="tilted-cover-face tilted-cover-left">
          {left.first && <span>{left.first}</span>}
          {left.middle && <span>{left.middle}</span>}
          {left.last && <span>{left.last}</span>}
        </div>
        <div className="tilted-cover-face tilted-cover-bottom">
          {bottom.first && <span className="tilted-cover-bottom-title">{bottom.first}</span>}
          {bottom.middle && <span>{bottom.middle}</span>}
          {bottom.last && <span className="tilted-cover-bottom-catno">{bottom.last}</span>}
        </div>
      </div>
    </div>
  );
};

export default TiltedCover;
