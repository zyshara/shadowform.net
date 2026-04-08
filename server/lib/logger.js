// server/lib/logger.js
//
// Thin logger wrapper with level-based filtering.
//   debug  — dev only (cache hits, full URLs, intermediate values)
//   info   — normal operational events (startup, sync complete, counts)
//   warn   — recoverable issues (missing data, skipped artists)
//   error  — failures that need attention

const isDev = process.env.NODE_ENV !== "production";
const ts    = () => new Date().toISOString();

export const logger = {
  debug: (...args) => { if (isDev) console.log( ts(), "[debug]", ...args); },
  info:  (...args) =>               console.log( ts(), "[info] ", ...args),
  warn:  (...args) =>               console.warn(ts(), "[warn] ", ...args),
  error: (...args) =>               console.error(ts(), "[error]", ...args),
};
