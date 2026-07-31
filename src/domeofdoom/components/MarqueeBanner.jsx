import React from "react";
import { colors } from "@/tokens";

const ITEM = " 15 YEARS OF DOME OF DOOM · EST. 2011 ";
const REPEAT = 10;
const FLOWER_URL = "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785467660/flower_filgree_iconography_b5cbd61913.png";

const grainSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/></filter><rect width="256" height="256" filter="url(#n)"/></svg>`;
const grainUrl = `url("data:image/svg+xml,${encodeURIComponent(grainSvg)}")`;

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
            className="mx-2 mb-[1px]"
            style={{ display: "inline-block", height: "0.9em", width: "auto", verticalAlign: "middle", opacity: 0.9 }}
          />
        </React.Fragment>
      ))}
    </>
  );
}

const MarqueeBanner = () => (
  <div
    className="relative overflow-hidden whitespace-nowrap border-b-2 py-[9px]"
    style={{ background: "rgb(13,11,10)", color: colors.accent, borderColor: colors.accent }}
  >
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        backgroundImage: grainUrl,
        backgroundRepeat: "repeat",
        backgroundSize: "256px 256px",
        mixBlendMode: "hard-light",
        opacity: 0.18,
        pointerEvents: "none",
      }}
    />
    <div className="inline-block animate-marquee text-[14px] font-extrabold tracking-[0.06em]" style={{ fontFamily: "Archivo, sans-serif", fontStretch: "expanded", fontVariationSettings: "'wdth' 125" }}>
      <span className="px-6"><MarqueeContent /></span>
      <span className="px-6" aria-hidden="true"><MarqueeContent /></span>
    </div>
  </div>
);

export default MarqueeBanner;
