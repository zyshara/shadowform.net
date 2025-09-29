import React from "react";

const Construction = () => {
  return (
      <div className="flex h-screen w-screen items-center justify-center w-screen">
        <div className="flex flex-col h-screen w-1/2 bg-black text-shadowform-grey justify-center items-center font-alkhemikal">
            <img src="/cherry_blossom.png" className="w-10 mb-[14px]"/>
            <hr/>
            <span>under</span>
        </div>
        <div className="absolute font-8bit text-white text-xs mix-blend-difference">&gt; shadowform.net &lt;</div>
        <div className="flex flex-col h-screen w-1/2 bg-white text-shadowform-grey justify-center items-center font-alkhemikal">
            <span>construction</span>
            <hr/>
            <img src="/cherry_blossom.png" className="w-10 mt-[14px]"/>
        </div>
      </div>
  )
};

export default Construction;
