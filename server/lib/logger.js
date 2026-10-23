// Scoped logs: timestamp [level] [scope][method] message, followed by objects.
// LOG_LEVEL defaults to debug locally and info in production.
const levels = { debug: 10, info: 20, warn: 30, error: 40, silent: 100 };
const privateKey = /authorization|cookie|password|secret|token|api[_-]?key|drawing|payload|requestbody|responsebody|ip_address/i;

function cleanString(value) {
  return value.replace(/Bearer\s+[^\s,;"']+/gi, "Bearer [REDACTED]")
    .replace(/([?&](?:[^=&]*(?:token|secret|password|api[_-]?key|code)[^=&]*)=)[^&\s]+/gi, "$1[REDACTED]");
}

function redact(value, seen = new WeakSet()) {
  if (typeof value === "string") return cleanString(value);
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return "[Circular]";
  seen.add(value);
  if (value instanceof Error) {
    return redact({ name: value.name, message: value.message, stack: value.stack,
      ...(value.code != null && { code: value.code }),
      ...(value.status != null && { status: value.status }),
    }, seen);
  }
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return "[Binary]";
  if (Array.isArray(value)) return value.map(item => redact(item, seen));
  return Object.fromEntries(Object.entries(value).map(([key, item]) =>
    [key, privateKey.test(key) ? "[REDACTED]" : redact(item, seen)]));
}

function write(level, ...args) {
  const configured = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug");
  if (levels[level] < (levels[configured] ?? levels.info)) return;
  const output = level === "warn" ? console.warn : level === "error" ? console.error : console.log;
  output(new Date().toISOString(), `[${level}]`, ...args.map(arg => redact(arg)));
}

// Retained for callers outside server that already supply their own context.
export const logger = Object.fromEntries(["debug", "info", "warn", "error"].map(level =>
  [level, (...args) => write(level, ...args)]));

export function createLogger(scope) {
  return Object.fromEntries(["debug", "info", "warn", "error"].map(level =>
    [level, (method, ...args) => write(level, `[${scope}][${method}]`, ...args)]));
}
