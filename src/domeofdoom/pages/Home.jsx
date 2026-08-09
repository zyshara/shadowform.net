import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { readSeedData } from "@/utils/readSeedData";
import { colors, LOGO_URL } from "@/tokens";
import Button from "@/components/Button";
import PosterFrame from "@/components/PosterFrame";
import testBg3 from "@/assets/test_bg_3.png";
import { ShowRow } from "@/pages/Shows";
import SectionHeader from "@/components/SectionHeader";
import SpotifyIcon from "@/components/SpotifyIcon";
import BandcampIcon from "@/components/BandcampIcon";
import ArrowUpRightIcon from "@/components/ArrowUpRightIcon";
import ArrowRightIcon from "@/components/ArrowRightIcon";

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

function formatReleaseDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const Home = () => {
  const releases = readSeedData("discography-data") ?? [];
  const merchItems = readSeedData("merch-data") ?? [];

  const showsData = readSeedData("shows-data") ?? [];
  const now = Date.now();
  const upcomingShows = showsData
    .filter((s) => {
      const [y, m, d] = s.date.split("-").map(Number);
      return new Date(y, m - 1, d).getTime() >= now;
    })
    .sort((a, b) => {
      const [ay, am, ad] = a.date.split("-").map(Number);
      const [by, bm, bd] = b.date.split("-").map(Number);
      return new Date(ay, am - 1, ad) - new Date(by, bm - 1, bd);
    });

  const latestRelease = releases.slice().sort((a, b) => {
    const ta = a.release_date ? new Date(a.release_date).getTime() : a.year ? new Date(`${a.year}-01-01`).getTime() : 0;
    const tb = b.release_date ? new Date(b.release_date).getTime() : b.year ? new Date(`${b.year}-01-01`).getTime() : 0;
    return tb - ta;
  })[0];
  const availableMerch = merchItems.filter((m) => !m.sold_out);
  const merchTeaser = (availableMerch.length ? availableMerch : merchItems).slice(0, 4);

  // Slight scroll parallax on the latest-release cover — drifts a few px
  // against the page's scroll as its section passes through the viewport,
  // layered on top of the cover's fixed 3D tilt.
  const [coverRef, parallaxY] = useScrollParallax(24);

  return (
    <div>
      {/* HERO */}
      <div className="relative h-[600px] sm:h-[640px] overflow-hidden border-b border-white/10">
        <img src={testBg3} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `linear-gradient(to right, ${colors.bg} 0%, ${colors.bg} 22%, color-mix(in srgb, ${colors.bg} 60%, transparent) 50%, color-mix(in srgb, ${colors.bg} 5%, transparent) 100%)` }}
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{ background: `linear-gradient(to right, ${colors.bg} 0%, ${colors.bg} 22%, color-mix(in srgb, ${colors.bg} 60%, transparent) 50%, color-mix(in srgb, ${colors.bg} 5%, transparent) 100%)` }}
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
                textShadow: "0 0 60px color-mix(in srgb, var(--dod-accent2) 50%, transparent)",
              }}
            >
              DOME<br />OF<br />DOOM
            </h1>
          </div>

          <p className="m-0 mb-8 max-w-[440px] text-[18px] leading-[1.5] text-white/65">
            Celebrating 15 years of supporting experimental & bass artists on vinyl & casette
          </p>
          <div className="flex gap-4 flex-col sm:flex-row">
            <Button variant="primary" href="https://open.spotify.com/search/label%3Adome-of-doom/albums"><div className="flex gap-2 justify-center items-center">Listen Now<ArrowUpRightIcon size={15}/></div></Button>
            <Button variant="secondary" to="/merch"><div className="flex gap-2 justify-center items-center">Shop Merch<ArrowRightIcon size={15} /></div></Button>
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
                  filter: `drop-shadow(rgb(30, 30, 30) 1px 1px 0px) drop-shadow(rgb(30, 30, 30) 2px 2px 0px) drop-shadow(rgb(30, 30, 30) 3px 3px 0px) drop-shadow(${colors.accent} 2px 2px 0px)`,
                  border: `2px solid ${colors.accent}`,
                }}
              />
            </div>
            <div className="flex flex-col justify-center px-10 py-9 pl-13">
              <div className="text-[13px] font-black uppercase tracking-[0.1em]" style={{ color: colors.accent2 }}>
                {latestRelease.spotify_url
                  ? "OUT NOW"
                  : `COMING ${formatReleaseDate(latestRelease.release_date) ?? "SOON"}`}
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
                    <span className="inline-flex items-center gap-[6px]">
                      <SpotifyIcon size={14} />
                      Spotify
                    </span>
                  </Button>
                ) : (
                  <Button type="small" variant="disabled">
                    <span className="inline-flex items-center gap-[6px]">
                      <SpotifyIcon size={14} />
                      Coming Soon
                    </span>
                  </Button>
                )}
                {latestRelease.bandcamp_url && (
                  <Button type="small" variant="secondary" href={latestRelease.bandcamp_url}>
                    <span className="inline-flex items-center gap-[6px]">
                      <BandcampIcon size={14} />
                      Bandcamp
                    </span>
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
        <SectionHeader title="Upcoming Shows" linkTo="/shows" linkText="Past Shows" />
        <div style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}>
          {upcomingShows.length === 0 ? (
            <div className="py-10 text-center text-[14px] text-white/45">No upcoming shows announced yet — check back soon.</div>
          ) : (
            upcomingShows.map((show, i) => <ShowRow key={i} show={show} />)
          )}
        </div>
      </div>

      {/* MERCH TEASER */}
      {merchTeaser.length > 0 && (
        <div className="mx-auto max-w-[1400px] px-10 pb-[100px]">
          <SectionHeader title="Merch" linkTo="/merch" linkText="Shop All" />
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {merchTeaser.map((item, i) => (
              <Link key={i} to="/merch" className="group block">
                  <div className="mb-3.5 aspect-square overflow-hidden" style={{ background: colors.bg }}>
                    <PosterFrame clickable>
                      <img
                        src={item.cover_art_src.replace("_10", "_2")}
                        alt={item.item_name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.2]"
                      />
                    </PosterFrame>
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
