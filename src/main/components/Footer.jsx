// src/main/components/Footer.jsx

import { NavLink, useLocation } from "react-router-dom";
import navlinks from "@/data/navlinks";
import kofi from "@shared/assets/icons/kofi.png";
import instagram from "@shared/assets/icons/instagram.png";
import steam from "@shared/assets/icons/steam.png";

const Footer = () => {
  const location = useLocation();
  const currentIndex = navlinks.findIndex((n) => location.pathname === n.url);
  const prev = navlinks[currentIndex - 1] ?? null;
  const next = navlinks[currentIndex + 1] ?? null;

  return (
    <footer
      className="px-7 py-[15.5px] flex items-center justify-between shrink-0 border-t"
      style={{
        background: "var(--bg-footer)",
        borderColor: "var(--border-footer)",
      }}
    >
      {/* prev */}
      <div
        className="font-alkhemikal text-[10px] tracking-[0.12em] uppercase min-w-[80px]"
        style={{ color: "var(--text-footer)" }}
      >
        {prev ? (
          <NavLink
            to={prev.url}
            className="transition-colors"
            style={{ color: "var(--text-footer)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-footer-accent)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-footer)"}
          >
            &lt; <span style={{ color: "var(--text-footer-accent)" }}>{prev.text}</span>
          </NavLink>
        ) : (
          <span className="opacity-0">·</span>
        )}
      </div>

      {/* social icons */}
      <div className="flex items-center gap-3">
        <a href="https://ko-fi.com/zyshara" target="_blank" rel="noreferrer" className="opacity-25 hover:opacity-50 transition-opacity">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--text-heading)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3.5h13.5a1.5 1.5 0 0 1 1.5 1.5v10.5a5.5 5.5 0 0 1-5.5 5.5H7.5A5.5 5.5 0 0 1 2 15.5V5a1.5 1.5 0 0 1 1-1.5z"/>
            <path d="M18 7h2a3 3 0 0 1 0 6h-2"/>
            <g fill="var(--text-heading)" stroke="none" transform="translate(10, 12.5)">
              <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35"/>
              <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35" transform="rotate(60)"/>
              <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35" transform="rotate(120)"/>
              <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35" transform="rotate(180)"/>
              <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35" transform="rotate(240)"/>
              <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35" transform="rotate(300)"/>
              <circle cx="0" cy="0" r="0.75"/>
            </g>
          </svg>
        </a>
        <span className="text-[10px]" style={{ color: "var(--text-separator)" }}>|</span>
        <a href="https://instagram.com/zyshara" target="_blank" rel="noreferrer" className="opacity-25 hover:opacity-50 transition-opacity">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--text-heading)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="5"/>
            <circle cx="17.5" cy="6.5" r="1.2" fill="var(--text-heading)" stroke="none"/>
            <g fill="var(--text-heading)" stroke="none" transform="translate(12, 12.5)">
              <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35"/>
              <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35" transform="rotate(60)"/>
              <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35" transform="rotate(120)"/>
              <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35" transform="rotate(180)"/>
              <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35" transform="rotate(240)"/>
              <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35" transform="rotate(300)"/>
              <circle cx="0" cy="0" r="0.75"/>
            </g>
          </svg>
        </a>
        <span className="text-[10px]" style={{ color: "var(--text-separator)" }}>|</span>
        <a href="https://steamcommunity.com/id/zyshara" target="_blank" rel="noreferrer" className="opacity-25 hover:opacity-50 transition-opacity">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--text-heading)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M15.5 7.5 L8.5 14.5" stroke-width="3.2" stroke-linecap="round"></path>
            <circle cx="7.5" cy="15.8" r="2.4"></circle>
            <circle cx="7.5" cy="15.8" r="1.0" fill="var(--text-heading)" stroke="none"></circle>
            <circle cx="15.8" cy="7.8" r="3.8"></circle>
            <g fill="var(--text-heading)" stroke="none" transform="translate(15.8, 7.8)">
              <ellipse cx="0" cy="-1.85" rx="0.76" ry="1.12"></ellipse>
              <ellipse cx="0" cy="-1.85" rx="0.76" ry="1.12" transform="rotate(60)"></ellipse>
              <ellipse cx="0" cy="-1.85" rx="0.76" ry="1.12" transform="rotate(120)"></ellipse>
              <ellipse cx="0" cy="-1.85" rx="0.76" ry="1.12" transform="rotate(180)"></ellipse>
              <ellipse cx="0" cy="-1.85" rx="0.76" ry="1.12" transform="rotate(240)"></ellipse>
              <ellipse cx="0" cy="-1.85" rx="0.76" ry="1.12" transform="rotate(300)"></ellipse>
              <circle cx="0" cy="0" r="0.64"></circle>
            </g>
          </svg>
        </a>
      </div>

      {/* next */}
      <div
        className="font-alkhemikal text-[10px] tracking-[0.12em] uppercase min-w-[80px] text-right"
        style={{ color: "var(--text-footer)" }}
      >
        {next ? (
          <NavLink
            to={next.url}
            className="transition-colors"
            style={{ color: "var(--text-footer)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-footer-accent)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-footer)"}
          >
            <span style={{ color: "var(--text-footer-accent)" }}>{next.text}</span> &gt;
          </NavLink>
        ) : (
          <span className="opacity-0">·</span>
        )}
      </div>
    </footer>
  );
};

export default Footer;
