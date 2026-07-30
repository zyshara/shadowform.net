import React from "react";
import { readSeedData } from "@/utils/readSeedData";

const Merch = () => {
  const items = readSeedData("merch-data") ?? [];

  return (
    <main>
      <h1>merch</h1>
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
    </main>
  );
};

export default Merch;
