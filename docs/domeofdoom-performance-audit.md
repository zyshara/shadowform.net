# Dome of Doom performance audit

Date: October 23, 2026. Scope: public production responses at https://www.domeofdoom.org and current local source, including existing uncommitted navigation changes. Audit only; no application changes or deployment.

## Measurements

Two GET requests per URL from this machine, requesting gzip. Times include network latency and are samples, not percentiles or browser render timings. Every sampled response returned 200, `Cache-Control: no-store`, and no Content-Encoding.

| URL | Response bytes (decimal KB) | Total request time | Time to response headers |
| --- | ---: | --- | --- |
| / | 872 | 1.03–1.49 s | 0.43–0.95 s |
| /catalog | 940 | 0.96–1.50 s | 0.43–0.95 s |
| /roster | 924 | 1.05–1.49 s | 0.43–0.95 s |
| /press | 726 | 0.80–1.13 s | 0.31–0.53 s |
| /about | 25 | 0.36–0.45 s | 0.27 s |
| /catalog.data | 719 | 0.79–0.87 s | 0.30–0.37 s |
| /roster.data | 42 | 0.52–0.54 s | 0.35–0.37 s |
| /press.data | 67 | 0.51 s | 0.34–0.36 s |

HTML figures exclude subsequent JavaScript, fonts, and images. Data URL samples are direct requests; actual browser requests can differ by router parameters and deployment version.

## Findings, in recommended order

1. **Enable response compression.** Public HTML and route-data samples are uncompressed even when gzip is requested. `server/app.js` has no compression middleware. Locally gzipping the sampled HTML gives approximately 250 KB home, 272 KB catalog, 360 KB roster, and 55 KB press: 61–92% fewer transferred bytes. These are estimates, not deployed savings. Configure streaming-compatible compression at the server or proxy and verify HTML, `.data`, JS, and CSS independently; do not buffer SSR until completion.

2. **Shrink data before sending it to the browser.** `app/routes/catalog.jsx` returns every normalized catalog entry, including descriptions, tracks, and packages required by detail pages but not the listing. `app/routes/home.jsx` also returns the entire catalog; Home selects two releases and one compilation locally. Create small listing projections and select home content on the server. Detail pages already return just the selected release, although they still fetch the full backend collection on a cache miss.

3. **Add real server pagination to Catalog.** Catalog already renders 24 cards initially through `useInfiniteScroll`; Roster uses 24 and Press 30. All collection data still arrives before the destination renders. Numbered buttons alone will not fix that. Return only the requested page of lightweight summaries and its metadata, retaining existing infinite scrolling or adding accessible Previous/Next controls. Press pagination is useful for growth, but its 67 KB data response makes it less urgent than Catalog and SVG work. Roster data is relatively small; optimize its rendering before making pagination a priority.

4. **Remove repeated heavy inline decoration.** Production Press HTML contains 2,340 SVG paths, versus 67 on Catalog. `components/WarpedGrid.jsx` embeds about 103 KB of source path data and is repeated in Press fallback thumbnails. Roster has 907 paths. Use cached external SVG backgrounds for static decorative variants or shared SVG symbols; retain inline geometry only where required for dynamic behavior. This reduces markup, DOM work, and parse/hydration cost. Exact browser CPU impact still needs profiling.

5. **Stop hiding Press text behind image loading.** `pages/Press.jsx` sets opacity to zero on the entire card until its thumbnail resolves, followed by a 500 ms transition. Slow external artwork therefore makes usable text look unloaded. Show text immediately and restrict the skeleton/fade to the image. `cdnImg` leaves external image URLs unchanged, so those images are not necessarily resized or optimized despite the helper call.

6. **Improve cold-cache behavior.** `server/lib/cache.js` has a default five-minute TTL and in-flight request deduplication. Expired values are deleted, so the next visitor blocks on a full refresh. `strapiGetAllPages` fetches batches of 100 sequentially, and every collection read requests all pages. Consider stale-while-revalidate for public content with a bounded stale period, background refresh, and explicit invalidation of the normalized service cache on relevant content updates. Restarted processes still need a cold load. Cold-cache timing and Strapi time were not isolated in this audit.

7. **Finish navigation feedback and prefetch handling.** Existing local `PrefetchedNavLink` warms data on hover/focus; touch users have no hover lead time. The client cache retains completed results but does not deduplicate in-flight loads, so clicking before prefetch completes can invoke another server loader. Coalesce concurrent requests with cancellation handling and add a visible pending state through `useNavigation`. Desktop link color changes provide limited feedback; mobile currently has none. The logo uses a plain NavLink and bypasses the custom data warmer. Merch is an external Bandcamp destination and has a separate loading path.

8. **Reduce secondary asset/render costs after the above.** Home imports a roughly 1.3 MB PNG in the existing local build. Convert/resize it to an appropriate modern format and verify visual quality. The fixed full-screen SVG turbulence overlay, blending, blur, and animations merit mobile profiling. Current source preloads WOFF2; local dist contains old chunks and fonts, so directory size is not a reliable current-route transfer budget. Use a clean build and actual browser waterfall before changing bundling.

## Pagination requirements

- Start with 24 releases per page, preserving format/type/origin/year filters and sort in shareable URLs such as `/catalog?page=2&format=Vinyl&sort=oldest`.
- Apply effective normalized/override-aware filters and sorting before slicing. Filtering only an upstream page would produce wrong results. A first stage can page the cached normalized server collection; a later Strapi query implementation must reproduce normalization semantics.
- Compute cross-filtered facet counts over the full matching dataset on the server, preserving the current rule that each facet excludes its own selection.
- Return summaries, total, page, page size, and facet counts. Reset page when filters/sort change; validate invalid/out-of-range pages and support browser Back/Forward and accessible controls.
- Change `clientCache.js`: pathname-only keys would incorrectly reuse page 1 for every page/filter combination. Key by the relevant canonical query parameters, ignoring `_preload` and internal router parameters.
- Change Catalog `shouldRevalidate`: it currently suppresses query-only loader reloads. Server pagination requires reloading for page/filter/sort changes.
- Test distinct pages, filter/sort reset, stable ordering, correct global facets, empty results, navigation restoration, cache keys, and concurrent prefetch/navigation.

## Validation and limitations

13 existing tests passed across client cache, prefetched navigation, route loaders, and backend data using installed Node 24.9.0. The default shell Node could not start the current toolchain; the package requires Node >=22.22.0. Tests establish current behavior, not performance targets.

No browser performance trace, Lighthouse run, Core Web Vitals field data, mobile CPU profile, or backend telemetry was collected. Do not treat request times as click-to-paint or LCP. Local source includes uncommitted work and is not assumed identical to production. The next validation should compare compressed bytes, first/repeat/touch navigation, cold/warm backend loads, and mobile paint times after changes.
