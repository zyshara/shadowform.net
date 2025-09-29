import React from "react";

const Construction = () => {
  return (
      <div className="flex h-dvh w-dvw items-center justify-center font-alkhemikal text-5xl text-shadowform-grey flex-col lg:text-lg lg:flex-row">
        <div className="flex flex-col h-full w-full bg-black justify-center items-center lg:w-1/2">
            <img src="/cherry_blossom.png" className="w-30 lg:w-10 mb-[14px] white-hard-border"/>
            <hr/>
            <span>under</span>
        </div>
        <div className="absolute font-8bit text-white text-3xl mix-blend-difference lg:text-xs"><span>&gt; shadowform.net &lt;</span></div>
        <div className="flex flex-col h-full w-full bg-white justify-center items-center lg:w-1/2">
            <span>construction</span>
            <hr/>
            <img src="/cherry_blossom.png" className="w-30 lg:w-10 mt-[14px]"/>
        </div>
      </div>
  )
};

export default Construction;
