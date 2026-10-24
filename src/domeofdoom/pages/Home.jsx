import HomeSectionHeader from "@/components/HomeSectionHeader";
import React from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "react-router";
import { catalogItemSlug } from "@/utils/catalogItemSlug";
import { selectHomeReleases } from "@/utils/homeReleases";
import { colors } from "@/tokens";
import Button from "@/components/Button";
import testBg3 from "@/assets/test_bg_3.png";
import SpotifyIcon from "@/components/SpotifyIcon";
import BandcampIcon from "@/components/BandcampIcon";
import ArrowUpRightIcon from "@/components/ArrowUpRightIcon";
import ArrowRightIcon from "@/components/ArrowRightIcon";
import TiltedCover from "@/components/TiltedCover";
import StarIcon from "@/components/StarIcon";
import GlobeIcon from "@/components/GlobeIcon";
import GlobeSlideButton from "@/components/GlobeSlideButton";
import SectionDots from "@/components/SectionDots";
import WarpedGrid from "@/components/WarpedGrid";
import CardLabelBadge from "@/components/CardLabelBadge";
import CalendarIcon from "@/components/CalendarIcon";
import PlusCircleIcon from "@/components/PlusCircleIcon";

// ---------------------------------------------------------------------------
// HomeSectionHeader — small tracked label + rule + link (matches mock)
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function releaseYear(item) {
  const d = item?.release_date ? new Date(item.release_date) : null;
  return d && !isNaN(d) ? d.getUTCFullYear() : null;
}

function formatReleaseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function isUpcoming(item, now) {
  if (!item?.release_date) return false;
  return new Date(item.release_date).getTime() > now;
}

// Strip HTML tags for plain-text contexts
function stripHtml(html) {
  return html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";
}

const typeLabel = {
  fontFamily: "Archivo, sans-serif",
  fontStretch: "expanded",
  fontVariationSettings: '"wdth" 125',
  fontWeight: 700,
  fontSize: "11px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--dod-accent2)",
};

// ---------------------------------------------------------------------------
// PlatformButton — icon + label + globe, used in compilation section
// ---------------------------------------------------------------------------

function PlatformButton({ href, icon, label, variant = "primary" }) {
  const isMint = variant === "primary";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-3 px-4 py-3 border transition-colors duration-150 hover:opacity-80"
      style={{
        borderColor: isMint ? "var(--dod-accent)" : "var(--dod-accent2)",
        background: "transparent",
        minWidth: "160px",
        textDecoration: "none",
      }}
    >
      <span
        className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.1em]"
        style={{ color: isMint ? "var(--dod-accent)" : "var(--dod-accent2)" }}
      >
        {icon}
        {label}
      </span>
      <GlobeIcon
        size={16}
        className="opacity-40"
        style={{ color: isMint ? "var(--dod-accent)" : "var(--dod-accent2)" }}
      />
    </a>
  );
}

// ---------------------------------------------------------------------------
// LatestCompilationSection
// ---------------------------------------------------------------------------

