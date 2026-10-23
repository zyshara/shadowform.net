// Input is the normalized Strapi catalog (type + release_date).
export function selectHomeReleases(items, now) {
  const releases = items
    .filter((item) => item.type?.trim().toLowerCase() !== "compilation" && item.release_date)
    .map((item) => ({ item, date: new Date(item.release_date).getTime() }))
    .filter(({ date }) => Number.isFinite(date));

  const released = releases.filter(({ date }) => date <= now).sort((a, b) => b.date - a.date);
  const upcoming = releases.filter(({ date }) => date > now).sort((a, b) => a.date - b.date);
  if (upcoming.length && released.length) {
    return [upcoming[0], released[0]].map(({ item }) => ({ item, showLabel: true }));
  }
  // Always use the two-card layout, without duplicating releases when the
  // catalog contains fewer than two eligible entries.
  const selected = released.length ? released : upcoming;
  return selected.slice(0, 2).map(({ item }, index) => ({ item, showLabel: index === 0 }));
}
