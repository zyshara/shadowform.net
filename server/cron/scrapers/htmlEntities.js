// server/cron/scrapers/htmlEntities.js
//
// &amp; must decode last — decoding it first would turn a literal "&amp;lt;"
// (i.e. the text "&lt;") into "&lt;" and then wrongly into "<".
export function decodeHtmlEntities(str) {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code))
    .replace(/&amp;/g, "&");
}
