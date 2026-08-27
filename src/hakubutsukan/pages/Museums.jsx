import React, { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { readSeedData } from "@/utils/readSeedData";

const STATUS_LABEL = {
  open:               "Open",
  temp_closed:        "Temporarily Closed",
  permanently_closed: "Permanently Closed",
};

const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="8" x2="13" y2="8" /><polyline points="9,4 13,8 9,12" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 10 10" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="1" y1="1" x2="9" y2="9" /><line x1="9" y1="1" x2="1" y2="9" />
  </svg>
);

const GridViewIcon = ({ active }) => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
    style={{ opacity: active ? 1 : 0.4 }}>
    <rect x="1" y="1" width="6" height="6" /><rect x="9" y="1" width="6" height="6" />
    <rect x="1" y="9" width="6" height="6" /><rect x="9" y="9" width="6" height="6" />
  </svg>
);

const ListViewIcon = ({ active }) => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
    style={{ opacity: active ? 1 : 0.4 }}>
    <line x1="1" y1="4" x2="15" y2="4" /><line x1="1" y1="8" x2="15" y2="8" /><line x1="1" y1="12" x2="15" y2="12" />
  </svg>
);

const MapViewIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
    style={{ opacity: 0.4 }}>
    <path d="M8 1C5.8 1 4 2.8 4 5c0 3 4 9 4 9s4-6 4-9c0-2.2-1.8-4-4-4z" />
    <circle cx="8" cy="5" r="1.2" />
  </svg>
);

