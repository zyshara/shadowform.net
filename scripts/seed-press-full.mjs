// scripts/seed-press-full.mjs
// Parses DOME OF DOOM PRESS UPDATES 2026.md, fetches OG descriptions,
// and seeds/updates Strapi press items with titles, outlets, dates, and summaries.
//
// Run: node --env-file=.env scripts/seed-press-full.mjs
// Dry run (no writes): node --env-file=.env scripts/seed-press-full.mjs --dry-run

import fs from "fs";

const STRAPI_URL   = process.env.STRAPI_API_URL;
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
const MD_PATH      = "/Users/zyshara/Downloads/DOME OF DOOM PRESS UPDATES 2026.md";
const DRY_RUN      = process.argv.includes("--dry-run");

if (!STRAPI_URL || !STRAPI_TOKEN) {
  console.error("STRAPI_API_URL and STRAPI_API_TOKEN must be set");
  process.exit(1);
}

if (DRY_RUN) console.log("--- DRY RUN ---\n");

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${STRAPI_TOKEN}`,
};

// ---------------------------------------------------------------------------
// Outlet mapping: hostname → display name
// ---------------------------------------------------------------------------

const HOSTNAME_TO_OUTLET = {
  "daily.bandcamp.com":         "Bandcamp",
  "xlr8r.com":                  "XLR8R",
  "www.xlr8r.com":              "XLR8R",
  "beatportal.com":             "Beatportal",
  "www.beatportal.com":         "Beatportal",
  "thefader.com":               "The Fader",
  "www.thefader.com":           "The Fader",
  "djmag.com":                  "DJ Mag",
  "www.djmag.com":              "DJ Mag",
  "pitchfork.com":              "Pitchfork",
  "www.pitchfork.com":          "Pitchfork",
  "dancingastronaut.com":       "Dancing Astronaut",
  "www.dancingastronaut.com":   "Dancing Astronaut",
  "theelectrichawk.com":        "The Electric Hawk",
  "audiofemme.com":             "Audiofemme",
  "www.audiofemme.com":         "Audiofemme",
  "hpluscreative.com":          "H+ Creative",
  "www.hpluscreative.com":      "H+ Creative",
  "fuxwithit.com":              "Fux With It",
  "www.fuxwithit.com":          "Fux With It",
  "powmag.net":                 "Pow! Mag",
  "www.powmag.net":             "Pow! Mag",
  "edmidentity.com":            "EDM Identity",
  "www.edmidentity.com":        "EDM Identity",
  "festivalinsider.com":        "Festival Insider",
  "www.festivalinsider.com":    "Festival Insider",
  "earmilk.com":                "Earmilk",
  "www.earmilk.com":            "Earmilk",
  "magneticmag.com":            "Magnetic Magazine",
  "www.magneticmag.com":        "Magnetic Magazine",
  "forbes.com":                 "Forbes",
  "www.forbes.com":             "Forbes",
  "mixmag.net":                 "Mixmag",
  "www.mixmag.net":             "Mixmag",
  "thissongissick.com":         "This Song Is Sick",
  "www.thissongissick.com":     "This Song Is Sick",
  "larecord.com":               "LA Record",
  "www.larecord.com":           "LA Record",
  "passionweiss.com":           "Passion Weiss",
  "www.passionweiss.com":       "Passion Weiss",
  "factmag.com":                "Fact Magazine",
  "www.factmag.com":            "Fact Magazine",
  "imposemagazine.com":         "Impose Magazine",
  "www.imposemagazine.com":     "Impose Magazine",
  "vice.com":                   "Vice",
  "www.vice.com":               "Vice",
  "suspendmag.com":             "Suspend Magazine",
  "www.suspendmag.com":         "Suspend Magazine",
  "consequenceofsound.net":     "Consequence of Sound",
  "www.consequenceofsound.net": "Consequence of Sound",
  "residentadvisor.net":        "Resident Advisor",
  "www.residentadvisor.net":    "Resident Advisor",
  "exclaim.ca":                 "Exclaim!",
  "www.exclaim.ca":             "Exclaim!",
  "theuntz.com":                "The Untz",
  "www.theuntz.com":            "The Untz",
  "theseventhhex.com":          "Seventh Hex",
  "hiphopdx.com":               "HipHopDX",
  "www.hiphopdx.com":           "HipHopDX",
  "laweekly.com":               "LA Weekly",
  "www.laweekly.com":           "LA Weekly",
  "timewheel.net":              "Timewheel",
  "www.timewheel.net":          "Timewheel",
  "syffal.com":                 "Syffal",
  "www.syffal.com":             "Syffal",
};

const OUTLET_WEBSITES = {
  "Audiofemme":            "https://www.audiofemme.com",
  "H+ Creative":           "https://www.hpluscreative.com",
  "Fux With It":           "https://fuxwithit.com",
  "Pow! Mag":              "https://www.powmag.net",
  "EDM Identity":          "https://edmidentity.com",
  "Festival Insider":      "https://festivalinsider.com",
  "Earmilk":               "https://earmilk.com",
  "Magnetic Magazine":     "https://www.magneticmag.com",
  "Forbes":                "https://www.forbes.com",
  "Mixmag":                "https://mixmag.net",
  "This Song Is Sick":     "https://thissongissick.com",
  "LA Record":             "https://larecord.com",
  "Passion Weiss":         "https://www.passionweiss.com",
  "Fact Magazine":         "https://www.factmag.com",
  "Impose Magazine":       "https://www.imposemagazine.com",
  "Vice":                  "https://www.vice.com",
  "Suspend Magazine":      "https://www.suspendmag.com",
  "Consequence of Sound":  "https://consequenceofsound.net",
  "Resident Advisor":      "https://www.residentadvisor.net",
  "Exclaim!":              "https://exclaim.ca",
  "The Untz":              "https://www.theuntz.com",
  "Seventh Hex":           "https://theseventhhex.com",
  "HipHopDX":              "https://hiphopdx.com",
  "LA Weekly":             "https://www.laweekly.com",
  "Timewheel":             "https://timewheel.net",
  "Syffal":                "https://www.syffal.com",
  "Dancing Astronaut":     "https://dancingastronaut.com",
  "The Electric Hawk":     "https://theelectrichawk.com",
};

// ---------------------------------------------------------------------------
// Date extraction
// ---------------------------------------------------------------------------

function extractDateFromUrl(url) {
  const full = url.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
  if (full) return `${full[1]}-${full[2]}-${full[3]}`;
  const ym = url.match(/\/(\d{4})\/(\d{2})\//);
  if (ym) return `${ym[1]}-${ym[2]}-01`;
  return null;
}

const MONTH_MAP = {
  january: "01", february: "02", march: "03", april: "04",
  may: "05", june: "06", july: "07", august: "08",
  september: "09", october: "10", november: "11", december: "12",
};

function extractDateFromTitle(title) {
  // "December YYYY/January YYYY" edge case
  const split = title.match(/december\s+(\d{4})\s*[\/\-]\s*january/i);
  if (split) return `${split[1]}-12-01`;
  // "Month YYYY"
  const m = title.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})\b/i);
  if (m) return `${m[2]}-${MONTH_MAP[m[1].toLowerCase()]}-01`;
  // "Best of YYYY" / "of YYYY"
  const y = title.match(/\bof\s+(\d{4})\b/i);
  if (y) return `${y[1]}-01-01`;
  return null;
}

// ---------------------------------------------------------------------------
// Markdown parsing
// ---------------------------------------------------------------------------

function cleanTitle(raw) {
  return raw
    // unescape markdown (including \-)
    .replace(/\\(.)/g, "$1")
    // strip leading outlet prefix: "VICE - " / "Bandcamp - " / "EARMILK - " etc.
    .replace(/^[A-Z!][A-Z\s!&]+\s*[-–]\s*/u, "")
    .replace(/^Bandcamp\s*[-–]\s*/i, "")
    .trim();
}

// Reject OG titles that are generic site/domain names rather than article titles
function isUsableOgTitle(title) {
  if (!title || title.length < 20) return false;
  if (/is for sale|HugeDomains|Substack$|\| Substack/i.test(title)) return false;
  return true;
}

function parseMarkdownLinks(content) {
  const results = [];
  const seen    = new Set();
  const re      = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let m;

  while ((m = re.exec(content)) !== null) {
    const rawTitle = m[1].trim();
    const url      = m[2];

    // Skip image placeholder links and the artist's own site
    if (!rawTitle || /^image\d*$/i.test(rawTitle)) continue;
    if (url.includes("wyliecable.com")) continue;
    if (seen.has(url)) continue;
    seen.add(url);

    const title = cleanTitle(rawTitle) || rawTitle;

    let outletName = null;
    try {
      outletName = HOSTNAME_TO_OUTLET[new URL(url).hostname] ?? null;
    } catch {}

    const date = extractDateFromUrl(url) ?? extractDateFromTitle(title);

    results.push({ title, url, outletName, date });
  }

  return results;
}

// ---------------------------------------------------------------------------
// OG data fetching
// ---------------------------------------------------------------------------

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;|&#x27;/g, "'")
    .replace(/&nbsp;/g, " ").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
}

async function fetchOG(url, timeout = 10000) {
  try {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    const res   = await fetch(url, {
      signal:   ctrl.signal,
      redirect: "follow",
      headers:  { "User-Agent": "Mozilla/5.0 (compatible; DomeOfDoomBot/1.0; +https://domeofdoom.com)" },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const html = await res.text();

    const get = (prop) =>
      html.match(new RegExp(`<meta[^>]+property="${prop}"[^>]+content="([^"]+)"`, "i"))?.[1] ??
      html.match(new RegExp(`<meta[^>]+content="([^"]+)"[^>]+property="${prop}"`, "i"))?.[1] ??
      null;

    const title = get("og:title");
    const desc  = get("og:description") ?? get("description");
    const image = get("og:image");

    return {
      title:       title ? decodeEntities(title.trim()) : null,
      description: desc  ? decodeEntities(desc.trim())  : null,
      image:       image ? image.trim()                 : null,
    };
  } catch {
    return null;
  }
}

