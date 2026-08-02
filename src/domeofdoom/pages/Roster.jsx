import React from "react";
import { readSeedData } from "@/utils/readSeedData";
import SubpageHeader from "@/components/SubpageHeader";

const Roster = () => {
  const artists = readSeedData("roster-data") ?? [];

  return (
    <div className="mx-auto max-w-[1400px] px-10 py-10 lg:py-[70px]">
     <SubpageHeader heading="Roster"/>
      <div className="flex flex-wrap gap-4">
        {artists.map((artist, i) => (
          <div key={i} className="flex flex-col max-w-[200px]">
            <img src={artist.photo_src} alt={artist.name} />
            <p>{artist.name}</p>
            <p>{artist.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Roster;
