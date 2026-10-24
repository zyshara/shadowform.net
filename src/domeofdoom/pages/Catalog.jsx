// src/domeofdoom/pages/Catalog.jsx
//
// Filter bar (dropdown pills: Format / Type / Origin / Year, sort on the
// right) above a full-bleed image grid with a bottom-gradient title/artist/
// type·year caption on each card - ported from a Claude Design mock, not
// the earlier "Crate Sidebar" checkbox-list direction this page used
// before.
//
// The route loader supplies normalized catalog data from Strapi.
// Facet counts are cross-filtered against the OTHER active groups' current
// selection (but not the group's own selection) - see facetCounts below.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link, useSearchParams } from "react-router";
import { catalogItemSlug } from "@/utils/catalogItemSlug";
import FilterBar from "@/components/FilterBar";
import IndexPageHeader from "@/components/IndexPageHeader";
import { colors } from "@/tokens";
import WarpedGrid from "@/components/WarpedGrid";
import StarIcon from "@/components/StarIcon";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

// value = the real stored format name (must match derived.formats exactly
// for filtering to work); label = what the dropdown displays. These differ
// for Cassette on request ("Cassette Tape" reads more clearly to a fan
// than the bare CMS taxonomy term).
const FORMAT_OPTIONS = [
  { value: "Vinyl", label: "Vinyl" },
  { value: "Cassette", label: "Cassette Tape" },
  { value: "Compact Disc", label: "Compact Disc" },
  { value: "Digital", label: "Digital" },
];
const TYPE_OPTIONS = ["Album", "EP", "Single", "Compilation", "Sample Pack"];
// "Origin" per conversation history - not a real genre facet (we don't
// have genre data), this is label_role wearing a fan-facing name.
const ORIGIN_OPTIONS = [
  { value: "original", label: "Original Release" },
  { value: "reissue", label: "Reissue" },
  { value: "physical", label: "Physical Only" },
  { value: "other", label: "Other" },
];

// Each filter group lives in its own comma-separated querystring param
// (?format=Vinyl,Cassette&type=Album&origin=original&year=2025,2024&
// sort=oldest) - readable/shareable URLs over a single opaque blob, and
// simple enough that no option value currently contains a comma itself.
function setFromParam(searchParams, key, transform = (v) => v) {
  const raw = searchParams.get(key);
  if (!raw) return new Set();
  return new Set(raw.split(",").map(transform).filter((v) => v !== null && v !== "" && !Number.isNaN(v)));
}

function yearOf(item) {
  const t = new Date(item.release_date).getTime();
  return isNaN(t) ? null : new Date(item.release_date).getUTCFullYear();
}

function timestampOf(item) {
  const t = new Date(item.release_date).getTime();
  return isNaN(t) ? 0 : t;
}

// Compilations, and anything with 5+ linked artists, read better as
// "Various Artists" than a long comma-joined name list on a small grid
// card - individual artist attribution still lives on the item's own
// CatalogItem page.
function artistDisplayLabel(item) {
  if (item.type === "Compilation" || item.artists.length >= 5) return "Various Artists";
  return item.artists.join(", ");
}

