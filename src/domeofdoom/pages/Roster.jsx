import React from "react";
import { readSeedData } from "@/utils/readSeedData";

const Roster = () => {
  const artists = readSeedData("roster-data") ?? [];

  return (
    <main>
      <h1>roster</h1>
      <div className="flex flex-wrap gap-4">
        {artists.map((artist, i) => (
          <div key={i} className="flex flex-col max-w-[200px]">
            <img src={artist.photo_src} alt={artist.name} />
            <p>{artist.name}</p>
            <p>{artist.location}</p>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Roster;
