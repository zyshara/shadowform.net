// src/domeofdoom/pages/Catalog.jsx
//
// Filter bar (dropdown pills: Format / Type / Origin / Year, sort on the
// right) above a full-bleed image grid with a bottom-gradient title/artist/
// type·year caption on each card - ported from a Claude Design mock, not
// the earlier "Crate Sidebar" checkbox-list direction this page used
// before.
//
// Data comes from the "catalog-items-data" seed (see injectJsonData in
// server/routes/spas.js, populated by fetchAndCacheStrapiData.js every 5
// minutes) - same server-seeded-JSON pattern as discography-data/
// roster-data/etc, no client-side fetch needed. Each item is already
// override ?? derived normalized server-side (server/models/catalogItem.js).
// Facet counts are computed against the full set rather than cross-filtered
// against the other active facets (real faceted search would recompute
// each group's counts against the other groups' current selection) -
// simpler for now, worth revisiting later.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { readSeedData } from "@/utils/readSeedData";
import { catalogItemSlug } from "@/utils/catalogItemSlug";
import { STARBURST_DECOR } from "@/tokens";
import { colors } from "@/tokens";
import WarpedGrid from "@/components/WarpedGrid";
import StarIcon from "@/components/StarIcon";

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
  { value: "original", label: "Original" },
  { value: "reissue", label: "Reissue" },
  { value: "physical", label: "Physical Only" },
  { value: "other", label: "Other" },
];

function yearOf(item) {
  const t = new Date(item.release_date).getTime();
  return isNaN(t) ? null : new Date(item.release_date).getUTCFullYear();
}

function timestampOf(item) {
  const t = new Date(item.release_date).getTime();
  return isNaN(t) ? 0 : t;
}

