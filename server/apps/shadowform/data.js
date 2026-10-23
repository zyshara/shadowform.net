import { strapiGet } from "#lib/strapi.js";
import { normalizeGuestbook } from "./models/guestbook.js";
export { getEngineering, getEngineeringArchive, getArchiveProject } from "./engineering.js";

export async function getGuestbookData() {
  const response = await strapiGet("/api/guestbook", {
    "populate[allowed_guestbook_tags]": "*",
    "populate[guestbook_entries][populate]": "*",
  });
  const raw = response.data ?? {};
  return {
    entries: normalizeGuestbook(raw).guestbook_entries,
    tags: (raw.allowed_guestbook_tags ?? []).map(({ id, label, theme }) => ({ id, label, theme })),
  };
}

