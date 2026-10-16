import React from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { readSeedData } from "@shared/utils/readSeedData";
import SubpageHeader from "@/components/SubpageHeader";
import UnderConstruction from "@/components/UnderConstruction";

const Merch = () => {
  usePageTitle("Merch");
  // TODO: remove — temporarily hidden
  return <UnderConstruction />;
  const items = readSeedData("merch-data") ?? [];

  return (
    <div className="mx-auto max-w-[1400px] px-10 py-10 lg:py-[70px]">
     <SubpageHeader heading="Merch"/>
      <div className="flex flex-wrap gap-4">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col max-w-[200px]">
            <img src={item.cover_art_src} alt={item.item_name} />
            <p>{item.artist}</p>
            <p>{item.item_name}</p>
            <p>{item.sold_out ? "Sold Out" : `$${item.price} ${item.currency}`}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Merch;
