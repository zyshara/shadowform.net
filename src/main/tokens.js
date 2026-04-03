// src/main/tokens.js
// Shadowform Design 1 — BW + Light Pink
// Import and use these anywhere: import { colors, typography, spacing } from '@/tokens'

export const colors = {
  // Backgrounds — darkest to lightest
  void:    "#0a0a0a",   // sidebar bg
  pitch:   "#0d0d0d",   // ticker, footer bg
  ink:     "#111111",   // main content bg
  // Borders & dividers
  stone:   "#222222",   // borders
  ember:   "#1e1e1e",   // ticker border
  ash:     "#333333",   // ornament / divider lines
  // Text scale
  smoke:   "#444444",   // ticker text, footer label
  dim:     "#555555",   // inactive tags, dim ui
  ghost:   "#888888",   // nav links inactive
  mist:    "#aaaaaa",   // body text
  bone:    "#f0f0f0",   // headings, active nav
  white:   "#ffffff",   // site name, max contrast

  // Pink accent — replaces old plum
  pinkBg:     "#1a0d14",   // lit tag background
  pinkBorder: "#4a1f38",   // lit tag border
  pinkText:   "#f4a7c3",   // lit tag text, active underline tint
  pinkGlow:   "#f4a7c344", // flower drop shadow

  // Semantic aliases
  bg:           "#111111",
  sidebar:      "#0a0a0a",
  sidebarBorder:"#222222",
  bodyText:     "#aaaaaa",
  heading:      "#f0f0f0",
  navInactive:  "#888888",
  navActive:    "#f0f0f0",
  tagLitBg:     "#1a0d14",
  tagLitBorder: "#4a1f38",
  tagLitText:   "#f4a7c3",
  tagDimText:   "#555555",
  tagDimBorder: "#222222",
  ornament:     "#333333",
  footerText:   "#444444",
  footerAccent: "#666666",
};

export const typography = {
  // Font families — matches your tailwind config
  display: "'Alagard', cursive",        // was UnifrakturMaguntia — headings, nav, site name
  ui:      "'Alkhemikal', monospace",   // UI labels, tags, ticker, footer
  body:    "'IM Fell English', serif",  // body prose, quotes

  // Sizes
  siteNameSize:  "15px",
  navSize:       "20px",
  h1Size:        "34px",
  bodySize:      "15px",
  tagSize:       "9px",
  tickerSize:    "10px",
  footerSize:    "10px",
  quoteSize:     "11px",

  // Tracking
  siteNameTracking: "3px",
  navTracking:      "1px",
  h1Tracking:       "2px",
  tagTracking:      "0.18em",
  tickerTracking:   "0.15em",
  footerTracking:   "0.12em",

  // Line heights
  bodyLineHeight: "1.9",
  quoteLineHeight:"1.7",
};

export const spacing = {
  xs:   "2px",
  sm:   "8px",
  md:   "16px",
  lg:   "20px",
  xl:   "24px",
  xxl:  "28px",
  xxxl: "40px",
  // Specific
  contentPaddingX: "56px",
  contentPaddingY: "40px",
  footerPaddingX:  "28px",
  footerPaddingY:  "14px",
  sidebarWidth:    "200px",
  maxContentWidth: "440px",
  ornamentLineW:   "60px",
};

export const animation = {
  tickerDuration: "18s",
  tickerEasing:   "linear",
};

export const borders = {
  sidebar:    `1px solid ${colors.stone}`,
  ticker:     `1px solid ${colors.ember}`,
  footer:     `1px solid #1a1a1a`,
  tagLit:     `1px solid ${colors.pinkBorder}`,
  tagDim:     `1px solid ${colors.stone}`,
  navActive:  `1px solid ${colors.pinkText}44`,
};
