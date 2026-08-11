// src/domeofdoom/components/VinylRecord.jsx
//
// A record sleeve with the vinyl disc peeking out from behind it - on hover
// the disc slides further out and spins (see .vinyl-record-* in index.css).
// Deliberately a flat, un-tilted 2D component - CatalogItem.jsx applies its
// own rotate/skew wrapper around this to angle it isometrically within the
// format grid, keeping that page-specific staging out of the reusable piece.
import React from "react";

const VinylRecord = ({ artworkUrl, title, className = "" }) => (
  <div className={`vinyl-record ${className}`}>
    <div className="vinyl-record-disc">
      <div className="vinyl-record-label">
        {artworkUrl && <img src={artworkUrl} alt="" />}
      </div>
    </div>
    <div className="vinyl-record-sleeve">
      {artworkUrl && <img src={artworkUrl} alt={title} />}
    </div>
  </div>
);

export default VinylRecord;
