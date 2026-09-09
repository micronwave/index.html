"""Render site/og-image.png from tools/og-card.html.

The card is drawn by headless Chrome at 2x and downsampled, so the type keeps
its edges at 1200x630. The favicon's bar is laid in afterwards, against ink
measured off the raster: it has to begin on the cap of "Aaron" and end on the
last stroke of "altergott.dev", and a line box is not that -- it carries
leading at both ends. Canvas metrics are no better, since canvas cannot apply
font-variation-settings and so measures a different cut of Fraunces than the
page draws.

    python tools/render-og.py
"""

import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
CARD = ROOT / "tools" / "og-card.html"
OUT = ROOT / "site" / "og-image.png"

W, H = 1200, 630
SCALE = 2
MARGIN_X = 88   # matches --margin-x in the card
BAR_W = 48      # the favicon's bar, at the width it reads best here

CHROME_CANDIDATES = [
    Path(r"C:/Program Files/Google/Chrome/Application/chrome.exe"),
    Path(r"C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"),
    Path("/usr/bin/google-chrome"),
    Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
]


def find_chrome() -> Path:
    for c in CHROME_CANDIDATES:
        if c.exists():
            return c
    sys.exit("chrome not found -- add its path to CHROME_CANDIDATES")


def shoot(dest: Path) -> None:
    subprocess.run(
        [
            str(find_chrome()),
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            f"--force-device-scale-factor={SCALE}",
            f"--window-size={W},{H}",
            "--virtual-time-budget=8000",  # long enough for Fraunces to arrive
            f"--screenshot={dest}",
            CARD.as_uri(),
        ],
        check=True,
        capture_output=True,
    )


def ink_span(im: Image.Image) -> tuple[int, int]:
    """Top and bottom of the lockup's ink, in 2x pixels.

    Scanned down the left column only, and only between the two rules, so the
    rules themselves stay out of it.
    """
    px = im.load()
    left, right = 60 * SCALE, 760 * SCALE
    top, bottom = 100 * SCALE, 540 * SCALE

    def marked(p):
        r, g, b = p[:3]
        return r + g + b < 600 or (r > 150 and g < 110 and b < 110)

    rows = [y for y in range(top, bottom)
            if any(marked(px[x, y]) for x in range(left, right))]
    if not rows:
        sys.exit("no ink found -- did the font load?")
    return rows[0], rows[-1]


def main() -> None:
    raw = ROOT / "tools" / ".og-card@2x.png"
    shoot(raw)

    im = Image.open(raw).convert("RGB")
    if im.size != (W * SCALE, H * SCALE):
        sys.exit(f"expected {W * SCALE}x{H * SCALE}, got {im.size[0]}x{im.size[1]}")

    top, bottom = ink_span(im)
    x1 = (W - MARGIN_X) * SCALE
    x0 = x1 - BAR_W * SCALE
    ImageDraw.Draw(im).rectangle([x0, top, x1 - 1, bottom], fill=(221, 47, 25))

    im.resize((W, H), Image.LANCZOS).save(OUT, optimize=True)
    raw.unlink()
    print(f"{OUT.relative_to(ROOT)}  bar {top // SCALE}->{bottom // SCALE} of {H}")


if __name__ == "__main__":
    main()
