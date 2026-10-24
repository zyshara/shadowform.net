# Dome of Doom: live performance follow-up

Date: October 23, 2026. Audit only; no application changes.

## Compression is deployed and working

All ten valid sampled page/data URLs returned gzip with `Vary: Accept-Encoding`. Homepage JavaScript and CSS assets also returned gzip. Hashed site assets retain `public, max-age=31536000, immutable`, which is appropriate. WOFF2 and PNG were not recompressed, as expected.

| Response | Previous transfer | Current transfer | Reduction |
| --- | ---: | ---: | ---: |
| Home HTML | 872 KB | 252 KB | 71% |
| Catalog HTML | 940 KB | 275 KB | 71% |
| Roster HTML | 924 KB | 360 KB | 61% |
| Press HTML | 726 KB | 55 KB | 92% |
| Catalog navigation data | 719 KB | 221 KB | 69% |
| Roster navigation data | 42 KB | 14 KB | 66% |
| Press navigation data | 67 KB | 21 KB | 68% |

Rounded decimal KB. Prior baseline is the earlier audit. These are transfer savings, not measured reductions in browser rendering time.

## Current request samples

Two requests per URL, gzip requested, three concurrent workers. Times are network samples from this machine, not click-to-paint or Core Web Vitals. First samples are not guaranteed cold-cache requests.

| URL | Transferred KB | Decoded KB | Total request time |
| --- | ---: | ---: | --- |
| / | 252.4 | 871.6 | 0.68–0.95 s |
| /catalog | 274.9 | 939.7 | 0.67–0.95 s |
| /roster | 359.5 | 924.2 | 0.79–1.03 s |
| /press | 54.9 | 726.0 | 0.52–0.88 s |
| /shows | 5.2 | 22.8 | 0.35–0.36 s |
| /contact | 48.6 | 125.6 | 0.52–0.52 s |
| /about | 5.6 | 25.2 | 0.27–0.35 s |
| /catalog.data | 220.9 | 718.8 | 0.69–0.72 s |
| /roster.data | 14.2 | 41.7 | 0.35–0.43 s |
| /press.data | 21.3 | 66.6 | 0.35–0.44 s |

## Ranked remaining improvements

### 1. Optimize the homepage hero image

The live `/assets/test_bg_3-BPJAcfaH.png` is **1,313,796 bytes** and preloaded. It is the single largest measured homepage asset, around 70% of the 1.87 MB of unique preload/stylesheet resources sampled. Including compressed HTML, that subset is approximately 2.12 MB; this is not the complete browser waterfall.

Generate appropriately sized AVIF/WebP variants with PNG fallback where needed and responsive selection. Compare visual quality and browser LCP before/after. Sampled Home, Catalog, Roster, and Press image elements contain no `srcset`, so responsive delivery is another opportunity. Preserve high priority for the actual hero; avoid preloading below-fold decorative artwork. Do not expect HTTP text compression to shrink PNG materially.

### 2. Send less catalog data, including on Home

Catalog navigation still transfers **221 KB compressed / 719 KB decoded**. Current local Catalog and Home loaders return the full normalized catalog, including descriptions, tracks, and packages. Home chooses two releases and one compilation after delivery. Select that content server-side; return only listing fields to Catalog and full detail fields to detail pages. Compression does not eliminate JSON decoding, memory, or hydration work.

### 3. Replace Roster's repeated inline grid geometry

Live Roster HTML contains **907 paths**, with approximately **783 KB in path `d` attributes alone**, about 85% of its decoded HTML. Its data response is only 14 KB compressed, so data pagination is not the primary Roster fix. Replace static decoration with cacheable external SVGs or a limited set of shared symbols/variants. Roster currently varies geometry per artist, so preserve the appearance with a finite set of reusable variants rather than blindly replacing every grid with one design.

