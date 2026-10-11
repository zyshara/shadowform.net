// scripts/backfill-press-urls.mjs
// Patches press items that have known URLs but were seeded without them.
// Run: node --env-file=.env scripts/backfill-press-urls.mjs

const STRAPI_URL   = process.env.STRAPI_API_URL;
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_URL || !STRAPI_TOKEN) {
  console.error("STRAPI_API_URL and STRAPI_API_TOKEN must be set");
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${STRAPI_TOKEN}`,
};

// title → correct URL
const URL_MAP = {
  // Bandcamp — Best Beat Tapes
  "The Best Beat Tapes on Bandcamp: September 2021":
    "https://daily.bandcamp.com/best-beat-tapes/the-best-beat-tapes-on-bandcamp-september-2021",
  "Baby Weight, Daedelus, ZOF, More Appear on New Dome of Doom Spring Compilation":
    "https://daily.bandcamp.com/genre-roundup/baby-weight-daedelus-zof-more-appear-on-new-dome-of-doom-spring-compilation",
  "The Best Beat Tapes of 2020":
    "https://daily.bandcamp.com/best-beat-tapes/the-best-beat-tapes-of-2020",
  "The Best Beat Tapes on Bandcamp: September 2020":
    "https://daily.bandcamp.com/best-beat-tapes/the-best-beat-tapes-on-bandcamp-september-2020",
  "Album of the Day: Wylie Cable, 'Shimmer, Then Disappear'":
    "https://daily.bandcamp.com/album-of-the-day/wylie-cable-shimmer-then-disappear",
  "Daedelus's New LP Is A Noisy Tribute to '90s Rave":
    "https://daily.bandcamp.com/features/daedelus-labyrinths-review",
  "The Best Beat Tapes on Bandcamp: April 2020":
    "https://daily.bandcamp.com/best-beat-tapes/the-best-beat-tapes-on-bandcamp-april-2020",
  "The Best Beat Tapes on Bandcamp: February 2020":
    "https://daily.bandcamp.com/best-beat-tapes/the-best-beat-tapes-on-bandcamp-february-2020",
  "The Best Beat Tapes on Bandcamp: December 2019 / January 2020":
    "https://daily.bandcamp.com/best-beat-tapes/the-best-beat-tapes-on-bandcamp-december-2019-january-2020",
  "The Best Beat Tapes of 2019":
    "https://daily.bandcamp.com/best-beat-tapes/the-best-beat-tapes-of-2019",
  "Rah Zen is Shining Light on Boston's Beat Scene":
    "https://daily.bandcamp.com/features/rah-zen-is-shining-light-on-bostons-beat-scene",
  "The Best Hip-Hop on Bandcamp: September 2019":
    "https://daily.bandcamp.com/best-hip-hop/the-best-hip-hop-on-bandcamp-september-2019",
  "The Best Beat Tapes on Bandcamp: July 2019":
    "https://daily.bandcamp.com/best-beat-tapes/the-best-beat-tapes-on-bandcamp-july-2019",
  "The Best Beat Tapes on Bandcamp: June 2019":
    "https://daily.bandcamp.com/best-beat-tapes/the-best-beat-tapes-on-bandcamp-june-2019",
  "To Make His Latest LP, Gnome Beats Pushed Himself to the Breaking Point":
    "https://daily.bandcamp.com/features/gnome-beats-timo-ceniceros-pushed-himself-to-the-breaking-point",
  "On 'A Man + His Plants,' Chicano Rapper Speak Finds His Identity In A Self-Created Eden":
    "https://daily.bandcamp.com/features/a-man-his-plants-chicano-rapper-speak",
  "The Best Beat Tapes on Bandcamp: September 2018":
    "https://daily.bandcamp.com/best-beat-tapes/the-best-beat-tapes-on-bandcamp-september-2018",
};

async function getAllItems() {
  const res = await fetch(
    `${STRAPI_URL}/api/dome-of-doom-press-items?pagination[pageSize]=200&fields[0]=title&fields[1]=url&fields[2]=documentId`,
    { headers }
  );
  if (!res.ok) throw new Error(`GET items → ${res.status}`);
  const json = await res.json();
  return json.data ?? [];
}

async function updateItem(documentId, url) {
  const res = await fetch(`${STRAPI_URL}/api/dome-of-doom-press-items/${documentId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: { url } }),
  });
  if (!res.ok) throw new Error(`PUT ${documentId} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function main() {
  console.log("Fetching all press items…");
  const items = await getAllItems();

  let updated = 0;
  let skipped = 0;

  for (const item of items) {
    const knownUrl = URL_MAP[item.title?.trim()];
    if (!knownUrl) continue;
    if (item.url) {
      console.log(`  already has url, skipping: ${item.title}`);
      skipped++;
      continue;
    }
    console.log(`  update: ${item.title}`);
    await updateItem(item.documentId, knownUrl);
    updated++;
  }

  console.log(`\nDone. ${updated} updated, ${skipped} skipped (already had URL).`);
}

main().catch((err) => { console.error(err); process.exit(1); });
