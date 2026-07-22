// server/lib/metadata.js
//
// Shared resolver for a SPA's metadata.json — used both at webpack build
// time (for the default/home page tags) and at request time in
// server/routes/spas.js (for per-page overrides like /epk). Top-level
// fields are the defaults; anything under `pages.<name>` overrides them for
// that page, except `title`, which combines with the default title via
// formatPageTitle instead of replacing it outright.

import { readFileSync } from "fs";
import { formatPageTitle } from "../../src/shared/utils/pageTitle.js";

export function loadMetadata(metadataPath) {
  return JSON.parse(readFileSync(metadataPath, "utf8"));
}

export function resolvePageMetadata(metadata, pageKey) {
  const override = pageKey ? metadata.pages?.[pageKey] : null;
  if (!override) return metadata;

  return {
    ...metadata,
    ...override,
    title: override.title ? formatPageTitle(override.title, metadata.title) : metadata.title,
  };
}
