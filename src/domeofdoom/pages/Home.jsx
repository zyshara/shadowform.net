import React from "react";
import { Link } from "react-router-dom";
import { readSeedData } from "@/utils/readSeedData";
import { colors, LOGO_URL } from "@/tokens";
import Button from "@/components/Button";

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

  const latestRelease = releases[0];
  const availableMerch = merchItems.filter((m) => !m.sold_out);
  const merchTeaser = (availableMerch.length ? availableMerch : merchItems).slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <div className="relative h-[640px] overflow-hidden border-b border-white/10">
        <img
          src="https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785465704/hero_sphere_3498e09523.png"
          alt=""
          className="pointer-events-none absolute right-[-5%] top-1/2 h-[115%] w-auto -translate-y-1/2 object-contain"
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
            className="grid grid-cols-1 overflow-hidden rounded-[18px] border border-white/10 sm:grid-cols-[340px_1fr]"
            style={{ background: colors.card }}
          >
            <div className="aspect-square" style={{ background: colors.bg }}>
              <img src={latestRelease.cover_art_src} alt={latestRelease.release_name} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col justify-center px-10 py-9">
              <div className="mb-2.5 text-[13px] font-black uppercase tracking-[0.1em]" style={{ color: colors.accent }}>
                New on Bandcamp
              </div>
              <div className="mb-1 text-[30px] font-black uppercase leading-[1.1]">{latestRelease.release_name}</div>
              <div className="text-[15px] font-medium text-white/55">{latestRelease.artist}</div>
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
