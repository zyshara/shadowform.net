// scripts/backfill-dates.mjs
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const STRAPI_URL   = env.STRAPI_API_URL;
const STRAPI_TOKEN = env.STRAPI_API_TOKEN;
const CONCURRENCY  = 4;
const TIMEOUT_MS   = 15000;

// ---------------------------------------------------------------------------
// Strapi helpers
// ---------------------------------------------------------------------------

async function strapiGet(path) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Strapi ${res.status}: ${await res.text()}`);
  return res.json();
}

async function strapiPatch(documentId, data) {
  const res = await fetch(`${STRAPI_URL}/api/dome-of-doom-press-items/${documentId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) throw new Error(`PUT ${res.status}: ${await res.text()}`);
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

async function fetchHtml(url, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
    });
    if (!res.ok) return { html: null, status: res.status };
    return { html: await res.text(), status: res.status };
  } catch (e) {
    return { html: null, status: e.name === "AbortError" ? "timeout" : "error" };
  } finally {
    clearTimeout(timer);
  }
}

// Try Wayback Machine CDX API — returns earliest snapshot date for the URL
async function waybackEarliestDate(url) {
  const cdx = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&limit=1&fl=timestamp&filter=statuscode:200&from=20100101&to=20271231`;
  const { html } = await fetchHtml(cdx, 10000);
  if (!html) return null;
  try {
    const rows = JSON.parse(html);
    // rows[0] is header ["timestamp"], rows[1] is first result
    if (rows.length < 2) return null;
    const ts = rows[1][0]; // e.g. "20161006120000"
    return toISODate(`${ts.slice(0,4)}-${ts.slice(4,6)}-${ts.slice(6,8)}`);
  } catch {
    return null;
  }
}

// Try fetching an archived snapshot from Wayback
async function fetchWaybackHtml(url) {
  const cdx = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&limit=1&fl=timestamp&filter=statuscode:200&from=20100101&to=20271231`;
  const { html: cdxHtml } = await fetchHtml(cdx, 10000);
  if (!cdxHtml) return null;
  try {
    const rows = JSON.parse(cdxHtml);
    if (rows.length < 2) return null;
    const ts = rows[1][0];
    const archiveUrl = `https://web.archive.org/web/${ts}/${url}`;
    const { html } = await fetchHtml(archiveUrl, 15000);
    return html;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Date parsing
// ---------------------------------------------------------------------------

function toISODate(str) {
  if (!str) return null;
  const d = new Date(str);
  if (isNaN(d)) return null;
  const y = d.getUTCFullYear();
  if (y < 2000 || y > 2027) return null;
  return `${y}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`;
}

function metaContent(html, property) {
  const re1 = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,"i");
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,"i");
  return (html.match(re1) || html.match(re2))?.[1] ?? null;
}

function extractDateFromUrl(url) {
  const full = url.match(/\/(\d{4})\/(\d{1,2})\/(\d{1,2})\//);
  if (full) return toISODate(`${full[1]}-${full[2]}-${full[3]}`);
  const ym = url.match(/\/(\d{4})\/(\d{1,2})\//);
  if (ym) return toISODate(`${ym[1]}-${ym[2]}-01`);
  return null;
}

function extractDateFromHtml(html, url) {
  // article meta tags
  for (const prop of ["article:published_time","article:modified_time","og:updated_time","datePublished"]) {
    const v = metaContent(html, prop);
    if (v) { const d = toISODate(v); if (d) return { date: d, source: prop }; }
  }

  // JSON-LD
  const ldBlocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  for (const block of ldBlocks) {
    try {
      const json = JSON.parse(block.replace(/<\/?script[^>]*>/gi, ""));
      for (const entry of (Array.isArray(json) ? json : [json])) {
        const dp = entry.datePublished || entry.dateCreated || entry.dateModified;
        if (dp) { const d = toISODate(dp); if (d) return { date: d, source: "json-ld" }; }
      }
    } catch {}
  }

  // <time datetime>
  const timeTag = html.match(/<time[^>]+datetime=["']([^"']+)["']/i);
  if (timeTag) { const d = toISODate(timeTag[1]); if (d) return { date: d, source: "<time>" }; }

  // URL pattern
  const urlDate = extractDateFromUrl(url);
  if (urlDate) return { date: urlDate, source: "url" };

  // Visible text — Month D, YYYY
  const months = "January|February|March|April|May|June|July|August|September|October|November|December";
  const textMatch = html.match(new RegExp(`(${months})\\s+(\\d{1,2}),?\\s+(20\\d{2})`,"i")) ||
                    html.match(new RegExp(`(\\d{1,2})\\s+(${months})\\s+(20\\d{2})`,"i"));
  if (textMatch) { const d = toISODate(textMatch[0]); if (d) return { date: d, source: "text" }; }

  return null;
}

// ---------------------------------------------------------------------------
// Concurrency limiter
// ---------------------------------------------------------------------------

function pLimit(n) {
  const q = []; let active = 0;
  const run = () => { while (active < n && q.length) { active++; const {fn,res,rej}=q.shift(); fn().then(res,rej).finally(()=>{active--;run();}); } };
  return (fn) => new Promise((res,rej) => { q.push({fn,res,rej}); run(); });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const data = await strapiGet(
    "/api/dome-of-doom-press-items" +
    "?filters[date][$null]=true&filters[url][$notNull]=true" +
    "&fields[0]=documentId&fields[1]=title&fields[2]=url" +
    "&pagination[pageSize]=200"
  );

  const items = data.data ?? [];
  console.log(`Found ${items.length} items without a date.\n`);

  const limit = pLimit(CONCURRENCY);
  const noDate = [];
  let found = 0, errors = 0;

  await Promise.all(items.map((item) => limit(async () => {
    const { documentId, title, url } = item;

    // 1. Try live page
    let result = null;
    const { html: liveHtml, status } = await fetchHtml(url);
    if (liveHtml) result = extractDateFromHtml(liveHtml, url);

    // 2. Try Wayback archived snapshot
    if (!result) {
      const archiveHtml = await fetchWaybackHtml(url);
      if (archiveHtml) result = extractDateFromHtml(archiveHtml, url);
    }

    // 3. Fallback: use Wayback CDX earliest capture date
    if (!result) {
      const cdxDate = await waybackEarliestDate(url);
      if (cdxDate) result = { date: cdxDate, source: "wayback-cdx" };
    }

    if (result) {
      try {
        await strapiPatch(documentId, { date: result.date });
        console.log(`✓ [${result.source}] ${result.date}  —  ${title}`);
        found++;
      } catch (err) {
        console.error(`✗ patch failed: ${title} — ${err.message}`);
        errors++;
      }
    } else {
      noDate.push({ title, url, reason: status === "timeout" ? "timeout" : status >= 400 ? `HTTP ${status}` : "no date in page" });
      console.log(`- no date: ${title}`);
    }
  })));

  console.log(`\nDone: ${found} updated, ${noDate.length} still missing, ${errors} errors\n`);

  if (noDate.length) {
    console.log("=== Still missing dates ===");
    for (const { title, url, reason } of noDate) {
      console.log(`\n  ${title}\n  ${url}\n  Reason: ${reason}`);
    }
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
