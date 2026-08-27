// src/hakubutsukan/pages/Exhibits.jsx
//
// Lists all exhibits, grouped into current/upcoming and past, with a museum
// filter dropdown.

import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { readSeedData } from "@/utils/readSeedData";

const ExternalIcon = () => (
  <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 2H2v8h8V7" /><path d="M8 2h2v2" /><line x1="10" y1="2" x2="5" y2="7" />
  </svg>
);

function formatDateRange(start, end) {
  const fmt = (s) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start && !end) return `${fmt(start)} – ongoing`;
  if (!start && end) return `through ${fmt(end)}`;
  return "Permanent collection";
}

function isCurrentOrUpcoming(ex) {
  if (!ex.end_date) return true;
  return new Date(ex.end_date) >= new Date();
}

const ExhibitCard = ({ exhibit, museumsBySlug }) => {
  const museum = exhibit.museum_slug ? museumsBySlug[exhibit.museum_slug] : null;
  return (
    <div className="flex flex-col sm:flex-row gap-0 border border-hk-rule bg-hk-card hover:border-hk-gold/60 transition-colors group">
      {exhibit.image_url && (
        <div className="shrink-0 w-full sm:w-32 aspect-video sm:aspect-square overflow-hidden">
          <img
            src={exhibit.image_url}
            alt={exhibit.title}
            className="w-full h-full object-cover"
            style={{ filter: "sepia(15%) brightness(0.95)" }}
          />
        </div>
      )}
      <div className="flex flex-col gap-2 p-4 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <h3 className="font-display font-semibold text-sm text-hk-text leading-snug group-hover:text-hk-gold transition-colors">
              {exhibit.title}
            </h3>
            {museum && (
              <Link
                to={`/museum/${museum.slug}`}
                className="text-[10px] uppercase tracking-widest text-hk-muted hover:text-hk-gold transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {museum.name}
              </Link>
            )}
          </div>
          {exhibit.exhibit_url && (
            <a
              href={exhibit.exhibit_url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-hk-muted hover:text-hk-gold transition-colors"
              aria-label="View exhibit"
            >
              <ExternalIcon />
            </a>
          )}
        </div>
        <p className="text-[11px] font-display italic text-hk-gold">
          {formatDateRange(exhibit.start_date, exhibit.end_date)}
        </p>
        {exhibit.description && (
          <p className="text-xs text-hk-text-mid leading-relaxed line-clamp-2">{exhibit.description}</p>
        )}
      </div>
    </div>
  );
};

const Exhibits = () => {
  const allExhibits = useMemo(() => readSeedData("exhibits-data") ?? [], []);
  const allMuseums  = useMemo(() => readSeedData("museums-data")  ?? [], []);

  const museumsBySlug = useMemo(() => Object.fromEntries(allMuseums.map((m) => [m.slug, m])), [allMuseums]);
  const museumOptions = useMemo(() => [
    { value: "", label: "All Museums" },
    ...allMuseums.map((m) => ({ value: m.slug, label: m.name })),
  ], [allMuseums]);

  const [museumFilter, setMuseumFilter] = useState("");

  const { current, past } = useMemo(() => {
    const exhibits = museumFilter
      ? allExhibits.filter((ex) => ex.museum_slug === museumFilter)
      : allExhibits;
    return {
      current: exhibits
        .filter(isCurrentOrUpcoming)
        .sort((a, b) => {
          if (!a.start_date) return 1;
          if (!b.start_date) return -1;
          return new Date(a.start_date) - new Date(b.start_date);
        }),
      past: exhibits
        .filter((ex) => !isCurrentOrUpcoming(ex))
        .sort((a, b) => new Date(b.end_date) - new Date(a.end_date)),
    };
  }, [allExhibits, museumFilter]);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-hk-rule px-6 py-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display font-semibold text-3xl italic text-hk-text leading-none">Exhibits</h1>
          <p className="text-xs text-hk-muted">
            {current.length} current · {past.length} past
          </p>
        </div>
        <div className="shrink-0">
          <select
            value={museumFilter}
            onChange={(e) => setMuseumFilter(e.target.value)}
            className="text-xs bg-hk-card border border-hk-rule text-hk-text-mid px-3 py-2 appearance-none cursor-pointer pr-7 focus:outline-none focus:border-hk-gold"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpolyline points='1,1 5,5 9,1' fill='none' stroke='%238c7350' strokeWidth='1.3'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
          >
            {museumOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-6 py-8 flex flex-col gap-10">
        {current.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-[10px] uppercase tracking-[0.22em] text-hk-muted border-b border-hk-rule pb-3">
              Current &amp; Upcoming
            </h2>
            <div className="flex flex-col gap-3">
              {current.map((ex) => <ExhibitCard key={ex.id} exhibit={ex} museumsBySlug={museumsBySlug} />)}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-[10px] uppercase tracking-[0.22em] text-hk-muted border-b border-hk-rule pb-3">
              Past
            </h2>
            <div className="flex flex-col gap-3 opacity-60">
              {past.map((ex) => <ExhibitCard key={ex.id} exhibit={ex} museumsBySlug={museumsBySlug} />)}
            </div>
          </section>
        )}

        {current.length === 0 && past.length === 0 && (
          <p className="font-display italic text-hk-muted text-sm py-16 text-center">
            No exhibits listed yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default Exhibits;
