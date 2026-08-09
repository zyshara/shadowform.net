// src/domeofdoom/tokens.js
// From the "Dome of Doom Redesign1" design export — the palette isn't
// reproducible with plain Tailwind classes (oklch colors), so components
// reference these directly via inline style where the exact value matters.
//
// These are var() references, not raw values — the actual colors live as
// :root custom properties in index.css. That's what makes them live-
// tweakable in devtools: every component below reads `colors.accent` into
// an inline style or template literal, so at paint time the browser
// resolves whatever --dod-accent currently is, not whatever it was when
// this module first ran.

export const colors = {
  bg:        "var(--dod-bg)",
  text:      "var(--dod-text)",
  accent:    "var(--dod-accent)",
  accent2:   "var(--dod-accent2)",
  secondary: "var(--dod-secondary)",
  card:      "var(--dod-card)",
};

export const LOGO_URL = "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785389998/DOD_LOGO_transparent_2f6232f4c2.png";

export const FLOWER_FILIGREE = "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1786232107/flower_decor_60_60_bc512335c1.png";
export const FLOWER_FILIGREE_PURPLE = "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1786232107/flower_decor_purple_60_60_df8c81e922.png";
