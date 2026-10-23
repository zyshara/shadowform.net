// src/domeofdoom/pages/Press.jsx
import React, { useMemo, useRef, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { colors } from "@/tokens";
import WarpedGrid from "@/components/WarpedGrid";
import WormholeGrid from "@/components/WormholeGrid";
import StarIcon from "@/components/StarIcon";
import PressCardSkeleton from "@/components/ImageSkeleton";
import FilterBar from "@/components/FilterBar";
import Button from "@/components/Button";
import ArrowRightIcon from "@/components/ArrowRightIcon";

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

const ArrowUpRightIcon = () => (
  <svg viewBox="0 0 16 16" width="10" height="10" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="13" x2="13" y2="3" />
    <polyline points="6,3 13,3 13,10" />
  </svg>
);

// ---------------------------------------------------------------------------
// Press card
// ---------------------------------------------------------------------------

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00Z");
  if (isNaN(d)) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function yearOf(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00Z");
  return isNaN(d) ? null : d.getUTCFullYear();
}

function outletInitials(name) {
  if (!name) return "DOD";
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function PressCardImage({ item, onLoad }) {
  const mode   = item.imageMode ?? "og";
  const imgSrc = mode === "override" ? item.thumbnail
               : mode === "og"       ? item.ogImage
               : null;

  const [errored, setErrored] = React.useState(false);
  const hasImage = Boolean(imgSrc) && !errored;

  // When there's nothing to load (no src or broken src), reveal the card immediately.
  // Must be unconditional — no returns before this.
  React.useEffect(() => {
    if (!hasImage) onLoad?.();
  }, [hasImage]);

  if (hasImage) {
    return (
      <img
        src={imgSrc}
        alt={item.title}
        loading="lazy"
        decoding="async"
        onLoad={onLoad}
        onError={() => setErrored(true)}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-dod-black">
      <StarIcon
        size={96}
        gradientFrom={colors.deep_purple}
        gradientTo={colors.deep_purple}
        glowColor={colors.lilac}
        showGlow={true}
        showBackground={false}
      />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,_var(--dod-black)_0%,_transparent_40%)]" />
      <div className="absolute inset-0 bg-dod-deep-purple/50 mix-blend-overlay saturate-200" />
      <WarpedGrid density={0.5} className="absolute w-full h-full scale-125" />
    </div>
  );
}

const PressCard = ({ item }) => {
  const href = item.url;
  const Tag  = href ? "a" : "div";
  const linkProps = href
    ? { href, target: "_blank", rel: "noreferrer noopener" }
    : {};

  const mode = item.imageMode ?? "og";
  const hasSrc = Boolean(mode === "override" ? item.thumbnail : mode === "og" ? item.ogImage : null);
  const [loaded, setLoaded] = React.useState(!hasSrc);

  return (
    <div className="relative border border-dod-lilac/20 hover:border-dod-neon-mint/50 transition-colors duration-200 overflow-hidden h-[220px]">
      {/* Skeleton shown until image resolves */}
      {!loaded && (
        <div className="absolute inset-0 z-10 bg-[#0d0f10]">
          <PressCardSkeleton />
        </div>
      )}
      <Tag
        {...linkProps}
        className={`group flex flex-row bg-[#0d0f10] hover:bg-[#181c1e] transition-[opacity,background-color] duration-500 overflow-hidden h-full ${href ? "cursor-pointer" : ""} ${loaded ? "opacity-100" : "opacity-0"}`}
      >
      {/* Thumbnail */}
      <div className="w-2/5 flex-shrink-0 p-3">
        <div className="relative h-full overflow-hidden">
          <PressCardImage item={item} onLoad={() => setLoaded(true)} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4 flex-1 min-w-0 overflow-hidden">
        {/* Outlet + date */}
        <div className="flex items-center justify-between gap-2">
          {item.outlet?.logo ? (
            <img
              src={item.outlet.logo}
              alt={item.outlet.name}
              loading="lazy"
              decoding="async"
              className="h-8 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity max-w-16"
            />
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-widest text-dod-lilac/60 group-hover:text-dod-lilac transition-colors leading-none">
              {item.outlet?.name ?? "—"}
            </span>
          )}
          {item.date && (
            <span className="text-[10px] text-dod-lilac/40 whitespace-nowrap flex-shrink-0">
              {formatDate(item.date)}
            </span>
          )}
        </div>

        {/* Title */}
        <div className="text-xs font-bold uppercase tracking-wide text-dod-white leading-snug group-hover:text-dod-neon-mint transition-colors duration-200 line-clamp-3">
          {item.title}
        </div>

        {/* Excerpt */}
        {item.excerpt && (
          <div className="relative flex-1 overflow-hidden min-h-0">
            <p className="text-[11px] text-dod-lilac/60 leading-relaxed">
              {item.excerpt}
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0d0f10] to-transparent group-hover:opacity-0 transition-opacity duration-500 pointer-events-none" />
          </div>
        )}

        {/* Read link */}
        {href && (
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-dod-neon-mint/70 group-hover:text-dod-neon-mint transition-colors duration-200 mt-auto">
            Read Article <ArrowUpRightIcon />
          </div>
        )}
      </div>
      </Tag>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Press page
// ---------------------------------------------------------------------------

export default function Press({ items = [] }) {
  usePageTitle("Press");
  const descriptionRef = useRef(null);

  const [yearSel,   setYearSel]   = useState(new Set());
  const [outletSel, setOutletSel] = useState(new Set());
  const [sortOrder, setSortOrder] = useState("newest");

  const toggle = (setSel) => (value) =>
    setSel((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });

  // Facet options derived from all items
  const yearOptions = useMemo(() => {
    const years = [...new Set(items.map((i) => yearOf(i.date)).filter(Boolean))].sort((a, b) => b - a);
    return years.map((y) => {
      const count = items.filter(
        (i) => yearOf(i.date) === y && (outletSel.size === 0 || outletSel.has(i.outlet?.name))
      ).length;
      return { value: String(y), label: String(y), count };
    });
  }, [items, outletSel]);

  const outletOptions = useMemo(() => {
    const names = [...new Set(items.map((i) => i.outlet?.name).filter(Boolean))].sort();
    return names.map((n) => {
      const count = items.filter(
        (i) => i.outlet?.name === n && (yearSel.size === 0 || yearSel.has(String(yearOf(i.date))))
      ).length;
      return { value: n, label: n, count };
    });
  }, [items, yearSel]);

  const filtered = useMemo(() => {
    let list = items;
    if (yearSel.size)   list = list.filter((i) => yearSel.has(String(yearOf(i.date))));
    if (outletSel.size) list = list.filter((i) => outletSel.has(i.outlet?.name));
    list = [...list].sort((a, b) => {
      const ta = a.date ? new Date(a.date).getTime() : 0;
      const tb = b.date ? new Date(b.date).getTime() : 0;
      return sortOrder === "oldest" ? ta - tb : tb - ta;
    });
    return list;
  }, [items, yearSel, outletSel, sortOrder]);

  const { visibleItems, sentinelRef, hasMore } = useInfiniteScroll(filtered, 30);

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="border-b border-dod-lilac/50 gap-4 lg:gap-0 grid grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col gap-4 lg:border-r lg:border-dod-lilac/50 lg:p-16 lg:pl-0">
          <span className="text-[clamp(4.5rem,6.3vw,6rem)] text-dod-neon-mint italic font-semibold">PRESS</span>
          <div className="text-xl">
            <span className="text-dod-lilac font-bold">{filtered.length}</span>
            {" "}of {items.length} items
          </div>
          <p ref={descriptionRef} className="text-xl text-dod-lilac">
            Articles, features, interviews, and coverage from around the world.
          </p>
          <div className="px-[3px] py-[3px]">
            <Button variant="primary" href="/DOMEOFDOOM_LICENSING.pdf" reloadDocument>
              <span className="flex items-center justify-center gap-2">
                Licensing <ArrowRightIcon size={15} />
              </span>
            </Button>
          </div>
        </div>
        <div className="relative overflow-hidden min-h-[110px]">
          <div className="absolute inset-0 w-full h-full flex justify-center items-center filter-[saturate(2)]">
            <WormholeGrid
              colorOuter={colors.deep_purple}
              colorMid={colors.lilac}
              colorInner={colors.neon_mint}
              throatGlowColor={colors.lilac}
              throatGlowIntensity={0.23}
              throatGlowReach={0.9}
              throatGlowSpread={4.8}
              scale={2.0}
              ringCount={20}
              spokeCount={44}
              perspective={0.47}
              gapEase={3.5}
              depth={378}
              tiltDeg={180}
              strokeWidth={0.4}
              strokeOpacity={0.69}
              warpStrength={0}
              solid
              showGlow
              showStars={false}
              showStar={false}
              showBackground={false}
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 w-full h-full"
            />
            <img
              className="absolute object-cover transition-all"
              src="https://res.cloudinary.com/dfeyhbxeg/image/upload/f_auto,q_auto,w_1200/v1786587597/distressed_texture_c11a949095.png"
            />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <FilterBar
        groups={[
          { key: "year",   label: "Year",   options: yearOptions,   selected: yearSel,   onToggle: toggle(setYearSel)   },
          { key: "outlet", label: "Outlet", options: outletOptions, selected: outletSel, onToggle: toggle(setOutletSel) },
        ]}
        sortOptions={[
          { value: "newest", label: "Newest First" },
          { value: "oldest", label: "Oldest First" },
        ]}
        sortValue={sortOrder}
        onSortChange={setSortOrder}
        resultCount={filtered.length}
        onClearAll={() => { setYearSel(new Set()); setOutletSel(new Set()); }}
        panelTopRef={descriptionRef}
      />

      {/* Grid */}
      {filtered.length === 0 && (
        <p className="text-dod-lilac/60 text-sm py-10 text-center">No results.</p>
      )}
      {filtered.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visibleItems.map((item) => <PressCard key={item.id} item={item} />)}
          </div>
          <div ref={sentinelRef} className="pb-20" />
        </>
      )}
    </div>
  );
}
