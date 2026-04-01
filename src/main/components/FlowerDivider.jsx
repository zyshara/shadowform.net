import React from "react";

const FlowerDivider = ({ variant = "top" }) => {
  const divider = (
    <span className="font-alkhemikal font-bold text-[20px]">
      ╔═════ ❀•°❀°•❀ ═════╗
    </span>
  );

  const classes = "absolute left-0 z-10 w-full flex justify-center align-center";

  if (variant === "bottom") {
    return (<div className={classes + " rotate-180 -mt-[30px]"}>{divider}</div>);
  }

  return (<div className={classes + " top-0"}>{divider}</div>);
};

export default FlowerDivider;
