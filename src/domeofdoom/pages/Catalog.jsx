import React from "react";
import SubpageHeader from "@/components/SubpageHeader";
import PosterFrame from "@/components/PosterFrame";
import ArrowRightIcon from "@/components/ArrowRightIcon";

const Catalog = () => {
  return (
    <div className="mx-auto max-w-[1400px] px-10 py-10 lg:py-[70px]">
     <SubpageHeader heading="Catalog"/>
     <div className="flex flex-col gap-8">
     <PosterFrame>
     </PosterFrame>
     <PosterFrame>
       <div className="flex flex-row justify-center items-center">
         <img src="https://i1.sndcdn.com/visuals-000062643645-4vCjuR-t1240x260.jpg"/>
         <div className="absolute flex flex-row justify-center items-center p-3">
           Sounds
           <ArrowRightIcon size={15} />
         </div>
       </div>
     </PosterFrame>
     </div>
    </div>
  );
};

export default Catalog;
