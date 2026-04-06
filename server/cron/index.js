import cron from "node-cron";
import { syncAllArtistStats } from "./syncStats.js";

// Run daily at 3am
cron.schedule("0 3 * * *", async () => {
  try {
    await syncAllArtistStats();
  } catch (err) {
    console.error("[cron] syncStats failed:", err.message);
  }
});

console.log("[cron] jobs registered");
