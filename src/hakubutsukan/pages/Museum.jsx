import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { readSeedData } from "@/utils/readSeedData";
import CompassStar from "@/components/CompassStar.jsx";

const ALL_TAG_MAP = {
  "visual-art": "Visual Art", "photography": "Photography", "design": "Design",
  "natural-history": "Natural History", "anthropology": "Anthropology",
  "science": "Science", "architecture": "Architecture", "textiles": "Textiles",
  "cultural-history": "Cultural History", "indoors": "Indoors", "outdoors": "Outdoors",
  "collection-focused": "Collection", "exhibition-focused": "Exhibitions",
  "interactive": "Interactive", "free": "Free Admission", "paid": "Paid",
  "contemporary-art": "Contemporary Art",
};

const CATEGORY_TAGS = new Set([
  "visual-art", "photography", "design", "natural-history", "anthropology",
  "science", "architecture", "textiles", "cultural-history", "interactive",
  "contemporary-art",
]);

const STATUS_LABEL = {
  open: "Open", temp_closed: "Temporarily Closed", permanently_closed: "Permanently Closed",
};

// Parchment panel — used for the Plan Your Visit sidebar
const PARCHMENT = "rgba(240,230,210,0.95)";
const PANEL_TEXT   = "#1c1408";
const PANEL_MUTED  = "rgba(28,20,8,0.5)";
const PANEL_RULE   = "rgba(160,138,90,0.22)";
const PANEL_GOLD   = "#a07828";

const SectionLabel = ({ children, dark = false }) => (
  <p
    className="text-[8px] font-ppneue uppercase tracking-[0.28em]"
    style={{ color: dark ? PANEL_MUTED : "var(--hk-sidebar-muted)" }}
  >
    {children}
  </p>
);

const ArrowRight = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="8" x2="13" y2="8" /><polyline points="9,4 13,8 9,12" />
  </svg>
);

const ExternalIcon = () => (
  <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 2H2v8h8V7" /><path d="M8 2h2v2" /><line x1="10" y1="2" x2="5" y2="7" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 14 16" width="11" height="13" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 1C4.24 1 2 3.24 2 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z" />
    <circle cx="7" cy="6" r="1.5" />
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 14 14" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="7" r="5.5" />
    <path d="M1.5 7h11M7 1.5C5.5 3.5 4.5 5.1 4.5 7s1 3.5 2.5 5.5M7 1.5C8.5 3.5 9.5 5.1 9.5 7s-1 3.5-2.5 5.5" />
  </svg>
);

function formatDateRange(start, end) {
  const fmt = (s) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return `${fmt(start)} – ongoing`;
  if (end) return `Through ${fmt(end)}`;
  return "Permanent collection";
}

function isCurrentOrUpcoming(ex) {
  if (!ex.end_date) return true;
  return new Date(ex.end_date + "T23:59:59Z") >= new Date();
}

function cityFromAddress(address) {
  if (!address) return null;
  const parts = address.split(",");
  return parts.length >= 2 ? parts[parts.length - 2].trim() : null;
}

