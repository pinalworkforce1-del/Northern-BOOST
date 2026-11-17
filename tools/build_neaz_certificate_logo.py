"""Generate an actual transparent Northeastern Arizona certificate logo.

Uses only the existing Northeastern Arizona logo asset included in Northern-BOOST.
It never changes the original logo or any Pinal assets.
"""
from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "site/preview-v2/ready2work/northern-neaz-logo.png"
DST = ROOT / "site/preview-v2/ready2work/northern-neaz-logo-clean.png"

source = Image.open(SRC).convert("RGBA")
if source.size != (2048, 843):
    raise ValueError(f"Unexpected original NEAZ logo dimensions: {source.size}")

# Keep the complete ARIZONA@WORK mark and 'NORTHEASTERN ARIZONA' lockup.
# Intentionally exclude the separate AJC partnership tagline.
image = source.crop((125, 126, 1910, 553))
rgba = np.asarray(image).copy()
rgb = rgba[..., :3].astype(np.float32)
original_alpha = rgba[..., 3].astype(np.float32) / 255.0

# Original PNG has opaque white pixels; convert those to true alpha.
# Respect colorful official logo ink and feather its antialiased edge.
delta = np.max(255.0 - rgb, axis=2)
alpha = np.clip((delta - 11.0) / 66.0, 0, 1) * original_alpha
unmatted = (rgb - (1 - alpha[..., None]) * 255.0) / np.maximum(alpha[..., None], .001)
rgba[..., :3] = np.clip(unmatted, 0, 255).astype(np.uint8)
rgba[..., 3] = np.round(alpha * 255.0).astype(np.uint8)

image = Image.fromarray(rgba, "RGBA")
image = image.crop(image.getbbox())
image.thumbnail((1560, 400), Image.Resampling.LANCZOS)
if image.getpixel((0, 0))[3] != 0:
    raise ValueError("NEAZ clean logo still has an opaque background")

image.save(DST, optimize=True)
print(f"Created {DST} at {image.width}x{image.height}")
