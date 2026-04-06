export function parseSongkickUrl(url) {
  const match = url?.match(/songkick\.com\/artists\/([^/?]+)/);
  return match ? match[1] : null;
}

export async function scrapeSongkickShows(artist) {
  const artistSlug = parseSongkickUrl(artist.songkick?.url);
  if (!artistSlug) {
    console.warn(`[songkick] no URL for ${artist.name}, skipping`);
    return null;
  }

  const res = await fetch(`https://www.songkick.com/artists/${artistSlug}`, {
    headers: {
      "User-Agent": "curl/7.88.1",
      "Accept": "*/*",
    },
  });

  if (!res.ok) throw new Error(`Songkick fetch failed: ${res.status}`);

  const html = await res.text();

  // "Show all past events" button badge
  const pastMatch = html.match(/class="action-btn see-all-btn"[^>]*>[\s\S]*?<span class="btn_badge">(\d+)<\/span>/);

  // "Coming up" tab badge
  const upcomingMatch = html.match(/id="coming-up-tab"[\s\S]*?<span class="sk-tabs-badge">(\d+)<\/span>/);

  const shows_played   = pastMatch    ? parseInt(pastMatch[1], 10)    : null;
  const upcoming_shows = upcomingMatch ? parseInt(upcomingMatch[1], 10) : null;

  console.log(`[songkick] ${artist.name}: ${shows_played} past, ${upcoming_shows} upcoming`);

  return {
    ...(shows_played   !== null ? { shows_played }   : {}),
    ...(upcoming_shows !== null ? { upcoming_shows } : {}),
  };
}