function mapsUrl(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

const ExhibitRow = ({ exhibit }) => (
  <div className="flex border-b" style={{ borderColor: "var(--hk-sidebar-rule)" }}>
    {exhibit.image_url && (
      <div className="shrink-0 w-40 overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <img
          src={exhibit.image_url}
          alt={exhibit.title}
          className="w-full h-full object-cover"
          style={{ filter: "sepia(15%) brightness(0.85)" }}
        />
      </div>
    )}
    <div className="flex flex-col gap-2 px-6 py-5 min-w-0 flex-1">
      <p className="text-[9px] font-ppneue uppercase tracking-[0.22em]" style={{ color: "var(--hk-sidebar-gold)" }}>
        {formatDateRange(exhibit.start_date, exhibit.end_date)}
      </p>
      <h3
        className="font-display font-semibold leading-snug"
        style={{ fontSize: "clamp(1rem, 1.4vw, 1.25rem)", color: "var(--hk-sidebar-text)" }}
      >
        {exhibit.title}
      </h3>
      {exhibit.description && (
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--hk-sidebar-muted)" }}>
          {exhibit.description}
        </p>
      )}
      {exhibit.exhibit_url && (
        <a
          href={exhibit.exhibit_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[9px] font-ppneue uppercase tracking-[0.2em] mt-1 transition-opacity hover:opacity-70"
          style={{ color: "var(--hk-sidebar-gold)" }}
        >
          Exhibit Details <ArrowRight />
        </a>
      )}
    </div>
  </div>
);

const Museum = () => {
  const { slug } = useParams();

  const allMuseums  = useMemo(() => readSeedData("museums-data")  ?? [], []);
  const allExhibits = useMemo(() => readSeedData("exhibits-data") ?? [], []);

  const museum = useMemo(() => allMuseums.find((m) => m.slug === slug), [allMuseums, slug]);

  const { current, past } = useMemo(() => {
    if (!museum) return { current: [], past: [] };
    const mine = allExhibits.filter((ex) => ex.museum_id === museum.id);
    return {
      current: mine.filter(isCurrentOrUpcoming).sort((a, b) => {
        if (!a.start_date) return 1;
        if (!b.start_date) return -1;
        return new Date(a.start_date) - new Date(b.start_date);
      }),
      past: mine.filter((ex) => !isCurrentOrUpcoming(ex))
        .sort((a, b) => new Date(b.end_date) - new Date(a.end_date)),
    };
  }, [museum, allExhibits]);

  const categoryTags = useMemo(() => museum?.tags.filter(t => CATEGORY_TAGS.has(t)) ?? [], [museum]);
  const isFree       = museum?.tags.includes("free");

  if (!museum) {
    return (
      <div className="px-6 py-20 text-center text-hk-muted">
        <p className="font-display italic text-sm">Museum not found.</p>
        <Link to="/museums" className="text-xs text-hk-gold mt-4 inline-block hover:underline">
          Back to index
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8" style={{ background: "var(--hk-sidebar)", minHeight: "100vh" }}>

      {/* Back link */}
      <div className="pr-8 pt-7 pb-0">
        <Link
          to="/museums"
          className="inline-flex items-center gap-1.5 text-[9px] font-ppneue uppercase tracking-[0.22em] transition-opacity hover:opacity-60"
          style={{ color: "var(--hk-sidebar-muted)" }}
        >
          ← Back to All Museums
        </Link>
      </div>

      {/* Museum name + city */}
      <div className="pr-8 pt-5 pb-6">
        <h1
          className="font-display font-semibold uppercase leading-none"
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)", color: "var(--hk-sidebar-text)", letterSpacing: "-0.02em" }}
        >
          {museum.name}
        </h1>
        {museum.address && (
          <p className="font-ppneue text-[9px] uppercase tracking-[0.3em] mt-2" style={{ color: "var(--hk-sidebar-muted)" }}>
            {cityFromAddress(museum.address)}
          </p>
        )}
        {museum.museum_status && museum.museum_status !== "open" && (
          <span className="text-[9px] uppercase tracking-wide px-2 py-1 mt-3 inline-block border" style={{ color: "var(--hk-sidebar-muted)", borderColor: "var(--hk-sidebar-rule)" }}>
            {STATUS_LABEL[museum.museum_status] ?? museum.museum_status}
          </span>
        )}
      </div>

      {/* Main grid: image + sidebar */}
      <div className="grid grid-cols-12 items-stretch gap-12">

        {/* Hero image — 8 cols */}
        <div className="col-span-8" style={{ minHeight: "320px" }}>
          {museum.image_url ? (
            <img
              src={museum.image_url}
              alt={museum.name}
              className="w-full h-full object-cover block"
              style={{ filter: "sepia(10%) brightness(0.88)", aspectRatio: "3/2" }}
            />
          ) : (
            <div className="w-full h-full" style={{ background: "rgba(255,255,255,0.04)" }} />
          )}
        </div>

        {/* Plan Your Visit sidebar — 4 cols, parchment */}
        <div
          className="col-span-4 flex flex-col gap-5 px-7 py-7"
          style={{ background: PARCHMENT }}
        >
          <SectionLabel dark>Plan Your Visit</SectionLabel>

          {/* Address */}
          {museum.address && (
            <div className="flex gap-2.5 items-start">
              <span className="mt-0.5 shrink-0" style={{ color: PANEL_MUTED }}><PinIcon /></span>
              <span className="font-ppneue text-[11px] leading-relaxed" style={{ color: PANEL_TEXT }}>
                {museum.address}
              </span>
            </div>
          )}

          {/* Website */}
          {museum.website_url && (
            <div className="flex gap-2.5 items-center">
              <span className="shrink-0" style={{ color: PANEL_MUTED }}><GlobeIcon /></span>
              <a
                href={museum.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-ppneue text-[11px] inline-flex items-center gap-1 transition-opacity hover:opacity-70"
                style={{ color: PANEL_GOLD }}
              >
                {museum.website_url.replace(/^https?:\/\//, "")} <ExternalIcon />
              </a>
            </div>
          )}

          <div className="h-px" style={{ background: PANEL_RULE }} />

          {/* Tickets */}
          {museum.ticket_url && (
            <a
              href={museum.ticket_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between gap-2 px-4 py-3 text-[10px] font-ppneue uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
              style={{ background: PANEL_TEXT, color: PARCHMENT }}
            >
              Tickets <ArrowRight />
            </a>
          )}

          {/* Categories */}
          {categoryTags.length > 0 && (
            <div className="flex flex-col gap-2">
              <SectionLabel dark>Categories</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {categoryTags.map(tag => (
                  <Link
                    key={tag}
                    to={`/museums?tag=${tag}`}
                    className="text-[9px] font-ppneue uppercase tracking-[0.16em] px-2 py-1 border transition-opacity hover:opacity-70"
                    style={{ borderColor: PANEL_RULE, color: PANEL_TEXT }}
                  >
                    {ALL_TAG_MAP[tag] ?? tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Good to Know */}
          <div className="flex flex-col gap-1.5">
            <SectionLabel dark>Good to Know</SectionLabel>
            <p className="text-[11px] font-ppneue" style={{ color: PANEL_MUTED }}>
              {isFree ? "General Admission: Free" : "Admission required"}
            </p>
          </div>

          {/* Location */}
          {museum.address && (
            <div className="flex flex-col gap-1.5">
              <SectionLabel dark>Location</SectionLabel>
              <a
                href={mapsUrl(museum.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[10px] font-ppneue uppercase tracking-[0.2em] transition-opacity hover:opacity-70"
                style={{ color: PANEL_GOLD }}
              >
                Map <ArrowRight />
              </a>
            </div>
          )}

          {/* Decorative star */}
          <div className="mt-auto flex justify-end pt-2">
            <CompassStar size={36} color={PANEL_RULE} />
          </div>
        </div>
      </div>

      {/* Exhibits */}
      <div className="border-t" style={{ borderColor: "var(--hk-sidebar-rule)" }}>
        {current.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "var(--hk-sidebar-rule)" }}>
              <SectionLabel>Current &amp; Upcoming Exhibits</SectionLabel>
              <Link
                to="/exhibits"
                className="inline-flex items-center gap-1.5 text-[9px] font-ppneue uppercase tracking-[0.2em] transition-opacity hover:opacity-70"
                style={{ color: "var(--hk-sidebar-gold)" }}
              >
                View All Exhibits <ArrowRight />
              </Link>
            </div>
            <div className="flex flex-col">
              {current.map((ex) => <ExhibitRow key={ex.id} exhibit={ex} />)}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div className="border-t" style={{ borderColor: "var(--hk-sidebar-rule)" }}>
            <div className="px-8 py-5 border-b" style={{ borderColor: "var(--hk-sidebar-rule)" }}>
              <SectionLabel>Past Exhibits</SectionLabel>
            </div>
            <div className="flex flex-col opacity-50">
              {past.map((ex) => <ExhibitRow key={ex.id} exhibit={ex} />)}
            </div>
          </div>
        )}

        {current.length === 0 && past.length === 0 && (
          <p className="px-8 py-16 font-display italic text-sm" style={{ color: "var(--hk-sidebar-muted)" }}>
            No exhibits listed yet.
          </p>
        )}
      </div>

    </div>
  );
};

export default Museum;
