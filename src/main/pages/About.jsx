// src/main/pages/About.jsx

import Ornament from "@/components/Ornament";
import Tag from "@/components/Tag";
import Header from "@/components/Header";

const About = () => {
  return (
    <div className="flex flex-col min-h-full" style={{ background: "var(--bg)" }}>
      <div className="flex-1 flex flex-col items-center px-14 py-10 justify-center">
        <Ornament className="mb-5" />

        <Header align="center" size="large" title="welcome to shadowform">
          <div className="flex flex-col items-center gap-4 max-w-[440px]">
            <p className="font-fell text-[15px] leading-[1.9] text-center" style={{ color: "var(--text-body)" }}>
              hi im <i style={{ color: "var(--text-heading)" }}>Jennifer</i>, a 31 year old software developer living in los angeles
              currently working at <i style={{ color: "var(--text-heading)" }}>Blizzard Entertainment</i> on the front end web team.
            </p>
            <p className="font-fell text-[15px] leading-[1.9] text-center" style={{ color: "var(--text-body)" }}>
              i've been on the internet since the days of Zyzz and Albino Black Sheep,
              and making websites since the dawn of &lt;marquee&gt; and Dreamweaver.
            </p>
            <p className="font-fell text-[15px] leading-[1.9] text-center" style={{ color: "var(--text-body)" }}>
              i'm a raver, a gamer, and a mom to three wonderful cats. this site
              contains a little piece of myself — enjoy your stay :-)
            </p>
          </div>
        </Header>

        <div className="flex gap-2 flex-wrap justify-center mt-5">
          <Tag variant="dim">los angeles</Tag>
          <Tag variant="dim">blizzard entertainment</Tag>
        </div>

        <Ornament className="mt-7" />
      </div>

      {/* footer quote */}
      <p
        className="font-fell italic text-[11px] text-center leading-[1.7] px-7 pt-4 pb-2"
        style={{ color: "var(--text-quote)" }}
      >
        "i am the lucid dream... the monster in your nightmares... the fiend of a thousand faces"
      </p>
    </div>
  );
};

export default About;