const MuseumCard = ({ museum, tagLabelMap }) => (
  <Link
    to={`/museum/${museum.slug}`}
    className="group flex flex-col border border-hk-rule hover:border-hk-gold/60 transition-colors bg-hk-card"
  >
    <div className="aspect-[4/3] overflow-hidden bg-hk-bg-alt">
      {museum.image_url ? (
        <img
          src={museum.image_url}
          alt={museum.name}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
          style={{ filter: "sepia(20%) brightness(0.95)" }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center opacity-20">
          <span className="font-display text-5xl text-hk-text-mid">博</span>
        </div>
      )}
    </div>
    <div className="flex flex-col gap-1.5 px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-hk-text group-hover:text-hk-gold transition-colors leading-snug">
          {museum.name}
        </h3>
        {museum.status !== "open" && (
          <span className="shrink-0 text-[9px] uppercase tracking-wide text-hk-muted border border-hk-rule px-1 py-0.5">
            {STATUS_LABEL[museum.status]}
          </span>
        )}
      </div>
      {museum.address && (
        <p className="text-[10px] uppercase tracking-widest text-hk-muted">
          {museum.address.split(",").slice(-2, -1)[0]?.trim() || museum.address}
        </p>
      )}
      {museum.tags.length > 0 && (
        <p className="text-[10px] text-hk-muted">
          {museum.tags.slice(0, 3).map((t) => tagLabelMap[t] ?? t).join(" · ")}
        </p>
      )}
      <div className="flex justify-end text-hk-gold group-hover:text-hk-gold-light transition-colors">
        <ArrowIcon />
      </div>
    </div>
  </Link>
);

const MuseumRow = ({ museum, tagLabelMap }) => {
  const area = museum.address
    ? museum.address.split(",").slice(0, 1)[0]?.trim() || museum.address
    : null;

  return (
    <Link
      to={`/museum/${museum.slug}`}
      className="group flex items-center gap-5 py-4 border-b border-hk-rule hover:bg-hk-card/40 transition-colors"
    >
      {/* Thumbnail */}
      <div className="w-16 h-11 shrink-0 overflow-hidden bg-hk-bg-alt">
        {museum.image_url ? (
          <img
            src={museum.image_url}
            alt={museum.name}
            className="w-full h-full object-cover"
            style={{ filter: "sepia(20%) brightness(0.9)" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20">
            <span className="font-display text-xl text-hk-text-mid">博</span>
          </div>
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-bold text-sm uppercase tracking-wide text-hk-text group-hover:text-hk-gold transition-colors truncate leading-snug">
          {museum.name}
        </h3>
        {museum.status !== "open" && (
          <span className="text-[9px] uppercase tracking-wide text-hk-muted">
            {STATUS_LABEL[museum.status]}
          </span>
        )}
      </div>

      {/* Tags */}
      <div className="w-36 shrink-0 hidden md:block">
        <p className="text-[10px] text-hk-muted truncate">
          {museum.tags.slice(0, 2).map((t) => tagLabelMap[t] ?? t).join(" · ")}
        </p>
      </div>

      {/* Area */}
      <div className="w-28 shrink-0 hidden lg:block">
        {area && <p className="text-[10px] text-hk-muted truncate">{area}</p>}
      </div>

      {/* Arrow */}
      <div className="text-hk-gold opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0">
        <ArrowIcon />
      </div>
    </Link>
  );
};

const Museums = () => {
  const allMuseums  = useMemo(() => readSeedData("museums-data") ?? [], []);
  const allTags     = useMemo(() => readSeedData("tags-data")    ?? [], []);
  const tagLabelMap = useMemo(
    () => Object.fromEntries(allTags.map((t) => [t.slug, t.name])),
    [allTags]
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState("grid");

  const [activeTags, setActiveTags] = useState(() => {
    const raw = searchParams.get("tag");
    return raw ? new Set(raw.split(",").filter(Boolean)) : new Set();
  });

  useEffect(() => {
    if (activeTags.size) setSearchParams({ tag: [...activeTags].join(",") }, { replace: true });
    else setSearchParams({}, { replace: true });
  }, [activeTags, setSearchParams]);

  const toggle = (tag) =>
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });

  const filtered = useMemo(() => {
    const open   = allMuseums.filter((m) => m.status === "open");
    const others = allMuseums.filter((m) => m.status !== "open");
    const sorted = [...open, ...others];
    if (activeTags.size === 0) return sorted;
    return sorted.filter((m) => [...activeTags].every((t) => m.tags.includes(t)));
  }, [allMuseums, activeTags]);

  return (
    <div className="flex flex-col px-10">
      {/* Header */}
      <div className="border-b border-hk-rule py-8 flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display font-semibold italic text-3xl text-hk-text leading-none">Museums</h1>
          <p className="text-xs text-hk-muted">
            {filtered.length} of {allMuseums.length} institution{allMuseums.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* View toggles */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setView("grid")}
            className="text-hk-text cursor-pointer transition-opacity"
            aria-label="Grid view"
          >
            <GridViewIcon active={view === "grid"} />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className="text-hk-text cursor-pointer transition-opacity"
            aria-label="List view"
          >
            <ListViewIcon active={view === "list"} />
          </button>
          <button
            type="button"
            disabled
            className="text-hk-text cursor-not-allowed"
            aria-label="Map view (coming soon)"
          >
            <MapViewIcon />
          </button>
        </div>
      </div>

      {/* Tag filters */}
      <div className="border-b border-hk-rule py-5 flex flex-col gap-4">
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allTags.map(({ slug, name }) => {
              const active = activeTags.has(slug);
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => toggle(slug)}
                  className={`text-xs px-2.5 py-1 border transition-colors cursor-pointer ${
                    active
                      ? "border-hk-gold text-hk-gold bg-hk-gold/10"
                      : "border-hk-rule text-hk-muted hover:border-hk-rule-dark hover:text-hk-text-mid"
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        )}

        {activeTags.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-hk-rule">
            <span className="text-[10px] uppercase tracking-widest text-hk-muted">Active</span>
            {[...activeTags].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggle(tag)}
                className="flex items-center gap-1.5 text-[10px] px-2 py-0.5 border border-hk-gold text-hk-gold cursor-pointer hover:bg-hk-gold/10 transition-colors"
              >
                {tagLabelMap[tag] ?? tag} <CloseIcon />
              </button>
            ))}
            <button
              type="button"
              onClick={() => setActiveTags(new Set())}
              className="text-[10px] text-hk-muted hover:text-hk-text-mid underline underline-offset-2 cursor-pointer ml-1 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="py-8">
        {filtered.length === 0 ? (
          <p className="py-20 text-center text-hk-muted text-sm font-display italic">
            No institutions match the selected filters.
          </p>
        ) : view === "list" ? (
          <div>
            {/* List header */}
            <div className="flex items-center gap-5 pb-2 border-b border-hk-rule">
              <div className="w-16 shrink-0" />
              <div className="flex-1">
                <span className="text-[9px] uppercase tracking-[0.2em] text-hk-muted">Institution</span>
              </div>
              <div className="w-36 shrink-0 hidden md:block">
                <span className="text-[9px] uppercase tracking-[0.2em] text-hk-muted">Tags</span>
              </div>
              <div className="w-28 shrink-0 hidden lg:block">
                <span className="text-[9px] uppercase tracking-[0.2em] text-hk-muted">Area</span>
              </div>
              <div className="w-5 shrink-0" />
            </div>
            {filtered.map((museum) => (
              <MuseumRow key={museum.id} museum={museum} tagLabelMap={tagLabelMap} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((museum) => (
              <MuseumCard key={museum.id} museum={museum} tagLabelMap={tagLabelMap} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Museums;
