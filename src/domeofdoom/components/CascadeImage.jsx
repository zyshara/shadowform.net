// src/domeofdoom/components/CascadeImage.jsx
import { useState, useEffect } from "react";

// Reveals an <img> only once it's both loaded (a real `load` event, not a
// fixed timer — network images have real, variable load times) AND its
// scheduled index-based slot has arrived. The schedule enforces a
// deterministic top-left-to-bottom-right reveal order across a grid
// (index order matches a row-major CSS grid's layout) as a floor: a
// fast-loading image still waits its turn, while a slow one just reveals
// late instead of popping in out of order. Expects the shared
// `.disco-grid-img` / `.disco-grid-img.loaded` opacity rules from
// index.css — any consumer using this must have that stylesheet loaded.
const CascadeImage = ({ src, alt, index = 0, className = "", style, staggerMs = 22, maxDelayMs = 650 }) => {
  const [loaded, setLoaded] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  useEffect(() => {
    const delay = Math.min(index * staggerMs, maxDelayMs);
    const t = setTimeout(() => setScheduled(true), delay);
    return () => clearTimeout(t);
  }, [index, staggerMs, maxDelayMs]);

  const revealed = loaded && scheduled;

  return (
    <img
      src={src}
      alt={alt}
      className={`disco-grid-img${revealed ? " loaded" : ""}${className ? ` ${className}` : ""}`}
      onLoad={() => setLoaded(true)}
      style={style}
    />
  );
};

export default CascadeImage;
