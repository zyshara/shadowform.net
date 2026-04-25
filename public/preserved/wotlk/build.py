#!/usr/bin/env python3
"""
WotLK local mirror builder.
Source: browser "Save Page As" from Wayback Machine (already processed by process.py)
Reads the current index.html, downloads all remaining external assets,
rewrites URLs, strips remaining Wayback chrome, writes final index.html.

Run from: public/preserved/wotlk/
"""

import re, os, time, hashlib, urllib.request, urllib.error
from pathlib import Path
from urllib.parse import urlparse

BASE      = Path(__file__).parent
ASSETS    = BASE / "assets"
IMG_DIR   = ASSETS / "images"
FONT_DIR  = ASSETS / "fonts"
CSS_DIR   = ASSETS / "css"
JS_DIR    = ASSETS / "js"
VIDEO_DIR = ASSETS / "videos"

for d in [IMG_DIR, FONT_DIR, CSS_DIR, JS_DIR, VIDEO_DIR]:
    d.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/104.0.0.0 Safari/537.36",
    "Accept": "*/*",
}

# ── URL helpers ────────────────────────────────────────────────────────────────

def clean_url(url):
    return url.replace("&amp;", "&")

def unwrap_wayback(url):
    url = clean_url(url)
    while True:
        m = re.match(r'https?://web\.archive\.org/web/\d+[a-z_]*/(.+)', url)
        if m:
            inner = m.group(1)
            if inner.startswith("http"):
                url = inner
            else:
                break
        else:
            break
    return url

# ── Fetch with retries ─────────────────────────────────────────────────────────

def fetch(url, retries=3, delay=2.0):
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

def fetch_with_fallbacks(orig_url):
    """Try direct CDN first, then Wayback."""
    orig = unwrap_wayback(orig_url)
    data = fetch(orig, retries=2, delay=1.0)
    if data:
        return data
    m = re.match(r'https?://web\.archive\.org/web/(\d+)', orig_url)
    ts = m.group(1) if m else "20220804073006"
    ext = Path(urlparse(orig).path).suffix.lower()
    hint = "cs_" if ext == ".css" else ("js_" if ext == ".js" else "im_")
    wb = f"https://web.archive.org/web/{ts}{hint}/{orig}"
    return fetch(wb, retries=2, delay=2.0)

# ── Local path helpers ─────────────────────────────────────────────────────────

def url_to_local(url):
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
    elif ext in (".mp4", ".webm", ".mov"):
        return VIDEO_DIR / name, f"assets/videos/{name}"
    else:
        return IMG_DIR / name, f"assets/images/{name}"

# ── CSS processing ─────────────────────────────────────────────────────────────

def process_css(css_text, css_local_path):
    css_text = re.sub(r'/\*\s*FILE ARCHIVED ON.*?INTERNET ARCHIVE.*?\*/', '', css_text, flags=re.DOTALL)
    css_text = re.sub(r'/\*\s*playback timings.*?\*/', '', css_text, flags=re.DOTALL)

    def replace_url(m):
        inner = m.group(1).strip("'\"")
        if inner.startswith("data:") or inner.startswith("#") or not inner.strip():
            return m.group(0)
        orig = unwrap_wayback(inner)
        local_path, rel_path = url_to_local(orig)
        if not local_path.exists():
            ext = Path(urlparse(orig).path).suffix.lower()
            data = fetch_with_fallbacks(inner)
            if data:
                if ext == ".css":
                    sub = process_css(data.decode("utf-8", errors="replace"), local_path)
                    local_path.write_bytes(sub.encode("utf-8"))
                else:
                    local_path.write_bytes(data)
                print(f"  css-dep: {rel_path}")
            else:
                print(f"  css-dep FAILED: {orig[:80]}")
                return m.group(0)
        rel_from_css = os.path.relpath(str(local_path), str(css_local_path.parent))
        return f"url('{rel_from_css}')"

    return re.sub(r"url\(\s*(['\"]?[^'\")\s]+['\"]?)\s*\)", replace_url, css_text)

# ── Nav mock ───────────────────────────────────────────────────────────────────

