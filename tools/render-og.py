"""Render site/og-image.png from tools/og-card.html.

The card is drawn by headless Chrome at 2x and downsampled, so the type keeps
its edges at 1200x630. The two columns that flank the name are the page's
own: the renderer that draws them is lifted out of site/index.html and set at
the foot of the card before it is shot, so there is one renderer and the card
cannot drift from the page. The light is pinned (?az=) rather than taken from
the clock the way the page takes it -- a card is rendered once, and it should
not depend on the hour it happened to be rendered at.

    python tools/render-og.py
"""

import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CARD = ROOT / "tools" / "og-card.html"
PAGE = ROOT / "site" / "index.html"
OUT = ROOT / "site" / "og-image.png"

W, H = 1200, 630
SCALE = 2
LIGHT = "az=-0.22"   # from the left, a little off axis: the page's morning

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


def order_script() -> str:
    """The column renderer, as the page carries it: its own <script> block."""
    page = PAGE.read_text(encoding="utf-8")
    start = page.index("<script>\n/* ── the order")
    end = page.index("</script>", start) + len("</script>")
    return page[start:end]


def staged_card() -> Path:
    card = CARD.read_text(encoding="utf-8")
    marker = "<!-- ORDER -->"
    if marker not in card:
        sys.exit(f"{CARD.name} has no {marker} marker")
    staged = ROOT / "tools" / ".og-card.staged.html"
    staged.write_text(card.replace(marker, order_script()), encoding="utf-8")
    return staged


def shoot(card: Path, dest: Path) -> None:
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
            card.as_uri() + "?" + LIGHT,
        ],
        check=True,
        capture_output=True,
    )


def main() -> None:
    raw = ROOT / "tools" / ".og-card@2x.png"
    staged = staged_card()
    try:
        shoot(staged, raw)
    finally:
        staged.unlink()

    im = Image.open(raw).convert("RGB")
    if im.size != (W * SCALE, H * SCALE):
        sys.exit(f"expected {W * SCALE}x{H * SCALE}, got {im.size[0]}x{im.size[1]}")

    im.resize((W, H), Image.LANCZOS).save(OUT, optimize=True)
    raw.unlink()
    print(f"{OUT.relative_to(ROOT)}  {W}x{H}")


if __name__ == "__main__":
    main()
