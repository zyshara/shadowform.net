import React from "react";

import DotDivider from "@/components/DotDivider.jsx";

const About = () => {
  return (
    <div className="w-full min-h-full flex flex-col justify-center items-center">
      <span className="font-alkhemikal lowercase text-[min(8vw,26px)] md:text-[24px]">
        Welcome to Shadowform
      </span>
      <DotDivider variant="alagard" />
      <div className="font-alagard max-w-[320px] text-center text-[min(3.5vw,16px)] md:text-[14px]">
        hi im jen, a 31 year old software developer living in los angeles
        currently working at <span>Blizzard Entertainment</span> on the front
        end web team. I've been on the internet since the days of Zyzz and
        Albino Black Sheep, and making websites since the dawn of
        &lt;marquee&gt; and Dreamweaver. i'm a raver, a gamer, and a mom to
        three wonderful cats.
        <br />
        <br />
        this site contains a little piece of myself- a showcase of my career, my
        creative endeavors, and other little projects & hobbies i've poured a
        part of myself into.
        <br />
        <br />
        thanks for coming and enjoy your stay :-)
      </div>
      <DotDivider variant="alagard" />
      <div
        onClick={() => {
          window.open("https://www.youtube.com/watch?v=07XwrN878Hs", "_blank");
        }}
        className="font-alkhemikal md:text-[12px] text-center text-[#ededed] mt-[30px] cursor-pointer"
      >
        ❝I am the lucid dream... the monster in your nightmares... the fiend of
        a thousand faces❞
      </div>
    </div>
  );
};

export default About;
