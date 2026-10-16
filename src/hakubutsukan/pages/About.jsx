import React, { useMemo } from "react";
import CompassStar from "@/components/CompassStar.jsx";
import { readSeedData } from "@shared/utils/readSeedData";

const SLabel = ({ n, title }) => (
  <div className="flex items-center gap-3">
    <span className="text-[8px] font-ppneue uppercase tracking-[0.28em] text-hk-muted">{n}</span>
    <span className="h-px w-4 bg-hk-rule" />
    <span className="text-[8px] font-ppneue uppercase tracking-[0.28em] text-hk-muted">{title}</span>
  </div>
);

const About = () => {
  const heroImages  = useMemo(() => readSeedData("hero-images-data") ?? [], []);
  const springImage = useMemo(() => heroImages.find(h => h.slug === "spring") ?? null, [heroImages]);

  return (
    <div className="relative grid grid-cols-12 min-h-[600px]">

      {/* Star — top right of grid */}
      <div className="absolute top-8 right-8" style={{ zIndex: 1 }}>
        <CompassStar size={44} color="var(--hk-gold)" />
      </div>

      {/* ── Left — 01 Origin ───────────────────────────────────── */}
      <div className="col-span-3 flex flex-col gap-5 px-10 py-14 border-r border-hk-rule">
        <SLabel n="01" title="Origin" />

        <div className="flex items-center gap-2.5">
          <h1 className="font-display font-semibold italic leading-none text-hk-text" style={{ fontSize: "clamp(2rem, 2.8vw, 2.8rem)" }}>
            About
          </h1>
          <CompassStar size={14} color="var(--hk-gold)" />
        </div>

        <p className="font-display text-[15px] text-hk-text leading-relaxed" style={{ maxWidth: "28ch" }}>
          Hakubutsukan was created by Jennifer Decker — a software engineer &amp; ameture art enjoyer.
        </p>

        <div className="h-px w-6 bg-hk-rule" />

        <div className="flex flex-col gap-4 text-[13px] text-hk-text-mid leading-relaxed" style={{ fontFamily: "var(--font-ppneue)", maxWidth: "36ch" }}>
          <p>
            I created this site to keep an index of museums within Los Angeles
            that I enjoy going to, and to keep a comprehensive record of their
            exhibits within one space.
          </p>
          <p>
            I am not an artist and don't claim to be an art expert, but I love
            looking at interesting things that have historical context, and
            things that have been created out of laborious love.
          </p>
        </div>
      </div>

      {/* ── Center — painting ──────────────────────────────────── */}
      <div className="col-span-4 relative overflow-hidden border-r border-hk-rule">
        {springImage?.image_url ? (
          <img
            src={springImage.image_url}
            alt={springImage.name ?? ""}
            className="w-full object-cover object-center"
            style={{ maxHeight: "100dvh", filter: "sepia(8%) brightness(0.95)" }}
          />
        ) : (
          <div className="w-full bg-hk-bg-alt" style={{ minHeight: "100dvh" }} />
        )}

        {/* Credits tag — top right of image */}
        {springImage && (
          <div
            className="absolute top-0 right-0 flex flex-col items-end gap-1 px-4 py-3"
            style={{ background: "rgba(240,230,210,0.95)" }}
          >
            <span className="text-[8px] font-ppneue uppercase tracking-[0.22em] text-hk-muted">
              {springImage.name}
            </span>
            {springImage.year && (
              <span className="text-[8px] font-display italic text-hk-muted">{springImage.year}</span>
            )}
            <div className="h-px w-4 bg-hk-rule self-stretch" />
            <span className="text-[8px] font-ppneue uppercase tracking-[0.16em] text-hk-muted opacity-70">
              The Getty
            </span>
          </div>
        )}
      </div>

      {/* ── Right — 02 The Name + 03 Credits ──────────────────── */}
      <div className="col-span-3 flex flex-col gap-5 px-10 py-14">

        <SLabel n="02" title="The Name" />

        <h2 className="font-display font-semibold italic leading-tight text-hk-text" style={{ fontSize: "clamp(1.8rem, 2.6vw, 2.6rem)" }}>
          Why HAKUBUTSUKAN?
        </h2>

        <p className="font-display text-[15px] text-hk-text leading-relaxed" style={{ maxWidth: "28ch" }}>
          Hakubutsukan (博物館) translates to "museum" in Japanese.
        </p>

        <div className="h-px w-6 bg-hk-rule" />

        <div className="flex flex-col gap-3 text-[13px] text-hk-text-mid leading-relaxed" style={{ fontFamily: "var(--font-ppneue)", maxWidth: "36ch" }}>
          <p>
            I decided to name this site "Hakubutsukan" as an homage to my
            experiences growing up in Hawai'i and studying abroad in Nagasaki
            Japan.
          </p>
          <p>
            I hope this site can serve you well, and I hope you can find
            something new that piques your curiosity.
          </p>
        </div>

        {/* ── 03 Credits ──────────────────────────────────────── */}
        <div className="h-px w-full bg-hk-rule mt-4" />

        <div className="flex flex-col gap-5">
          <SLabel n="03" title="Credits" />

          <h2 className="font-display font-semibold italic leading-tight text-hk-text" style={{ fontSize: "clamp(1.4rem, 2vw, 2rem)" }}>
            With Thanks
          </h2>

          <div className="flex flex-col gap-4 text-[11px] text-hk-text-mid leading-relaxed" style={{ fontFamily: "var(--font-ppneue)", maxWidth: "36ch" }}>
            <p>
              Image: Home Page Art &amp; Design Card &mdash; <em>Reverie</em>, 1904, John William Godward (British, 1861&ndash;1922) from{" "}
              <a href="https://www.getty.edu/art/collection/object/103REP" target="_blank" rel="noopener noreferrer" style={{ color: "var(--hk-gold)" }}>
                The Getty's online collection
              </a>
            </p>
            <p>
              Image: Home Page Natural History Card &mdash; Plate 18 from <em>Osteology of the carnivorous Dinosauria in the United States National Museum: with special reference to the genera Antrodemus (Allosaurus) and Ceratosaurus</em>, in{" "}
              <a href="https://www.biodiversitylibrary.org/item/101543#page/9/mode/1up" target="_blank" rel="noopener noreferrer" style={{ color: "var(--hk-gold)" }}>
                Bulletin of the United States National Museum, volume 110
              </a>
            </p>
            <p>
              Image: Home Page History &amp; Culture Card &mdash; <em>Playing Samisen, Tsudzumi, Fuye and Taiko</em>, 1870s&ndash;1890s, Kusakabe Kimbei (Japanese, 1841&ndash;1934),{" "}
              <a href="https://www.getty.edu/art/collection/object/108NKF" target="_blank" rel="noopener noreferrer" style={{ color: "var(--hk-gold)" }}>
                From The Getty's online collection
              </a>
            </p>
            <p>
              Image: Home Page Specialty Card &mdash; <em>A Star Fell In The Fish Tank</em>, Onenhillion,{" "}
              <a href="https://andand.gallery/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--hk-gold)" }}>
                From &amp;&amp; Gallery's website
              </a>
            </p>
            <p>
              Image: Home Page Science &amp; Tech Card &mdash; <em>Artwork of the solar system planets</em>, Stuart Painter,{" "}
              <a href="https://www.sciencephoto.com/contributor/spi/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--hk-gold)" }}>
                From Science Photo Library
              </a>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default About;
