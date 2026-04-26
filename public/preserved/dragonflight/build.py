#!/usr/bin/env python3
"""
Dragonflight local mirror builder.
Downloads all assets, strips Wayback/GTM/cookie-consent, mocks the nav.
"""

import re
import os
import time
import hashlib
import urllib.request
import urllib.error
from pathlib import Path
from urllib.parse import urlparse, urljoin

BASE = Path(__file__).parent
ASSETS = BASE / "assets"
CSS_DIR = ASSETS / "css"
JS_DIR = ASSETS / "js"
IMG_DIR = ASSETS / "images"
FONT_DIR = ASSETS / "fonts"

for d in [CSS_DIR, JS_DIR, IMG_DIR, FONT_DIR]:
    d.mkdir(parents=True, exist_ok=True)

WAYBACK_TIMESTAMP = "20220803011216"
WAYBACK_BASE = f"https://web.archive.org/web/{WAYBACK_TIMESTAMP}"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/104.0.0.0 Safari/537.36",
    "Accept": "*/*",
}

# ── URL helpers ────────────────────────────────────────────────────────────────

def clean_url(url):
    """Remove HTML entities."""
    return url.replace("&amp;", "&")

def unwrap_wayback(url):
    """Strip any Wayback Machine prefix(es) to get the original URL."""
    url = clean_url(url)
    while True:
        m = re.match(r'https?://web\.archive\.org/web/\d+[a-z_]*/(.+)', url)
        if m:
            url = m.group(1)
            # Sometimes the inner URL isn't fully qualified
            if not url.startswith("http"):
                break
        else:
            break
    return url

def wayback_url_for(orig, hint="im_"):
    """Build a single-wrapped Wayback URL."""
    return f"{WAYBACK_BASE}{hint}/{orig}"

# ── Fetch with retries ─────────────────────────────────────────────────────────

def fetch(url, retries=3, delay=2.0):
    """Download URL bytes with retries. Returns None on failure."""
    url = clean_url(url)
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read()
        except Exception as e:
            if attempt < retries - 1:
                print(f"  retry {attempt+1} ({url[:80]}): {e}")
                time.sleep(delay * (attempt + 1))
            else:
                print(f"  FAILED ({url[:80]}): {e}")
                return None

def fetch_with_fallbacks(orig_url, wayback_hint="im_"):
    """
    Try fetching in order:
    1. Direct CDN URL (often still live)
    2. Wayback URL with the main timestamp
    Falls back gracefully.
    """
    orig = unwrap_wayback(orig_url)
    # 1) Try direct CDN
    data = fetch(orig, retries=2, delay=1.0)
    if data:
        return data
    # 2) Try Wayback
    wb = wayback_url_for(orig, wayback_hint)
    data = fetch(wb, retries=2, delay=2.0)
    return data

# ── Local path helpers ─────────────────────────────────────────────────────────

def url_to_local(url):
    """Return (Path, rel_str) for a URL."""
    orig = unwrap_wayback(url)
    parsed = urlparse(orig)
    basename = os.path.basename(parsed.path) or "asset"
    basename = basename.split("?")[0]
    basename = re.sub(r"[^\w.\-@]", "_", basename)
    h = hashlib.md5(orig.encode()).hexdigest()[:8]
    name = f"{h}_{basename}"
    ext = Path(basename).suffix.lower()
    if ext in (".woff", ".woff2", ".ttf", ".eot", ".otf"):
        return FONT_DIR / name, f"assets/fonts/{name}"
    elif ext == ".css":
        return CSS_DIR / name, f"assets/css/{name}"
    elif ext == ".js":
        return JS_DIR / name, f"assets/js/{name}"
    else:
        return IMG_DIR / name, f"assets/images/{name}"

# ── CSS processing ─────────────────────────────────────────────────────────────

