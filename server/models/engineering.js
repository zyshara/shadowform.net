// server/models/engineering.js

import { normalizeHeader, richTextToHtml } from "./header.js";

export function normalizeEngineeringPage(entry) {
  const e = entry?.attributes ?? entry;
  const raw = e?.header;
  if (!raw) return { header: null };

  return {
    header: {
      ...normalizeHeader(raw),
      // Override description with paragraph-preserving HTML
      description: Array.isArray(raw.description)
        ? richTextToHtml(raw.description)
        : (raw.description ?? ""),
    },
  };
}
