// src/redspear/app/routes/epk.jsx
import EPK from "@shared/pages/EPK";
import { getEpkBySlug } from "#lib/epk.js";
import { normalizeEpk } from "#models/epk.js";
import { formatPageTitle } from "@shared/utils/pageTitle";
import appsConfig from "../../../../config/apps.json";
import fontStylesheet from "@shared/themes/epk/fonts.css?url";

const { metadata, artistSlug } = appsConfig.redspear;

export function links() {
  return [
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    // These URLs match the Latin faces in shared themes/epk/fonts.css so preloads are reused.
    ...[
      "https://fonts.gstatic.com/s/syne/v24/8vIH7w4qzmVxm2BL9G78HEY.woff2",
      "https://fonts.gstatic.com/s/spacemono/v17/i7dPIFZifjKcF5UAWdDRYEF8RXi4EwQ.woff2",
    ].map((href) => ({
      rel: "preload", as: "font", type: "font/woff2", href,
      crossOrigin: "anonymous", fetchPriority: "high",
    })),
    { rel: "stylesheet", href: fontStylesheet },
  ];
}

// Server-only — tree-shaken out of the client bundle, so the EPK fetch
// (and its Strapi token) never ships to the browser.
export async function loader() {
  const data = await getEpkBySlug(artistSlug);
  const entries = data.data ?? [];
  if (!entries.length) throw new Response("EPK not found", { status: 404 });
  return normalizeEpk(entries[0]);
}

export function meta({ data }) {
  const title = data?.artist?.name
    ? formatPageTitle("Artist Press Kit", data.artist.name)
    : formatPageTitle(metadata.pages?.epk?.title, metadata.title);
  const url = metadata.pages?.epk?.url ?? metadata.url;

  return [
    { title },
    { property: "og:title", content: title },
    { property: "og:url", content: url },
    { name: "twitter:title", content: title },
    { name: "twitter:url", content: url },
    { tagName: "link", rel: "canonical", href: url },
  ];
}

export default function EpkRoute({ loaderData }) {
  return <EPK epk={loaderData} loadFontStyles={false} manageFavicon={false} />;
}
