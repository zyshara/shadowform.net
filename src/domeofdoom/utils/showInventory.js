export function formatShowDate(date, options = {}) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC", ...options }).format(new Date(`${date}T12:00:00Z`));
}

export function showDateLabel(show) {
  if (!show.endDate || show.endDate === show.date) return formatShowDate(show.date, { year: "numeric" });
  const sameMonth = show.date.slice(0, 7) === show.endDate.slice(0, 7);
  return sameMonth
    ? `${formatShowDate(show.date)}–${Number(show.endDate.slice(8, 10))}, ${show.endDate.slice(0, 4)}`
    : `${formatShowDate(show.date, show.date.slice(0, 4) !== show.endDate.slice(0, 4) ? { year: "numeric" } : {})}–${formatShowDate(show.endDate, { year: "numeric" })}`;
}

export function showRegion(country) {
  if (["US", "CA", "MX"].includes(country)) return "North America";
  if (["GB", "BE", "CZ", "DE", "ES", "NL"].includes(country)) return "Europe";
  if (country === "JP") return "Asia";
  return "Other";
}

export function filterShows(shows, filters) {
  const matches = (selected, values) => selected instanceof Set
    ? selected.size === 0 || values.some(value => selected.has(value))
    : !selected || values.includes(selected);
  return shows.filter(show =>
    matches(filters.type, [show.type]) &&
    matches(filters.year, [show.date.slice(0, 4)]) &&
    matches(filters.artist, show.artists) &&
    matches(filters.region, [showRegion(show.country)])
  );
}

export function splitShows(shows, today, sort = "newest") {
  const upcoming = shows.filter(s => (s.endDate || s.date) >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = shows.filter(s => (s.endDate || s.date) < today).sort((a, b) => sort === "oldest" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
  return { upcoming, past };
}

export function groupShows(shows, by = "year") {
  const groups = new Map();
  for (const show of shows) {
    const key = show.date.slice(0, by === "month" ? 7 : 4);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(show);
  }
  return [...groups].map(([key, items]) => ({ key, items }));
}
