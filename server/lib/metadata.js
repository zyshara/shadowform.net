// server/lib/metadata.js
//
// Resolves one app's metadata (see config/apps.json, read via
// appsConfig.js) down to the tags for one page — used both at webpack
// build time (for the default/home page tags) and at request time (for
// per-page overrides like /epk). Top-level fields are the defaults;
// anything under `pages.<name>` overrides them for that page, except
// `title`, which combines with the default title via formatPageTitle
// instead of replacing it outright.

import { readFileSync } from "fs";
import { formatPageTitle } from "../../src/shared/utils/pageTitle.js";

export function resolvePageMetadata(metadata, pageKey) {
  const override = pageKey ? metadata.pages?.[pageKey] : null;
  if (!override) return metadata;

  return {
    ...metadata,
    ...override,
    title: override.title ? formatPageTitle(override.title, metadata.title) : metadata.title,
  };
}

function escapeHtmlAttr(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function injectPageMeta(html, metadata, pageKey) {
  const resolved = resolvePageMetadata(metadata, pageKey);

  const title       = escapeHtmlAttr(resolved.title);
  const description = escapeHtmlAttr(resolved.description);
  const url         = escapeHtmlAttr(resolved.url);
  const image       = escapeHtmlAttr(resolved.image);

  return html
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${image}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<meta name="twitter:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${image}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
}

// Reads a tenant's dist/index.html off disk and rewrites its meta tags for
// one page (e.g. /epk) before sending — crawlers don't run JS, so per-page
// overrides can't come from the CMS at request time via the client.
export function servePageHtml(distIndexPath, metadata, pageKey, res) {
  const html = readFileSync(distIndexPath, "utf8");
  res.type("html").send(injectPageMeta(html, metadata, pageKey));
}
