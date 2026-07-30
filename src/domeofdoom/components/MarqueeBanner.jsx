// src/domeofdoom/components/MarqueeBanner.jsx

import { colors } from "@/tokens";

const MarqueeBanner = ({ text = " 15 YEARS OF DOME OF DOOM · EST. 2011 " }) => {
  const repeated = Array(6).fill(text).join("  ✳  ") + "  ✳";

  return (
    <div
      className="overflow-hidden whitespace-nowrap border-b-2 py-[9px]"
      style={{ background: colors.accent, color: colors.bg, borderColor: colors.bg }}
    >
      <div className="inline-block animate-marquee text-[14px] font-extrabold tracking-[0.06em]">
        <span className="px-6">{repeated}</span>
        <span className="px-6" aria-hidden="true">{repeated}</span>
      </div>
    </div>
  );
};

export default MarqueeBanner;
