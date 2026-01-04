import React from "react";

const DotDivider = ({ variant = "default" }) => {
  if (variant === "alagard") {
    return (
      <span className="font-alagard mt-[6px] mb-[6px] font-bold text-[7px]">
        •• ━━━━━ ••●•• ━━━━━ ••
      </span>
    );
  }

  return <span className="text-[7px]">•• ━━━━━ ••●•• ━━━━━ ••</span>;
};

export default DotDivider;
