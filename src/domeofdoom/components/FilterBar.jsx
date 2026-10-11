// Shared filter bar used by Press, Catalog, and any other page with
// filter dropdowns + sort. Handles both desktop (popover dropdowns) and
// mobile (slide-up panel with accordion sections).
//
// Usage:
//   <FilterBar
//     groups={[{ key: "year", label: "Year", options, selected, onToggle }]}
//     sortOptions={[{ value: "newest", label: "Newest First" }, ...]}
//     sortValue={sortOrder}
//     onSortChange={setSortOrder}
//     resultCount={filtered.length}
//   />

import React, { useEffect, useRef, useState } from "react";

const PANEL_ANIMATION_MS = 500;

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

export const ChevronIcon = ({ open }) => (
  <svg viewBox="0 0 10 10" width="12" height="12"
    className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}>
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

// ---------------------------------------------------------------------------
// Desktop dropdown — one filter group as a popover
// ---------------------------------------------------------------------------

export const FilterDropdown = ({ panelKey, label, options, selected, onToggle, openPanel, onOpenPanel, resultCount }) => {
  const isOpen = openPanel === panelKey;
  const activeCount = selected.size;
  const valueText =
    activeCount === 0
      ? `All ${label}s`
      : options.filter((o) => selected.has(o.value)).map((o) => o.label).join(", ");

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
          <span className="max-w-[200px] truncate">{valueText}</span>
          <span className="text-dod-lilac/60">{resultCount}</span>
          <ChevronIcon open={isOpen} />
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-30 mt-2 max-h-[280px] min-w-[200px] overflow-y-auto border border-dod-lilac/50 bg-dod-black p-2 shadow-xl">
          {options.map(({ value, label: optLabel, count }) => {
            const isSel = selected.has(value);
            return (
              <div key={value} onClick={() => onToggle(value)}
                className="flex cursor-pointer items-center justify-between gap-3 px-2 py-1.5 hover:bg-dod-lilac/10">
                <span className={`flex items-center gap-2 text-sm ${isSel ? "text-dod-neon-mint" : "text-dod-white"}`}>
                  <span className={`h-3 w-3 flex-shrink-0 border ${isSel ? "border-dod-neon-mint bg-dod-neon-mint" : "border-dod-lilac/50"}`} />
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

// ---------------------------------------------------------------------------
// Mobile accordion section — used inside the slide-up panel
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// FilterBar — desktop + mobile combined
//
// Props:
//   groups        — array of { key, label, options: [{value, label, count}], selected (Set), onToggle }
//   sortOptions   — array of { value, label }
//   sortValue     — current sort string
//   onSortChange  — (value: string) => void
//   resultCount   — shown next to each desktop dropdown label
//   onClearAll    — optional; shows "Clear All" in mobile panel when provided
// ---------------------------------------------------------------------------

// panelTopRef: optional ref to the element the panel's top edge should
// align with when open (same pull-up technique as Catalog's filter panel).
const FilterBar = ({ groups, sortOptions, sortValue, onSortChange, resultCount, onClearAll, panelTopRef }) => {
  const [openPanel, setOpenPanel] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState(groups[0]?.key ?? null);
  const [panelMounted, setPanelMounted] = useState(false);
  const [panelPullUp, setPanelPullUp] = useState(null);
  const [panelMaxHeight, setPanelMaxHeight] = useState(null);
  const mobileBarWrapperRef = useRef(null);

  const activeFilterCount = groups.reduce((sum, g) => sum + g.selected.size, 0);
  const hasFilters = activeFilterCount > 0;

  // Mount immediately on open; unmount after close animation
  useEffect(() => {
    if (mobileOpen) { setPanelMounted(true); return; }
    const t = setTimeout(() => { setPanelMounted(false); setPanelPullUp(null); setPanelMaxHeight(null); }, PANEL_ANIMATION_MS);
    return () => clearTimeout(t);
  }, [mobileOpen]);

  // Lock body scroll while panel is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  // Pull-up measurement — mirrors Catalog's approach exactly.
  // Scroll to top, then compute how far to translate the panel so its top
  // aligns with panelTopRef (the page's description element).
  useEffect(() => {
    if (!mobileOpen || !panelMounted) return;
    if (!mobileBarWrapperRef.current || !panelTopRef?.current) return;

    const measure = () => {
      const panelDocTop = mobileBarWrapperRef.current.getBoundingClientRect().top + window.scrollY;
      const targetDocTop = panelTopRef.current.getBoundingClientRect().top + window.scrollY;
      setPanelPullUp(Math.max(0, panelDocTop - targetDocTop));
      setPanelMaxHeight(Math.max(0, window.innerHeight - targetDocTop - 10));
    };

    window.scrollTo(0, 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [mobileOpen, panelMounted, panelTopRef]);

  // Close desktop popovers on outside click
  const barRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) setOpenPanel(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="font-sans">
      {/* ---- Mobile bar (hidden on md+) ---- */}
      <div ref={mobileBarWrapperRef} className="relative md:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className={`flex flex-1 items-center justify-center gap-2 border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
              activeFilterCount > 0
                ? "border-dod-neon-mint text-dod-neon-mint"
                : "border-dod-lilac/50 text-dod-lilac"
            }`}
          >
            Filters <SlidersIcon />
            {activeFilterCount > 0 && <span>({activeFilterCount})</span>}
          </button>

          {/* Icon-only sort */}
          <div className="relative h-full">
            <select
              value={sortValue}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="Sort"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="pointer-events-none flex h-full min-h-[38px] w-11 items-center justify-center border border-dod-lilac/50 text-dod-lilac">
              <SortIcon />
            </div>
          </div>
        </div>

        {/* Slide-up panel — absolute, anchored to mobileBarWrapperRef, pulled
            up to align with panelTopRef (same technique as Catalog). */}
        {panelMounted && (
          <div
            style={{
              transform: panelPullUp != null ? `translateY(${-panelPullUp}px)` : "translateY(50vh)",
              height: panelMaxHeight != null ? `${panelMaxHeight}px` : undefined,
            }}
            className="absolute inset-x-0 top-0 z-40 max-h-[75vh] overflow-y-auto overscroll-contain border border-dod-lilac/50 bg-dod-black p-4 shadow-xl transition-all duration-500"
          >
            <div className="flex items-center justify-between border-b border-dod-lilac/20 pb-4">
              <span className="text-sm font-semibold uppercase tracking-wide text-dod-white">Filters</span>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close filters" className="text-dod-lilac">
                <CloseIcon />
              </button>
            </div>

            {groups.map((g) => (
              <MobileFilterSection
                key={g.key}
                label={g.label}
                options={g.options}
                selected={g.selected}
                onToggle={g.onToggle}
                isOpen={mobileSection === g.key}
                onToggleOpen={() => setMobileSection((prev) => prev === g.key ? null : g.key)}
              />
            ))}

            {hasFilters && onClearAll && (
              <button
                type="button"
                onClick={() => { onClearAll(); setMobileOpen(false); }}
                className="mt-4 w-full border border-dod-lilac/50 py-2.5 text-xs font-semibold uppercase tracking-wide text-dod-white"
              >
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* ---- Desktop bar (hidden below md) ---- */}
      <div ref={barRef} className="hidden md:flex items-end justify-between gap-6 border-b border-dod-lilac/50 pb-3">
        <div className="flex items-end gap-8">
          {groups.map((g, i) => (
            <React.Fragment key={g.key}>
              {i > 0 && <div className="self-stretch w-px bg-dod-lilac/20" />}
              <FilterDropdown
                panelKey={g.key}
                label={g.label}
                options={g.options}
                selected={g.selected}
                onToggle={g.onToggle}
                openPanel={openPanel}
                onOpenPanel={setOpenPanel}
                resultCount={resultCount}
              />
            </React.Fragment>
          ))}
        </div>

        {/* Sort */}
        <div className="relative flex-shrink-0">
          <select
            value={sortValue}
            onChange={(e) => onSortChange(e.target.value)}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
          >
            {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="pointer-events-none flex items-center gap-2 border border-dod-lilac/50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-dod-white">
            <span className="text-dod-lilac">Sort:</span>
            {sortOptions.find((o) => o.value === sortValue)?.label ?? sortValue}
            <ChevronIcon open={false} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
