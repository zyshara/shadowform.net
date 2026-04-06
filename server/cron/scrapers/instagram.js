export function parseInstagramHandle(url) {
  // https://www.instagram.com/lowpolysound/
  const match = url.match(/instagram\.com\/([^/?]+)/);
  return match ? match[1] : null;
}

export async function scrapeInstagramFollowers(artist) {
  const handle = parseInstagramHandle(artist.instagram?.url);
  if (!handle) {
    console.warn(`[instagram] no handle for ${artist.name}, skipping`);
    return null;
  }

  const res = await fetch(`https://www.instagram.com/${handle}/`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
  });

  if (!res.ok) throw new Error(`Instagram fetch failed: ${res.status}`);

  const html = await res.text();

  // Instagram embeds metadata in a <script> tag as JSON
  const match = html.match(/"edge_followed_by":\{"count":(\d+)\}/);
  if (!match) {
    console.warn(`[instagram] could not parse followers for ${handle} — Instagram may have changed their markup`);
    return null;
  }

  const instagram_followers = parseInt(match[1], 10);
  console.log(`[instagram] ${artist.name}: ${instagram_followers} followers`);

  return { instagram_followers };
}
