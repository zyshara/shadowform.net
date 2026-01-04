import React from "react";

import DotDivider from "@/components/DotDivider";

import caution from "@shared/assets/images/caution.png";

const UnderConstruction = () => {
  return (
    <div className="w-full min-h-full flex flex-col justify-center items-center">
      <DotDivider variant="alagard" />
      <span className="font-alkhemikal md:text-[24px]">Under Construction</span>
      <img src={caution} className="w-[45px] md:w-[54px]" />
      <DotDivider variant="alagard" />
    </div>
  );
};

export default UnderConstruction;
