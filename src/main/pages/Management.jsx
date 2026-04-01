import React from "react";
import FlowerDivider from "@/components/FlowerDivider.jsx";

import red_spear_text_logo from "@shared/assets/images/red_spear_text_logo.png";
import red_spear_graphic_logo from "@shared/assets/images/red_spear_graphic_logo.png";

import PixelArt from "./PixelArt";

const Management = ({ artSrc, logoSrc }) => {
  return (
    <div className="relative flex flex-col items-center w-full grayscale place-self-start">

      <div>
        <FlowerDivider variant="top" />
        <PixelArt src={red_spear_graphic_logo} className="w-[220px] object-cover grayscale" />
        <FlowerDivider variant="bottom" />
      </div>

      <div className="absolute -bottom-[24px] h-10 flex items-center justify-center">
        <img src={red_spear_text_logo} className="h-20" />
      </div>
    </div>
  );
};

export default Management;
