import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { AnimatePresence, motion } from "framer-motion";

import { DotDivider } from "@/components";
import navlinks from "@/data/navlinks";

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const MobileMenu = ({ open, onClose }) => {
  const navigate = useNavigate();

  const handleNavClick = (url) => {
    onClose();
    navigate(url);
  };

  return (
    <div
      className={`fixed inset-0 bg-black/80 z-40 backdrop-blur-sm md:hidden transition-opacity duration-300 ${open ? "opacity-100 pointer-events-all" : "opacity-0 pointer-events-none"}`}
    >
      <div className="absolute h-full w-full p-6 flex flex-col justify-center items-center font-alagard text-white opacity-70 text-center">
        <button className="absolute top-0 right-0 p-6" onClick={onClose}>
          X
        </button>

        <DotDivider variant="alagard" />
        <ol className="flex flex-col gap-[10px] text-[25px] z-2 w-full">
          {navlinks.map((navlink) => (
            <li
              key={navlink.id}
              className="w-full hover:[animation:pink-rotate-text_100ms_linear_infinite]"
            >
              <button
                className="uppercase block w-full"
                onClick={() => handleNavClick(navlink.url)}
              >
                {navlink.text}
              </button>
            </li>
          ))}
        </ol>
        <DotDivider variant="alagard" />
      </div>
    </div>
  );
};

export default MobileMenu;
