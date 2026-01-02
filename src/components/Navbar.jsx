import React, { useState } from "react";
import { NavLink } from "react-router";

import DotDivider from "@/components/DotDivider";

import cherry_blossom from "@/assets/images/cherry_blossom.png";

import navlinks from "@/data/navlinks.json";

const Navbar = ({ onMenuOpen }) => {
  return (
    <nav className="relative shrink-0 h-[56px]">
      <img
        src={cherry_blossom}
        className="w-[45px] absolute left-[7px] top-[20px] z-2"
      />
      <div className="absolute whitespace-pre-line [writing-mode:vertical-rl] top-[70px] left-[22px] font-alagard text-[10px] tracking-[5px]">
        shadowform.net
      </div>
      <img
        src="hamburg.png"
        className="absolute w-[45px] h-[45px] md:hidden right-0 cursor-pointer z-2"
        onClick={onMenuOpen}
      />
      <ol className="flex w-full justify-evenly items-end lowercase absolute h-[60px] font-alagard text-white">
        {navlinks.map((navlink) => {
          const isActive = location.pathname === navlink.url;
          return (
            <li
              key={navlink.id}
              className={isActive ? "flex" : "hidden md:flex"}
            >
              <NavLink
                to={navlink.url}
                className="mix-blend-difference z-[1] text-[25px]"
              >
                {navlink.text}
              </NavLink>
            </li>
          );
        })}
      </ol>
      <div className="flex w-full bg-black h-[13px] absolute bottom-0" />
    </nav>
  );
};

export default Navbar;
