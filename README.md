# altergott.dev

Personal portfolio for Aaron Altergott. A single static page — no build step, no
dependencies, no framework.

## Layout

```
site/
  index.html   the whole site: markup, CSS, and JS in one file
  404.html     not-found page
  img/         project screenshots
  og-image.png social preview card
  CNAME        custom domain (altergott.dev)
```

## Local preview

Any static server over `site/` works:

```
npx serve site
# or
python -m http.server -d site 5173
```

## Deploy

Push to `main`. `.github/workflows/deploy.yml` uploads `site/` straight to
GitHub Pages — no install, no build.

## Social card

`site/og-image.png` (1200x630) is rendered from `tools/og-card.html`:

```
python tools/render-og.py
```

Headless Chrome draws the card at 2x and it is downsampled to 1200x630. The
two columns are the page's own: the renderer that draws them is lifted out of
`site/index.html` and set at the foot of the card before it is shot, with the
light pinned so the card does not depend on the hour it was rendered at.
Pillow is the only dependency.
