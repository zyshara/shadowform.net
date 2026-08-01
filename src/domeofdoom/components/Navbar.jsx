import { useState, useEffect, useRef, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import navlinks from "@/data/navlinks.json";
import { colors, LOGO_URL } from "@/tokens";

const NAV_FONT_STYLE = {
  fontFamily: "Archivo, sans-serif",
  fontStretch: "expanded",
  fontVariationSettings: '"wdth" 125',
  fontWeight: 700,
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Sliding underline — measures the active link's position within the nav
  // row and animates a single shared indicator to it, rather than each link
  // owning its own static border.
  const navRef = useRef(null);
  const linkRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  const updateIndicator = useCallback(() => {
    const activeLink = navlinks.find((l) =>
      l.path === "/" ? location.pathname === "/" : location.pathname.startsWith(l.path)
    );
    const el = activeLink && linkRefs.current[activeLink.id];
    const nav = navRef.current;
    if (!el || !nav) return;
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setIndicator({ left: elRect.left - navRect.left, width: elRect.width, ready: true });
  }, [location.pathname]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    // The variable-width Archivo font can still be loading on first paint —
    // measuring before it swaps in gives the indicator the fallback font's
    // (narrower) width, so re-measure once webfonts are actually ready.
    document.fonts?.ready?.then(updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  return (
    <div style={{ background: "rgba(13,11,10,0.85)", backdropFilter: "blur(12px)" }}>
      {/* Bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-[22px] lg:px-10">
        <NavLink to="/" className="flex items-center">
          <img src={LOGO_URL} alt="Dome of Doom" className="h-11 w-auto" />
        </NavLink>

        {/* Desktop nav */}
        <nav ref={navRef} className="relative hidden items-center gap-[34px] lg:flex">
          {navlinks.map((link) => (
            <NavLink
              key={link.id}
              ref={(el) => {
                linkRefs.current[link.id] = el;
              }}
              to={link.path}
              end={link.path === "/"}
              className="navlink-hover-flash py-1.5 text-[13px] uppercase tracking-[0.02em]"
              style={({ isActive }) => ({
                color: isActive ? "#ffffff" : colors.text,
                ...NAV_FONT_STYLE,
              })}
            >
              {link.text}
            </NavLink>
          ))}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: 0,
              height: 2,
              background: colors.accent,
              left: indicator.left,
              width: indicator.width,
              opacity: indicator.ready ? 1 : 0,
              transition: "left 0.3s ease, width 0.3s ease, opacity 0.2s ease",
            }}
          />
        </nav>

        {/* Hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
        >
          <span
            className="block h-[2px] w-6 origin-center transition-all duration-200"
            style={{ background: colors.text, transform: open ? "translateY(7px) rotate(45deg)" : "none" }}
          />
          <span
            className="block h-[2px] w-6 transition-all duration-200"
            style={{ background: colors.text, opacity: open ? 0 : 1 }}
          />
          <span
            className="block h-[2px] w-6 origin-center transition-all duration-200"
            style={{ background: colors.text, transform: open ? "translateY(-7px) rotate(-45deg)" : "none" }}
          />
        </button>
      </div>

      {/* Mobile dropdown tray */}
      <nav
        className="overflow-hidden border-b border-white/10 transition-all duration-300 ease-in-out lg:hidden"
        style={{ maxHeight: open ? "500px" : "0", borderBottomColor: open ? "rgba(255,255,255,0.1)" : "transparent" }}
      >
        <div className="flex flex-col gap-1 px-4 py-3">
          {navlinks.map((link) => (
            <NavLink
              key={link.id}
              to={link.path}
              end={link.path === "/"}
              className="rounded px-4 py-3 text-[14px] uppercase tracking-[0.02em] transition-colors"
              style={({ isActive }) => ({
                color: isActive ? colors.accent : colors.text,
                background: isActive ? "rgba(255,255,255,0.05)" : "transparent",
                ...NAV_FONT_STYLE,
              })}
            >
              {link.text}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
