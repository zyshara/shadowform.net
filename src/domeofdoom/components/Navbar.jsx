// src/domeofdoom/components/Navbar.jsx

import { NavLink } from "react-router-dom";
import navlinks from "@/data/navlinks.json";
import { colors, LOGO_URL } from "@/tokens";

const Navbar = () => {
  return (
    <div
      className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-10 py-[22px] backdrop-blur-md"
      style={{ background: "rgba(13,11,10,0.85)" }}
    >
      <NavLink to="/" className="flex items-center">
        <img src={LOGO_URL} alt="Dome of Doom" className="h-11 w-auto" />
      </NavLink>

      <nav className="flex items-center gap-[34px]">
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
    </div>
  );
};

export default Navbar;
