#!/usr/bin/env python3
"""
process.py — build index.html from a browser "Save Page As" zip from Wayback Machine.
Source: ~/Downloads/wowzers/
Dest:   public/preserved/wotlk/
"""

import os, re, shutil
from pathlib import Path

SRC_DIR   = Path.home() / "Downloads" / "wowzers"
SRC_HTML  = SRC_DIR / "World of Warcraft®_ Wrath of the Lich King® Classic™.html"
SRC_FILES = SRC_DIR / "World of Warcraft®_ Wrath of the Lich King® Classic™_files"

DEST_DIR    = Path(__file__).parent
ASSETS_DIR  = DEST_DIR / "assets"
DEST_HTML   = DEST_DIR / "index.html"

# Old path prefix used in saved HTML for local assets
OLD_PREFIX  = "./World of Warcraft®_ Wrath of the Lich King® Classic™_files/"

# Wayback chrome scripts/styles to drop entirely (matched by partial filename)
WAYBACK_DROPS = [
    "analytics.js",
    "www-widgetapi.js",
    "gtm.js",
    "bundle-playback.js",
    "wombat.js",
    "ruffle.js",
    "banner-styles.css",
    "iconochive.css",
    "www-player.css",
    "onetrust-banner",
    "iframe_api",
]

# ── Copy assets ───────────────────────────────────────────────────────────────

ASSETS_DIR.mkdir(exist_ok=True)

asset_map = {}  # old filename → new filename

for f in SRC_FILES.iterdir():
    old_name = f.name
    # strip .download extension
    new_name = re.sub(r"\.download$", "", old_name)
    shutil.copy2(f, ASSETS_DIR / new_name)
    asset_map[old_name] = new_name

print(f"Copied {len(asset_map)} assets to {ASSETS_DIR}")

# ── Read HTML ─────────────────────────────────────────────────────────────────

html = SRC_HTML.read_text(encoding="utf-8", errors="replace")

# ── Rewrite local asset paths ─────────────────────────────────────────────────

for old_name, new_name in asset_map.items():
    # replace both the old full path (with .download) and without
    html = html.replace(OLD_PREFIX + old_name, "./assets/" + new_name)

# Also catch any remaining OLD_PREFIX references (e.g. already no .download)
html = html.replace(OLD_PREFIX, "./assets/")

# ── Strip Wayback Machine chrome ──────────────────────────────────────────────

# Remove <script> tags for Wayback files
for drop in WAYBACK_DROPS:
    # <script ... src="...drop..."></script>  (self-closing or paired)
    html = re.sub(
        r'<script[^>]+src="[^"]*' + re.escape(drop) + r'[^"]*"[^>]*>.*?</script>',
        "", html, flags=re.DOTALL
    )
    html = re.sub(
        r'<script[^>]+src="[^"]*' + re.escape(drop) + r'[^"]*"[^>]*/?>',
        "", html
    )
    # <link ... href="...drop...">
    html = re.sub(
        r'<link[^>]+href="[^"]*' + re.escape(drop) + r'[^"]*"[^>]*/?>',
        "", html
    )

# Remove inline __wm.init / wombat init script block
html = re.sub(
    r'<script[^>]*>\s*__wm\.init\(.*?</script>',
    "", html, flags=re.DOTALL
)

# Remove window.RufflePlayer config block
html = re.sub(
    r'<script[^>]*>\s*window\.RufflePlayer\s*=.*?</script>',
    "", html, flags=re.DOTALL
)

# Remove Wayback toolbar div (id="wm-ipp-base" or class="wb-*")
html = re.sub(
    r'<div[^>]+id=["\']wm-ipp[^"\']*["\'][^>]*>.*?</div>',
    "", html, flags=re.DOTALL
)

# Remove <!-- saved from url --> comment
html = re.sub(r'<!-- saved from url.*?-->', "", html)

# Remove the GTM noscript iframe (google tag manager)
html = re.sub(
    r'<noscript[^>]*>.*?googletagmanager.*?</noscript>',
    "", html, flags=re.DOTALL
)

# ── Write output ──────────────────────────────────────────────────────────────

DEST_HTML.write_text(html, encoding="utf-8")
print(f"Wrote {DEST_HTML}")
print("Done. Set previewSrc to '/preserved/wotlk/index.html' in MOCK_PROJECTS.")
