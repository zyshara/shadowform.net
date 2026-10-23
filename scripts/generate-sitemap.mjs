// Build the public sitemap from the same Strapi-normalized data as SSR.
import "dotenv/config";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getCatalog, getArtists } from "../server/apps/domeofdoom/data.js";
import { catalogItemSlug } from "../src/domeofdoom/utils/catalogItemSlug.js";
import { artistSlug } from "../src/domeofdoom/utils/artistSlug.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = "https://www.domeofdoom.org";

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
    const catalogData = await getCatalog();
    catalogPages = catalogData.map((item) => ({
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
    const rosterData = await getArtists();
    rosterPages = rosterData
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

  const outPath = path.join(__dirname, "../dist/domeofdoom/client/sitemap.xml");
  writeFileSync(outPath, xml, "utf8");
  console.log(`\nWrote ${allPages.length} URLs → dist/domeofdoom/client/sitemap.xml`);
}

main().catch((e) => { console.error(e); process.exit(1); });
