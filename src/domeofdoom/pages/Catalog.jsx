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
// Facet counts are cross-filtered against the OTHER active groups' current
// selection (but not the group's own selection) - see facetCounts below.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  { value: "original", label: "Original Release" },
  { value: "reissue", label: "Reissue" },
  { value: "physical", label: "Physical Only" },
  { value: "other", label: "Other" },
];

// Must match the mobile filter panel's `duration-500` transition class -
// used to time how long the panel stays mounted after close so its
// closing slide has time to actually play.
const PANEL_ANIMATION_MS = 500;

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

const ChevronIcon = ({ open }) => (
  <svg
    viewBox="0 0 10 10"
    width="12"
    height="12"
    className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
  >
    <polyline points="2,3 5,7 8,3" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const SlidersIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="2" y1="4" x2="14" y2="4" />
    <line x1="2" y1="8" x2="14" y2="8" />
    <line x1="2" y1="12" x2="14" y2="12" />
    <circle cx="6" cy="4" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="10" cy="8" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const SortIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4,3 4,13" />
    <polyline points="1.5,5.5 4,3 6.5,5.5" />
    <polyline points="12,13 12,3" />
    <polyline points="9.5,10.5 12,13 14.5,10.5" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="3" y1="3" x2="13" y2="13" />
    <line x1="13" y1="3" x2="3" y2="13" />
  </svg>
);

// Mobile counterpart to FilterDropdown - an always-in-flow accordion
// section (checkbox list) instead of a popover, since the mobile panel
// itself is what needs to scroll into view, not a floating menu on top of
// the page.
const MobileFilterSection = ({ label, options, selected, onToggle, isOpen, onToggleOpen }) => (
  <div className="border-b border-dod-lilac/20 py-4">
    <button
      type="button"
      onClick={onToggleOpen}
      className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-dod-neon-mint"
    >
      {label}
      <ChevronIcon open={isOpen} />
    </button>
    {isOpen && (
      <div className="mt-3 flex flex-col gap-1">
        {options.map(({ value, label: optLabel, count }) => {
          const isSelected = selected.has(value);
          return (
            <label key={value} className="flex cursor-pointer items-center justify-between gap-3 py-2">
              <span className="flex items-center gap-3 text-sm text-dod-white">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(value)}
                  className="h-4 w-4 accent-dod-neon-mint"
                />
                {optLabel}
              </span>
              <span className="text-xs text-dod-lilac/60">{count}</span>
            </label>
          );
        })}
      </div>
    )}
  </div>
);

// One filter segment (Format / Type / Origin / Year) - a small uppercase
// mint label stacked above the current value (either "All X" or a summary
// of what's selected) + the overall result count + a chevron, opening the
// same checkbox-list popover as before. `panelKey` is this dropdown's
// identity in the shared openPanel state, so only one can be open at a
// time. `resultCount` is the page's current total match count (not a
// per-group facet count) - every segment shows the same number, same as
// the reference design.
const FilterDropdown = ({ panelKey, label, options, selected, onToggle, openPanel, onOpenPanel, resultCount }) => {
  const isOpen = openPanel === panelKey;
  const activeCount = selected.size;
  const valueText =
    activeCount === 0
      ? `All ${label}s`
      : options
          .filter((o) => selected.has(o.value))
          .map((o) => o.label)
          .join(", ");

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onOpenPanel(isOpen ? null : panelKey)}
        className="flex cursor-pointer flex-col items-start gap-1 py-1 text-left"
      >
        <span className={`text-xs font-semibold uppercase tracking-wide ${activeCount > 0 ? "text-dod-neon-mint" : "text-dod-lilac"}`}>
          {label}
        </span>
        <span className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-dod-white">
          <span className="max-w-[160px] truncate">{valueText}</span>
          <span className="text-dod-lilac/60">{resultCount}</span>
          <ChevronIcon open={isOpen} />
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 cursor-pointer z-30 mt-2 max-h-[280px] min-w-[200px] overflow-y-auto border border-dod-lilac/50 bg-dod-black p-2 shadow-xl">
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

