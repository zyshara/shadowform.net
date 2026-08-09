// src/domeofdoom/components/Footer.jsx

import { Link } from "react-router-dom";
import { colors, FLOWER_FILIGREE } from "@/tokens";

const SubpageHeader = ({ heading, children }) => (
  <>
    <div
      className="m-0 font-archivo text-[clamp(26px,_7vw,_48px)] font-semibold uppercase leading-none tracking-tight flex-row gap-2 flex items-center"
      style={{ fontFamily: "Archivo, sans-serif", fontStretch: "expanded", fontVariationSettings: "'wdth' 125", fontWeight: "600" }}
    >
     <img className="w-[40px] h-[40px]" src={ FLOWER_FILIGREE }/>
     { heading }
    </div>
   { children }
  </>
);

export default SubpageHeader;
