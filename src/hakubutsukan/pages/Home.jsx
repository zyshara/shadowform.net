import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { readSeedData } from "@shared/utils/readSeedData";
import CompassStar from "@/components/CompassStar.jsx";

const CLASSIFICATION_GROUPS = [
  { key: "art-and-design",    label: "Art & Design",     tag: "art-and-design"    },
  { key: "natural-history",   label: "Natural History",  tag: "natural-history"   },
  { key: "history-culture",   label: "History & Culture",tag: "history-and-culture"},
  { key: "science-and-tech",  label: "Science & Tech",   tag: "science-and-tech"  },
  { key: "specialty",         label: "Specialty",        tag: "specialty"         },
  { key: "galleries",         label: "Galleries",        tag: "galleries"         },
];

const CARD_IMAGE_OVERRIDES = {
  "art-and-design":   "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1787682787/d34d4fae_3b88_4e94_9dba_ea8cb29371d3_3000_f459e92c92.jpg",
  "natural-history":  "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1787682830/bulletinunitedst1101920unitfo_0190_f7b9dc1dca.jpg",
  "history-culture":  "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1787683613/351a2093_291b_4bcb_ac66_62c0a251cfed_3000_105be5f08b.jpg",
  "specialty":        "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1787683991/nhi_preview_c437734bde.jpg",
  "science-and-tech": "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1787685154/R3000123_Artwork_of_the_solar_system_planets_b8a03f230d.jpg",
};

const CARD_POSITION_OVERRIDES = {
  "art-and-design":  "0% 30%",
  "natural-history": "0% 70%",
  "specialty":       "0% 35%",
};

const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="8" x2="13" y2="8" />
    <polyline points="9,4 13,8 9,12" />
  </svg>
);

function renderArtists(text) {
  if (!text) return null;
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--hk-gold)">$1</a>');
}

const Home = () => {
  const allMuseums = useMemo(() => readSeedData("museums-data")     ?? [], []);
  const heroImages = useMemo(() => readSeedData("hero-images-data") ?? [], []);
  const heroImage  = heroImages[0] ?? null;


  return (
    <div className="flex flex-col">

      {/* HERO */}
      <section className="relative border-b border-hk-rule">
        <div
          className="relative overflow-hidden"
          style={{
            maxHeight: "50vh",
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            alignItems: "center",
          }}
        >
          {heroImage?.image_url ? (
            <img
              src={heroImage.image_url}
              alt={heroImage.name ?? "Hero"}
              className="w-full object-cover"
              style={{ maxHeight: "50vh", filter: "sepia(10%) brightness(0.9)", gridColumn: "1 / 9", gridRow: 1 }}
            />
          ) : (
            <div className="w-full bg-hk-sidebar" style={{ minHeight: "50vh", gridColumn: "1 / 9", gridRow: 1 }} />
          )}

          {/* Parchment card — absolute over image, right cols */}
          <div
            className="absolute flex flex-col items-center justify-center text-center px-8 py-10 gap-4 border-l border-hk-rule"
            style={{
              gridArea: "1 / 6 / auto / 8",
              alignSelf: "center",
              height: "70%",
              background: "rgba(240,230,210,0.95)",
            }}
          >
            <CompassStar size={24} color="var(--hk-gold)" />

            {heroImage?.name && (
              <h1
                className="font-display font-semibold italic leading-tight text-hk-text"
                style={{ fontSize: "clamp(1.2rem, 1.8vw, 1.9rem)", letterSpacing: "-0.01em" }}
              >
                {heroImage.name}
              </h1>
            )}

            <div className="h-px w-10 bg-hk-rule" />

            <div className="flex flex-col items-center gap-1.5">
              {heroImage?.year && (
                <span className="text-[11px] text-hk-muted font-display italic">{heroImage.year}</span>
              )}
              {heroImage?.artists && (
                <span
                  className="text-[11px] text-hk-text-mid leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderArtists(heroImage.artists) }}
                />
              )}
            </div>

            <CompassStar size={16} color="var(--hk-rule-dark)" />

            <p className="text-[9px] text-hk-muted italic mt-auto">
              From The Getty's online collection
            </p>
          </div>
        </div>
      </section>

      {/* CATEGORY GRID */}
      <section className="px-10 py-14">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display font-semibold italic text-hk-text" style={{ fontSize: "clamp(1.4rem, 2vw, 2rem)" }}>
            Explore Museums
          </h2>
          <Link to="/museums" className="flex items-center gap-2 text-[11px] font-ppneue uppercase tracking-[0.2em] text-hk-muted hover:text-hk-text transition-colors">
            View All Museums
            <ArrowIcon />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {CLASSIFICATION_GROUPS.map(({ key, label, tag }) => {
            const museums = allMuseums.filter((m) => m.tags.includes(tag));
            const bgImage = CARD_IMAGE_OVERRIDES[key] ?? museums.find((m) => m.image_url)?.image_url ?? null;
            return (
              <Link
                key={key}
                to={`/museums?tag=${tag}`}
                className="group relative overflow-hidden"
                style={{ aspectRatio: "5/3" }}
              >
                {/* Background image */}
                {bgImage && (
                  <img
                    src={bgImage}
                    alt={label}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ filter: "sepia(30%) brightness(0.55)", objectPosition: CARD_POSITION_OVERRIDES[key] ?? "center" }}
                  />
                )}
                {/* Dark overlay gradient */}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }}
                />
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col gap-0.5">
                      <h2 className="font-display font-semibold uppercase leading-none text-white transition-colors"
                        style={{ fontSize: "clamp(0.85rem, 1.5vw, 1.1rem)", letterSpacing: "0.04em" }}>
                        {label}
                      </h2>
                      <p className="text-[9px] font-ppneue uppercase tracking-[0.2em]"
                        style={{ color: "rgba(255,255,255,0.55)" }}>
                        {museums.length} institution{museums.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="text-white opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                      <ArrowIcon />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </section>

    </div>
  );
};

export default Home;
