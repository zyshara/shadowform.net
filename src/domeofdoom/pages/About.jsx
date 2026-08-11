import React from "react";
import { readSeedData } from "@/utils/readSeedData";
import Button from "@/components/Button";
import ArrowRightIcon from "@/components/ArrowRightIcon";
import { FLOWER_FILIGREE_PURPLE } from "@/tokens";

const About = () => {
  const aboutPage = readSeedData("about-page-data");

  return (
    <div className="border border-dod-lilac/50 my-10 grid grid-cols-1 xl:grid-cols-2 justify-center items-center gap-8 font-ppneue">
      <div className="relative overflow-hidden w-full h-full">
        <img className="p-16 absolute inset-0 w-full h-full object-cover" src="https://assets.bigcartel.com/theme_images/142772454/DomeOfDoom_Anniversary_Small+4+web.png?auto=format&fit=max&w=1800"/>
      </div>
      <div className="flex flex-col gap-4 p-16 pl-0">
        <span className="text-[clamp(4.5rem,6.5vw,6rem)] text-dod-neon-mint font-semibold flex flex-row items-center gap-4">
          <img className="w-15 h-15" src={ FLOWER_FILIGREE_PURPLE }/>
          ABOUT
        </span>
        <div
          className="leading-relaxed text-dod-lilac font-medium text-md"
          dangerouslySetInnerHTML={{ __html: aboutPage?.description ?? "" }}
        />
        <div className="flex flex-col sm:flex-row gap-8 max-h-[50px]">
          <Button variant="primary" href="/press">
            <div className="flex gap-2 items-center justify-center">Press<ArrowRightIcon size={15} /></div>
          </Button>
          <Button variant="secondary" href="/contact">
            <div className="flex gap-2 items-center justify-center">Contact<ArrowRightIcon size={15} /></div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;
