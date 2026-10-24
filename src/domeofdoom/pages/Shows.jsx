import { Link } from "react-router";
import IndexPageHeader from "@/components/IndexPageHeader";
import FilterBar from "@/components/FilterBar";
import React, { useMemo, useRef, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import WorldMap from "@/components/WorldMap";
import JapanTourCard from "@/components/JapanTourCard";
import StarIcon from "@/components/StarIcon";
import HomeSectionHeader from "@/components/HomeSectionHeader";
import ArrowUpRightIcon from "@/components/ArrowUpRightIcon";
import { filterShows, formatShowDate, groupShows, showDateLabel, showRegion, splitShows } from "@/utils/showInventory";

const emptyFilters = () => ({ type: new Set(), year: new Set(), artist: new Set(), region: new Set() });
const COUNTRY_NAMES = { US: "USA", CA: "Canada", MX: "Mexico", GB: "UK", BE: "Belgium", CZ: "Czech Republic", JP: "Japan" };
const unique = values => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

function ShowImage({ show }) {
  return show.flyerUrl ? <img src={show.flyerUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /> :
    <div className="shows-image-fallback" aria-hidden="true"><StarIcon size={54} showBackground={false} showGlow={false} /></div>;
}

export function ShowRow({ show }) {
  const page = show.pageSlug ? { slug: show.pageSlug } : null;
  const Tag = page ? Link : show.url ? "a" : "div";
  const location = [show.city, show.state, COUNTRY_NAMES[show.country] || show.country].filter(Boolean).join(", ");
  return (
    <Tag className="shows-event" {...(page ? { to: `/shows/${page.slug}` } : show.url ? { href: show.url, target: "_blank", rel: "noopener noreferrer", "aria-label": `${show.title} — event information (opens in a new tab)` } : {})}>
      <div className="shows-event-image"><ShowImage show={show} /></div>
      <div className="min-w-0 flex-1">
        <div className="shows-event-date">
          <time dateTime={show.date}>{showDateLabel(show)}</time>
        </div>
        <h3 className="shows-event-title">{show.title}</h3>
        {show.venue && show.venue !== show.title && <p className="m-0 mt-1 text-xs text-dod-white/75">{show.venue}</p>}
        <p className="m-0 mt-1 text-xs text-dod-lilac/70">{location}</p>
        <p className="m-0 mt-2 text-[11px] leading-relaxed text-dod-white/50">{show.artists.join(" · ")}</p>
      </div>
      <div className="shows-event-end">
        <span className={`shows-type ${show.type === "Show" ? "shows-type-mint" : ""}`}>{show.type}</span>
        {show.url && <span className="text-dod-lilac" aria-hidden="true"><ArrowUpRightIcon size={15} /></span>}
      </div>
    </Tag>
  );
}


function Timeline({ groups, monthly = false }) {
  return <div className="shows-timeline">
    {groups.map(({ key, items }) => <div className="shows-timeline-group" key={key}>
      <div className="shows-timeline-label">
        {monthly ? <><span>{formatShowDate(`${key}-01`, { month: "short", day: undefined })}</span><span className="text-lg font-normal">{key.slice(0, 4)}</span></> : <span>{key}</span>}
      </div>
      <ul className={`shows-event-list ${monthly ? "shows-event-list-upcoming" : ""}`}>
        {items.map(show => <li key={show.id}><ShowRow show={show} /></li>)}
      </ul>
    </div>)}
  </div>;
}

export default function Shows({ shows = [], now }) {
  usePageTitle("Shows");
  const [filters, setFilters] = useState(emptyFilters);
  const descriptionRef = useRef(null);
  const [sort, setSort] = useState("newest");
  const today = new Date(now ?? Date.now()).toISOString().slice(0, 10);
  const options = useMemo(() => ({
    type: unique(shows.map(s => s.type)),
    year: unique(shows.map(s => s.date.slice(0, 4))).reverse(),
    artist: unique(shows.flatMap(s => s.artists)),
    region: unique(shows.map(s => showRegion(s.country))),
  }), [shows]);
  const filtered = useMemo(() => filterShows(shows, filters), [shows, filters]);
  const { upcoming, past } = useMemo(() => splitShows(filtered, today, sort), [filtered, today, sort]);
  const anyFilter = Object.values(filters).some(values => values.size);

  return <div className="shows-page">
    <IndexPageHeader heading="SHOWS" count={filtered.length} total={shows.length} noun="shows & festivals"
      descriptionRef={descriptionRef}
      description="A curated selection of live shows, festivals, and stage takeovers featuring the Dome of Doom family."
      asset={<div className="shows-header-art" aria-hidden="true"><WorldMap className="h-full w-full" showBackground={false} /></div>}
    />
    <div className="my-10">
      <FilterBar groups={Object.entries(options).map(([key, values]) => ({
        key, label: key.charAt(0).toUpperCase() + key.slice(1), selected: filters[key],
        options: values.map(value => ({ value, label: value, count: filterShows(shows, { ...filters, [key]: new Set([value]) }).length })),
        onToggle: value => setFilters(previous => {
          const selected = new Set(previous[key]);
          if (selected.has(value)) selected.delete(value); else selected.add(value);
          return { ...previous, [key]: selected };
        }),
      }))} sortOptions={[{ value: "newest", label: "Newest First" }, { value: "oldest", label: "Oldest First" }]}
        sortValue={sort} onSortChange={setSort} resultCount={filtered.length}
        onClearAll={() => setFilters(emptyFilters())} panelTopRef={descriptionRef} />
    </div>
    {anyFilter && <div className="mb-4 flex justify-end text-xs">
      <button className="cursor-pointer text-dod-neon-mint underline underline-offset-4" onClick={() => setFilters(emptyFilters())}>Clear filters</button>
    </div>}

    <section aria-label="Upcoming shows">
      <HomeSectionHeader title="Upcoming Shows" count={`${upcoming.length} ${upcoming.length === 1 ? "event" : "events"}`} />
      <div className="shows-upcoming-layout">
      <div>{upcoming.length ? <Timeline groups={groupShows(upcoming, "month")} monthly /> : <div className="shows-empty">
        <StarIcon size={38} showBackground={false} showGlow={false} />
        <div><p className="m-0 text-sm font-semibold text-dod-white">{anyFilter ? "No upcoming shows match these filters." : "No upcoming shows announced."}</p><p className="m-0 mt-1 text-sm text-dod-lilac/65">{anyFilter ? "Try another selection or clear the filters." : "Explore selected past appearances below."}</p></div>
      </div>}</div>
      <aside className="shows-upcoming-placeholder" aria-label="Japan tour">
        <JapanTourCard className="aspect-[3/5] w-full" />
      </aside>
      </div>
    </section>

    <section className="mt-12" aria-label="Show archive">
      <HomeSectionHeader title="Show Archive" count={`${past.length} ${past.length === 1 ? "event" : "events"}`} />
      {past.length ? <Timeline groups={groupShows(past)} /> : <p className="shows-empty text-sm text-dod-lilac/70">No archived shows match these filters.</p>}
    </section>
  </div>;
}