NAV_MOCK_JS = """
(function() {
  'use strict';
  window.Blizzard = window.Blizzard || {};
  window.Blizzard.SiteNav = { init: function() {} };
  window.BlzNav = window.BlzNav || { init: function() {} };
  window.BlzFooter = window.BlzFooter || { init: function() {} };

  document.addEventListener('DOMContentLoaded', function() {
    var nav = document.querySelector('.blz-nav, #blz-nav, nav[data-navbar], [data-blz-nav]');
    if (nav) {
      nav.innerHTML = '<div style="padding:12px 24px;background:#1a1a2e;color:#9fd4f0;font-family:sans-serif;">' +
        '<span style="font-weight:bold;">World of Warcraft: Wrath of the Lich King Classic</span>' +
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

# ── Main build ─────────────────────────────────────────────────────────────────

def build():
    src = BASE / "index.html"
    if not src.exists():
        print("ERROR: index.html not found. Run process.py first.")
        return

    html = src.read_text(encoding="utf-8", errors="replace")

    # ── Strip remaining Wayback boilerplate ────────────────────────────────────
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

    noise_patterns = [
        r'<script[^>]*googletagmanager[^>]*>.*?</script>',
        r'<noscript[^>]*>.*?iframe[^>]*googletagmanager[^>]*>.*?</noscript>',
        r'<script[^>]*cookie-consent[^>]*>.*?</script>',
        r'<script[^>]*cookie-consent[^>]*/?>',
        r'<script[^>]*onetrust[^>]*>.*?</script>',
        r'<script[^>]*cookielaw[^>]*/?>',
        r'<link[^>]*cookie-consent[^>]*/?>',
    ]
    for pat in noise_patterns:
        html = re.sub(pat, '', html, flags=re.DOTALL | re.IGNORECASE)

    url_replacements = {}

    # ── Process local CSS (download @import / url() deps) ─────────────────────
    for css_file in ASSETS.glob("*.css"):
        if css_file.name in ("banner-styles.css", "iconochive.css", "www-player.css"):
            continue
        print(f"Processing CSS: {css_file.name}")
        css_text = css_file.read_text(encoding="utf-8", errors="replace")
        css_text = process_css(css_text, css_file)
        css_file.write_bytes(css_text.encode("utf-8"))

    # ── Download external images (src= attrs) ──────────────────────────────────
    img_urls = re.findall(r'<\w[\w-]*[^>]+\bsrc=["\']([^"\']*https?://[^"\']+)["\']', html)
    for attr_url in img_urls:
        if attr_url.startswith("data:") or attr_url in url_replacements:
            continue
        orig = unwrap_wayback(attr_url)
        local, rel = url_to_local(orig)
        if local.exists():
            url_replacements[attr_url] = rel
            url_replacements[orig] = rel
            continue
        print(f"IMG: {orig[:80]}")
        data = fetch_with_fallbacks(attr_url)
        if data:
            local.write_bytes(data)
            print(f"  saved: {rel}")
            url_replacements[attr_url] = rel
            url_replacements[orig] = rel

    # ── Download srcset images ─────────────────────────────────────────────────
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
            print(f"SRCSET: {orig[:80]}")
            data = fetch_with_fallbacks(u)
            if data:
                local.write_bytes(data)
                url_replacements[u] = rel
                url_replacements[orig] = rel

    # ── Download inline url() backgrounds ─────────────────────────────────────
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
        print(f"BG: {orig[:80]}")
        data = fetch_with_fallbacks(url)
        if data:
            local.write_bytes(data)
            url_replacements[url] = rel
            url_replacements[orig] = rel

    # ── Download video sources ─────────────────────────────────────────────────
    for attr_url in re.findall(r'<source[^>]+src=["\']([^"\']*https?://[^"\']+)["\']', html):
        if attr_url in url_replacements:
            continue
        orig = unwrap_wayback(attr_url)
        local, rel = url_to_local(orig)
        if local.exists():
            url_replacements[attr_url] = rel
            url_replacements[orig] = rel
            continue
        print(f"VIDEO: {orig[:80]}")
        data = fetch_with_fallbacks(attr_url)
        if data:
            local.write_bytes(data)
            print(f"  saved: {rel}")
            url_replacements[attr_url] = rel
            url_replacements[orig] = rel

    # ── Handle external JS (replace navbar with mock) ─────────────────────────
    nav_mock_path = JS_DIR / "nav-mock.js"
    nav_mock_path.write_text(NAV_MOCK_JS)

    js_urls = re.findall(r'<script[^>]+src=["\']([^"\']*https?://[^"\']+)["\']', html)
    for attr_url in js_urls:
        if attr_url in url_replacements:
            continue
        if "navbar.blizzard.com" in attr_url or "blz-nav" in attr_url:
            url_replacements[attr_url] = "assets/js/nav-mock.js"
            continue
        orig = unwrap_wayback(attr_url)
        local, rel = url_to_local(orig)
        if local.exists():
            url_replacements[attr_url] = rel
            continue
        print(f"JS: {orig[:80]}")
        data = fetch_with_fallbacks(attr_url)
        if data:
            local.write_bytes(data)
            url_replacements[attr_url] = rel

    # ── Rewrite all URLs in HTML ───────────────────────────────────────────────
    for attr_url, local_rel in sorted(url_replacements.items(), key=lambda x: -len(x[0])):
        if local_rel is None:
            html = re.sub(r'<script[^>]+src=["\']' + re.escape(attr_url) + r'["\'][^>]*>\s*</script>', '', html)
            html = re.sub(r'<script[^>]+src=["\']' + re.escape(attr_url) + r'["\'][^>]*/?>',          '', html)
            html = re.sub(r'<link[^>]+href=["\']'  + re.escape(attr_url) + r'["\'][^>]*/?>',          '', html)
        else:
            html = html.replace(attr_url, local_rel)
            html = html.replace(attr_url.replace("&", "&amp;"), local_rel)

    # ── Unwrap any lingering Wayback hrefs/srcs ────────────────────────────────
    def _unwrap(m):
        return m.group(1) + unwrap_wayback(m.group(2)) + m.group(3)

    html = re.sub(r'(src=["\'])https?://web\.archive\.org/web/[^/]+/([^"\']+)(["\'])',  _unwrap, html)
    html = re.sub(r'(href=["\'])https?://web\.archive\.org/web/[^/]+/([^"\']+)(["\'])', _unwrap, html)

    # ── Strip leftover query fragments after local asset paths ─────────────────
    # e.g. assets/images/abc.jpg&amp;auto=webp  →  assets/images/abc.jpg
    html = re.sub(r'(assets/[^\s"\'<>)]+?)(&amp;[^\s"\'<>)]+)', r'\1', html)
    html = re.sub(r'(assets/[^\s"\'<>)]+?)(&[a-z]+=\S+?)(["\'\s<>)])', r'\1\3', html)

    # ── Write output ───────────────────────────────────────────────────────────
    src.write_text(html, encoding="utf-8")
    n_assets = sum(1 for _ in ASSETS.rglob("*") if _.is_file())
    print(f"\nDone! {src}")
    print(f"Total assets: {n_assets}")

if __name__ == "__main__":
    build()
