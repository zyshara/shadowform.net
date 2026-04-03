import React, { useState } from "react";
import { NavLink } from "react-router-dom";

import DotDivider from "@/components/DotDivider";

import cherry_blossom from "@shared/assets/images/cherry_blossom.png";
import hamburg from "@shared/assets/icons/hamburg.png";

import navlinks from "@/data/navlinks";

export const DesktopNavbar = ({ onMenuOpen }) => {
  return (
    <nav className="hidden lg:flex relative flex-col">
      <ol className="flex w-full justify-evenly items-end lowercase absolute h-[60px] font-alagard text-white flex-col">
        {navlinks.map((navlink) => {
          const isActive = location.pathname === navlink.url;
          return (
            <li
              key={navlink.id}
              className={
                isActive
                  ? "flex lg:[text-shadow:-2px_-1px_black,-2px_1px_black,1px_1px_black,1px_-1px_black] lg:[text-decoration-line:underline]"
                  : "hidden lg:hover:[text-shadow:-2px_-1px_black,-2px_1px_black,1px_1px_black,1px_-1px_black] lg:hover:[animation:hue-rotate-text_100ms_linear_infinite] lg:flex"
              }
            >
              <NavLink
                to={navlink.url}
                className={`mix-blend-difference hover:mix-blend-normal ${isActive && "lg:mix-blend-normal"} z-[1] text-[25px] lg:text-[20px]`}
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

const MobileNavbara = ({ onMenuOpen }) => {
  return (
    <nav className="relative flex-col">
      <NavLink to="/" className="absolute left-[7px] top-[20px] z-2 lg:hidden">
        <img src={cherry_blossom} className="w-[45px]" />
        <div className="whitespace-pre-line [writing-mode:vertical-rl] m-[5px_15px] font-alagard text-[10px] tracking-[5px]">
          shadowform.net
        </div>
      </NavLink>
      <img
        src={hamburg}
        className="absolute w-[45px] h-[45px] lg:hidden right-0 cursor-pointer z-2"
        onClick={onMenuOpen}
      />
      <ol className="flex w-full justify-evenly items-end lowercase absolute h-[60px] font-alagard text-white flex-col">
        {navlinks.map((navlink) => {
          const isActive = location.pathname === navlink.url;
          return (
            <li
              key={navlink.id}
              className={
                isActive
                  ? "flex lg:[text-shadow:-2px_-1px_black,-2px_1px_black,1px_1px_black,1px_-1px_black] lg:[text-decoration-line:underline]"
                  : "hidden lg:hover:[text-shadow:-2px_-1px_black,-2px_1px_black,1px_1px_black,1px_-1px_black] lg:hover:[animation:hue-rotate-text_100ms_linear_infinite] lg:flex"
              }
            >
              <NavLink
                to={navlink.url}
                className={`mix-blend-difference hover:mix-blend-normal ${isActive && "md:mix-blend-normal"} z-[1] text-[25px] md:text-[20px]`}
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

export const MobileNavbar = ({ onMenuOpen }) => {
  return (
    <>
    <nav className="flex lg:hidden relative flex-col">
      <NavLink to="/" className="absolute left-[9px] top-[9px] z-2 lg:hidden">
        <img src={cherry_blossom} className="w-[32px]" />
        <div className="whitespace-pre-line [writing-mode:vertical-rl] m-[9px_5px] font-alagard text-[15px] tracking-[5px]">
          shadowform.net
        </div>
      </NavLink>
      <div className="h-[45px] w-full flex items-center justify-center uppercase">
        <div className="absolute font-alkhemikal right-0 leading-[9px] text-[45px] m-[9px]" onClick={onMenuOpen}>—<br/>—<br/>—</div>
          <div className="flex lowercase text-white absolute -top-[13px] text-[10px] font-alagard [text-shadow:-2px_-1px_black,-2px_1px_black,1px_1px_black,1px_-1px_black] overflow-hidden w-full">
            <div style={{ animation: "marquee 20s linear infinite" }} className="shrink-0 inline-block whitespace-nowrap">
              {Array(20).fill(navlinks.find((navlink) => location.pathname === navlink.url)?.text).join(" ● ") + " ● "}
            </div>
            <div style={{ animation: "marquee 20s linear infinite" }} className="shrink-0 inline-block whitespace-nowrap">
              {Array(20).fill(navlinks.find((navlink) => location.pathname === navlink.url)?.text).join(" ● ")}
            </div>
          </div>
      </div>
    </nav>
    </>
  );
};
