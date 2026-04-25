// src/main/components/MobileSitePreview.jsx
// Renders a preserved site scaled to a 390×844 mobile viewport,
// fitted to fill its container — mirror of PreservedSite but phone-sized.

import { useRef, useState, useLayoutEffect } from "react";

const MOBILE_W = 390;
const MOBILE_H = 844;

const MobileSitePreview = ({ src, style = {} }) => {
  const wrapperRef = useRef(null);
  const [width, setWidth]   = useState(0);

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

  const scale  = width ? width / MOBILE_W : 0;
  const height = Math.round(MOBILE_H * scale);

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
          title="mobile site preview"
          style={{
            position:        "absolute",
            top:             0,
            left:            0,
            width:           MOBILE_W,
            height:          MOBILE_H,
            border:          "none",
            transformOrigin: "0 0",
            transform:       `scale(${scale})`,
            display:         "block",
          }}
        />
      )}
    </div>
  );
};

export default MobileSitePreview;