// Run tasks with limited concurrency
async function pLimit(fns, limit) {
  const results = new Array(fns.length);
  let idx = 0;
  async function worker() {
    while (idx < fns.length) {
      const i = idx++;
      results[i] = await fns[i]();
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

// ---------------------------------------------------------------------------
// Strapi helpers
// ---------------------------------------------------------------------------

async function strapiGet(path) {
  const res = await fetch(`${STRAPI_URL}${path}`, { headers });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

async function getAllItems() {
  const res = await strapiGet(
    "/api/dome-of-doom-press-items?pagination[pageSize]=500&fields[0]=title&fields[1]=url&fields[2]=documentId&populate[outlet][fields][0]=name"
  );
  return res.data ?? [];
}

async function getAllOutlets() {
  const res = await strapiGet(
    "/api/dome-of-doom-press-outlets?pagination[pageSize]=200&fields[0]=name&fields[1]=website&fields[2]=documentId"
  );
  return res.data ?? [];
}

async function createOutlet(name) {
  if (DRY_RUN) { console.log(`    [dry] create outlet: ${name}`); return { documentId: `dry-${name}` }; }
  const res = await fetch(`${STRAPI_URL}/api/dome-of-doom-press-outlets`, {
    method: "POST", headers,
    body: JSON.stringify({ data: { name, website: OUTLET_WEBSITES[name] ?? null, publishedAt: new Date().toISOString() } }),
  });
  if (!res.ok) throw new Error(`Create outlet "${name}" → ${res.status}: ${await res.text()}`);
  return (await res.json()).data;
}

async function createItem({ title, date, url, outletId, summary, ogImage }) {
  if (DRY_RUN) { console.log(`    [dry] create item: ${title.slice(0, 60)}`); return; }
  const res = await fetch(`${STRAPI_URL}/api/dome-of-doom-press-items`, {
    method: "POST", headers,
    body: JSON.stringify({
      data: {
        title, date: date ?? null, url: url ?? null,
        imageMode: ogImage ? "og" : "placeholder",
        publishedAt: new Date().toISOString(),
        ...(outletId && { outlet: outletId }),
        ...(ogImage  && { ogImage }),
        ...(summary  && { summary: [{ type: "paragraph", children: [{ type: "text", text: summary }] }] }),
      },
    }),
  });
  if (!res.ok) throw new Error(`Create item "${title}" → ${res.status}: ${await res.text()}`);
}

async function updateItem(documentId, { title, url, summary, ogImage, outletId, date }) {
  const data = {};
  if (title)   data.title   = title;
  if (url)     data.url     = url;
  if (summary) data.summary = [{ type: "paragraph", children: [{ type: "text", text: summary }] }];
  if (ogImage) { data.ogImage = ogImage; data.imageMode = "og"; }
  if (outletId) data.outlet = outletId;
  if (date)    data.date    = date;
  if (Object.keys(data).length === 0) return;
  if (DRY_RUN) { console.log(`    [dry] update ${documentId}: ${Object.keys(data).join(", ")}`); return; }
  const res = await fetch(`${STRAPI_URL}/api/dome-of-doom-press-items/${documentId}`, {
    method: "PUT", headers,
    body: JSON.stringify({ data }),
  });
  if (!res.ok) throw new Error(`Update ${documentId} → ${res.status}: ${await res.text()}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const md    = fs.readFileSync(MD_PATH, "utf8");
  const links = parseMarkdownLinks(md);
  console.log(`Parsed ${links.length} unique links\n`);

  // Fetch existing Strapi data
  console.log("Fetching existing Strapi data…");
  const [existingItems, existingOutlets] = await Promise.all([getAllItems(), getAllOutlets()]);
  console.log(`  ${existingItems.length} items, ${existingOutlets.length} outlets\n`);

  const itemByUrl   = new Map(existingItems.filter((i) => i.url).map((i) => [i.url.trim(), i]));
  const itemByTitle = new Map(existingItems.map((i) => [i.title?.trim().toLowerCase(), i]));
  const outletByName = new Map(existingOutlets.map((o) => [o.name?.trim().toLowerCase(), o]));

  // Fetch OG data (5 concurrent)
  console.log("Fetching OG descriptions (5 concurrent)…");
  const ogData = await pLimit(
    links.map(({ url }) => async () => {
      process.stdout.write(`  ${url.slice(0, 72).padEnd(72)} `);
      const og = await fetchOG(url);
      console.log(og?.description ? "✓" : "–");
      return og;
    }),
    5
  );
  console.log();

  // Ensure all needed outlets exist
  const neededOutlets = new Set(links.map((l) => l.outletName).filter(Boolean));
  const outletIds     = new Map();

  console.log("Resolving outlets…");
  for (const name of neededOutlets) {
    const existing = outletByName.get(name.toLowerCase());
    if (existing) {
      outletIds.set(name, existing.documentId);
    } else {
      console.log(`  + creating outlet: ${name}`);
      const created = await createOutlet(name);
      outletIds.set(name, created.documentId);
    }
  }
  console.log();

  // Process items
  let created = 0, updated = 0, skipped = 0, errors = 0;

  console.log("Processing items…");
  for (let i = 0; i < links.length; i++) {
    const { title: mdTitle, url, outletName, date } = links[i];
    const og          = ogData[i];
    const ogTitle     = isUsableOgTitle(og?.title) ? og.title : null;
    const description = og?.description ?? null;
    const ogImage     = og?.image       ?? null;
    // Prefer OG title (cleaner, no outlet prefix); fall back to markdown title
    const title       = ogTitle || mdTitle;
    const outletId    = outletName ? outletIds.get(outletName) : null;

    const existing = itemByUrl.get(url)
      ?? itemByTitle.get(mdTitle.trim().toLowerCase())
      ?? (ogTitle ? itemByTitle.get(ogTitle.trim().toLowerCase()) : null);

    if (existing) {
      const updates = {};
      if (!existing.url && url)             updates.url      = url;
      if (description)                      updates.summary  = description;
      if (ogImage)                          updates.ogImage  = ogImage;
      if (!existing.outlet && outletId)     updates.outletId = outletId;
      if (!existing.date && date)           updates.date     = date;
      // Update title only if OG title is meaningfully different and markdown title looks like a raw outlet prefix
      if (ogTitle && ogTitle !== existing.title) updates.title = ogTitle;

      if (Object.keys(updates).length > 0) {
        try {
          await updateItem(existing.documentId, updates);
          console.log(`  ~ updated: ${title.slice(0, 65)}`);
          updated++;
        } catch (err) {
          console.error(`  ✗ update error: ${err.message}`);
          errors++;
        }
      } else {
        skipped++;
      }
    } else {
      try {
        await createItem({ title, date, url, outletId, summary: description, ogImage });
        console.log(`  + created: ${title.slice(0, 65)}`);
        created++;
      } catch (err) {
        console.error(`  ✗ create error: ${err.message}`);
        errors++;
      }
    }
  }

  console.log(`\n${"─".repeat(50)}`);
  console.log(`Created: ${created}  Updated: ${updated}  Skipped: ${skipped}  Errors: ${errors}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
