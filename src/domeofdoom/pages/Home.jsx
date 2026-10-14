import React from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "react-router-dom";
import { readSeedData } from "@/utils/readSeedData";
import { catalogItemSlug } from "@/utils/catalogItemSlug";
import { colors } from "@/tokens";
import Button from "@/components/Button";
import testBg3 from "@/assets/test_bg_3.png";
import SpotifyIcon from "@/components/SpotifyIcon";
import BandcampIcon from "@/components/BandcampIcon";
import ArrowUpRightIcon from "@/components/ArrowUpRightIcon";
import ArrowRightIcon from "@/components/ArrowRightIcon";
import TiltedCover from "@/components/TiltedCover";
import StarIcon from "@/components/StarIcon";
import GlobeRings from "@/components/GlobeRings";
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

function HomeSectionHeader({ title, linkTo, linkText }) {
  return (
    <div className="flex items-center gap-3 mb-8 w-full">
      <SectionDots color={colors.accent2} size={18} className="flex-shrink-0" />
      <span
        className="flex-shrink-0 whitespace-nowrap"
        style={{
          fontFamily: "Archivo, sans-serif",
          fontStretch: "expanded",
          fontVariationSettings: '"wdth" 125',
          fontWeight: 700,
          fontSize: "clamp(11px, 1.1vw, 14px)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "var(--dod-accent)",
        }}
      >
        {title}
      </span>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, color-mix(in srgb, var(--dod-white) 60%, transparent), color-mix(in srgb, var(--dod-lilac) 80%, transparent))" }} />
      {linkTo && (
        <Link
          to={linkTo}
          className="navlink-hover-flash flex-shrink-0 flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.08em] whitespace-nowrap"
          style={{ color: colors.accent2 }}
        >
          {linkText}
          <ArrowRightIcon size={12} />
        </Link>
      )}
    </div>
  );
}

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
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isUpcoming(item) {
  if (!item?.release_date) return false;
  return new Date(item.release_date).getTime() > Date.now();
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

      <div className="grid grid-cols-1 lg:grid-cols-[440px_1fr] relative overflow-hidden">
        <div
          className="absolute top-0 bottom-0 w-full lg:w-[440px] pointer-events-none overflow-hidden"
          style={{
            left: "20px",
            maskImage: "radial-gradient(ellipse 95% 85% at 50% 50%, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 95% 85% at 50% 50%, black 30%, transparent 75%)",
          }}
        >
          <WarpedGrid density={0.4} className="absolute inset-0 opacity-80" />
        </div>
        {/* Cover side */}
        <div className="flex items-center justify-center py-14 px-10 min-h-[340px] relative">
          <div className="relative z-10 w-[300px] lg:w-[380px]">
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

function ReleaseCard({ item }) {
  const upcoming = isUpcoming(item);
  const slug = catalogItemSlug(item);
  const date = formatReleaseDate(item.release_date);
  const year = releaseYear(item);
  const description = item.description ? stripHtml(item.description) : null;

  // Upcoming = mint theme; Latest = lilac theme
  const themeColor = upcoming ? "var(--dod-neon-mint)" : "var(--dod-lilac)";

  const cta = upcoming ? (
    <Link
      to={`/catalog/${slug}`}
      className="flex items-center justify-center gap-2 border py-3 text-[11px] font-black uppercase tracking-[0.1em] transition-colors hover:opacity-80"
      style={{ color: themeColor, borderColor: themeColor }}
    >
      Pre-Save <ArrowRightIcon size={12} />
    </Link>
  ) : (
    <a
      href={item.spotify_url || undefined}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 border py-3 text-[11px] font-black uppercase tracking-[0.1em] transition-colors hover:opacity-80"
      style={{ color: themeColor, borderColor: themeColor }}
    >
      Listen Now <ArrowRightIcon size={12} />
    </a>
  );

  return (
    <div
      className="relative flex flex-col gap-4 border p-5"
      style={{ borderColor: themeColor, background: "transparent" }}
    >
      <CardLabelBadge
        text={upcoming ? "Upcoming Release" : "Latest Release"}
        icon={upcoming ? CalendarIcon : PlusCircleIcon}
        color={themeColor}
        style={{ position: "absolute", top: "-1px", left: "-1px" }}
      />

      {date && (
        <div className="flex justify-end">
          <span className="flex-shrink-0 text-[11px] font-medium uppercase tracking-[0.04em]" style={{ color: "rgba(255,255,255,0.35)" }}>
            {date}
          </span>
        </div>
      )}

      {/* Cover + info — stacked on mobile, two columns (cover left, details right) from sm up */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="aspect-square w-full overflow-hidden border border-dod-lilac/70">
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
              className="font-black uppercase leading-tight"
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

          <div className="mt-auto pt-2">{cta}</div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FeatureReleaseCard — single wide card (1-up layout)
// ---------------------------------------------------------------------------

function FeatureReleaseCard({ item }) {
  const year = releaseYear(item);
  const slug = catalogItemSlug(item);
  const description = item.description ? stripHtml(item.description) : null;

  return (
    <div
      className="grid border border-white/10 overflow-hidden"
      style={{
        background: colors.card,
        gridTemplateColumns: "56px 1fr 1fr 56px",
      }}
    >
      {/* Far-left: DOD label column */}
      <div
        className="flex flex-col items-center justify-between py-6 border-r border-white/[0.06]"
        style={{ background: "rgba(0,0,0,0.2)" }}
      >
        <div
          className="text-[8px] font-black uppercase tracking-[0.18em] text-center leading-tight"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          DOD
        </div>
        <div
          className="text-[8px] font-bold"
          style={{
            color: "rgba(255,255,255,0.2)",
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            letterSpacing: "0.2em",
          }}
        >
          {year ?? ""}
        </div>
        <div className="w-px flex-1 mt-2 mb-2" style={{ background: "rgba(255,255,255,0.08)" }} />
      </div>

      {/* Cover */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "1 / 1" }}>
        {item.artwork_url ? (
          <img
            src={item.artwork_url}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "var(--dod-deep-purple)" }}>
            <StarIcon size={120} showBackground={false} showGlow />
          </div>
        )}
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[color:var(--dod-card)] to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center px-10 py-10 gap-4">
        <div style={typeLabel}>
          {item.type ?? "Single"}{year ? ` · ${year}` : ""}
        </div>

        <Link to={`/catalog/${slug}`} className="group">
          <h2
            className="m-0 italic font-black uppercase leading-[0.95] group-hover:opacity-80 transition-opacity"
            style={{
              fontFamily: "Archivo, sans-serif",
              fontStretch: "expanded",
              fontVariationSettings: '"wdth" 125',
              fontSize: "clamp(42px, 5vw, 72px)",
              color: "var(--dod-accent)",
            }}
          >
            {item.title}
          </h2>
        </Link>

        {item.artists?.length > 0 && (
          <div
            className="font-semibold"
            style={{ fontSize: "clamp(16px, 1.6vw, 22px)", color: "rgba(255,255,255,0.75)" }}
          >
            {item.artists.join(", ")}
          </div>
        )}

        {description && (
          <p className="m-0 text-[13px] leading-relaxed line-clamp-3" style={{ color: "rgba(255,255,255,0.45)" }}>
            {description}
          </p>
        )}

        <div className="mt-2">
          <Button
            variant="primary"
            type="small"
            href={item.spotify_url || undefined}
            to={!item.spotify_url ? `/catalog/${slug}` : undefined}
          >
            <span className="inline-flex items-center gap-2">
              Listen Now <ArrowUpRightIcon size={11} />
            </span>
          </Button>
        </div>

        {/* Platform row */}
        <div className="flex items-center gap-5 mt-1">
          {item.spotify_url && (
            <a
              href={item.spotify_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] opacity-40 hover:opacity-80 transition-opacity"
              style={{ color: "var(--dod-text)" }}
            >
              <SpotifyIcon size={12} /> Spotify
            </a>
          )}
          {item.bandcamp_url && (
            <a
              href={item.bandcamp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] opacity-40 hover:opacity-80 transition-opacity"
              style={{ color: "var(--dod-text)" }}
            >
              <BandcampIcon size={12} /> Bandcamp
            </a>
          )}
        </div>
      </div>

      {/* Far-right decorative column */}
      <div
        className="flex flex-col items-center justify-between py-6 border-l border-white/[0.06]"
        style={{ background: "rgba(0,0,0,0.2)" }}
      >
        <StarIcon
          size={28}
          gradientFrom="var(--dod-accent2)"
          gradientTo="var(--dod-accent2)"
          glowColor="var(--dod-accent2)"
          showBackground={false}
          showGlow
        />
        <GlobeRings
          size={38}
          radius={13}
          meridianCount={3}
          parallelCount={3}
          tilt={0.32}
          strokeWidth={0.7}
          gradientFrom="var(--dod-accent2)"
          gradientTo="var(--dod-accent2)"
          glowColor="var(--dod-accent2)"
          glowIntensity={2}
          showFill={false}
          rings={[{ angle: -18, rx: 18, ry: 5, colorFrom: "var(--dod-accent2)", glowIntensity: 3, thickness: 0.7 }]}
        />
        <div
          className="text-[7px] font-bold uppercase text-center leading-loose"
          style={{
            color: "rgba(255,255,255,0.2)",
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            letterSpacing: "0.25em",
          }}
        >
          Low&nbsp;Frequencies Brighter&nbsp;Worlds
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LatestReleasesSection
// ---------------------------------------------------------------------------

function LatestReleasesSection({ latestRelease, upcomingRelease }) {
  if (!latestRelease && !upcomingRelease) return null;

  return (
    <div className="mx-auto max-w-[1400px] pb-[100px] px-6 lg:px-10">
      <HomeSectionHeader title="Latest Releases" linkTo="/catalog" linkText="View All" />

      {upcomingRelease ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ReleaseCard item={upcomingRelease} />
          {latestRelease && <ReleaseCard item={latestRelease} />}
        </div>
      ) : (
        <FeatureReleaseCard item={latestRelease} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

const Home = () => {
  usePageTitle(null);

  const catalogItems = readSeedData("catalog-items-data") ?? [];
  const now = Date.now();

  const compilations = catalogItems
    .filter((i) => i.type === "Compilation")
    .sort((a, b) => new Date(b.release_date ?? 0) - new Date(a.release_date ?? 0));

  const nonCompilations = catalogItems
    .filter((i) => i.type !== "Compilation")
    .sort((a, b) => new Date(b.release_date ?? 0) - new Date(a.release_date ?? 0));

  const latestCompilation = compilations[0] ?? null;

  const released = nonCompilations.filter(
    (i) => !i.release_date || new Date(i.release_date).getTime() <= now
  );
  const latestRelease = released[0] ?? nonCompilations[0] ?? null;
  // PREVIEW: test upcoming release card with fake future date
  const upcomingRelease = released[1] ? { ...released[1], release_date: "2027-06-01" } : null;

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
            <Button variant="primary" href="https://open.spotify.com/search/label%3Adome-of-doom/albums">
              <div className="flex gap-2 justify-center items-center">Listen Now<ArrowUpRightIcon size={15} /></div>
            </Button>
            <Button variant="secondary" to="/merch">
              <div className="flex gap-2 justify-center items-center">Shop Merch<ArrowRightIcon size={15} /></div>
            </Button>
          </div>
        </div>
      </div>

      <LatestCompilationSection item={latestCompilation} />
      <LatestReleasesSection latestRelease={latestRelease} upcomingRelease={upcomingRelease} />
    </div>
  );
};

export default Home;
