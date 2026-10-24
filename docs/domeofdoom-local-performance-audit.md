# Dome of Doom: local and live follow-up audit

October 23, 2026. Read-only application audit. Tested the existing local development server on port 3000 with Host `domeofdoom.localhost` and public production at https://www.domeofdoom.org/. No application changes, restart, cache invalidation, or deployment.

## Subsequent implementation

Implemented the approved data, prefetch, Press visibility, and image improvements locally after this audit:

- Catalog route now returns summaries; measured local gzip response is **14,751 bytes**, down from **221,093**. Existing browser filters, facets, sorting, and infinite scrolling retain the full summary inventory.
- Home now receives server-selected releases/compilation with only its display/link fields. Local dev HTML measured **28,564 bytes gzipped**, down from **252,002**. These are same-server HTML transfer samples, not click timing guarantees.
- Shows participates in data warming on hover/focus and mobile-menu open; covered by the menu integration test.
- Press text and article links are visible while only thumbnails show placeholders; tested before image load and after image failure.
- Hero retains its original dimensions/alpha with AVIF (**216,099 bytes**) and WebP (**191,242 bytes**) plus original PNG fallback (**1,313,796 bytes**). Local SSR does not preload the fallback PNG. Generated assets can be reproduced with `scripts/optimize-dod-hero.py` using Pillow with AVIF/WebP support.
- Cloudinary card/detail images now expose width candidates through srcset/sizes. Confirmed representative 200/400/800 variants return HTTP 200, WebP, and the requested dimensions. External hosts retain their existing URLs; no unconfigured image proxy was introduced.
- 49 Dome of Doom tests passed; scoped client/server production build succeeded. Homepage and Press layouts were visually checked locally. Not yet deployed as part of this implementation.

SVG ideas for a future change: define identical shapes once with symbol/use; move seeded grid variants into cacheable SVG assets (optionally a small curated set, with visual review); move static world-map coastlines into a cached background while retaining dynamic markers and arcs. Exact per-artist variations need either separate cached variants or a deliberate agreement to use a smaller set. Shared definitions reduce markup/DOM duplication but do not guarantee reduced paint cost. No SVG changes were included.

## Most useful next change: lightweight collection responses

Decoded the local Catalog route response using React Router's decoder, then projected its 176 records to the fields consumed by the listing. Re-encoded using the installed React Router encoder and gzip. The unmodified control exactly reproduced the sampled Catalog response's decoded and compressed sizes.

| Experiment | Decoded route bytes | Gzipped bytes |
| --- | ---: | ---: |
| Existing full Catalog | 719,140 | 221,093 |
| All 176 listing summaries | 45,758 | 14,751 |
| First 24 summaries only | 6,077 | 2,369 |
| Home: selected two releases plus latest compilation, full selected records | 7,973 | 3,218 |

Listing fields: uid, title, artwork_url, type, label_role, catalog_number, artists, formats, release_date. Descriptions, tracks, packages, and platform URLs remain available to detail pages. Confirm field requirements if the listing design changes.

**Recommendation:** start with the summary projection, preserving existing local filters, facet counts, sort, and infinite scrolling. It removes 93% of compressed Catalog data without the complexity of server pagination. Home can use a separate selected-content response rather than sending the same complete catalog. Full detail routes should continue receiving full selected records.

The page-of-24 experiment excludes pagination metadata/facet counts and is a lower bound, not a complete implementation. Its ordering was not intended to model the UI's final sorted page. Server pagination remains an option for catalog growth, but is no longer the obvious first task at this collection size.

Plain JSON field accounting found approximately 362 KB of tracks, 199 KB of descriptions, and 123 KB of packages across the collection. Those are decoded field sizes, not additive compressed contributions.

A local encoding/compression microbenchmark (5 warmups, 20 measured iterations) produced a median 23.03 ms for the full route result versus 1.38 ms for summaries. This is isolated Node encode+gzip CPU time, not end-to-end request time, browser render time, or a guaranteed deployed speedup. Server compression is streamed; this benchmark consumes the stream then uses synchronous gzip to compare CPU work consistently.

## Local timing evidence

Two sequential requests per route, gzip requested, already-running development server. The first request includes unknown cache/compilation state.

| Route | First request | Second request | Gzipped bytes | Decoded bytes |
| --- | ---: | ---: | ---: | ---: |
| Home HTML | 3.235 s | 0.071 s | 252,002 | 869,757 |
| Catalog HTML | 0.079 s | 0.051 s | 274,498 | 937,512 |
| Roster HTML | 0.599 s | 0.073 s | 359,742 | 924,961 |
| Press HTML | 1.297 s | 0.059 s | 54,351 | 723,520 |
| Shows HTML | 0.051 s | 0.038 s | 128,461 | 431,499 |
| Catalog data | 0.027 s | 0.026 s | 221,093 | 719,140 |
| Roster data | 0.003 s | 0.002 s | 14,180 | 42,009 |
| Press data | 0.003 s | 0.003 s | 21,316 | 66,645 |
| Shows data | 0.001 s | 0.001 s | 3,779 | 11,224 |