const CatalogCard = ({ item }) => (
  <Link
    to={`/catalog/${catalogItemSlug(item)}`}
    className="group relative aspect-[135/172] cursor-pointer overflow-hidden bg-dod-deep-purple/20 border border-dod-lilac/50 hover:border-dod-neon-mint/60 transition-colors duration-300 gap-2"
  >
    {item.catalog_number && (
      <div className="absolute bottom-2 font-ppneue left-2 z-10 border border-dod-lilac bg-dod-black/65 px-1.5 py-0.5 font-medium text-xxxs xl:text-xs uppercase tracking-wide text-dod-white group-hover:border-dod-neon-mint transition-colors">
        {item.catalog_number}
      </div>
    )}
    { item.label_role === "reissue" && (
      <div className="absolute bottom-2 font-ppneue right-2 z-10 border border-dod-pink bg-dod-pink font-medium px-1.5 py-0.5 text-xxxs xl:text-xs uppercase tracking-wide text-dod-black">
        Reissue
      </div>
    )}
    { item.label_role === "physical" && (
      <div className="absolute bottom-2 font-ppneue right-2 z-10 border border-dod-orange bg-dod-orange font-medium px-1.5 py-0.5 text-xxxs xl:text-xs uppercase tracking-wide text-dod-black">
        Physical Only
      </div>
    )}
    {item.artwork_url && (
      <img
        src={item.artwork_url}
        alt={item.title}
        loading="lazy"
        decoding="async"
        className="absolute bottom-0 aspect-square w-full object-cover transition-[filter_transform] group-hover:scale-105 group-hover:brightness-[1.2] group-hover:saturate-[1.5] duration-300"
      />
    )}
    {/* aspect-[135/172] card + aspect-square image (bottom-anchored) means
        the image only covers the bottom ~78.5% of the card - the rest is
        bare card background. The old stops didn't hit 100% opacity until
        90%, so between ~78.5%-90% a translucent gradient sat over two
        different surfaces (image vs flat bg), and their different colors
        showed through as a seam even though the overlay itself was
        continuous. Hitting solid black by 78% keeps 100%-opaque coverage
        starting at/before the image's real top edge, so the fade only
        ever plays out over the photo itself - never over bare background. */}
    <div className="absolute inset-x-0 h-full bg-[linear-gradient(to_top,transparent_0%,color-mix(in_srgb,var(--color-dod-deep-purple)_30%,transparent)_25%,color-mix(in_srgb,var(--color-dod-black)_55%,transparent)_45%,color-mix(in_srgb,var(--color-dod-black)_90%,transparent)_62%,var(--color-dod-black)_78%)] p-3 pt-4">
<div className="mt-1 text-[11px] uppercase tracking-wide text-dod-lilac/50">
  {item.type} · {yearOf(item)}
</div>
      <div className="font-archivo font-bold [font-stretch:expanded] [font-variation-settings:'wdth'_125] text-clamp-[10px,_1vw,_22px] font-semibold uppercase text-dod-white text-xs md:text-lg">{item.title}</div>
      {(item.type === "Compilation" || item.artists.length > 0) && (
        <div className="font-ppneue text-xs text-dod-white">{artistDisplayLabel(item)}</div>
      )}
    </div>
  </Link>
);