const ChevronIcon = ({ open }) => (
  <svg
    viewBox="0 0 10 10"
    width="8"
    height="8"
    className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
  >
    <polyline points="2,3 5,7 8,3" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

// One dropdown pill button + its checkbox-list popover (Format / Type /
// Origin / Year). `panelKey` is this dropdown's identity in the shared
// openPanel state, so only one can be open at a time.
const FilterDropdown = ({ panelKey, label, options, selected, onToggle, openPanel, onOpenPanel }) => {
  const isOpen = openPanel === panelKey;
  const activeCount = selected.size;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onOpenPanel(isOpen ? null : panelKey)}
        className={`flex items-center gap-1.5 border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
          activeCount > 0
            ? "border-dod-neon-mint text-dod-neon-mint"
            : "border-dod-lilac/50 text-dod-lilac hover:border-dod-lilac"
        }`}
      >
        {label}
        {activeCount > 0 && <span>({activeCount})</span>}
        <ChevronIcon open={isOpen} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-30 mt-2 max-h-[280px] min-w-[200px] overflow-y-auto border border-dod-lilac/50 bg-dod-black p-2 shadow-xl">
          {options.map(({ value, label: optLabel, count }) => {
            const isSelected = selected.has(value);
            return (
              <div
                key={value}
                onClick={() => onToggle(value)}
                className="flex cursor-pointer items-center justify-between gap-3 px-2 py-1.5 hover:bg-dod-lilac/10"
              >
                <span className={`flex items-center gap-2 text-sm ${isSelected ? "text-dod-neon-mint" : "text-dod-white"}`}>
                  <span
                    className={`h-3 w-3 flex-shrink-0 border ${
                      isSelected ? "border-dod-neon-mint bg-dod-neon-mint" : "border-dod-lilac/50"
                    }`}
                  />
                  {optLabel}
                </span>
                <span className="text-xs text-dod-lilac/60">{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CatalogCard = ({ item }) => (
  <Link
    to={`/catalog/${catalogItemSlug(item)}`}
    className="group relative aspect-[135/172] cursor-pointer overflow-hidden bg-dod-deep-purple/20 border border-dod-lilac/50 hover:border-dod-neon-mint/60 transition-colors duration-300 gap-2"
  >
    {item.catalog_number && (
      <div className="absolute bottom-2 font-ppneue left-2 z-10 border border-dod-lilac bg-dod-black/65 px-1.5 py-0.5 font-medium text-xxs xl:text-xs uppercase tracking-wide text-dod-white group-hover:border-dod-neon-mint transition-colors">
        {item.catalog_number}
      </div>
    )}
    { item.label_role === "reissue" && (
      <div className="absolute bottom-2 font-ppneue right-2 z-10 border border-dod-pink bg-dod-pink font-medium px-1.5 py-0.5 text-xxs xl:text-xs uppercase tracking-wide text-dod-black">
        Reissue
      </div>
    )}
    { item.label_role === "physical" && (
      <div className="absolute bottom-2 font-ppneue right-2 z-10 border border-dod-orange bg-dod-orange font-medium px-1.5 py-0.5 text-xxs xl:text-xs uppercase tracking-wide text-dod-black">
        Physical Only
      </div>
    )}
    {item.artwork_url && (
      <img
        src={item.artwork_url}
        alt={item.title}
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
      <div className="font-archivo font-bold [font-stretch:expanded] [font-variation-settings:'wdth'_125] text-clamp-[10px,_1vw,_22px] font-semibold uppercase text-dod-white">{item.title}</div>
      {item.artists.length > 0 && (
        <div className="font-ppneue text-xs text-dod-white">{item.artists.join(", ")}</div>
      )}
    </div>
  </Link>
);

const Catalog = () => {
  const allItems = useMemo(() => readSeedData("catalog-items-data") ?? [], []);

  const [formatSel, setFormatSel] = useState(new Set());
  const [typeSel, setTypeSel] = useState(new Set());
  const [originSel, setOriginSel] = useState(new Set());
  const [yearSel, setYearSel] = useState(new Set());
  const [sortOrder, setSortOrder] = useState("newest");
  const [openPanel, setOpenPanel] = useState(null);

  // Closes whichever dropdown is open on any click outside the filter bar.
  const filterBarRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setOpenPanel(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const yearOptions = useMemo(() => {
    const set = new Set();
    allItems.forEach((item) => {
      const y = yearOf(item);
      if (y) set.add(y);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [allItems]);

  const facetCounts = useMemo(() => {
    const counts = { format: {}, type: {}, origin: {}, year: {} };
    allItems.forEach((item) => {
      item.formats.forEach((f) => { counts.format[f] = (counts.format[f] ?? 0) + 1; });
      counts.type[item.type] = (counts.type[item.type] ?? 0) + 1;
      counts.origin[item.label_role] = (counts.origin[item.label_role] ?? 0) + 1;
      const y = yearOf(item);
      if (y) counts.year[y] = (counts.year[y] ?? 0) + 1;
    });
    return counts;
  }, [allItems]);

  const toggle = (setFn) => (value) =>
    setFn((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });

  const hasFilters = formatSel.size > 0 || typeSel.size > 0 || originSel.size > 0 || yearSel.size > 0;

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

  return (
    <>
      <div className="border-b border-dod-lilac/50 mb-10 gap-4 lg:gap-0 grid grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col gap-4 lg:border-r lg:border-dod-lilac/50 lg:p-16 lg:pl-0">
          <span className="text-[clamp(4.5rem,6.3vw,6rem)] text-dod-neon-mint italic font-semibold">CATALOG</span>
          <div className="text-xl">
            <span className="text-dod-lilac font-bold">{items.length}</span> of {allItems.length} items 
          </div>
          <div className="text-xl text-dod-lilac">
            Comprehensive catalog of our original releases, vinyl presses, cassette duplications, and more
          </div>
        </div>
        <div className="relative overflow-hidden min-h-[110px]">
          <div className="absolute inset-0 w-full h-full object-cover flex justify-center items-center filter-[saturate(2)]">
            <img
              className="absolute object-cover transition-all" 
              src="https://res.cloudinary.com/dfeyhbxeg/image/upload/v1786587597/distressed_texture_c11a949095.png"/>
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
        </div>
      </div>

      <div>
        {/* Filter bar */}
        <div ref={filterBarRef} className="mb-10 flex flex-wrap items-center justify-between gap-3 font-sans">
          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown
              panelKey="format"
              label="Format"
              options={FORMAT_OPTIONS.map((f) => ({ value: f.value, label: f.label, count: facetCounts.format[f.value] ?? 0 }))}
              selected={formatSel}
              onToggle={toggle(setFormatSel)}
              openPanel={openPanel}
              onOpenPanel={setOpenPanel}
            />
            <FilterDropdown
              panelKey="type"
              label="Type"
              options={TYPE_OPTIONS.map((t) => ({ value: t, label: t, count: facetCounts.type[t] ?? 0 }))}
              selected={typeSel}
              onToggle={toggle(setTypeSel)}
              openPanel={openPanel}
              onOpenPanel={setOpenPanel}
            />
            <FilterDropdown
              panelKey="origin"
              label="Origin"
              options={ORIGIN_OPTIONS.map((r) => ({ value: r.value, label: r.label, count: facetCounts.origin[r.value] ?? 0 }))}
              selected={originSel}
              onToggle={toggle(setOriginSel)}
              openPanel={openPanel}
              onOpenPanel={setOpenPanel}
            />
            <FilterDropdown
              panelKey="year"
              label="Year"
              options={yearOptions.map((y) => ({ value: y, label: String(y), count: facetCounts.year[y] ?? 0 }))}
              selected={yearSel}
              onToggle={toggle(setYearSel)}
              openPanel={openPanel}
              onOpenPanel={setOpenPanel}
            />
            {hasFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-semibold uppercase tracking-wide text-dod-neon-mint"
              >
                Clear ✕
              </button>
            )}
          </div>

          <div className="relative inline-flex">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="cursor-pointer appearance-none border border-dod-lilac/50 bg-transparent px-3 py-1.5 pr-7 text-xs font-semibold uppercase tracking-wide text-dod-lilac"
            >
              <option className="bg-dod-black" value="newest">Newest First</option>
              <option className="bg-dod-black" value="oldest">Oldest First</option>
              <option className="bg-dod-black" value="az">A–Z</option>
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-dod-lilac">
              <ChevronIcon open={false} />
            </span>
          </div>
        </div>

        {/* Grid */}
        {items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4 mb-10">
            {items.map((item) => (
              <CatalogCard key={item.uid} item={item} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center font-sans text-dod-lilac/60">
            No releases match the current filters.
          </div>
        )}
      </div>
    </>
  );
};

export default Catalog;
