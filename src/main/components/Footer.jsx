// src/main/components/Footer.jsx
// Design 1 BW footer — prev/next nav + social icons

import React from "react";
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
    <footer className="border-t border-[#1a1a1a] bg-[#0d0d0d] px-7 py-[14px] flex items-center justify-between shrink-0">
      {/* prev */}
      <div className="font-alkhemikal text-[10px] tracking-[0.12em] uppercase text-[#444] min-w-[80px]">
        {prev ? (
          <NavLink to={prev.url} className="hover:text-[#666] transition-colors">
            &lt; <span className="text-[#666]">{prev.text}</span>
          </NavLink>
        ) : (
          <span className="opacity-0">·</span>
        )}
      </div>

      {/* social icons */}
      <div className="flex items-center gap-3">
        <a href="https://ko-fi.com" target="_blank" rel="noreferrer" className="opacity-25 hover:opacity-50 transition-opacity">
          <img src={kofi} className="w-[16px] h-[16px]" />
        </a>
        <span className="text-[#2a2a2a] text-[10px]">|</span>
        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="opacity-25 hover:opacity-50 transition-opacity">
          <img src={instagram} className="w-[16px] h-[16px]" />
        </a>
        <span className="text-[#2a2a2a] text-[10px]">|</span>
        <a href="https://store.steampowered.com" target="_blank" rel="noreferrer" className="opacity-25 hover:opacity-50 transition-opacity">
          <img src={steam} className="w-[16px] h-[16px]" />
        </a>
      </div>

      {/* next */}
      <div className="font-alkhemikal text-[10px] tracking-[0.12em] uppercase text-[#444] min-w-[80px] text-right">
        {next ? (
          <NavLink to={next.url} className="hover:text-[#666] transition-colors">
            <span className="text-[#666]">{next.text}</span> &gt;
          </NavLink>
        ) : (
          <span className="opacity-0">·</span>
        )}
      </div>
    </footer>
  );
};

export default Footer;
