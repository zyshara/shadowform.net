// scripts/generate-sitemap.mjs
// Run after webpack build to write dist/domeofdoom/sitemap.xml.
// Fetches dynamic slugs (catalog items, artists) from the local server
// so the sitemap reflects real content.

import { readFileSync, writeFileSync } from "fs";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envPath = path.join(__dirname, "../.env");
let fileEnv = {};
try {
  fileEnv = Object.fromEntries(
    readFileSync(envPath, "utf8")
      .split("\n")
      .filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
} catch { /* no .env file — rely on process.env (e.g. Heroku config vars) */ }

const STRAPI_URL   = fileEnv.STRAPI_API_URL   ?? process.env.STRAPI_API_URL;
const STRAPI_TOKEN = fileEnv.STRAPI_API_TOKEN ?? process.env.STRAPI_API_TOKEN;
const SITE_ROOT    = "https://www.domeofdoom.org";

function artistSlug(name) {
  return (name ?? "").toLowerCase().trim().replace(/\s+/g, "-");
}

function slugify(str) {
  return (str || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function catalogItemSlug(item) {
  if (item.catalog_number) return item.catalog_number;
  return `${slugify(item.title)}-${item.documentId}`;
}

async function strapiGet(path) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Strapi ${res.status} ${path}`);
  return res.json();
}

async function main() {
  const staticPages = [
    { loc: "/",          priority: "1.0", changefreq: "weekly"  },
    { loc: "/catalog",   priority: "0.9", changefreq: "weekly"  },
    { loc: "/roster",    priority: "0.9", changefreq: "monthly" },
    { loc: "/press",     priority: "0.8", changefreq: "weekly"  },
    { loc: "/shows",     priority: "0.8", changefreq: "daily"   },
    { loc: "/about",     priority: "0.7", changefreq: "monthly" },
    { loc: "/merch",     priority: "0.7", changefreq: "weekly"  },
    { loc: "/contact",   priority: "0.6", changefreq: "yearly"  },
    { loc: "/licensing", priority: "0.6", changefreq: "yearly"  },
  ];

  // Fetch catalog items
  let catalogPages = [];
  try {
    const catalogData = await strapiGet(
      "/api/dome-of-doom-catalog-items?fields[0]=documentId&fields[1]=title&fields[2]=catalog_number&pagination[pageSize]=500"
    );
    catalogPages = (catalogData.data ?? []).map((item) => ({
      loc: `/catalog/${catalogItemSlug(item)}`,
      priority: "0.7",
      changefreq: "monthly",
    }));
    console.log(`  Catalog: ${catalogPages.length} items`);
  } catch (e) {
    console.warn(`  Catalog fetch failed: ${e.message}`);
  }

  // Fetch artists
  let rosterPages = [];
  try {
    const rosterData = await strapiGet(
      "/api/dome-of-doom-artists?fields[0]=name&pagination[pageSize]=200"
    );
    rosterPages = (rosterData.data ?? [])
      .filter((a) => a.name)
      .map((a) => ({
        loc: `/roster/${artistSlug(a.name)}`,
        priority: "0.7",
        changefreq: "monthly",
      }));
    console.log(`  Roster: ${rosterPages.length} artists`);
  } catch (e) {
    console.warn(`  Roster fetch failed: ${e.message}`);
  }

  const today = new Date().toISOString().slice(0, 10);
  const allPages = [...staticPages, ...catalogPages, ...rosterPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(({ loc, priority, changefreq }) => `  <url>
    <loc>${SITE_ROOT}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  const outPath = path.join(__dirname, "../dist/domeofdoom/sitemap.xml");
  writeFileSync(outPath, xml, "utf8");
  console.log(`\nWrote ${allPages.length} URLs → dist/domeofdoom/sitemap.xml`);
}

main().catch((e) => { console.error(e); process.exit(1); });
