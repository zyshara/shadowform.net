// src/main/pages/About.jsx

import { useState } from "react";
import Header from "@/components/Header";
import DotDivider from "@/components/DotDivider";
import Ornament from "@/components/Ornament";
import FlowerDivider from "@/components/FlowerDivider";
import VoidFrame from "@/components/VoidFrame";
import EntryCard from "@/components/EntryCard";
import Button from "@/components/Button";
import SparkleFrame from "@/components/SparkleFrame";
import LoadingScreen, { FadeIn, usePageLoad } from "@/components/LoadingScreen";

// ── cat photo — cycles through srcs on click, scales up on hover ──
const CatImage = ({ srcs, alt }) => {
  const [index, setIndex] = useState(0);

  return (
    <img
      src={srcs[index]}
      alt={alt}
      onClick={() => setIndex((i) => (i + 1) % srcs.length)}
      className="cursor-pointer transition-transform duration-300 hover:scale-[1.2] active:scale-[0.9]"
    />
  );
};

// ── divider label row — shows a name next to each candidate so they're easy to compare ──
const DividerSample = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <span className="font-alkhemikal text-[9px] uppercase tracking-[0.2em]" style={{ color: "var(--text-nav-inactive)" }}>
      {label}
    </span>
    <div className="relative flex items-center justify-center min-h-8 py-1">
      {children}
    </div>
  </div>
);

// ── bordered section wrapper — shared by every block below the intro ──
const AboutSection = ({ className = "", children }) => (
  <div className={`flex flex-col sm:px-7 py-8 gap-4 ${className}`} style={{ borderTop: "1px solid var(--border)" }}>
    {children}
  </div>
);

const About = () => {
  const { data: latestEntry, loading, fading } = usePageLoad(
    () => fetch("/api/guestbook")
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data) => data.guestbook?.guestbook_entries?.[0] ?? null),
    { minLoadMs: 300 },
  );

  if (loading) return <LoadingScreen fading={fading} />;

  return (
    <FadeIn className="flex flex-col w-full">
        <div className="flex flex-col justify-center items-center md:items-start md:flex-row gap-7">
          <VoidFrame size={180}>
            <img
              src="https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785122578/IMG_2755_51b12be6aa.jpg"
              alt="Hi I'm Jennifer!"
              className="rotate-90 -scale-y-100"
              style={{ objectPosition: "-20px center" }}
            />
          </VoidFrame>

          <Header
            align={{ base: "center", md: "left" }}
            size={{ base: "medium", sm: "large" }}
            title="welcome to shadowform"
            description={(
              <>
                <p>
                  hi im <i style={{ color: "var(--text-heading)" }}>Jennifer</i>, a 31 year old software developer living in los angeles
                  currently working at <i style={{ color: "var(--text-heading)" }}>Blizzard Entertainment</i> on the front end web team.
                </p>
                <p>
                  i've been on the internet since the days of Zyzz and Albino Black Sheep,
                  and making websites since the dawn of &lt;marquee&gt; and Dreamweaver.
                </p>
                <p>
                  i'm a raver, a gamer, and a mom to three wonderful cats.<br/>
                  enjoy your stay :-)
                </p>
              </>
            )}
          />
      </div>

      <div className="flex justify-center pb-4">
        <DotDivider variant="alagard" />
      </div>

      <AboutSection>
        <div className="flex flex-col md:flex-row gap-6 justify-between">
          <span className="text-center sm:text-left font-alkhemikal text-[14px] uppercase tracking-[0.2em] flex justify-center items-center" style={{ color: "var(--pink-text)" }}>
            // latest guestbook entry
          </span>
          <Button variant="secondary" corners className="w-full h-[30px] sm:w-auto justify-center text-[10px]" href="/guestbook">
            <div className="flex flex-row justify-center items-center">
              <div className="inline-flex guestbook-heart mr-[5px]">🩷</div>
              <p className="text-wrap text-center">Sign My Guestbook!!!</p>
              <div className="inline-flex guestbook-heart ml-[5px]">🩷</div>
            </div>
          </Button>
        </div>
        <div className="flex">
          {latestEntry && <SparkleFrame className="w-full"><EntryCard entry={latestEntry} className="w-full" /></SparkleFrame>}
        </div>
      </AboutSection>

      <AboutSection>
          <span className="text-center sm:text-left font-alkhemikal text-[14px] uppercase tracking-[0.2em] flex justify-center items-center" style={{ color: "var(--pink-text)" }}>
          // cat collection
        </span>
        <div className="flex flex-row gap-6">
          <div className="w-full flex flex-col justify-center gap-6">
            <CatImage
              alt="Arthur Morgan"
              srcs={[
                "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785135997/about_arthur3_8eadd8df9d.png",
                "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785133654/about_arthur1_eda74c82bb.png",
                "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785135126/about_arthur2_a1f2b00374.png",
              ]}
            />
            <span className="font-alagard text-[11px] uppercase tracking-[0.2em] self-center" style={{ color: "var(--pink-text)" }}>
              🧡 Arthur Morgan 🍊
            </span>
            <Button className="w-full sm:w-auto justify-center" href="/about/arthur-morgan">
              Learn More about Arthur!
            </Button>
          </div>
          <div className="w-full flex flex-col justify-center gap-6">
            <CatImage
              alt="Kilrogg Deadeye"
              srcs={[
                "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785135126/about_kilrogg3_7130035fbc.png",
                "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785133654/about_kilrogg1_07f593f1aa.png",
                "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785135126/about_kilrogg2_15de30b0b8.png",
                "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785135997/about_kilrogg4_f11ddfa1ce.png",
              ]}
            />
            <span className="font-alagard text-[11px] uppercase tracking-[0.2em] self-center" style={{ color: "var(--pink-text)" }}>
              🤍 Kilrogg Deadeye 👁️
            </span>
            <Button className="w-full sm:w-auto justify-center" href="/about/kilrogg-deadeye">
              Learn More about Kilrogg!
            </Button>
          </div>
          <div className="w-full flex flex-col justify-center gap-6">
            <CatImage
              alt="Guardian Lulu"
              srcs={[
                "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785135126/about_lulu3_013f45c90f.png",
                "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785133655/about_lulu1_1874d9543d.png",
                "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785135126/about_lulu2_fc86b6e0e0.png",
              ]}
            />
            <span className="font-alagard text-[11px] uppercase tracking-[0.2em] self-center" style={{ color: "var(--pink-text)" }}>
              ☕ Guardian Lulu 🌶️
            </span>
            <Button className="w-full sm:w-auto justify-center" href="/about/guardian-lulu">
              Learn More about Lulu!
            </Button>
          </div>
        </div>
      </AboutSection>

      {/* footer quote */}
      <AboutSection>
        <a
          href="https://www.youtube.com/watch?v=07XwrN878Hs"
          target="_blank"
          rel="noreferrer"
          className="font-manuskript italic text-[18px] text-center leading-[1.7] px-7 block transition-colors duration-300 text-[#1c1428] hover:underline hover:text-[var(--pink-text)]"
        >
          "i am the lucid dream... the monster in your nightmares... the fiend of a thousand faces"
        </a>
      </AboutSection>
    </FadeIn>
  );
};

export default About;
