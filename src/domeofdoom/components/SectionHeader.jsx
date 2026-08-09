import React from "react";
import { Link } from "react-router-dom";
import { colors } from "@/tokens";
import ArrowRightIcon from "@/components/ArrowRightIcon";

const SectionHeader = ({ title, linkTo, linkText }) => (
  <div className="flex-col-reverse gap-[8px] sm:flex-row mb-7 flex items-baseline justify-between items-start">
    <h2 className="m-0 font-archivo text-[36px] font-semibold uppercase leading-none tracking-tight"
      style={{ fontFamily: "Archivo, sans-serif", fontStretch: "expanded", fontVariationSettings: "'wdth' 125", fontWeight: "600" }}>
      {title}
    </h2>
    {linkTo && (
      <div className="flex gap-[4px] items-center" style={{ color: colors.accent2, textAlign: "left" }}>
        <Link
          to={linkTo}
          className="navlink-hover-flash font-bold text-[11px] sm:text-[12px] py-[4px] sm:py-0 md:text-[13px] gap-[4px] uppercase tracking-[0.06em]"
          style={{ color: colors.accent2, whiteSpace: "nowrap" }}
        >
          {linkText}
        </Link>
        <ArrowRightIcon size={13} />
      </div>
    )}
  </div>
);

export default SectionHeader;
