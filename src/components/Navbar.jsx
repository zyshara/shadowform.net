import React, { useState } from "react";
import { NavLink } from "react-router";

import DotDivider from "@/components/DotDivider";

import cherry_blossom from "@/assets/images/cherry_blossom.png";

import navlinks from "@/data/navlinks";

const Navbar = ({ onMenuOpen }) => {
  return (
    <nav className="relative shrink-0 h-[56px]">
      <NavLink to="/" className="absolute left-[7px] top-[20px] z-2 md:hidden">
        <img src={cherry_blossom} className="w-[45px]" />
        <div className="whitespace-pre-line [writing-mode:vertical-rl] m-[5px_15px] font-alagard text-[10px] tracking-[5px]">
          shadowform.net
        </div>
      </NavLink>
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
              className={
                isActive
                  ? "flex md:[text-shadow:-2px_-1px_black,-2px_1px_black,1px_1px_black,1px_-1px_black] md:[text-decoration-line:underline]"
                  : "hidden md:hover:[text-shadow:-2px_-1px_black,-2px_1px_black,1px_1px_black,1px_-1px_black] md:hover:[animation:hue-rotate-text_100ms_linear_infinite] md:flex"
              }
            >
              <NavLink
                to={navlink.url}
                className={`mix-blend-difference hover:mix-blend-normal ${isActive && "md:mix-blend-normal"} z-[1] text-[25px]`}
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
