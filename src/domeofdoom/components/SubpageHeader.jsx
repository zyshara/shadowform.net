// src/domeofdoom/components/Footer.jsx

import { Link } from "react-router-dom";
import { colors } from "@/tokens";

const SubpageHeader = ({ heading, children }) => (
  <>
    <div
      className="m-0 font-archivo text-[clamp(26px,_7vw,_48px)] font-semibold uppercase leading-none tracking-tight"
      style={{ fontFamily: "Archivo, sans-serif", fontStretch: "expanded", fontVariationSettings: "'wdth' 125", fontWeight: "600" }}
    >
      { heading }
    </div>
   { children }
  </>
);

export default SubpageHeader;