def process_css(css_text):
    """
    Rewrite url() references inside CSS to local paths.
    Handles already-wayback-wrapped URLs correctly.
    """
    # Strip Wayback comment appended at bottom of served CSS
    css_text = re.sub(
        r'/\*\s*FILE ARCHIVED ON.*?INTERNET ARCHIVE.*?\*/',
        '', css_text, flags=re.DOTALL
    )
    css_text = re.sub(
        r'/\*\s*playback timings.*?\*/',
        '', css_text, flags=re.DOTALL
    )

    def replace_url(m):
        inner = m.group(1).strip("'\"")
        if inner.startswith("data:") or inner.startswith("#") or not inner.strip():
            return m.group(0)

        orig = unwrap_wayback(inner)
        local_path, rel_path = url_to_local(orig)

        if not local_path.exists():
            # Decide hint: fonts/images vs CSS
            ext = Path(urlparse(orig).path).suffix.lower()
            hint = "cs_" if ext == ".css" else "im_"
            data = fetch_with_fallbacks(orig, wayback_hint=hint)
            if data:
                # Recursively process CSS imports
                if ext == ".css":
                    sub_css = data.decode("utf-8", errors="replace")
                    sub_css = process_css(sub_css)
                    local_path.write_bytes(sub_css.encode("utf-8"))
                else:
                    local_path.write_bytes(data)
                print(f"  css-dep: {rel_path}")
            else:
                print(f"  css-dep FAILED: {orig[:80]}")
                return m.group(0)  # keep original URL on failure

        # Compute relative path from the css dir
        rel_from_css = os.path.relpath(str(local_path), str(CSS_DIR))
        return f"url('{rel_from_css}')"

    return re.sub(r"url\(\s*(['\"]?[^'\")\s]+['\"]?)\s*\)", replace_url, css_text)

# ── Nav mock ───────────────────────────────────────────────────────────────────

NAV_MOCK_JS = r"""
// Mocked Blizzard nav — no external API calls
(function() {
  'use strict';
  window.Blizzard = window.Blizzard || {};
  window.Blizzard.SiteNav = { init: function() {} };
  window.BlzNav = window.BlzNav || { init: function() {} };
  window.BlzFooter = window.BlzFooter || { init: function() {} };

  document.addEventListener('DOMContentLoaded', function() {
    var nav = document.querySelector('.blz-nav, #blz-nav, nav[data-navbar], [data-blz-nav]');
    if (nav) {
      nav.innerHTML = '<div style="padding:12px 24px;background:#1a1a2e;color:#fff;font-family:sans-serif;">' +
        '<a href="#" style="color:#f0a000;font-weight:bold;text-decoration:none;">World of Warcraft: Dragonflight</a>' +
        '</div>';
    }
    var footer = document.querySelector('.blz-footer, #blz-footer, footer[data-footer], [data-blz-footer]');
    if (footer) {
      footer.innerHTML = '<div style="padding:24px;background:#111;color:#888;font-family:sans-serif;text-align:center;">' +
        '&copy; 2022 Blizzard Entertainment, Inc. &mdash; Local Archive' +
        '</div>';
    }
  });
})();
""".strip()

# ── HTML processing ────────────────────────────────────────────────────────────

def strip_wayback_prefix_in_attr(url):
    """For HTML attributes: unwrap a single wayback layer."""
    return unwrap_wayback(url)

