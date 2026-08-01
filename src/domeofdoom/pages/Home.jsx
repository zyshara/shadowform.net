import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { readSeedData } from "@/utils/readSeedData";
import { colors, LOGO_URL } from "@/tokens";
import Button from "@/components/Button";
import PosterFrame from "@/components/PosterFrame";

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

const ArrowRightIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 12H20M20 12L13 5M20 12L13 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SectionHeader = ({ title, linkTo, linkText }) => (
  <div className="flex-col-reverse gap-[8px] sm:flex-row mb-7 flex items-baseline justify-between items-start">
    <h2 className="m-0 font-archivo text-[36px] font-semibold uppercase leading-none tracking-tight"
      style={{ fontFamily: "Archivo, sans-serif", fontStretch: "expanded", fontVariationSettings: "'wdth' 125", fontWeight: "600" }}>
      {title}
    </h2>
    {linkTo && (
      <>
        <div className="flex gap-[4px] items-center" style={{ color: colors.accent2, textAlign: "left" }}>
          <Link
            to={linkTo}
            className="navlink-hover-flash font-bold text-[11px] sm:text-[12px] py-[4px] sm:py-0 md:text-[13px] gap-[4px] uppercase tracking-[0.06em]"
            style={{ color: colors.accent2, whiteSpace: "nowrap" }}
          >
            {linkText}
          </Link>
          <ArrowRightIcon size={13} />
        </div>
      </>
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
  const [heroImgRef, heroParallaxY] = useScrollParallax(60);
  const [coverRef, parallaxY] = useScrollParallax(24);

  // Belt-and-suspenders mute: React's `muted` prop only sets the DOM
  // property, and some browsers briefly honor autoplay before that property
  // is applied — forcing it imperatively guarantees no audio ever plays.
  const heroVideoRef = useRef(null);
  useEffect(() => {
    if (heroVideoRef.current) heroVideoRef.current.muted = true;
  }, []);

  return (
    <div>
      {/* HERO */}
      <div className="relative h-[600px] sm:h-[640px] overflow-hidden border-b border-white/10">
        <video
          ref={heroVideoRef}
          className="pointer-events-none absolute left-0 top-0 h-full w-full object-cover"
          src="https://res.cloudinary.com/dfeyhbxeg/video/upload/v1785558021/test_bg_dfbb193114.mp4"
          autoPlay
          muted
          defaultMuted
          playsInline
          loop
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `linear-gradient(to right, ${colors.bg} 0%, ${colors.bg} 22%, rgba(13,11,10,0.6) 50%, rgba(13,11,10,0.05) 100%)` }}
        />
        <img
          ref={heroImgRef}
          src="https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785465704/hero_sphere_3498e09523.png"
          alt=""
          className="pointer-events-none absolute right-[-5%] top-1/2 h-[115%] w-auto object-contain object-bottom"
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
          <PosterFrame>
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
            <div className="flex flex-col justify-center px-10 py-9 pl-13">
              <div className="text-[13px] font-black uppercase tracking-[0.1em]" style={{ color: colors.accent2 }}>
                OUT NOW
              </div>
              <div
                className="mb-1 uppercase leading-[1.1]"
                style={{
                  fontFamily: "Archivo, sans-serif",
                  fontStretch: "expanded",
                  fontVariationSettings: '"wdth" 125',
                  fontWeight: 600,
                  fontSize: "30px",
                }}
              >
                {latestRelease.release_name}
              </div>
              <div className="mb-4 text-[15px] font-medium" style={{ color: "rgba(255, 255, 255, 0.35)", letterSpacing: 0 }}>
                {latestRelease.artists?.length ? latestRelease.artists.join(", ") : "Dome of Doom"}
              </div>
              <div className="flex flex-col lg:flex-row gap-[14px]">
                {latestRelease.spotify_url ? (
                  <Button type="small" variant="primary" href={latestRelease.spotify_url}>
                    Spotify
                  </Button>
                ) : (
                  <Button type="small" variant="disabled">
                    Not on Spotify
                  </Button>
                )}
                {latestRelease.bandcamp_url && (
                  <Button type="small" variant="secondary" href={latestRelease.bandcamp_url}>
                    Bandcamp
                  </Button>
                )}
              </div>
            </div>
          </div>
          </PosterFrame>
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
