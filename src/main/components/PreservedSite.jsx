// src/main/components/PreservedSite.jsx
// Renders an archived 1920×1080 website scaled to fit its container.
// Measures its own wrapper (width: 100%) so the parent needs no measurement logic.

import { useRef, useState, useLayoutEffect } from "react";

const SITE_W = 1920;
const SITE_H = 1080;

const PreservedSite = ({ src, style = {} }) => {
  const wrapperRef = useRef(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setWidth(w);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale  = width ? width / SITE_W : 0;
  const height = Math.round(SITE_H * scale);

  return (
    <div
      ref={wrapperRef}
      style={{
        position:   "relative",
        width:      "100%",
        height:     scale ? height : 0,
        overflow:   "hidden",
        background: "var(--bg)",
        flexShrink: 0,
        ...style,
      }}
    >
      {scale > 0 && (
        <iframe
          src={src}
          title="preserved site"
          style={{
            position:        "absolute",
            top:             0,
            left:            0,
            width:           SITE_W,
            height:          SITE_H,
            border:          "none",
            transformOrigin: "0 0",
            transform:       `scale(${scale})`,
            display:         "block",
            pointerEvents:   "auto",
          }}
        />
      )}
    </div>
  );
};

export default PreservedSite;
