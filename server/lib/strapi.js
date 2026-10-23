import { createLogger } from "./logger.js";
import { createAsyncCache } from "./cache.js";

const STRAPI_URL = process.env.STRAPI_API_URL || "https://strapi-shadowform-52c53315c615.herokuapp.com";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";
const cache = createAsyncCache();
const log = createLogger("strapi");

function requestUrl(path, params = {}) {
  const query = new URLSearchParams(params).toString();
  return `${STRAPI_URL}${path}${query ? `?${query}` : ""}`;
}

// One transport for JSON reads/writes and multipart uploads. The timeout also
// covers response-body consumption. Do not retry writes automatically.
async function request(url, { method = "GET", payload, formData } = {}) {
  const parsed = new URL(url);
  const endpoint = `${parsed.origin}${parsed.pathname}`;
  const query = Object.fromEntries([...new Set(parsed.searchParams.keys())].map(key => {
    const values = parsed.searchParams.getAll(key);
    return [key, values.length === 1 ? values[0] : values];
  }));
  const started = performance.now();
  log.info(method, endpoint, { event: "request", query });
  try {
    const res = await fetch(url, {
      method,
      signal: AbortSignal.timeout(30000),
      headers: {
        ...(!formData && { "Content-Type": "application/json" }),
        ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
      },
      ...(formData ? { body: formData } : payload !== undefined ? { body: JSON.stringify(payload) } : {}),
    });
    if (!res.ok) {
      const error = new Error(`Strapi ${res.status}: ${res.statusText}`);
      error.status = res.status;
      error.body = await res.text();
      throw error;
    }
    const data = res.status === 204 ? null : await res.json();
    log.info(method, endpoint, { event: "response", status: res.status,
      durationMs: Math.round(performance.now() - started) });
    return data;
  } catch (error) {
    log.error(method, endpoint, { event: "failed", durationMs: Math.round(performance.now() - started), error });
    throw error;
  }
}

export function strapiGet(path, params = {}, { ttl, noCache = false } = {}) {
  const url = requestUrl(path, params);
  const load = () => request(url);
  // Bypass both cache reads and writes, as used by ingestion/pagination.
  return noCache ? load() : cache.get(url, load, { ttl });
}

export async function strapiGetAllPages(path, params = {}) {
  const all = [];
  let page = 1;
  while (true) {
    const res = await strapiGet(path, {
      ...params, "pagination[page]": page, "pagination[pageSize]": 100,
    }, { noCache: true });
    all.push(...res.data);
    if (page >= res.meta.pagination.pageCount) break;
    page++;
  }
  return all;
}

export function strapiPost(path, payload) {
  return request(requestUrl(path), { method: "POST", payload });
}

export function strapiPut(path, payload) {
  return request(requestUrl(path), { method: "PUT", payload });
}

export async function strapiUploadMedia(buffer, filename, mimeType = "image/png") {
  const formData = new FormData();
  formData.append("files", new Blob([buffer], { type: mimeType }), filename);
  const uploaded = await request(requestUrl("/api/upload"), { method: "POST", formData });
  return uploaded?.[0] ?? null;
}

export function resolveMediaUrl(media) {
  const url = media?.url;
  if (!url) return null;
  return /^https?:\/\//.test(url) ? url : `${STRAPI_URL}${url}`;
}

// Without params, invalidate every populated/filtered variant of this endpoint
// and its detail URLs. With params, invalidate just the exact query.
export function invalidateCache(path, params) {
  cache.invalidate(url => {
    if (!path) return true;
    if (params !== undefined) return url === requestUrl(path, params);
    const pathname = new URL(url).pathname;
    return pathname === path || pathname.startsWith(`${path}/`);
  });
}