function LatestCompilationSection({ item }) {
  if (!item) return null;
  const year = releaseYear(item);
  const slug = catalogItemSlug(item);
  const description = item.description ? stripHtml(item.description) : null;

  return (
    <div className="mx-auto max-w-[1400px] pb-[80px] pt-12 px-6 lg:px-10">
      <HomeSectionHeader title="Latest Compilation" linkTo={`/catalog/${slug}`} linkText="Learn More" />

      <div className="grid grid-cols-1 3xl:grid-cols-[440px_1fr] relative overflow-hidden">
        {/* Keep the decorative grid inside the artwork area at every breakpoint. */}
        <div className="isolate flex items-center justify-center py-14 px-10 min-h-[340px] relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{
              maskImage: "radial-gradient(ellipse 95% 85% at 50% 50%, black 30%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse 95% 85% at 50% 50%, black 30%, transparent 75%)",
            }}
          >
            <WarpedGrid density={0.4} className="absolute inset-0 opacity-80" />
          </div>
          <div className="relative z-10 w-[300px] 3xl:w-[380px]">
            <TiltedCover
              artworkUrl={item.artwork_url}
              title={item.title}
            />
          </div>
        </div>

        {/* Details side */}
        <div className="flex flex-col justify-center px-12 py-12 gap-5">
          <div style={typeLabel}>
            Compilation{year ? ` · ${year}` : ""}
          </div>

          <Link to={`/catalog/${slug}`} className="group">
            <h2
              className="m-0 italic leading-[1.05] uppercase group-hover:opacity-80 transition-opacity"
              style={{
                fontFamily: "Archivo, sans-serif",
                fontStretch: "expanded",
                fontVariationSettings: '"wdth" 125',
                fontWeight: 800,
                fontSize: "clamp(28px, 3vw, 48px)",
                color: "var(--dod-accent)",
              }}
            >
              {item.title}
            </h2>
          </Link>

          {item.artists?.length > 0 && (
            <p className="m-0 text-[13px] leading-relaxed" style={{ color: "var(--dod-accent2)" }}>
              {item.artists.join(", ")}
            </p>
          )}

          {description && (
            <p className="m-0 text-[14px] leading-relaxed line-clamp-4" style={{ color: "rgba(255,255,255,0.55)" }}>
              {description}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            {item.spotify_url && (
              <GlobeSlideButton
                text="Spotify"
                leftIcon={<SpotifyIcon size={20} />}
                icon={<ArrowUpRightIcon size={20} />}
                size="md"
                thickness="thin"
                duration={520}
                labelShift={26}
                color="var(--dod-neon-mint)"
                href={item.spotify_url}
              />
            )}
            {item.bandcamp_url && (
              <GlobeSlideButton
                text="Bandcamp"
                leftIcon={<BandcampIcon size={20} />}
                icon={<ArrowUpRightIcon size={20} />}
                size="md"
                thickness="thin"
                duration={520}
                labelShift={26}
                color="var(--dod-lilac)"
                href={item.bandcamp_url}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ReleaseCard — corner badge, date, cover + details row, CTA
// ---------------------------------------------------------------------------

function ReleaseCard({ item, now, showLabel = true, primary = false }) {
  const upcoming = isUpcoming(item, now);
  const slug = catalogItemSlug(item);
  const date = formatReleaseDate(item.release_date);
  const year = releaseYear(item);
  const description = item.description ? stripHtml(item.description) : null;

  // Card position determines its skin; release date determines its label.
  const themeColor = primary ? "var(--dod-neon-mint)" : "var(--dod-lilac)";

  const cta = (
    <Button
      variant={primary ? "primary" : "secondary"}
      to={upcoming ? `/catalog/${slug}` : "/catalog"}
      className="w-full min-w-0"
    >
      <span className="flex items-center justify-center gap-2">
        {upcoming ? "Learn More" : "Listen Now"}
        <ArrowRightIcon size={15} />
      </span>
    </Button>
  );

  return (
    <div
      className="relative flex min-w-0 flex-col gap-4 border p-5"
      style={{ borderColor: themeColor, background: "transparent" }}
    >
      {showLabel && <CardLabelBadge
        text={upcoming ? "Upcoming Release" : "Latest Release"}
        icon={upcoming ? CalendarIcon : PlusCircleIcon}
        color={themeColor}
        style={{ position: "absolute", top: "-1px", left: "-1px" }}
      />}

      {date && (
        <div className="flex justify-end">
          <span className="flex-shrink-0 text-[11px] font-medium uppercase tracking-[0.04em]" style={{ color: "rgba(255,255,255,0.35)" }}>
            {date}
          </span>
        </div>
      )}

      {/* Cover + info — stacked on mobile, two columns (cover left, details right) from sm up */}
      <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="aspect-square w-full self-start overflow-hidden border border-dod-lilac/70">
          {item.artwork_url ? (
            <img
              src={item.artwork_url}
              alt={item.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--dod-deep-purple)" }}>
              <StarIcon size={64} showBackground={false} showGlow />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <div
            className="text-[11px] font-bold uppercase leading-none tracking-[0.1em]"
            style={{ fontFamily: "'PP Neue Montreal', sans-serif" }}
          >
            <span style={{ color: "color-mix(in srgb, var(--dod-white) 50%, transparent)" }}>
              {item.type ?? "Single"}
            </span>
            {year && <span style={{ color: "var(--dod-deep-purple)" }}> · {year}</span>}
          </div>
          <Link to={`/catalog/${slug}`} className="hover:opacity-80 transition-opacity">
            <div
              className="line-clamp-3 font-black uppercase leading-tight [overflow-wrap:anywhere]"
              style={{
                fontFamily: "Archivo, sans-serif",
                fontStretch: "expanded",
                fontVariationSettings: '"wdth" 125',
                fontSize: "clamp(18px, 2vw, 26px)",
                color: "var(--dod-text)",
              }}
            >
              {item.title}
            </div>
          </Link>
          {item.artists?.length > 0 && (
            <div className="text-[13px]" style={{ color: "rgba(255,255,255,0.55)" }}>
              {item.artists.join(", ")}
            </div>
          )}
          {description && (
            <p className="m-0 text-[12px] leading-relaxed line-clamp-3" style={{ color: "rgba(255,255,255,0.4)" }}>
              {description}
            </p>
          )}

          {/* Include the button's 1px outline + 2px offset in its alignment. */}
          <div className="mt-auto px-[3px] pb-[3px] pt-2">{cta}</div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LatestReleasesSection
// ---------------------------------------------------------------------------

function LatestReleasesSection({ cards, now }) {
  if (!cards.length) return null;

  return (
    <div className="mx-auto max-w-[1400px] pb-[100px] px-6 lg:px-10">
      <HomeSectionHeader title="Latest Releases" linkTo="/catalog" linkText="View All" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {cards.map(({ item, showLabel }, index) => (
          <ReleaseCard key={item.uid || catalogItemSlug(item)} item={item} now={now} showLabel={showLabel} primary={index === 0} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

const Home = ({ catalogItems = [], now }) => {
  usePageTitle(null);


  const compilations = catalogItems
    .filter((i) => i.type === "Compilation")
    .sort((a, b) => new Date(b.release_date ?? 0) - new Date(a.release_date ?? 0));

  const latestCompilation = compilations[0] ?? null;
  const cards = selectHomeReleases(catalogItems, now);

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
          <h1
            style={{
              fontFamily: "Archivo, Arial, sans-serif",
              fontSize: "clamp(20px, 14vw, 108px)",
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
          <p className="m-0 mb-8 max-w-[440px] text-[18px] leading-[1.5] text-white/65">
            Celebrating 15 years of supporting experimental & bass artists on vinyl & casette
          </p>
          <div className="flex gap-4 flex-col sm:flex-row">
            <Button variant="primary" to="/catalog">
              <div className="flex gap-2 justify-center items-center">Listen Now<ArrowRightIcon size={15} /></div>
            </Button>
            <Button variant="secondary" href="https://domeofdoom.bandcamp.com/merch">
              <div className="flex gap-2 justify-center items-center">Shop Merch<ArrowRightIcon size={15} /></div>
            </Button>
          </div>
        </div>
      </div>

      <LatestCompilationSection item={latestCompilation} />
      <LatestReleasesSection cards={cards} now={now} />
    </div>
  );
};

export default Home;
