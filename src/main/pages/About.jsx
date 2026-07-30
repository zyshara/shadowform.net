// src/main/pages/About.jsx

import { useRef, useState } from "react";
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

// ── cat collection data ──
const CATS = [
  {
    emojiStart: "🧡",
    name: "Arthur Morgan",
    emojiEnd: "🍊",
    href: "/about/arthur-morgan",
    buttonText: "Learn More about Arthur!",
    alt: "Arthur Morgan",
    srcs: [
      "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785135997/about_arthur3_8eadd8df9d.png",
      "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785133654/about_arthur1_eda74c82bb.png",
      "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785135126/about_arthur2_a1f2b00374.png",
    ],
  },
  {
    emojiStart: "🤍",
    name: "Kilrogg Deadeye",
    emojiEnd: "👁️",
    href: "/about/kilrogg-deadeye",
    buttonText: "Learn More about Kilrogg!",
    alt: "Kilrogg Deadeye",
    srcs: [
      "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785135126/about_kilrogg3_7130035fbc.png",
      "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785133654/about_kilrogg1_07f593f1aa.png",
      "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785135126/about_kilrogg2_15de30b0b8.png",
      "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785135997/about_kilrogg4_f11ddfa1ce.png",
    ],
  },
  {
    emojiStart: "☕",
    name: "Guardian Lulu",
    emojiEnd: "🌶️",
    href: "/about/guardian-lulu",
    buttonText: "Learn More about Lulu!",
    alt: "Guardian Lulu",
    srcs: [
      "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785135126/about_lulu3_013f45c90f.png",
      "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785133655/about_lulu1_1874d9543d.png",
      "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785135126/about_lulu2_fc86b6e0e0.png",
    ],
  },
];

// ── carousel arrow — same glyph PageChrome uses for its breadcrumb
// separator, mirrored for "prev"; hover adds the standard pink-glow
// drop-shadow used for active/hovered nav state elsewhere on the site ──
const CarouselArrow = ({ direction, onClick, label }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={label}
      className={`absolute top-1/2 -translate-y-1/2 ${direction === "left" ? "left-[-24px]" : "right-[-24px]"} px-3 py-2 text-[20px] cursor-pointer`}
      style={{
        color: "var(--pink-text)",
        filter: hovered ? "drop-shadow(0 0 4px var(--pink-glow)) drop-shadow(0 0 6px var(--pink-glow))" : "none",
        transition: "filter 150ms ease-out",
      }}
    >
      <span aria-hidden="true" className={direction === "left" ? "inline-block rotate-180" : "inline-block"}>➺</span>
    </button>
  );
};

// ── mobile/below-sm cat carousel — left arrow / cat / right arrow,
// swipeable via pointer events (covers touch and mouse alike) ──
const CatCarousel = () => {
  const [index, setIndex] = useState(0);
  const dragStartX = useRef(null);

  const cat = CATS[index];
  const goPrev = () => setIndex((i) => (i - 1 + CATS.length) % CATS.length);
  const goNext = () => setIndex((i) => (i + 1) % CATS.length);

  const onPointerDown = (e) => { dragStartX.current = e.clientX; };
  const onPointerUp = (e) => {
    if (dragStartX.current === null) return;
    const deltaX = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX > 0) goPrev(); else goNext();
  };

  return (
    <div
      className="md:hidden relative touch-pan-y"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <CarouselArrow direction="left" onClick={goPrev} label="Previous cat" />

      <div className="flex flex-col items-center gap-6 select-none">
        <CatImage alt={cat.alt} srcs={cat.srcs} />
        <div className="flex flex-col items-center gap-1">
          <span className="font-alagard text-[11px] uppercase tracking-[0.2em] text-nowrap" style={{ color: "var(--pink-text)" }}>
            {cat.name}
          </span>
          <span className="flex gap-2 font-noto-emoji">
            <span>{cat.emojiStart}</span>
            <span>{cat.emojiEnd}</span>
          </span>
        </div>
        <Button className="w-full justify-center min-h-[36px]" href={cat.href}>
          <div className="text-center text-wrap">{cat.buttonText}</div>
        </Button>
      </div>

      <CarouselArrow direction="right" onClick={goNext} label="Next cat" />
    </div>
  );
};

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
          <span className="text-center sm:text-left font-alkhemikal text-[14px] uppercase tracking-[0.2em] flex justify-center items-center gap-2" style={{ color: "var(--pink-text)" }}>
          <span className="cat-wiggle font-noto-emoji" aria-hidden="true">😻</span>
          // cat collection
          <span className="cat-wiggle font-noto-emoji" aria-hidden="true">😼</span>
        </span>

        <CatCarousel />

        <div className="hidden md:flex flex-row gap-6">
          {CATS.map((cat) => (
            <div key={cat.href} className="w-full min-w-0 flex flex-col justify-center gap-6">
              <CatImage alt={cat.alt} srcs={cat.srcs} />

              <span className="flex items-center gap-2 font-alagard text-[11px] uppercase tracking-[0.2em] self-center text-nowrap" style={{ color: "var(--pink-text)" }}>
                <span className="font-noto-emoji">{cat.emojiStart}</span>
                <span>{cat.name}</span>
                <span className="font-noto-emoji">{cat.emojiEnd}</span>
              </span>
              <Button className="w-auto justify-center min-h-[36px] lg:min-h-auto" href={cat.href}>
                <div className="text-center max-w-[140px] lg:max-w-full text-wrap">
                  {cat.buttonText}
                </div>
              </Button>
            </div>
          ))}
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
        <Ornament className="self-center" />
      </AboutSection>

    </FadeIn>
  );
};

export default About;
