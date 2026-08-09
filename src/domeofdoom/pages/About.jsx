import React from "react";
import { readSeedData } from "@/utils/readSeedData";
import SubpageHeader from "@/components/SubpageHeader";
import Button from "@/components/Button";
import ArrowRightIcon from "@/components/ArrowRightIcon";

const About = () => {
  const aboutPage = readSeedData("about-page-data");

  return (
    <div className="mx-auto max-w-[1400px] px-10 py-10 lg:py-[70px]">
     <SubpageHeader heading="About"/>
     <div className="grid grid-cols-[1fr] md:grid-cols-[1fr_1fr] gap-8">
        <img src="https://assets.bigcartel.com/theme_images/142772454/DomeOfDoom_Anniversary_Small+4+web.png?auto=format&fit=max&w=1800"/>
        <div className="grid grid-rows-[1fr_1fr] gap-8">
          <div
            className="text-[15px] leading-relaxed text-white/70"
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
    </div>
  );
};

export default About;
