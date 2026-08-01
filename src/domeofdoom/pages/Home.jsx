import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { readSeedData } from "@/utils/readSeedData";
import { colors, LOGO_URL } from "@/tokens";
import Button from "@/components/Button";

// Drifts `amplitude` px (in either direction) as the element's section
// passes through the viewport — a slight scroll parallax, reusable across
// any image on the page.
function useScrollParallax(amplitude = 24) {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const elCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const progress = Math.max(-1, Math.min(1, (viewportCenter - elCenter) / window.innerHeight));
      setOffset(progress * amplitude);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [amplitude]);

  return [ref, offset];
}

const SectionHeader = ({ title, linkTo, linkText }) => (
  <div className="mb-7 flex items-baseline justify-between">
    <h2 className="m-0 font-archivo text-[32px] font-semibold uppercase leading-none tracking-tight"
      style={{ fontFamily: "Archivo, sans-serif", fontStretch: "expanded", fontVariationSettings: "'wdth' 125", fontWeight: "600" }}>
      {title}
    </h2>
    {linkTo && (
      <Link to={linkTo} className="text-[13px] font-bold uppercase tracking-[0.06em]" style={{ color: colors.accent2 }}>
        {linkText} →
      </Link>
    )}
  </div>
);

const Home = () => {
  const releases = readSeedData("discography-data") ?? [];
  const merchItems = readSeedData("merch-data") ?? [];

  const latestRelease = releases.slice().sort((a, b) => {
    const ta = a.release_date ? new Date(a.release_date).getTime() : a.year ? new Date(`${a.year}-01-01`).getTime() : 0;
    const tb = b.release_date ? new Date(b.release_date).getTime() : b.year ? new Date(`${b.year}-01-01`).getTime() : 0;
    return tb - ta;
  })[0];
  const availableMerch = merchItems.filter((m) => !m.sold_out);
  const merchTeaser = (availableMerch.length ? availableMerch : merchItems).slice(0, 4);

  // Slight scroll parallax on the masthead sphere and the latest-release
  // cover — each drifts a few px against the page's scroll as its section
  // passes through the viewport, layered on top of the cover's fixed 3D tilt.
  const [heroImgRef, heroParallaxY] = useScrollParallax(36);
  const [coverRef, parallaxY] = useScrollParallax(24);

  return (
    <div>
      {/* HERO */}
      <div className="relative h-[640px] overflow-hidden border-b border-white/10">
        <img
          ref={heroImgRef}
          src="https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785465704/hero_sphere_3498e09523.png"
          alt=""
          className="pointer-events-none absolute right-[-5%] top-1/2 h-[115%] w-auto object-contain"
          style={{ transform: `translateY(calc(-50% + ${heroParallaxY}px))` }}
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{ background: `linear-gradient(to right, ${colors.bg} 0%, ${colors.bg} 22%, rgba(13,11,10,0.6) 50%, rgba(13,11,10,0.05) 100%)` }}
        />

        <div className="relative z-[2] mx-auto flex h-full max-w-[1400px] flex-col justify-center px-10">
          <div style={{ position: "relative" }}>
            <h1
              style={{
                position: "relative",
                zIndex: 1,
                fontFamily: "Archivo, Arial, sans-serif",
                fontSize: "clamp(20px, 20vw, 108px)",
                lineHeight: "0.86",
                fontWeight: 800,
                fontStretch: "expanded",
                fontVariationSettings: '"wdth" 125',
                letterSpacing: "-0.03em",
                margin: "0 0 28px",
                textTransform: "uppercase",
                WebkitTextStroke: `5px ${colors.accent}`,
                color: "transparent",
                textShadow: "0 0 60px rgba(255,120,100,0.25)",
              }}
            >
              DOME<br />OF<br />DOOM
            </h1>
          </div>

          <p className="m-0 mb-8 max-w-[440px] text-[18px] leading-[1.5] text-white/65">
            A home for restless club music &amp; the artists who make it. Twenty-five years underground and still digging.
          </p>
          <div className="flex gap-4 flex-col sm:flex-row">
            <Button variant="primary" to="https://open.spotify.com/search/label%3Adome-of-doom/albums">Listen Now</Button>
            <Button variant="secondary" to="/merch">Shop Merch</Button>
          </div>
        </div>
      </div>

      {/* LATEST RELEASE */}
      {latestRelease && (
        <div className="mx-auto max-w-[1400px] px-10 pb-[90px] pt-10">
          <SectionHeader title="Latest Release" linkTo="/discography" linkText="View Discography" />
          <div
            className="grid grid-cols-1 overflow-hidden border border-white/10 sm:grid-cols-[340px_1fr]"
            style={{ background: colors.card }}
          >
            <div
              ref={coverRef}
              className="aspect-square flex items-center justify-center"
              style={{ background: colors.bg, perspective: "1000px" }}
            >
              <img
                src={latestRelease.cover_art_src}
                alt={latestRelease.release_name}
                className="h-full w-full object-cover"
                style={{
                  transform: `translateY(${parallaxY}px) rotateX(32deg) rotateY(-16deg) rotateZ(24deg) scale(1)`,
                  filter: "drop-shadow(rgb(30, 30, 30) 1px 1px 0px) drop-shadow(rgb(30, 30, 30) 2px 2px 0px) drop-shadow(rgb(30, 30, 30) 3px 3px 0px) drop-shadow(rgb(255, 107, 101) 2px 2px 0px)",
                  borderRadius: "3px",
                  border: "2px solid #ff6b65",
                }}
              />
            </div>
            <div className="flex flex-col justify-center px-10 py-9">
              <div className="mb-2.5 text-[13px] font-black uppercase tracking-[0.1em]" style={{ color: colors.accent }}>
                New on Bandcamp
              </div>
              <div className="mb-1 text-[30px] font-black uppercase leading-[1.1]">{latestRelease.release_name}</div>
              <div className="text-[15px] font-medium text-white/55">
                {latestRelease.artists?.length ? latestRelease.artists.join(", ") : "Dome of Doom"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHOWS */}
      <div className="mx-auto max-w-[1400px] px-10 pb-[90px]">
        <SectionHeader title="Upcoming Shows" />
        <div className="flex flex-col border-t border-white/10">
          <div className="py-10 text-center text-[14px] text-white/45">No shows announced yet — check back soon.</div>
        </div>
      </div>

      {/* MERCH TEASER */}
      {merchTeaser.length > 0 && (
        <div className="mx-auto max-w-[1400px] px-10 pb-[100px]">
          <SectionHeader title="Merch" linkTo="/merch" linkText="Shop All" />
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {merchTeaser.map((item, i) => (
              <Link key={i} to="/merch" className="block">
                <div className="mb-3.5 aspect-square overflow-hidden rounded-[14px]" style={{ background: colors.bg }}>
                  <img src={item.cover_art_src} alt={item.item_name} className="h-full w-full object-cover" />
                </div>
                <div className="truncate text-[14px] font-bold uppercase">{item.item_name}</div>
                <div className="mt-0.5 text-[13px] font-medium text-white/50">
                  {item.sold_out ? "Sold Out" : `$${item.price} ${item.currency}`}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
