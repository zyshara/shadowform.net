// src/main/pages/UnderConstruction.jsx

import { useLocation } from "react-router-dom";
import Ornament from "@/components/Ornament";
import Header from "@/components/Header";
import navlinks from "@/data/navlinks";

const UnderConstruction = () => {
  const location = useLocation();
  const current  = navlinks.find((n) => location.pathname === n.url);
  const pageName = current?.text?.toLowerCase() ?? "this page";

  return (
    <div className="flex flex-col min-h-full" style={{ background: "var(--bg)" }}>
      <div className="flex-1 flex flex-col items-center justify-center px-10 py-12 gap-6">
        <Ornament />

        <Header
          align="center"
          size="medium"
          eyebrow={pageName}
          title="under construction"
        >
          <p
            className="font-fell italic text-[14px] leading-[1.85] max-w-[340px]"
            style={{ color: "var(--text-body)" }}
          >
            this page is under construction, come back later!
          </p>
        </Header>

        <svg width="45" viewBox="0 0 100 100" fill="none" stroke="var(--pink-text)" strokeWidth="4" strokeLinejoin="round">
          <path d="M50 8 L94 88 L6 88 Z"/>
          <rect x="46.5" y="32" width="7" height="30" rx="3.5" fill="var(--pink-text)" stroke="none"/>
          <g transform="translate(50, 76) scale(0.52)" fill="#f4a7c3" stroke="none">
            <ellipse cx="0" cy="-0.52" rx="0.22" ry="0.32" transform="scale(18)"/>
            <ellipse cx="0" cy="-0.52" rx="0.22" ry="0.32" transform="scale(18) rotate(60)"/>
            <ellipse cx="0" cy="-0.52" rx="0.22" ry="0.32" transform="scale(18) rotate(120)"/>
            <ellipse cx="0" cy="-0.52" rx="0.22" ry="0.32" transform="scale(18) rotate(180)"/>
            <ellipse cx="0" cy="-0.52" rx="0.22" ry="0.32" transform="scale(18) rotate(240)"/>
            <ellipse cx="0" cy="-0.52" rx="0.22" ry="0.32" transform="scale(18) rotate(300)"/>
            <circle cx="0" cy="0" r="3.5"/>
          </g>
        </svg>

        <Ornament />
      </div>
    </div>
  );
};

export default UnderConstruction;
