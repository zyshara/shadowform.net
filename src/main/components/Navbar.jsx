// src/main/components/Navbar.jsx
// Design 1 BW — sidebar nav, Alagard font, light pink active accent

import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import cherry_blossom from "@shared/assets/images/cherry_blossom.png";
import navlinks from "@/data/navlinks";

// ── Desktop: vertical sidebar nav ──────────────────────────────────────────
export const DesktopNavbar = () => {
  const location = useLocation();

  return (
    <nav className="flex flex-col items-end w-full">
      {/* flower + vertical site name */}
      <NavLink to="/" className="flex flex-col items-center mb-4">
        <img
          src={cherry_blossom}
          className="w-[40px] mb-3"
          style={{ filter: "drop-shadow(0 0 6px #f4a7c344)" }}
        />
        <div className="[writing-mode:vertical-rl] font-alagard text-[20px] py-5 text-white tracking-[3px]">
          shadowform.net
        </div>
      </NavLink>

      {/* gradient divider */}
      <div className="w-[60%] h-px my-4 bg-gradient-to-r from-transparent via-[#333] to-transparent" />

      {/* nav links */}
      <ol className="flex flex-col items-end w-full px-5 gap-[2px]">
        {navlinks.map((navlink) => {
          const isActive = location.pathname === navlink.url;
          return (
            <li key={navlink.id}>
              <NavLink
                to={navlink.url}
                className={`
                  lowercase font-alagard text-[16px] tracking-[1px] py-1
                  transition-colors duration-150
                  ${isActive
                    ? "text-white border-b border-[#f4a7c344]"
                    : "text-[#888] hover:text-[#ccc]"
                  }
                `}
              >
                {navlink.text}
              </NavLink>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// ── Mobile: top bar with hamburger ─────────────────────────────────────────
export const MobileNavbar = ({ onMenuOpen }) => {
  const location = useLocation();
  const currentPage = navlinks.find((n) => location.pathname === n.url);

  return (
    <nav className="flex lg:hidden flex-col bg-[#0a0a0a] border-b border-[#222]">
      <div className="flex items-center justify-between px-3 py-2">
        {/* logo */}
        <NavLink to="/" className="flex items-center gap-2">
          <img
            src={cherry_blossom}
            className="w-[28px]"
            style={{ filter: "drop-shadow(0 0 4px #f4a7c344)" }}
          />
          <span className="font-alagard text-white text-[13px] tracking-[2px]">
            shadowform
          </span>
        </NavLink>

        {/* current page indicator + hamburger */}
        <div className="flex items-center gap-3">
          {currentPage && (
            <span className="font-alkhemikal text-[9px] text-[#f4a7c3] tracking-[0.12em] uppercase">
              {currentPage.text}
            </span>
          )}
          <button
            onClick={onMenuOpen}
            className="flex flex-col gap-[4px] cursor-pointer p-1"
            aria-label="open menu"
          >
            <span className="block w-[18px] h-px bg-[#888]" />
            <span className="block w-[18px] h-px bg-[#888]" />
            <span className="block w-[18px] h-px bg-[#888]" />
          </button>
        </div>
      </div>

      {/* marquee ticker showing current page */}
      <div className="overflow-hidden whitespace-nowrap bg-[#0d0d0d] border-t border-[#1e1e1e] py-[5px]">
        <span
          className="inline-block font-alkhemikal text-[9px] text-[#333] tracking-[0.2em]"
          style={{ animation: "marquee 18s linear infinite" }}
        >
          {Array(20)
            .fill(currentPage?.text ?? "shadowform")
            .join(" ● ") + " ● "}
        </span>
      </div>
    </nav>
  );
};
