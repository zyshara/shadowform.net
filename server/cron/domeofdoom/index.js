import cron from "node-cron";
import { logger } from "../../lib/logger.js";
import { setRoster, setMerch } from "../../lib/bandcampCache.js";
import { scrapeBandcampRoster } from "../scrapers/bandcampRoster.js";
import { scrapeBandcampMerch } from "../scrapers/bandcampMerch.js";
import { scrapeBandcampAndSyncStrapi } from "./scrapeBandcampAndSyncStrapi.js";
import { backfillCatalogItems } from "./backfillCatalogItems.js";
import { backfillArtistSpotify } from "./backfillArtistSpotify.js";
import { fetchAndCacheStrapiData } from "./fetchAndCacheStrapiData.js";
import { syncDiscography } from "./syncDiscography.js";
import { syncAboutPage } from "./syncAboutPage.js";
import { syncShows } from "./syncShows.js";
import { syncAllArtistStats } from "./syncStats.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

async function runSafe(label, fn) {
  try {
    await fn();
  } catch (err) {
    logger.error(`[domeofdoomCron] ${label} failed:`, err.message);
  }
}

async function runRosterThenShows() {
  // Shows sync matches artist names against the roster cache to attach
  // photos (see syncShows.js), so the roster scrape must complete first.
  await runSafe("bandcamp roster scrape", async () => {
    const artists = await scrapeBandcampRoster();
    setRoster(artists);
  });
  await runSafe("shows sync", syncShows);
}

export function startDomeOfDoomCron() {
  // ── Strapi data cache (read-only, runs on startup + every 5 min) ─────────
  fetchAndCacheStrapiData().catch((err) =>
    logger.error("[domeofdoomCron] initial catalog cache fetch failed:", err.message)
  );
  cron.schedule("*/5 * * * *", () => runSafe("strapi cache refresh", fetchAndCacheStrapiData));

  // ── Heavy scrape + backfill (twice daily) ────────────────────────────────
  cron.schedule(
    "0 0,12 * * *",
    async () => {
      await runSafe("bandcamp scrape + strapi sync", scrapeBandcampAndSyncStrapi);
      await runSafe("catalog item backfill", backfillCatalogItems);
      await runSafe("artist spotify backfill", backfillArtistSpotify);
      await runSafe("artist stats sync", syncAllArtistStats);
    },
    { timezone: "America/Los_Angeles" }
  );

  // ── Daily data syncs (run on startup + every 24h) ───────────────────────
  runSafe("discography sync", syncDiscography);
  setInterval(() => runSafe("discography sync", syncDiscography), ONE_DAY_MS);

  runRosterThenShows();
  setInterval(runRosterThenShows, ONE_DAY_MS);

  runSafe("bandcamp merch scrape", async () => {
    const items = await scrapeBandcampMerch();
    setMerch(items);
  });
  setInterval(async () => {
    await runSafe("bandcamp merch scrape", async () => {
      const items = await scrapeBandcampMerch();
      setMerch(items);
    });
  }, ONE_DAY_MS);

  runSafe("about page sync", syncAboutPage);
  setInterval(() => runSafe("about page sync", syncAboutPage), ONE_DAY_MS);

  logger.info("[domeofdoomCron] jobs registered (catalog cache: every 5 min; scrape/sync: daily)");
}