const Catalog = ({ allItems = [] }) => {
  usePageTitle("Catalog");
  const [searchParams, setSearchParams] = useSearchParams();

  // Lazy initializers (function form of useState) - only read the URL
  // once, on first mount. After that these are the source of truth and
  // the effect below writes THEM back into the URL, not the other way
  // around - so typing in the search bar mid-session can't get clobbered
  // by a stale searchParams reference.
  const [formatSel, setFormatSel] = useState(() => setFromParam(searchParams, "format"));
  const [typeSel, setTypeSel] = useState(() => setFromParam(searchParams, "type"));
  const [originSel, setOriginSel] = useState(() => setFromParam(searchParams, "origin"));
  const [yearSel, setYearSel] = useState(() => setFromParam(searchParams, "year", Number));
  const [sortOrder, setSortOrder] = useState(() => searchParams.get("sort") || "newest");

  // Keeps the URL in sync with the filter/sort state - shareable/
  // bookmarkable filtered views, and the back button un-applies the last
  // change. `replace: true` so toggling checkboxes doesn't spam browser
  // history with an entry per click.
  useEffect(() => {
    const params = new URLSearchParams();
    if (formatSel.size) params.set("format", [...formatSel].join(","));
    if (typeSel.size) params.set("type", [...typeSel].join(","));
    if (originSel.size) params.set("origin", [...originSel].join(","));
    if (yearSel.size) params.set("year", [...yearSel].join(","));
    if (sortOrder !== "newest") params.set("sort", sortOrder);
    setSearchParams(params, { replace: true });
  }, [formatSel, typeSel, originSel, yearSel, sortOrder, setSearchParams]);

  const descriptionRef = useRef(null);

  const yearOptions = useMemo(() => {
    const set = new Set();
    allItems.forEach((item) => {
      const y = yearOf(item);
      if (y) set.add(y);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [allItems]);

  // Real faceted counts: each group's option counts are computed against
  // items matching every OTHER active group's selection (but not its own -
  // otherwise picking "Vinyl" would zero out every other Format option).
  // So checking a Type filter updates the numbers next to Format/Origin/
  // Year, and vice versa.
  const facetCounts = useMemo(() => {
    const matchesExcept = (item, exceptGroup) => {
      if (exceptGroup !== "format" && formatSel.size && !item.formats.some((f) => formatSel.has(f))) return false;
      if (exceptGroup !== "type" && typeSel.size && !typeSel.has(item.type)) return false;
      if (exceptGroup !== "origin" && originSel.size && !originSel.has(item.label_role)) return false;
      if (exceptGroup !== "year" && yearSel.size && !yearSel.has(yearOf(item))) return false;
      return true;
    };

    const counts = { format: {}, type: {}, origin: {}, year: {} };
    allItems.forEach((item) => {
      if (matchesExcept(item, "format")) {
        item.formats.forEach((f) => { counts.format[f] = (counts.format[f] ?? 0) + 1; });
      }
      if (matchesExcept(item, "type")) {
        counts.type[item.type] = (counts.type[item.type] ?? 0) + 1;
      }
      if (matchesExcept(item, "origin")) {
        counts.origin[item.label_role] = (counts.origin[item.label_role] ?? 0) + 1;
      }
      if (matchesExcept(item, "year")) {
        const y = yearOf(item);
        if (y) counts.year[y] = (counts.year[y] ?? 0) + 1;
      }
    });
    return counts;
  }, [allItems, formatSel, typeSel, originSel, yearSel]);

  const toggle = (setFn) => (value) =>
    setFn((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });

  const clearAll = () => {
    setFormatSel(new Set());
    setTypeSel(new Set());
    setOriginSel(new Set());
    setYearSel(new Set());
  };

  const items = useMemo(() => {
    let list = allItems.filter((item) => {
      if (formatSel.size && !item.formats.some((f) => formatSel.has(f))) return false;
      if (typeSel.size && !typeSel.has(item.type)) return false;
      if (originSel.size && !originSel.has(item.label_role)) return false;
      if (yearSel.size && !yearSel.has(yearOf(item))) return false;
      return true;
    });
    list = list.slice().sort((a, b) => {
      if (sortOrder === "az") return a.title.localeCompare(b.title);
      if (sortOrder === "oldest") return timestampOf(a) - timestampOf(b);
      return timestampOf(b) - timestampOf(a);
    });
    return list;
  }, [allItems, formatSel, typeSel, originSel, yearSel, sortOrder]);

  const { visibleItems, sentinelRef } = useInfiniteScroll(items, 24);

  return (
    <div className="flex flex-col gap-10">
      <IndexPageHeader heading="CATALOG" count={items.length} total={allItems.length}
        descriptionRef={descriptionRef}
        description="Comprehensive catalog of our original releases, vinyl presses, cassette duplications, and more"
        asset={<>          <div className="absolute inset-0 w-full h-full object-cover flex justify-center items-center filter-[saturate(2)]">
            <img
              className="absolute object-cover transition-all" 
              src="https://res.cloudinary.com/dfeyhbxeg/image/upload/f_auto,q_auto,w_1200/v1786587597/distressed_texture_c11a949095.png"/>
            <StarIcon
              size={300}
              gradientFrom={colors.deep_purple}
              gradientTo={colors.neon_mint}
              showGlow={true}
              showBackground={false}
              className="absolute transform-[rotateY(4deg)_rotateZ(-30deg)_scaleX(1.05)] animate-[star-hover_6s_ease-in-out_infinite]"
            />
            <WarpedGrid/>
          </div>
</>}
      />

        <FilterBar
          groups={[
            { key: "format", label: "Format", options: FORMAT_OPTIONS.map(f => ({ ...f, count: facetCounts.format[f.value] ?? 0 })), selected: formatSel, onToggle: toggle(setFormatSel) },
            { key: "type", label: "Type", options: TYPE_OPTIONS.map(value => ({ value, label: value, count: facetCounts.type[value] ?? 0 })), selected: typeSel, onToggle: toggle(setTypeSel) },
            { key: "origin", label: "Origin", options: ORIGIN_OPTIONS.map(f => ({ ...f, count: facetCounts.origin[f.value] ?? 0 })), selected: originSel, onToggle: toggle(setOriginSel) },
            { key: "year", label: "Year", options: yearOptions.map(value => ({ value, label: String(value), count: facetCounts.year[value] ?? 0 })), selected: yearSel, onToggle: toggle(setYearSel) },
          ]}
          sortOptions={[{ value: "newest", label: "Newest First" }, { value: "oldest", label: "Oldest First" }, { value: "az", label: "A–Z" }]}
          sortValue={sortOrder} onSortChange={setSortOrder} resultCount={items.length}
          onClearAll={clearAll} panelTopRef={descriptionRef}
        />

        {/* Grid */}
        {items.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
              {visibleItems.map((item) => (
                <CatalogCard key={item.uid} item={item} />
              ))}
            </div>
            <div ref={sentinelRef} className="pb-20" />
          </>
        ) : (
          <div className="py-16 text-center font-sans text-dod-lilac/60">
            No releases match the current filters.
          </div>
        )}
    </div>
  );
};

export default Catalog;
