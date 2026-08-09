import React, { useRef, useState, useLayoutEffect } from "react";
import { colors, FLOWER_FILIGREE_PURPLE } from "@/tokens";

const ITEM = " 15 YEARS OF DOMEOFDOOM · EST. 2011 ";
const REPEAT = 10;

function MarqueeContent() {
  return (
    <>
      {Array.from({ length: REPEAT }, (_, i) => (
        <React.Fragment key={i}>
          {ITEM}
          <img
            src={FLOWER_FILIGREE_PURPLE}
            alt=""
            aria-hidden="true"
            width={100}
            height={100}
            className="mx-1 mb-[5px] p-[5px]"
            style={{ display: "inline-block", height: "38px", width: "42px", verticalAlign: "middle", opacity: 0.9, background: colors.accent }}
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
      className="relative overflow-hidden whitespace-nowrap border-b-2 h-[40px]"
      style={{ background: colors.accent2, color: colors.accent, borderColor: colors.accent }}
    >
      <div
        className="inline-block animate-marquee text-[14px] font-bold tracking-[0.06em]"
        style={{
          fontFamily: "Archivo, sans-serif",
          fontSize: "18px",
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
