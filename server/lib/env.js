// server/lib/env.js
//
// Persists a runtime-refreshed value back to the .env file (and the current
// process) so it survives restarts without a human re-pasting it.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ENV_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../.env");

export function updateEnvVar(key, value) {
  const contents = readFileSync(ENV_PATH, "utf8");
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");

  const updated = pattern.test(contents)
    ? contents.replace(pattern, line)
    : `${contents.trimEnd()}\n${line}\n`;

  writeFileSync(ENV_PATH, updated);
  process.env[key] = value;
}
