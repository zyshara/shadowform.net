// src/main/components/Navbar.jsx

import { NavLink, useLocation } from "react-router-dom";
import cherry_blossom from "@shared/assets/images/cherry_blossom.png";
import navlinks from "@/data/navlinks";

// ── Desktop: vertical sidebar nav ──────────────────────────────────────────
export const DesktopNavbar = () => {
  const location = useLocation();

  return (
    <nav className="flex flex-col items-end w-full">
      <NavLink to="/" className="flex flex-col items-center mb-4">
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

      {/* gradient divider */}
      <div
        className="w-[60%] h-px my-4"
        style={{
          background: `linear-gradient(to right, transparent, var(--divider), transparent)`,
        }}
      />

      {/* nav links */}
      <ol className="flex flex-col items-end w-full px-5 gap-[2px]">
        {navlinks.map((navlink) => {
          const isActive = location.pathname === navlink.url;
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

// ── Mobile: top bar with hamburger ─────────────────────────────────────────
export const MobileNavbar = ({ onMenuOpen }) => {
  const location = useLocation();
  const currentPage = navlinks.find((n) => location.pathname === n.url);

  return (
    <nav
      className="flex lg:hidden flex-col border-b"
      style={{
        background: "var(--bg-mobile-nav)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-center justify-between px-5 py-4">
        {/* logo */}
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

        {/* current page indicator + hamburger */}
        <div className="flex items-center gap-3">
          {currentPage && (
            <span
              className="font-alkhemikal text-[10px] tracking-[0.12em] uppercase"
              style={{ color: "var(--text-page-indicator)" }}
            >
              {currentPage.text}
            </span>
          )}
          <button
            onClick={onMenuOpen}
            className="flex flex-col gap-[4px] cursor-pointer p-1"
            aria-label="open menu"
          >
            <span className="block w-[18px] h-px" style={{ background: "var(--text-hamburger)" }} />
            <span className="block w-[18px] h-px" style={{ background: "var(--text-hamburger)" }} />
            <span className="block w-[18px] h-px" style={{ background: "var(--text-hamburger)" }} />
          </button>
        </div>
      </div>
    </nav>
  );
};
