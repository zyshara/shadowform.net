// src/main/components/MobileMenu.jsx

import { NavLink, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Ornament from "@/components/Ornament";

import cherry_blossom from "@shared/assets/images/cherry_blossom.png";
import navlinks from "@/data/navlinks";

const MobileMenu = ({ open, onClose }) => {
  const location = useLocation();

  useEffect(() => { onClose(); }, [location.pathname]);

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
          fixed inset-0 z-50 flex flex-col lg:hidden
          transition-transform duration-250 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ background: "var(--bg-menu)" }}
      >
        {/* header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--border-menu-header)" }}
        >
          <NavLink to="/" className="flex items-center gap-2">
            <img
              src={cherry_blossom}
              className="w-[28px]"
              style={{ filter: "drop-shadow(0 0 4px var(--pink-glow))" }}
            />
            <span
              className="font-alagard text-[13px] tracking-[2px]"
              style={{ color: "var(--text-mobile-name)" }}
            >
              shadowform.net
            </span>
          </NavLink>
          <button
            onClick={onClose}
            className="font-alkhemikal text-[9px] tracking-[0.12em] uppercase px-2 py-1 rounded-[2px] border"
            style={{
              color: "var(--text-close-btn)",
              borderColor: "var(--border-close-btn)",
            }}
          >
            close
          </button>
        </div>
i
        {/* nav links */}
        <nav className="flex-1 flex flex-col justify-center px-6">
          <Ornament className="mb-8 self-center" />
          <ol className="flex flex-col gap-0">
            {navlinks.map((navlink) => {
              const isActive = location.pathname === navlink.url;
              return (
                <li
                  key={navlink.id}
                >
                  <NavLink
                    to={navlink.url}
                    className="block font-alagard text-[20px] tracking-[1px] py-3 transition-colors duration-150 text-center lowercase"
                    style={{
                      color: isActive
                        ? "var(--text-menu-active)"
                        : "var(--text-menu-inactive)",
                      filter: isActive ? "drop-shadow(0 0 4px var(--pink-glow)) drop-shadow(0 0 6px var(--pink-glow))" : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.color = "var(--text-menu-hover)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.color = "var(--text-menu-inactive)";
                    }}
                  >
                    {navlink.text}
                  </NavLink>
                </li>
              );
            })}
          </ol>
          <Ornament className="mt-8 self-center" />
        </nav>
      </div>
    </>
  );
};

export default MobileMenu;
