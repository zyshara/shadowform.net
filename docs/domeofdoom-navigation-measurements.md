# Live navigation observations

October 23, 2026, https://www.domeofdoom.org/, desktop in-app browser.

## Method and interpretation

Clicked the site's top navigation links. Timed from immediately before the automation click until the destination appeared in the accessibility tree, polling the browser state. No intentional hover wait was added. This measures **click-to-observed-route**, including automation/input/snapshot overhead. It is not a browser performance trace, exact paint timing, image completion timing, or network/render breakdown. A fresh tab resets route-module memory but does not guarantee an empty browser HTTP cache or cold server cache.

## Observations

| Destination | Initial route observation | Later individually checked observation |
| --- | ---: | ---: |
| Catalog | 377 ms in second fresh tab | 699 ms |
| Roster | 578 ms | 485 ms |
| Press | 753 ms | 530 ms |
| Shows | 332 ms | 399 ms |
| Contact | 388 ms | 263 ms |

Later Catalog/Roster/Press checks were followed immediately by screenshots confirming the destination. These are individual samples, not statistical medians. The original Catalog attempt did not complete within its first 276 ms observation; a later check confirmed arrival, but the intervening tool gap makes that attempt unsuitable for a duration claim.

A rapid repeated-navigation series returned approximately 238–484 ms per observed route. Subsequent state/screenshot verification was inconsistent, so that series is excluded from the comparison above. One automated attempt failed to confirm the destination within 15 seconds; a subsequent direct click worked. This cannot be attributed confidently to the website rather than the automation and is not reported as a website latency sample.

## What the screenshots establish

- The destination can be present while the nav underline still sits under the previous link, consistent with the source's 300 ms indicator transition. The underline is not a reliable loading-completion signal.
- The later Catalog capture showed release labels while artwork was still absent; the Press capture showed empty card frames below its header. Route arrival is not equivalent to completed imagery.
- Roster's individually checked capture already showed its first artist cards.

## Conclusions

There is a noticeable several-hundred-millisecond interval in these observed transitions, and imagery can continue afterward. These measurements do **not** establish how much is server wait, JavaScript work, SVG rendering, image loading, or automation overhead. They also do not establish that repeat navigation consistently bypasses network requests.

The previous separate HTTP audit found substantial uncached data transfer cost, especially Catalog, but those timings cannot be subtracted from these browser observations because requests, connection state, and caches differ.

For an exact breakdown, capture browser network and performance traces or add temporary browser-side marks for input, route commit, and the first post-commit frame. Compare first/repeated clicks, hover versus immediate click, and touch/mobile. Match loader requests to clicks to verify prefetch reuse/deduplication. Until then, keep the recommendation focused on smaller Catalog payloads, visible pending feedback, and rendering text independently of images; do not claim a proven dominant bottleneck.

No application behavior changed during this measurement.
