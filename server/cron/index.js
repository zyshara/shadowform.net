import { syncAllArtistStats } from "./syncStats.js";
import { startNotionCron } from "./notion.js";
import { startInstagramCron } from "./instagram.js";
import { syncDiscography } from "./syncDiscography.js";
import { syncShows } from "./syncShows.js";
import { scrapeBandcampRoster } from "./scrapers/bandcampRoster.js";
import { scrapeBandcampMerch } from "./scrapers/bandcampMerch.js";
import { setRoster, setMerch } from "../lib/bandcampCache.js";
import { logger } from "../lib/logger.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

async function runSyncAllArtistStats() {
  try {
    await syncAllArtistStats();
  } catch (err) {
    logger.error("[cron] syncStats failed:", err.message);
  }
}

async function runSyncDiscography() {
  try {
    await syncDiscography();
  } catch (err) {
    logger.error("[cron] discography sync failed:", err.message);
  }
}

async function runBandcampRosterScrape() {
  try {
    const artists = await scrapeBandcampRoster();
    setRoster(artists);
  } catch (err) {
    logger.error("[cron] bandcamp roster scrape failed:", err.message);
  }
}

async function runBandcampMerchScrape() {
  try {
    const items = await scrapeBandcampMerch();
    setMerch(items);
  } catch (err) {
    logger.error("[cron] bandcamp merch scrape failed:", err.message);
  }
}

async function runSyncShows() {
  try {
    await syncShows();
  } catch (err) {
    logger.error("[cron] shows sync failed:", err.message);
  }
}

// Shows sync matches artist names against the roster cache to attach
// photos (see syncShows.js), so the roster scrape must complete first —
// everything else here is independent and can fire concurrently.
async function runRosterThenShows() {
  await runBandcampRosterScrape();
  await runSyncShows();
}

export function startCronJobs() {
  // Disabled in dev — hits Spotify/Instagram/Bandsintown on every restart and
  // gets rate limited fast. Uncomment before deploying to prod.
  //runSyncAllArtistStats();
  //setInterval(runSyncAllArtistStats, ONE_DAY_MS);

  runSyncDiscography();
  setInterval(runSyncDiscography, ONE_DAY_MS);

  runRosterThenShows();
  setInterval(runRosterThenShows, ONE_DAY_MS);

  runBandcampMerchScrape();
  setInterval(runBandcampMerchScrape, ONE_DAY_MS);

  startNotionCron();
  startInstagramCron();

  logger.info("[cron] jobs registered");
}
