// src/domeofdoom/pages/Press.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { colors } from "@/tokens";
import WarpedGrid from "@/components/WarpedGrid";
import StarIcon from "@/components/StarIcon";

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

const ChevronIcon = ({ open }) => (
  <svg viewBox="0 0 10 10" width="12" height="12"
    className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}>
    <polyline points="2,3 5,7 8,3" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const ArrowUpRightIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="13" x2="13" y2="3" />
    <polyline points="6,3 13,3 13,10" />
  </svg>
);

// ---------------------------------------------------------------------------
// FilterDropdown — same pattern as Catalog
// ---------------------------------------------------------------------------

const FilterDropdown = ({ panelKey, label, options, selected, onToggle, openPanel, onOpenPanel, resultCount }) => {
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
          <span className="max-w-[220px] truncate">{valueText}</span>
          <span className="text-dod-lilac/60">{resultCount}</span>
          <ChevronIcon open={isOpen} />
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-30 mt-2 max-h-[280px] min-w-[220px] overflow-y-auto border border-dod-lilac/50 bg-dod-black p-2 shadow-xl">
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

function PressCardImage({ item }) {
  const mode   = item.imageMode ?? "og";
  const imgSrc = mode === "override" ? item.thumbnail
               : mode === "og"       ? item.ogImage
               : null;

  if (imgSrc) {
    return (
      <img
        src={imgSrc}
        alt={item.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    );
  }

  // Placeholder — matches Roster page: StarIcon + WarpedGrid on dod-black
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-dod-black">
      <StarIcon
        size={60}
        gradientFrom={colors.deep_purple}
        gradientTo={colors.deep_purple}
        glowColor={colors.lilac}
        showGlow={true}
        showBackground={false}
      />
      <div className="absolute inset-0 bg-dod-deep-purple/40 mix-blend-overlay" />
      <WarpedGrid className="absolute w-full h-full" />
    </div>
  );
}

const PressCard = ({ item }) => {
  const href = item.url;
  const Tag  = href ? "a" : "div";
  const linkProps = href
    ? { href, target: "_blank", rel: "noreferrer noopener" }
    : {};

  return (
    <Tag
      {...linkProps}
      className={`group flex flex-row bg-[#0d0f10] hover:bg-[#181c1e] border border-dod-lilac/20 hover:border-dod-neon-mint/50 transition-colors duration-200 overflow-hidden h-[220px] ${href ? "cursor-pointer" : ""}`}
    >
      {/* Thumbnail */}
      <div className="w-2/5 flex-shrink-0 p-3">
        <div className="relative h-full overflow-hidden">
          <PressCardImage item={item} />
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
          <p className="text-[11px] text-dod-lilac/60 leading-relaxed line-clamp-2 flex-1">
            {item.excerpt}
          </p>
        )}

        {/* Read link */}
        {href && (
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-dod-neon-mint/70 group-hover:text-dod-neon-mint transition-colors duration-200 mt-auto">
            Read Article <ArrowUpRightIcon />
          </div>
        )}
      </div>
    </Tag>
  );
};

// ---------------------------------------------------------------------------
// Press page
// ---------------------------------------------------------------------------

export default function Press() {
  usePageTitle("Press");
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [yearSel,   setYearSel]   = useState(new Set());
  const [outletSel, setOutletSel] = useState(new Set());
  const [sortOrder, setSortOrder] = useState("newest");
  const [openPanel, setOpenPanel] = useState(null);

  // Close dropdown when clicking outside
  const barRef = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (!barRef.current?.contains(e.target)) setOpenPanel(null); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    fetch("/api/domeofdoom/press")
      .then((r) => r.json())
      .then((d) => { setItems(d.items ?? []); setLoading(false); })
      .catch(() => { setError("Failed to load press items."); setLoading(false); });
  }, []);

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
          <p className="text-xl text-dod-lilac">
            Articles, features, interviews, and coverage from around the world.
          </p>
        </div>
        <div className="relative overflow-hidden min-h-[110px]">
          <div className="absolute inset-0 w-full h-full flex justify-center items-center filter-[saturate(2)]">
            <img
              className="absolute object-cover transition-all"
              src="https://res.cloudinary.com/dfeyhbxeg/image/upload/v1786587597/distressed_texture_c11a949095.png"
            />
            <StarIcon
              size={300}
              gradientFrom={colors.deep_purple}
              gradientTo={colors.neon_mint}
              showGlow={true}
              showBackground={false}
              className="absolute transform-[rotateY(4deg)_rotateZ(-30deg)_scaleX(1.05)] animate-[star-hover_6s_ease-in-out_infinite]"
            />
            <WarpedGrid />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div ref={barRef} className="flex items-end justify-between gap-6 border-b border-dod-lilac/20 pb-4">
        <div className="flex items-end gap-8">
          <FilterDropdown
            panelKey="year"
            label="Year"
            options={yearOptions}
            selected={yearSel}
            onToggle={toggle(setYearSel)}
            openPanel={openPanel}
            onOpenPanel={setOpenPanel}
            resultCount={yearSel.size === 0 ? items.length : filtered.length}
          />
          <FilterDropdown
            panelKey="outlet"
            label="Outlet"
            options={outletOptions}
            selected={outletSel}
            onToggle={toggle(setOutletSel)}
            openPanel={openPanel}
            onOpenPanel={setOpenPanel}
            resultCount={outletSel.size === 0 ? items.length : filtered.length}
          />
        </div>

        {/* Sort */}
        <div className="relative flex-shrink-0">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <div className="pointer-events-none flex items-center gap-2 border border-dod-lilac/50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-dod-white">
            <span className="text-dod-lilac">Sort:</span>
            {sortOrder === "newest" ? "Newest First" : "Oldest First"}
            <ChevronIcon open={false} />
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading && (
        <p className="text-dod-lilac/60 text-sm py-10 text-center">Loading…</p>
      )}
      {error && (
        <p className="text-dod-orange text-sm py-10 text-center">{error}</p>
      )}
      {!loading && !error && filtered.length === 0 && (
        <p className="text-dod-lilac/60 text-sm py-10 text-center">No results.</p>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
          {filtered.map((item) => <PressCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}