const Catalog = () => {
  const allItems = useMemo(() => readSeedData("catalog-items-data") ?? [], []);
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
  const [openPanel, setOpenPanel] = useState(null);

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

  // Mobile: the four filter groups render as an absolutely-positioned
  // panel (see MobileFilterSection) that overlaps the page below the
  // Filters/Sort bar instead of pushing the grid down, and scrolls
  // internally past its own max-h (see overflow-y-auto below) rather than
  // scrolling the page. Only one accordion section is open at a time, same
  // as the desktop popovers' shared `openPanel`.

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileOpenSection, setMobileOpenSection] = useState("format");
  const mobileBarWrapperRef = useRef(null);
  const descriptionRef = useRef(null);
  // Stays mounted for PANEL_ANIMATION_MS after mobileFiltersOpen goes
  // false, so the close slide (back down to the 50vh resting position) has
  // time to actually play before the panel leaves the DOM.
  const [panelMounted, setPanelMounted] = useState(false);
  // How far up (px) to shift the panel so its top lands on the
  // description's position instead of its own natural in-flow spot below
  // the mobile bar - see below for how this is measured. null = not
  // measured (yet, or anymore) - falls back to the panel's own
  // translateY(50vh) resting position (see the style below), which is
  // also the slide-closed target.
  const [panelPullUp, setPanelPullUp] = useState(null);
  // Once the panel lands at the description's position, its top sits at
  // descTop - so the remaining space down to the bottom of the viewport
  // (minus a 10px margin) is the panel's target height. Computed in JS
  // since it depends on measured viewport/layout, not something a fixed
  // Tailwind class can express.
  const [panelMaxHeight, setPanelMaxHeight] = useState(null);

  const toggleMobileSection = (key) =>
    setMobileOpenSection((prev) => (prev === key ? null : key));

  // Mount immediately on open. On close, slide back down to the resting
  // position (panelPullUp -> null) and only unmount once that transition
  // has had time to finish.
  useEffect(() => {
    if (mobileFiltersOpen) {
      setPanelMounted(true);
      return;
    }
    setPanelPullUp(null);
    const timeout = setTimeout(() => setPanelMounted(false), PANEL_ANIMATION_MS);
    return () => clearTimeout(timeout);
  }, [mobileFiltersOpen]);

  // Locks the page's own scroll while the filter panel is open - otherwise
  // the panel's rules are visible but the page underneath can still be
  // dragged around behind it.
  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileFiltersOpen]);

  // The panel is anchored (position: absolute, top: 0) to the mobile bar's
  // own wrapper, which sits below the hero's description paragraph in
  // normal flow - so its natural top lands well below that paragraph. This
  // measures that gap and pulls the panel up by exactly that amount (a
  // translateY, not margin-top - compositor-only, avoids a layout reflow)
  // so its top edge lands where the description currently is, replacing
  // it in place rather than opening further down the page. Scrolling to
  // the top too, since none of this helps if the description itself is
  // scrolled out of view when Filters gets tapped from down in the grid.
  // A plain useEffect (not useLayoutEffect) - the panel needs to actually
  // paint at its resting translateY(50vh) position first so the slide into
  // place is visible, rather than jumping straight to its final spot.
  useEffect(() => {
    if (!mobileFiltersOpen || !panelMounted) return;
    if (!mobileBarWrapperRef.current || !descriptionRef.current) return;

    // Document-absolute (not getBoundingClientRect()'s viewport-relative)
    // positions, so this is correct regardless of whether the window.
    // scrollTo below has actually applied by the time we measure - a
    // same-tick "instant" scroll isn't guaranteed to be reflected yet in
    // subsequent getBoundingClientRect() calls. Measured off the mobile
    // bar WRAPPER, not the panel itself, since the panel is what's BEING
    // positioned by this measurement - measuring it would be circular.
    const measure = () => {
      const panelDocTop = mobileBarWrapperRef.current.getBoundingClientRect().top + window.scrollY;
      const descDocTop = descriptionRef.current.getBoundingClientRect().top + window.scrollY;
      setPanelPullUp(Math.max(0, panelDocTop - descDocTop));
      // After scrolling to the top, the description (and the panel once
      // pulled up to match it) sits at viewport Y = descDocTop.
      setPanelMaxHeight(Math.max(0, window.innerHeight - descDocTop - 10));
    };

    window.scrollTo(0, 0);
    measure();

    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [mobileFiltersOpen, panelMounted]);

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

  const hasFilters = formatSel.size > 0 || typeSel.size > 0 || originSel.size > 0 || yearSel.size > 0;
  const activeFilterCount = formatSel.size + typeSel.size + originSel.size + yearSel.size;

  // Flattened, removable chips for whatever's currently selected across
  // all four groups - shown in the "Active Filters" row.
  const selectedChips = [
    ...[...formatSel].map((v) => ({
      key: `format-${v}`,
      label: FORMAT_OPTIONS.find((f) => f.value === v)?.label ?? v,
      onRemove: () => toggle(setFormatSel)(v),
    })),
    ...[...typeSel].map((v) => ({ key: `type-${v}`, label: v, onRemove: () => toggle(setTypeSel)(v) })),
    ...[...originSel].map((v) => ({
      key: `origin-${v}`,
      label: ORIGIN_OPTIONS.find((r) => r.value === v)?.label ?? v,
      onRemove: () => toggle(setOriginSel)(v),
    })),
    ...[...yearSel].map((v) => ({ key: `year-${v}`, label: String(v), onRemove: () => toggle(setYearSel)(v) })),
  ];

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
    <div className="flex flex-col gap-10">
      <div className="border-b border-dod-lilac/50 gap-4 lg:gap-0 grid grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col gap-4 lg:border-r lg:border-dod-lilac/50 lg:p-16 lg:pl-0">
          <span className="text-[clamp(4.5rem,6.3vw,6rem)] text-dod-neon-mint italic font-semibold">CATALOG</span>
          <div className="text-xl">
            <span className="text-dod-lilac font-bold">{items.length}</span> of {allItems.length} items 
          </div>
          <div ref={descriptionRef} className="text-xl text-dod-lilac">
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

        {/* Mobile filter bar - compact "Filters" toggle + icon-only sort
            control. The panel below is its own absolutely-positioned
            module (not in normal flow) so opening it overlays the grid
            instead of pushing it down, and scrolls internally once it hits
            max-height instead of scrolling the whole page. */}
        <div ref={mobileBarWrapperRef} className="relative font-sans md:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((open) => !open)}
              className={`flex flex-1 items-center justify-center gap-2 border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                activeFilterCount > 0
                  ? "border-dod-neon-mint text-dod-neon-mint"
                  : "border-dod-lilac/50 text-dod-lilac"
              }`}
            >
              Filters
              <SlidersIcon />
              {activeFilterCount > 0 && <span>({activeFilterCount})</span>}
            </button>
            <div className="relative h-full">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                aria-label="Sort"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0 px-4 py-2"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="az">A–Z</option>
              </select>
              <div className="pointer-events-none flex h-full min-h-[38px] w-11 items-center justify-center border border-dod-lilac/50 text-dod-lilac">
                <SortIcon />
              </div>
            </div>
          </div>

          {panelMounted && (
            <div
              style={{
                // null (not yet measured, or closing) -> the resting
                // translateY(50vh) below; a real number -> pulled up to
                // sit on the description's position.
                transform: panelPullUp != null ? `translateY(${-panelPullUp}px)` : "translateY(50vh)",
                height: panelMaxHeight != null ? `${panelMaxHeight}px` : undefined,
              }}
              className="absolute inset-x-0 top-0 z-40 max-h-[75vh] overflow-y-auto overscroll-contain border border-dod-lilac/50 bg-dod-black p-4 shadow-xl transition-all duration-500"
            >
              <div className="flex items-center justify-between border-b border-dod-lilac/20 pb-4">
                <span className="text-sm font-semibold uppercase tracking-wide text-dod-white">Filters</span>
                <button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters" className="text-dod-lilac">
                  <CloseIcon />
                </button>
              </div>

              <MobileFilterSection
                label="Format"
                options={FORMAT_OPTIONS.map((f) => ({ value: f.value, label: f.label, count: facetCounts.format[f.value] ?? 0 }))}
                selected={formatSel}
                onToggle={toggle(setFormatSel)}
                isOpen={mobileOpenSection === "format"}
                onToggleOpen={() => toggleMobileSection("format")}
              />
              <MobileFilterSection
                label="Type"
                options={TYPE_OPTIONS.map((t) => ({ value: t, label: t, count: facetCounts.type[t] ?? 0 }))}
                selected={typeSel}
                onToggle={toggle(setTypeSel)}
                isOpen={mobileOpenSection === "type"}
                onToggleOpen={() => toggleMobileSection("type")}
              />
              <MobileFilterSection
                label="Origin"
                options={ORIGIN_OPTIONS.map((r) => ({ value: r.value, label: r.label, count: facetCounts.origin[r.value] ?? 0 }))}
                selected={originSel}
                onToggle={toggle(setOriginSel)}
                isOpen={mobileOpenSection === "origin"}
                onToggleOpen={() => toggleMobileSection("origin")}
              />
              <MobileFilterSection
                label="Year"
                options={yearOptions.map((y) => ({ value: y, label: String(y), count: facetCounts.year[y] ?? 0 }))}
                selected={yearSel}
                onToggle={toggle(setYearSel)}
                isOpen={mobileOpenSection === "year"}
                onToggleOpen={() => toggleMobileSection("year")}
              />

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-4 w-full border border-dod-lilac/50 py-2.5 text-xs font-semibold uppercase tracking-wide text-dod-white"
                >
                  Clear All
                </button>
              )}
            </div>
          )}
        </div>

        {/* Filter bar - four stacked label/value segments (Format/Type/
            Origin/Year), each divided by a vertical rule, Sort pinned to
            the far right. Below the horizontal divider, an "active
            filters" row of removable chips only shows once something's
            actually selected. */}
        <div ref={filterBarRef} className="hidden flex-col gap-3 font-sans md:flex">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-stretch">
              <FilterDropdown
                panelKey="format"
                label="Format"
                options={FORMAT_OPTIONS.map((f) => ({ value: f.value, label: f.label, count: facetCounts.format[f.value] ?? 0 }))}
                selected={formatSel}
                onToggle={toggle(setFormatSel)}
                openPanel={openPanel}
                onOpenPanel={setOpenPanel}
                resultCount={items.length}
              />
              <div className="mx-6 w-px bg-dod-lilac/20" />
              <FilterDropdown
                panelKey="type"
                label="Type"
                options={TYPE_OPTIONS.map((t) => ({ value: t, label: t, count: facetCounts.type[t] ?? 0 }))}
                selected={typeSel}
                onToggle={toggle(setTypeSel)}
                openPanel={openPanel}
                onOpenPanel={setOpenPanel}
                resultCount={items.length}
              />
              <div className="mx-6 w-px bg-dod-lilac/20" />
              <FilterDropdown
                panelKey="origin"
                label="Origin"
                options={ORIGIN_OPTIONS.map((r) => ({ value: r.value, label: r.label, count: facetCounts.origin[r.value] ?? 0 }))}
                selected={originSel}
                onToggle={toggle(setOriginSel)}
                openPanel={openPanel}
                onOpenPanel={setOpenPanel}
                resultCount={items.length}
              />
              <div className="mx-6 w-px bg-dod-lilac/20" />
              <FilterDropdown
                panelKey="year"
                label="Year"
                options={yearOptions.map((y) => ({ value: y, label: String(y), count: facetCounts.year[y] ?? 0 }))}
                selected={yearSel}
                onToggle={toggle(setYearSel)}
                openPanel={openPanel}
                onOpenPanel={setOpenPanel}
                resultCount={items.length}
              />
            </div>

            {/* Full "Sort: Newest First" control once there's room for it;
                below that, the same compact icon-only control the mobile
                bar uses, rather than letting the segments row wrap. */}
            <div className="hidden items-center gap-2 xl:flex">
              <span className="text-xs font-semibold uppercase tracking-wide text-dod-white/50">Sort:</span>
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
            <div className="relative flex xl:hidden">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                aria-label="Sort"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="az">A–Z</option>
              </select>
              <div className="pointer-events-none flex h-full min-h-[38px] w-11 items-center justify-center border border-dod-lilac/50 text-dod-lilac">
                <SortIcon />
              </div>
            </div>
          </div>

          <div className="h-[1px] w-full bg-dod-lilac/50" />

          {hasFilters && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-dod-white/50">Active Filters:</span>
                {selectedChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onRemove}
                    className="flex cursor-pointer items-center gap-1.5 border border-dod-lilac/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-dod-white transition-colors hover:border-dod-neon-mint hover:text-dod-neon-mint"
                  >
                    {chip.label}
                    <span aria-hidden="true">✕</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearAll}
                  className="cursor-pointer px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-dod-neon-mint"
                >
                  Clear All
                </button>
              </div>
              <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-dod-neon-mint">
                {items.length} Result{items.length === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </div>

        {/* Grid */}
        {items.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
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
  );
};

export default Catalog;