Press contains **2,341 paths** and 726 KB decoded HTML even though gzip reduces transfer to 55 KB. Simplifying repeated decoration reduces DOM/parse work that compression cannot address. The homepage also preloads a **98.8 KB decoded / 40.8 KB compressed WarpedGrid JS module**: externalizing static geometry can reduce JavaScript as well as HTML.

### 4. Add server pagination to Catalog

Existing Catalog/Roster/Press infinite scrolling only limits rendered cards (24/24/30). It does not limit downloaded collection data. Prioritize Catalog at 24 summaries per page with shareable filter/sort/page parameters and accessible Previous/Next or Load more controls.

Apply normalization-aware filtering/sorting before slicing and compute facet counts over the correct global dataset. Preserve override precedence. Change the pathname-only client cache key to include relevant query parameters, and change Catalog's query-only `shouldRevalidate` exemption. Otherwise page 2 can reuse page 1 or never reload. Exclude `_preload` and router-internal parameters from canonical cache keys. Press pagination is lower priority at 21 KB compressed data; Roster pagination should follow its SVG work if still needed.

### 5. Reveal Press text independently of artwork

Current source hides the whole card with opacity zero until its thumbnail loads, then fades it over 500 ms. Live SSR contains those hidden card classes. Keep title, outlet, date, and link visible immediately; put loading skeletons and fades on the thumbnail only. External image URLs pass through the current Cloudinary helper unchanged, so those images are not guaranteed optimized. Establish controlled thumbnails or an approved image delivery path and responsive sizes.

### 6. Improve uncached navigation and feedback

Current local navigation warms data on hover/focus and caches completed route responses. This helps repeat visits, but touch interactions have no hover lead time. There is no in-flight promise entry in the client cache, so a click before prefetch completion can request data again. Coalesce concurrent requests with careful abort/error handling. Use router pending state for visible navigation feedback, including mobile. Consider warming likely routes when the menu opens or during idle time, respecting data-saving preferences and avoiding full-catalog eager downloads.

The home logo uses a plain NavLink and does not use the custom data warmer. Merch leads to external Bandcamp and must be assessed separately. Artist source loads artists before starting shows; starting independent reads together can reduce cold detail latency if service dependencies are considered.

### 7. Improve server cache refresh behavior

The default service cache expires after five minutes and removes expired entries before loading. The next visitor waits for refresh; full Strapi pagination is sequential. Consider bounded stale-while-revalidate for public content, explicit invalidation on content changes, and telemetry for cache hit/miss and upstream durations. Cache normalized collections separately from per-page results. Cold-process/expired-cache costs were not isolated in this audit.

HTML and route data still use `Cache-Control: no-store`. That is not a compression bug. Public route-specific short shared caching could help, but only after deciding freshness and excluding authenticated/personalized responses. Preserve long immutable caching for hashed static assets.

### 8. Profile fonts, paint effects, and mobile rendering

The preloaded Archivo WOFF2 is **187 KB**; subset glyphs or variable axes only if typography requirements allow. Measured homepage modulepreloads total **170 KB compressed**, so prioritize the hero, payload, and repeated geometry before broad bundler changes. Fixed turbulence grain, blend modes, backdrop blur, and marquee animation remain candidates for mobile CPU/GPU profiling. No measured CPU cost is claimed here.

## Verification and limits

Public HTTP headers, body sizes, referenced asset sizes, live HTML markup, and current local source were inspected. A browser screenshot confirmed the homepage renders. No Lighthouse score, mobile throttling, LCP/INP/CLS field data, browser CPU trace, or measured click-to-paint is available. Direct `.data` requests may differ from router requests with internal parameters. Brotli was not independently retested; gzip is confirmed. Existing local uncommitted Shows/Artist work is outside this audit and may differ from deployed pages.

Recommended sequence: hero image → smaller Home/Catalog payloads → reusable SVG decoration → Catalog server pagination → Press visibility → navigation/cache refinements, then compare mobile browser traces and repeat/cold navigation.
