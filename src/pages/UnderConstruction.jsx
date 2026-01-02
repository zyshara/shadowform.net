import React from "react";

import DotDivider from "@/components/DotDivider";

import caution from "@/assets/images/caution.png";

const UnderConstruction = () => {
  return (
    <div className="w-full min-h-full flex flex-col justify-center items-center">
      <DotDivider variant="alagard" />
      <span className="font-alkhemikal lg:text-lg">Under Construction</span>
      <img src={caution} className="w-[12vw] max-w-[50px] lg:w-10" />
      <DotDivider variant="alagard" />
    </div>
  );
};

export default UnderConstruction;
