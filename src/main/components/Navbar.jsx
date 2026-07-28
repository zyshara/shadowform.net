// src/main/components/Navbar.jsx

import { NavLink, useLocation } from "react-router-dom";
import cherry_blossom from "@shared/assets/images/cherry_blossom.png";
import navlinks from "@/data/navlinks";

// ── Desktop: vertical sidebar nav ──────────────────────────────────────────
export const DesktopNavbar = ({ onOpenMenu }) => {
  const location = useLocation();

  return (
    <nav className="absolute lg:relative top-[40px] lg:top-0 left-0 flex flex-col items-center lg:items-end lg:w-full h-full max-h-[424px] lg:justify-between">
      <NavLink to="/about" className="flex flex-col items-center">
        <img
          src={cherry_blossom}
          className="w-[40px] mb-3"
          style={{ filter: "drop-shadow(0 0 6px var(--pink-glow))" }}
        />
        <div
          className="[writing-mode:vertical-rl] font-alagard text-[20px] py-5 tracking-[3px]"
          style={{ color: "var(--text-site-name)" }}
        >
          shadowform.net
        </div>
      </NavLink>

      {/* hamburger */}
      <button
        onClick={onOpenMenu}
        aria-label="open menu"
        className="color-white lg:hidden text-white leading-[0.4] mt-[10px]"
      >
        __
        <br/>
        __
        <br/>
        __
      </button>

      {/* nav links */}
      <ol className="hidden lg:flex flex-col items-end w-full px-5 gap-[2px]">
        {navlinks.filter((navlink) => !navlink.hideFromNav).map((navlink) => {
          const bare = navlink.url.replace(/\/+$/, '');
          const isActive = location.pathname === bare || location.pathname.startsWith(bare + '/');
          return (
            <li key={navlink.id}>
              <NavLink
                to={navlink.url}
                className="lowercase font-alagard text-[16px] tracking-[1px] py-1 transition-animation transition-filter duration-150"
                style={{
                  color: isActive
                    ? "var(--text-nav-active)"
                    : "var(--text-nav-inactive)",
                  borderBottom: isActive
                    ? "1px solid var(--nav-active-underline)"
                    : "none",
                  filter: isActive ? "drop-shadow(0 0 4px var(--pink-glow)) drop-shadow(0 0 6px var(--pink-glow))" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.target.classList.add("md:hover:[animation:pink-rotate-text_100ms_linear_infinite]")
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.target.classList.remove("md:hover:[animation:pink-rotate-text_100ms_linear_infinite]")
                }}
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
