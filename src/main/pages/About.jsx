// src/main/pages/About.jsx
// Design 1 BW — centered content, ornament dividers, pink lit tags

import Ornament from "@/components/Ornament";
import Tag from "@/components/Tag";
import Ticker from "@/components/Ticker";

const About = () => {
  return (
    <div className="flex flex-col min-h-full">
      <Ticker text="about" />

      <div className="flex-1 flex flex-col items-center px-14 py-10">
        <Ornament className="mb-5" />

        <h1 className="font-alagard text-[34px] text-[#f0f0f0] tracking-[2px] font-normal text-center mb-6 leading-tight">
          welcome to shadowform
        </h1>

        <div className="flex flex-col items-center gap-4 max-w-[440px]">
          <p className="font-fell text-[15px] text-[#aaa] leading-[1.9] text-center">
            hi im jen, a 31 year old software developer living in los angeles
            currently working at Blizzard Entertainment on the front end web team.
          </p>
          <p className="font-fell text-[15px] text-[#aaa] leading-[1.9] text-center">
            i've been on the internet since the days of Zyzz and Albino Black
            Sheep, and making websites since the dawn of &lt;marquee&gt; and
            Dreamweaver.
          </p>
          <p className="font-fell text-[15px] text-[#aaa] leading-[1.9] text-center">
            i'm a raver, a gamer, and a mom to three wonderful cats. this site
            contains a little piece of myself — enjoy your stay :-)
          </p>
        </div>

        <div className="flex gap-2 flex-wrap justify-center mt-5">
          <Tag variant="dim">los angeles</Tag>
          <Tag variant="dim">blizzard entertainment</Tag>
        </div>

        <Ornament className="mt-7" />
      </div>

      {/* footer quote */}
      <p className="font-fell italic text-[11px] text-[#2e2e2e] text-center leading-[1.7] px-7 pt-4 pb-2">
        "i am the lucid dream... the monster in your nightmares... the fiend of a thousand faces"
      </p>
    </div>
  );
};

export default About;
