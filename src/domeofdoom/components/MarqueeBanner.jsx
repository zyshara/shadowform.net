import React, { useRef, useState, useLayoutEffect } from "react";
import { colors } from "@/tokens";

const ITEM = " 15 YEARS OF DOME OF DOOM · EST. 2011 ";
const REPEAT = 10;
const FLOWER_URL = "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785467660/flower_filgree_iconography_b5cbd61913.png";

function MarqueeContent() {
  return (
    <>
      {Array.from({ length: REPEAT }, (_, i) => (
        <React.Fragment key={i}>
          {ITEM}
          <img
            src={FLOWER_URL}
            alt=""
            aria-hidden="true"
            width={18}
            height={18}
            className="mx-1 mb-[5px]"
            style={{ display: "inline-block", height: "18px", width: "18px", verticalAlign: "middle", opacity: 0.9 }}
          />
        </React.Fragment>
      ))}
    </>
  );
}

const MarqueeBanner = () => {
  // The classic "duplicate content, translate -50%" loop only looks seamless
  // if both copies render at exactly the same width. Subpixel text-layout
  // drift across ten repeated chunks means they're actually a few px apart,
  // so -50% alone produces a visible jump at every loop reset — measure the
  // first copy's real width instead and drive the animation off that.
  const firstSpanRef = useRef(null);
  const [shift, setShift] = useState(null);

  useLayoutEffect(() => {
    const el = firstSpanRef.current;
    if (!el) return;
    const measure = () => setShift(el.getBoundingClientRect().width);
    measure();
    // The variable Archivo font can still be loading on first paint —
    // ResizeObserver doesn't reliably fire for reflows caused purely by a
    // webfont swap, so re-measure explicitly once fonts are ready too.
    document.fonts?.ready?.then(measure);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="relative overflow-hidden whitespace-nowrap border-b-2 py-[9px]"
      style={{ background: "rgb(13,11,10)", color: colors.accent, borderColor: colors.accent }}
    >
      <div
        className="inline-block animate-marquee text-[14px] font-bold tracking-[0.06em]"
        style={{
          fontFamily: "Archivo, sans-serif",
          fontStretch: "expanded",
          fontVariationSettings: "'wdth' 125",
          willChange: "transform",
          backfaceVisibility: "hidden",
          ...(shift ? { "--marquee-shift": `-${shift}px` } : {}),
        }}
      >
        <span ref={firstSpanRef} className="inline-block px-6"><MarqueeContent /></span>
        <span className="inline-block px-6" aria-hidden="true"><MarqueeContent /></span>
      </div>
    </div>
  );
};

export default MarqueeBanner;
