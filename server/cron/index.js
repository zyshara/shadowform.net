import { syncAllArtistStats } from "./syncStats.js";
import { startNotionCron } from "./notion.js";
import { startInstagramCron } from "./instagram.js";
import { scrapeBandcampDiscography } from "./scrapers/bandcamp.js";
import { scrapeBandcampRoster } from "./scrapers/bandcampRoster.js";
import { scrapeBandcampMerch } from "./scrapers/bandcampMerch.js";
import { setDiscography, setRoster, setMerch } from "../lib/bandcampCache.js";
import { logger } from "../lib/logger.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

async function runSyncAllArtistStats() {
  try {
    await syncAllArtistStats();
  } catch (err) {
    logger.error("[cron] syncStats failed:", err.message);
  }
}

async function runBandcampDiscographyScrape() {
  try {
    const releases = await scrapeBandcampDiscography();
    setDiscography(releases);
  } catch (err) {
    logger.error("[cron] bandcamp discography scrape failed:", err.message);
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

export function startCronJobs() {
  // Disabled in dev — hits Spotify/Instagram/Bandsintown on every restart and
  // gets rate limited fast. Uncomment before deploying to prod.
  //runSyncAllArtistStats();
  //setInterval(runSyncAllArtistStats, ONE_DAY_MS);

  runBandcampDiscographyScrape();
  setInterval(runBandcampDiscographyScrape, ONE_DAY_MS);

  runBandcampRosterScrape();
  setInterval(runBandcampRosterScrape, ONE_DAY_MS);

  runBandcampMerchScrape();
  setInterval(runBandcampMerchScrape, ONE_DAY_MS);

  startNotionCron();
  startInstagramCron();

  logger.info("[cron] jobs registered");
}
