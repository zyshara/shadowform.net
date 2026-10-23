// Input is the normalized Strapi catalog (type + release_date).
export function selectHomeReleases(items, now) {
  const releases = items
    .filter((item) => item.type?.trim().toLowerCase() !== "compilation" && item.release_date)
    .map((item) => ({ item, date: new Date(item.release_date).getTime() }))
    .filter(({ date }) => Number.isFinite(date));

  const released = releases.filter(({ date }) => date <= now).sort((a, b) => b.date - a.date);
  const upcoming = releases.filter(({ date }) => date > now).sort((a, b) => a.date - b.date);
  return {
    latestRelease: released[0]?.item ?? null,
    upcomingRelease: upcoming[0]?.item ?? null,
  };
}
