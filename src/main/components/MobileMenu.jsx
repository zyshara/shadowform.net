// src/main/components/MobileMenu.jsx
// Fullscreen slide-over nav overlay for mobile — Design 1 BW + pink

import { NavLink, useLocation } from "react-router-dom";
import React, { useEffect } from "react";
import cherry_blossom from "@shared/assets/images/cherry_blossom.png";
import navlinks from "@/data/navlinks";

const MobileMenu = ({ open, onClose }) => {
  const location = useLocation();

  // close on route change
  useEffect(() => { onClose(); }, [location.pathname]);

  // lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/60 z-40 lg:hidden
          transition-opacity duration-200
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
      />

      {/* panel */}
      <div
        className={`
          fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col lg:hidden
          transition-transform duration-250 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <img
              src={cherry_blossom}
              className="w-[28px]"
              style={{ filter: "drop-shadow(0 0 5px #f4a7c355)" }}
            />
            <span className="font-alagard text-white text-[15px] tracking-[2px]">
              shadowform
            </span>
          </div>
          <button
            onClick={onClose}
            className="font-alkhemikal text-[9px] text-[#444] tracking-[0.12em] uppercase border border-[#222] px-2 py-1 rounded-[2px]"
          >
            close
          </button>
        </div>

        {/* nav links — big gothic list */}
        <nav className="flex-1 flex flex-col justify-center px-6">
          <ol className="flex flex-col gap-0">
            {navlinks.map((navlink) => {
              const isActive = location.pathname === navlink.url;
              return (
                <li key={navlink.id} className="border-b border-[#111]">
                  <NavLink
                    to={navlink.url}
                    className={`
                      block font-alagard text-[28px] tracking-[1px] py-3
                      transition-colors duration-150
                      ${isActive ? "text-white" : "text-[#333] hover:text-[#888]"}
                    `}
                  >
                    {navlink.text}
                  </NavLink>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* footer tags */}
        <div className="flex gap-2 px-6 pb-8 flex-wrap">
          {["raver ✦", "gamer ✦", "cat mom ✦"].map((tag) => (
            <span
              key={tag}
              className="font-alkhemikal text-[8px] tracking-[0.14em] uppercase text-[#f4a7c3] border border-[#4a1f38] bg-[#1a0d14] px-2 py-1 rounded-[2px]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
