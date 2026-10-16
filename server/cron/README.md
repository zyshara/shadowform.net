# server/cron/

The top-level cron orchestrator. Each app/concern owns its own cron jobs
(`server/apps/domeofdoom/cron/`, `server/automation/`) — this folder just
calls each one's starter function once at boot.

## Contents

- `index.js` — `startCronJobs()`, called once from `server.js`.
