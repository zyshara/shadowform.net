"""Regenerate committed hero variants using Python with Pillow AVIF/WebP support."""
from pathlib import Path
from PIL import Image

assets = Path(__file__).resolve().parents[1] / "src/domeofdoom/assets"
with Image.open(assets / "test_bg_3.png") as image:
    # Preserve dimensions, alpha, and crop; the PNG remains the browser fallback.
    image.save(assets / "home-hero.avif", quality=85, speed=4, subsampling="4:4:4")
    image.save(assets / "home-hero.webp", quality=88, method=6)