def build():
    raw_html = (BASE / "index_raw.html").read_text(encoding="utf-8")
    html = raw_html

    # 1. Strip Wayback injected boilerplate scripts/links
    wb_patterns = [
        r'<script[^>]+web-static\.archive\.org[^>]*>.*?</script>',
        r'<script[^>]+web-static\.archive\.org[^>]*/?>',
        r'<link[^>]+web-static\.archive\.org[^>]*/?>',
        r'<script[^>]*>\s*window\.RufflePlayer.*?</script>',
        r'<script[^>]*>\s*__wm\.(init|wombat)\(.*?</script>',
        r'<!-- End Wayback Rewrite JS Include -->',
        r'<!-- BEGIN WAYBACK TOOLBAR INSERT -->.*?<!-- END WAYBACK TOOLBAR INSERT -->',
    ]
    for pat in wb_patterns:
        html = re.sub(pat, '', html, flags=re.DOTALL)

    # 2. Remove GTM / analytics / cookie consent
    noise_patterns = [
        r'<!--\s*Google Tag Manager.*?<!--\s*End Google Tag Manager\s*-->',
        r'<script[^>]*googletagmanager[^>]*>.*?</script>',
        r'<noscript[^>]*>.*?iframe[^>]*googletagmanager[^>]*>.*?</noscript>',
        r'<script[^>]*cookie-consent[^>]*>.*?</script>',
        r'<script[^>]*cookie-consent[^>]*/?>',
        r'<link[^>]*cookie-consent[^>]*/?>',
        r'<script[^>]*onetrust[^>]*>.*?</script>',
        r"<script>\s*window\[(?:'|\")dataLayer(?:'|\")\].*?</script>",
        r"<script>\s*\(function\(w,d,s,l,i\).*?</script>",
        # dataLayer.push analytics blocks
        r'<script[^>]*>\s*var dataLayer\s*=.*?</script>',
        # BlzCookieConsent / onetrust config blocks
        r'<script[^>]*>\s*var BlzCookieConsent\s*=.*?</script>',
        # Remove Wayback canonical/alternate links (not stylesheet links)
        r'<link[^>]+rel=["\']canonical["\'][^>]*web\.archive\.org[^>]*/?>',
        r'<link[^>]+web\.archive\.org[^>]*rel=["\']canonical["\'][^>]*/?>',
        # cookielaw script tags
        r'<script[^>]*cookielaw[^>]*>.*?</script>',
        r'<script[^>]*cookielaw[^>]*/?>',
    ]
    for pat in noise_patterns:
        html = re.sub(pat, '', html, flags=re.DOTALL | re.IGNORECASE)

    url_replacements = {}  # original_attr_url -> local_rel_path or None(=remove)

    # ── 3a. CSS links ──────────────────────────────────────────────────────────
    css_matches = re.findall(
        r'(?:href=["\']([^"\']+\.css[^"\']*)["\']|'
        r'href=["\']([^"\']+)["\'][^>]+rel=["\']stylesheet["\'])',
        html
    )
    flat_css = [u for pair in css_matches for u in pair if u]

    for attr_url in flat_css:
        if "web-static.archive.org" in attr_url:
            continue
        orig = unwrap_wayback(attr_url)
        local, rel = url_to_local(orig)
        if local.exists():
            print(f"CSS cached: {rel}")
            url_replacements[attr_url] = rel
            continue
        print(f"CSS: {orig}")
        data = fetch_with_fallbacks(attr_url, wayback_hint="cs_")
        if data:
            css_text = data.decode("utf-8", errors="replace")
            css_text = process_css(css_text)
            local.write_bytes(css_text.encode("utf-8"))
            print(f"  saved: {rel}")
            url_replacements[attr_url] = rel
        else:
            print(f"  CSS FAILED: {orig}")

    # ── 3b. JavaScript ─────────────────────────────────────────────────────────
    js_urls = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', html)

    nav_mock_path = JS_DIR / "nav-mock.js"
    nav_mock_path.write_text(NAV_MOCK_JS)
    nav_blizzard_replaced = False

    for attr_url in js_urls:
        if "web-static.archive.org" in attr_url:
            continue
        if "cookie-consent" in attr_url.lower():
            url_replacements[attr_url] = None
            continue
        if "navbar.blizzard.com" in attr_url:
            if not nav_blizzard_replaced:
                url_replacements[attr_url] = "assets/js/nav-mock.js"
                nav_blizzard_replaced = True
            else:
                url_replacements[attr_url] = None
            continue

        orig = unwrap_wayback(attr_url)
        local, rel = url_to_local(orig)
        if local.exists():
            print(f"JS cached: {rel}")
            url_replacements[attr_url] = rel
            continue
        print(f"JS: {orig}")
        data = fetch_with_fallbacks(attr_url, wayback_hint="js_")
        if data:
            local.write_bytes(data)
            print(f"  saved: {rel}")
            url_replacements[attr_url] = rel
        else:
            print(f"  JS FAILED: {orig}")

    # ── 3c. Images in src= (img, source, and Blizzard custom elements like blz-image) ──
    img_urls = re.findall(r'<\w[\w-]*[^>]+\bsrc=["\']([^"\']*https?://[^"\']+)["\']', html)
    for attr_url in img_urls:
        if attr_url.startswith("data:") or not attr_url.startswith("http"):
            continue
        if attr_url in url_replacements:
            continue
        orig = unwrap_wayback(attr_url)
        local, rel = url_to_local(orig)
        if local.exists():
            url_replacements[attr_url] = rel
            url_replacements[orig] = rel
            continue
        print(f"IMG: {orig}")
        data = fetch_with_fallbacks(attr_url, wayback_hint="im_")
        if data:
            local.write_bytes(data)
            print(f"  saved: {rel}")
            url_replacements[attr_url] = rel
            url_replacements[orig] = rel

    # ── 3d. srcset= ────────────────────────────────────────────────────────────
    for srcset_val in re.findall(r'srcset=["\']([^"\']+)["\']', html):
        for piece in srcset_val.split(","):
            u = piece.strip().split()[0]
            if not u or not u.startswith("http") or u in url_replacements:
                continue
            orig = unwrap_wayback(u)
            if orig in url_replacements:
                url_replacements[u] = url_replacements[orig]
                continue
            local, rel = url_to_local(orig)
            if local.exists():
                url_replacements[u] = rel
                url_replacements[orig] = rel
                continue
            print(f"SRCSET: {orig}")
            data = fetch_with_fallbacks(u, wayback_hint="im_")
            if data:
                local.write_bytes(data)
                url_replacements[u] = rel
                url_replacements[orig] = rel

    # ── 3e. Inline url() backgrounds ──────────────────────────────────────────
    for url in re.findall(r"url\(['\"]?(https?://[^'\")\s]+)['\"]?\)", html):
        if url in url_replacements:
            continue
        orig = unwrap_wayback(url)
        if orig in url_replacements:
            url_replacements[url] = url_replacements[orig]
            continue
        local, rel = url_to_local(orig)
        if local.exists():
            url_replacements[url] = rel
            url_replacements[orig] = rel
            continue
        print(f"BG: {orig}")
        data = fetch_with_fallbacks(url, wayback_hint="im_")
        if data:
            local.write_bytes(data)
            url_replacements[url] = rel
            url_replacements[orig] = rel

    # ── 3f. Custom element image= attributes (e.g. <blz-tab-control image="...">) ──
    for attr_url in re.findall(r'\bimage=["\']([^"\']*https?://[^"\']+)["\']', html):
        if attr_url in url_replacements:
            continue
        orig = unwrap_wayback(attr_url)
        local, rel = url_to_local(orig)
        if local.exists():
            url_replacements[attr_url] = rel
            url_replacements[orig] = rel
            continue
        data = fetch_with_fallbacks(attr_url, wayback_hint="im_")
        if data:
            local.write_bytes(data)
            print(f"  image= attr: {rel}")
            url_replacements[attr_url] = rel
            url_replacements[orig] = rel

    # ── 3g. Meta tags (og:image etc) and favicon ──────────────────────────────
    meta_urls = re.findall(r'<meta[^>]+content=["\']([^"\']*https?://[^"\']+)["\']', html)
    favicon_urls = re.findall(r'<link[^>]+href=["\']([^"\']*https?://[^"\']+\.(?:ico|png|svg)[^"\']*)["\']', html)

    for url in meta_urls + favicon_urls:
        if url in url_replacements:
            continue
        orig = unwrap_wayback(url)
        if orig in url_replacements:
            url_replacements[url] = url_replacements[orig]
            continue
        local, rel = url_to_local(orig)
        if local.exists():
            url_replacements[url] = rel
            url_replacements[orig] = rel
            continue
        data = fetch_with_fallbacks(url, wayback_hint="im_")
        if data:
            local.write_bytes(data)
            url_replacements[url] = rel
            url_replacements[orig] = rel

    # ── 4. Rewrite URLs in HTML ────────────────────────────────────────────────
    for attr_url, local_rel in sorted(url_replacements.items(), key=lambda x: -len(x[0])):
        if local_rel is None:
            # Remove entire script/link tag
            html = re.sub(
                r'<script[^>]+src=["\']' + re.escape(attr_url) + r'["\'][^>]*>\s*</script>',
                '', html
            )
            html = re.sub(
                r'<script[^>]+src=["\']' + re.escape(attr_url) + r'["\'][^>]*/?>',
                '', html
            )
            html = re.sub(
                r'<link[^>]+href=["\']' + re.escape(attr_url) + r'["\'][^>]*/?>',
                '', html
            )
        else:
            html = html.replace(attr_url, local_rel)
            html = html.replace(attr_url.replace("&", "&amp;"), local_rel)

    # ── 5. Unwrap any remaining Wayback-prefixed hrefs/srcs ───────────────────
    def _unwrap(m):
        orig = unwrap_wayback(m.group(2))
        return m.group(1) + orig + m.group(3)

    html = re.sub(
        r'(src=["\'])https?://web\.archive\.org/web/[^/]+/([^"\']+)(["\'])',
        _unwrap, html
    )
    html = re.sub(
        r'(href=["\'])https?://web\.archive\.org/web/[^/]+/([^"\']+)(["\'])',
        _unwrap, html
    )

    # ── 6. Final output ────────────────────────────────────────────────────────
    out_path = BASE / "index.html"
    out_path.write_text(html, encoding="utf-8")
    n_assets = sum(1 for _ in ASSETS.rglob("*") if _.is_file())
    print(f"\nDone! {out_path}")
    print(f"Assets downloaded: {n_assets}")

if __name__ == "__main__":
    build()
