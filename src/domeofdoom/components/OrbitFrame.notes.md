# OrbitFrame — open items / notes

Working notes on `OrbitFrame.jsx` (used by `Roster.jsx`) so we can pick this
back up later without re-deriving context. Not user-facing docs — delete
once the open item below is resolved.

## Current state (as of this writing)

- Star motion + z-index are both computed in one JS `rAF` loop
  (`performance.now()`-based clock, `project(t)` math), no SMIL. Solid —
  don't reintroduce `<animateMotion>` for this.
- Each card's clock start is back-dated by a random offset so different
  cards don't all share the same phase on page load.
- The hover-reveal (`opacity-0 group-hover:opacity-100`, `mt-[-100px]/mt-
  [100px] group-hover:mt-0`, `transition-all duration-500`) is applied to
  each ring/star **SVG individually**, not to `.orbit-frame`'s root div.
  This is load-bearing: `opacity < 1` creates a CSS stacking context, so
  putting it on the root trapped every child's z-index into one unit for
  the whole ~500ms transition, making everything render "front" during
  hover-in/out and only snapping to correct once opacity settled at
  exactly `1`. See the `IMPORTANT` comment in `index.css` above
  `.orbit-frame` for the full writeup — don't move these classes back to
  the root.
- Front-ring visibility still uses the original hand-tuned
  `FRONT_CLIP_POINTS` triangle clip-path (`[[0,0],[0,100],[100,0]]`), and
  the star's z-index test reuses that exact same polygon
  (`effectiveFrontWedge`) so the two always agree with each other.

## Open item: front wedge edge imprecision (minor, cosmetic)

The hand-tuned triangle is an approximation — it doesn't exactly match
where the tilted ellipse actually crosses the card's box, so there's a
small visible seam/mismatch right at the edge of the front wedge. Low
severity, but noticeable close-up.

**Two fixes were tried and reverted - don't just redo either as-is:**

1. **Exact SVG mask** (mirror the back ring's precise punch-out mask
   technique, inverted, instead of a clip-path triangle). This should be
   geometrically correct by construction, but broke the visual result
   ("messed up the SVG clipping") - never diagnosed *why* it looked
   wrong, just reverted. Worth retrying with actual visual inspection at
   each step (screenshot after the change) instead of reasoning from math
   alone, since the math was sound but the rendered result wasn't.
2. **Geometrically-computed wedge** (derive a short "front" window from
   wherever the ellipse's path actually dips into the card's box, sized
   by a `frontDuration` prop, rendered as a buffered ribbon polygon
   around that arc). This successfully fixed a *different*, bigger bug
   (star reading "front" for ~27% of the loop instead of a brief accent)
   at the math level, but the actual rendered clip-path came out as a
   degenerate sliver (first attempt used convex-hull + centroid-scale for
   padding, which doesn't add real width to an already-thin/straight arc;
   a perpendicular-offset ribbon was tried as the fix but never got
   visually verified before being reverted). This approach is still
   probably the *right* long-term direction (it also would fix the wedge
   ever being oversized) - it just needs the ribbon math verified against
   an actual screenshot before landing it, not just node-script math.

**Suggested next approach:** pick one of the two directions above, apply
it, and get a screenshot (or ask for one) *before* moving on to the next
step, rather than reasoning purely from computed geometry. Both prior
attempts were mathematically defensible but visually wrong in ways that
weren't caught until the user looked at them.

## Tooling gotcha (unrelated to the code, but wasted real time)

The in-app Browser pane used for automated testing throttles
`requestAnimationFrame` and the SMIL timeline hard on tabs that aren't
genuinely focused (`document.hidden` reads `true` even after
`tabs_select`), and stale bundles get cached per-tab after a rebuild
(symptom: `ReferenceError` for identifiers that were already removed from
source - fix is opening a brand new tab, not reloading the old one).
Live animation/timing behavior in OrbitFrame is basically only reliably
verifiable in a real, user-driven browser tab, or via a console script the
user runs themselves and pastes back the output.