Current single production data samples: Catalog 1.055 s, Roster 0.597 s, Press 0.666 s, Shows 0.386 s. Their decoded payload sizes match local data. Shows production HTML was 129,213 bytes gzipped / 434,564 decoded, taking 0.663 s.

These measurements support reducing network dependencies and transfer volume. They do not isolate DNS/TLS, hosting latency, backend cold loads, SSR CPU, or mobile paint. Do not subtract dev timings from production timings to assign a precise network cost. First-request local delays may include Vite compilation and upstream cache misses; no claim attributes them exclusively to either.

## Other high-value findings

### Shows is missing from data prefetch

`app/routes/shows.jsx` now has a service loader and cached client loader, but `components/PrefetchedNavLink.jsx` still lists only Home, Catalog, Roster, and Press in DATA_ROUTES. Shows therefore receives framework module prefetch but not the custom data warmer on hover/focus or mobile-menu open. Add `/shows` and test it alongside the other data destinations. Its compressed payload is only 3.8 KB, making it inexpensive to warm.

### Keep decoration out of repeated page DOM

| Local page | Element start tags | SVG paths | Bytes of path coordinates |
| --- | ---: | ---: | ---: |
| Home | 352 | 51 | 40,406 |
| Catalog | 433 | 67 | 91,695 |
| Roster | 1,482 | 907 | 782,948 |
| Press | 3,352 | 2,341 | 139,549 |
| Shows | 1,598 | 646 | 322,908 |

Coordinate bytes are a subset of markup, not complete SVG size. Roster is dominated by repeated per-card WarpedGrid geometry; Shows now has substantial map/artwork decoration. `ArtworkOverlay` also reuses the expensive grid on event media. Use a small set of cached SVG variants or shared symbols for repeated static decoration, and simplify/externalize map coastlines while retaining any dynamic points/labels separately. Preserve visual variants and compare screenshots. Avoid blanket rasterization if vector assets preserve quality and reduce cost.

### Press still hides useful content while images load

`PressCard` hides the entire link/card until its thumbnail resolves, then fades it over 500 ms. Display titles, outlet, dates, and links immediately; put the skeleton/fade only on the image. This is a perceived-completion fix as well as an accessibility improvement. The current 21 KB compressed route response is not the strongest reason to paginate Press first.

### Responsive images and homepage hero

The homepage hero remains a 1,313,796-byte PNG in local source. Generate visually checked WebP/AVIF sizes and responsive selection. None of the sampled Home/Catalog/Roster/Press/Shows image elements uses srcset. Cloudinary images have fixed widths and external URLs are passed through unchanged by the current helper. Define card/detail/hero size variants; don't eagerly load every image or preload below-fold cards. The hero optimization primarily improves initial/home loading, whereas Catalog payload work targets nav clicks directly.

### Cache and detail-route refinements

- The five-minute server cache drops expired values; its next reader blocks on a refresh. Consider bounded stale-while-revalidate and explicit update invalidation, with cache-miss/upstream duration telemetry first.
- Client cache values last until tab close or eviction. Shows includes a cached `now` timestamp; a long-open tab can retain old upcoming/past classification and new CMS content remains unseen. Add a deliberate freshness/revalidation policy rather than disabling caching across the board.
- Artist detail waits for artists before starting shows. Start independent service work together where appropriate; verify whether upstream show loading already depends on artists before estimating benefit.
- New show detail queries use a filtered endpoint through the shared transport cache; they do not use the normalized collection wrapper. They are not entirely uncached. Profile them before adding another cache layer.
- The logo's Home link bypasses the custom data warmer. Consider using the same prefetch component once Home's payload is small.

## Recommended implementation order

1. Add Catalog summary data and server-selected Home content; verify complete filter/sort/facet/slug behavior against the current dataset.
2. Add Shows to nav data warming and test immediate-click reuse.
3. Reveal Press text independently of thumbnails.
4. Replace repeated Roster/event geometry and externalize/simplify Shows map decoration.
5. Optimize responsive images/hero; introduce deliberate cache freshness.
6. Add server pagination when collection growth, mobile profiles, or remaining costs justify its extra filter/cache complexity.

## Measurement limitations and next instrumentation

This audit adds local HTTP measurements, real dataset projections in the router wire format, a serialization microbenchmark, and DOM/source inspection. It does not add a browser performance trace or precise click-to-paint timings. Previous browser automation timings include input/snapshot overhead and should remain approximate.

For subsequent changes, record input → loader start/end → route commit → first post-commit frame, with request IDs/route names and cache hit/miss status. Capture both production-like local builds and the deployed site; normal Vite development asset traffic is not a production bundle benchmark. Compare first visit, cached revisit, immediate click during hover, and mobile menu warmup. Preserve the existing prefetch cancellation/error tests. No application changes were made in this audit.
