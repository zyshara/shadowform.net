import React from "react";

const Construction = () => {
  return (
      <div className="flex h-dvh w-dvw items-center justify-center w-screen font-alkhemikal text-lg text-shadowform-grey">
        <div className="flex flex-col h-full w-1/2 bg-black justify-center items-center">
            <img src="/cherry_blossom.png" className="w-10 mb-[14px]"/>
            <hr/>
            <span>under</span>
        </div>
        <div className="absolute font-8bit text-white text-xs mix-blend-difference"><span>&gt; shadowform.net &lt;</span></div>
        <div className="flex flex-col h-full w-1/2 bg-white justify-center items-center">
            <span>construction</span>
            <hr/>
            <img src="/cherry_blossom.png" className="w-10 mt-[14px]"/>
        </div>
      </div>
  )
};

export default Construction;
