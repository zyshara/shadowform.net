import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import navlinks from "@/data/navlinks.json";
import { colors, LOGO_URL } from "@/tokens";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="sticky top-0 z-50" style={{ background: "rgba(13,11,10,0.85)", backdropFilter: "blur(12px)" }}>
      {/* Bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-[22px] lg:px-10">
        <NavLink to="/" className="flex items-center">
          <img src={LOGO_URL} alt="Dome of Doom" className="h-11 w-auto" />
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-[34px] lg:flex">
          {navlinks.map((link) => (
            <NavLink
              key={link.id}
              to={link.path}
              end={link.path === "/"}
              className="border-b-2 border-transparent py-1.5 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors"
              style={({ isActive }) => ({
                color: isActive ? colors.accent : colors.text,
                borderColor: isActive ? colors.accent : "transparent",
              })}
            >
              {link.text}
            </NavLink>
          ))}
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
              className="rounded px-4 py-3 text-[14px] font-semibold uppercase tracking-[0.08em] transition-colors"
              style={({ isActive }) => ({
                color: isActive ? colors.accent : colors.text,
                background: isActive ? "rgba(255,255,255,0.05)" : "transparent",
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
