# server/cron/

`index.js` registers scheduled work once per process when enabled by the root
server entry point. See `server/README.md` for `CRON_ENABLED` and deployment
settings. Importing `server/app.js` never schedules jobs.

- `artistStats.js` and `scrapers/` update the generic artist statistics used by
  EPKs across tenants. The existing twice-daily ingestion pipeline invokes the
  sync after label ingestion/backfills; its schedule and order are preserved.
- Label-specific ingestion/backfills live in `server/apps/domeofdoom/cron/`.
- Notion/calendar and Instagram-token jobs live in `server/automation/`.

The twice-daily pipeline prevents overlapping executions within one process.
Run the scheduler in one process only; this is not a distributed job lock.
